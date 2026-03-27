import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  Card,
  Tabs,
  message,
  Spin,
  Typography,
  ConfigProvider,
  Button,
  Modal,
  theme as antdTheme,
} from "antd";
import {
  BookOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useTheme } from "./context/ThemeContext";
import TokenInput from "./components/TokenInput";
import OrgSelector from "./components/OrgSelector";
import LoadingOverlay from "./components/LoadingOverlay";
import RepoTab from "./components/RepoTab";
import UserManagementTab from "./components/UserManagementTab";
import UserRepoModal from "./components/UserRepoModal";
import AddUserModal from "./components/AddUserModal";
import GitHubAPI from "./services/githubApi";
import {
  extractOrganizations,
  aggregateUsers,
  sortUsersByRepoCount,
} from "./utils/dataTransform";

const { Title } = Typography;

function App() {
  const { mode, toggleTheme, theme } = useTheme();
  const [modal, contextHolder] = Modal.useModal();

  // Authentication state
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Phase state: 'token' -> 'select-orgs' -> 'loading' -> 'dashboard'
  const [authPhase, setAuthPhase] = useState("token");

  // Organization selection state
  const [availableOrgs, setAvailableOrgs] = useState([]);

  // Loading progress state
  const [fetchProgress, setFetchProgress] = useState({
    current: 0,
    total: 0,
    message: "",
  });

  // Abort controller for cancelling requests
  const abortControllerRef = useRef(null);

  // Data state
  const [repos, setRepos] = useState([]);
  const [collaboratorsMap, setCollaboratorsMap] = useState(new Map());
  const [userList, setUserList] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  // Filter state
  const [orgFilter, setOrgFilter] = useState("all");

  // UI state
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Initialize GitHub API
  const getApi = useCallback(() => {
    return new GitHubAPI(token);
  }, [token]);

  // Phase 1: Validate token and fetch available organizations
  const validateToken = async (pat) => {
    setLoading(true);
    try {
      const api = new GitHubAPI(pat);

      // Get current user info
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      setToken(pat);

      // Fetch user's organizations
      const orgs = await api.getUserOrganizations();

      // Combine personal account with organizations
      const allOrgs = [
        {
          login: user.login,
          id: user.id,
          avatar_url: user.avatar_url,
          html_url: user.html_url,
          type: "personal",
        },
        ...orgs.map((org) => ({ ...org, type: "organization" })),
      ];

      setAvailableOrgs(allOrgs);
      setAuthPhase("select-orgs");
    } catch (error) {
      message.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle organization selection and start fetching
  const handleOrgSelection = (orgs) => {
    setAuthPhase("loading");
    fetchDataForOrgs(orgs);
  };

  // Handle back button from org selection
  const handleBackToToken = () => {
    setToken("");
    setCurrentUser(null);
    setAvailableOrgs([]);
    setAuthPhase("token");
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    modal.confirm({
      title: "Confirm Logout",
      content: "Are you sure you want to logout? All data will be cleared.",
      okText: "Logout",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        // Clear authentication state
        setToken("");
        setCurrentUser(null);
        setAvailableOrgs([]);
        setAuthPhase("token");

        // Clear data state
        setRepos([]);
        setCollaboratorsMap(new Map());
        setUserList([]);
        setOrganizations([]);
        setFetchProgress({ current: 0, total: 0, message: "" });
        setActiveTab("users");

        message.success("Logged out successfully");
      },
    });
  };

  // Handle stop button during loading
  const handleStopFetch = () => {
    // Abort ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset all data
    setRepos([]);
    setCollaboratorsMap(new Map());
    setUserList([]);
    setOrganizations([]);
    setFetchProgress({ current: 0, total: 0, message: "" });

    // Return to org selection
    setAuthPhase("select-orgs");
    message.info("Fetch cancelled. Select organizations to try again.");
  };

  // Phase 3: Fetch data for selected organizations
  const fetchDataForOrgs = async (orgs) => {
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const api = new GitHubAPI(token);

      // Fetch repositories for selected organizations
      setFetchProgress({
        current: 0,
        total: orgs.length,
        message: "Fetching repositories...",
      });

      const allRepos = [];
      for (let i = 0; i < orgs.length; i++) {
        if (signal.aborted) throw new Error("Request cancelled");

        const org = orgs[i];
        setFetchProgress({
          current: i + 1,
          total: orgs.length,
          message: `Fetching repositories for ${org.login}...`,
        });

        try {
          const orgRepos = await api.fetchAllPages(
            "/user/repos",
            {
              affiliation:
                org.type === "personal" ? "owner" : "organization_member",
              sort: "full_name",
              direction: "asc",
            },
            signal,
          );

          // Filter repos for this specific owner
          const filteredRepos = orgRepos.filter(
            (repo) => repo.owner.login === org.login,
          );
          allRepos.push(...filteredRepos);
        } catch (error) {
          if (error.message === "Request cancelled") throw error;
          console.warn(
            `Failed to fetch repos for ${org.login}:`,
            error.message,
          );
        }
      }

      setRepos(allRepos);

      // Extract organizations from fetched repos
      const extractedOrgs = extractOrganizations(allRepos, currentUser.login);
      setOrganizations(extractedOrgs);

      // Fetch collaborators for each repo
      setFetchProgress({
        current: 0,
        total: allRepos.length,
        message: "Fetching collaborators...",
      });

      const collabMap = new Map();
      for (let i = 0; i < allRepos.length; i++) {
        if (signal.aborted) throw new Error("Request cancelled");

        const repo = allRepos[i];
        setFetchProgress({
          current: i + 1,
          total: allRepos.length,
          message: `Fetching collaborators for ${repo.full_name}...`,
        });

        try {
          const collaborators = await api.getCollaborators(
            repo.owner.login,
            repo.name,
            signal,
          );
          collabMap.set(repo.id, collaborators);
        } catch (error) {
          if (error.message === "Request cancelled") throw error;
          console.warn(
            `Failed to fetch collaborators for ${repo.full_name}:`,
            error.message,
          );
          collabMap.set(repo.id, []);
        }
      }

      setCollaboratorsMap(collabMap);

      // Aggregate users
      const userMap = aggregateUsers(allRepos, collabMap);
      const sortedUsers = sortUsersByRepoCount(userMap);
      setUserList(sortedUsers);

      // Transition to dashboard
      setAuthPhase("dashboard");
      message.success("Data loaded successfully!");
    } catch (error) {
      if (error.message === "Request cancelled") {
        // Handled by handleStopFetch
        return;
      }
      message.error(error.message);
      // Return to org selection on error
      setAuthPhase("select-orgs");
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Handle remove collaborator from single repo
  const handleRemoveCollaborator = async (owner, repo, username) => {
    setActionLoading(true);
    try {
      const api = getApi();
      await api.removeCollaborator(owner, repo, username);

      // Update local state
      const repoData = repos.find(
        (r) => r.owner.login === owner && r.name === repo,
      );
      if (repoData) {
        const updatedCollabs = (collaboratorsMap.get(repoData.id) || []).filter(
          (c) => c.login !== username,
        );
        const newCollabMap = new Map(collaboratorsMap);
        newCollabMap.set(repoData.id, updatedCollabs);
        setCollaboratorsMap(newCollabMap);

        // Re-aggregate users
        const userMap = aggregateUsers(repos, newCollabMap);
        const sortedUsers = sortUsersByRepoCount(userMap);
        setUserList(sortedUsers);
      }

      message.success(`Removed ${username} from ${repo}`);
    } catch (error) {
      message.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle remove user from all repos
  const handleRemoveFromAll = async (username) => {
    setActionLoading(true);
    try {
      const api = getApi();
      const userData = userList.find((u) => u.user.login === username);

      if (!userData) return;

      let successCount = 0;
      let failCount = 0;

      for (const { repo } of userData.repos) {
        try {
          await api.removeCollaborator(repo.owner.login, repo.name, username);
          successCount++;
        } catch (error) {
          console.error(`Failed to remove from ${repo.name}:`, error);
          failCount++;
        }
      }

      // Refresh data
      const newCollabMap = new Map(collaboratorsMap);
      for (const { repo } of userData.repos) {
        const updatedCollabs = (newCollabMap.get(repo.id) || []).filter(
          (c) => c.login !== username,
        );
        newCollabMap.set(repo.id, updatedCollabs);
      }
      setCollaboratorsMap(newCollabMap);

      const userMap = aggregateUsers(repos, newCollabMap);
      const sortedUsers = sortUsersByRepoCount(userMap);
      setUserList(sortedUsers);

      if (failCount === 0) {
        message.success(
          `Removed ${username} from all ${successCount} repositories`,
        );
      } else {
        message.warning(
          `Removed from ${successCount} repos, failed on ${failCount}`,
        );
      }

      setUserModalVisible(false);
    } catch (error) {
      message.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle add user to repos
  const handleAddUser = async (username, permission, repoFullNames) => {
    const api = getApi();
    const selectedRepos = repos.filter((r) =>
      repoFullNames.includes(r.full_name),
    );

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const repo of selectedRepos) {
      try {
        await api.addCollaborator(
          repo.owner.login,
          repo.name,
          username,
          permission,
        );
        successCount++;
      } catch (error) {
        console.error(`Failed to add to ${repo.name}:`, error);
        failCount++;
        errors.push(`${repo.name}: ${error.message}`);
      }
    }

    // Refresh collaborators for affected repos
    const newCollabMap = new Map(collaboratorsMap);
    for (const repo of selectedRepos) {
      try {
        const collaborators = await api.getCollaborators(
          repo.owner.login,
          repo.name,
        );
        newCollabMap.set(repo.id, collaborators);
      } catch (error) {
        console.warn(`Failed to refresh collaborators for ${repo.name}`);
      }
    }
    setCollaboratorsMap(newCollabMap);

    // Re-aggregate users
    const userMap = aggregateUsers(repos, newCollabMap);
    const sortedUsers = sortUsersByRepoCount(userMap);
    setUserList(sortedUsers);

    if (failCount > 0) {
      throw new Error(`Added to ${successCount} repos, failed on ${failCount}`);
    }
  };

  // Open user preview modal
  const handlePreviewUser = (user) => {
    setSelectedUser(user);
    setUserModalVisible(true);
  };

  // Filter repos based on org filter
  const getFilteredRepos = () => {
    if (orgFilter === "all") return repos;
    if (orgFilter === "personal") {
      return repos.filter((r) => r.owner.login === currentUser?.login);
    }
    return repos.filter((r) => r.owner.login === orgFilter);
  };

  // Phase-based rendering
  if (authPhase === "token") {
    return (
      <ConfigProvider
        theme={{
          algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: theme.colors.primary,
            colorSuccess: theme.colors.success,
            colorWarning: theme.colors.warning,
            colorError: theme.colors.danger,
            colorInfo: theme.colors.info,
            colorTextBase: theme.colors.text,
            colorBgBase: theme.colors.background,
            borderRadius: parseInt(theme.borderRadius.md),
          },
          components: {
            Select: {
              optionSelectedBg: "#333333",
            },
            Modal: {
              headerBg: theme.colors.background,
              contentBg: theme.colors.background,
            },
            Tooltip: {
              colorBgDefault: theme.colors.background,
              colorTextDefault: theme.colors.text,
            },
            Message: {
              colorBgDefault: theme.colors.background,
            },
          },
        }}
      >
        <div
          className="tw-min-h-screen"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          <TokenInput onSubmit={validateToken} loading={loading} />
        </div>
      </ConfigProvider>
    );
  }

  if (authPhase === "select-orgs") {
    return (
      <ConfigProvider
        theme={{
          algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: theme.colors.primary,
            colorSuccess: theme.colors.success,
            colorWarning: theme.colors.warning,
            colorError: theme.colors.danger,
            colorInfo: theme.colors.info,
            colorTextBase: theme.colors.text,
            colorBgBase: theme.colors.background,
            borderRadius: parseInt(theme.borderRadius.md),
          },
          components: {
            Select: {
              optionSelectedBg: "#333333",
            },
            Modal: {
              headerBg: theme.colors.background,
              contentBg: theme.colors.background,
            },
            Tooltip: {
              colorBgDefault: theme.colors.background,
              colorTextDefault: theme.colors.text,
            },
            Message: {
              colorBgDefault: theme.colors.background,
            },
          },
        }}
      >
        <div
          className="tw-min-h-screen"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          <OrgSelector
            organizations={availableOrgs}
            onContinue={handleOrgSelection}
            onBack={handleBackToToken}
            loading={loading}
          />
        </div>
      </ConfigProvider>
    );
  }

  if (authPhase === "loading") {
    return (
      <ConfigProvider
        theme={{
          algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: theme.colors.primary,
            colorSuccess: theme.colors.success,
            colorWarning: theme.colors.warning,
            colorError: theme.colors.danger,
            colorInfo: theme.colors.info,
            colorTextBase: theme.colors.text,
            colorBgBase: theme.colors.background,
            borderRadius: parseInt(theme.borderRadius.md),
          },
          components: {
            Select: {
              optionSelectedBg: "#333333",
            },
            Modal: {
              headerBg: theme.colors.background,
              contentBg: theme.colors.background,
            },
            Tooltip: {
              colorBgDefault: theme.colors.background,
              colorTextDefault: theme.colors.text,
            },
            Message: {
              colorBgDefault: theme.colors.background,
            },
          },
        }}
      >
        <div
          className="tw-min-h-screen"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          <LoadingOverlay
            visible={true}
            progress={fetchProgress}
            onStop={handleStopFetch}
          />
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: theme.colors.primary,
          colorSuccess: theme.colors.success,
          colorWarning: theme.colors.warning,
          colorError: theme.colors.danger,
          colorInfo: theme.colors.info,
          colorTextBase: theme.colors.text,
          colorBgBase: theme.colors.background,
          borderRadius: parseInt(theme.borderRadius.md),
          optionSelectedBg: "#333333",
        },
        components: {
          Select: {
            optionSelectedBg: "#333333",
          },
          Modal: {
            headerBg: theme.colors.background,
            contentBg: theme.colors.background,
          },
          Tooltip: {
            colorBgDefault: theme.colors.background,
            colorTextDefault: theme.colors.text,
          },
          Message: {
            colorBgDefault: theme.colors.background,
          },
        },
      }}
    >
      {contextHolder}
      <div
        className="tw-min-h-screen"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Professional Header Bar */}
        <div
          style={{
            backgroundColor: "var(--color-bgPrimary)",
            borderBottom: "1px solid var(--color-border)",
            padding: "16px 24px",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            className="tw-max-w-7xl tw-mx-auto tw-flex tw-justify-between tw-items-center"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <img
                src="/logo.png"
                alt="Company Logo"
                style={{
                  height: "40px",
                  borderRadius: "8px",
                  objectFit: "contain",
                }}
              />

              <Title
                level={4}
                className="tw-mb-0"
                style={{
                  color: "var(--color-text)",
                  fontSize: "17px",
                  fontWeight: "600",
                  margin: "0",
                }}
              >
                GitHub Manager
              </Title>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "1px",
                  height: "20px",
                  backgroundColor: "var(--color-border)",
                }}
              ></div>
              <div
                style={{
                  color: "var(--color-textSecondary)",
                  fontSize: "13px",
                }}
              >
                <span>Logged in as: </span>
                <br></br>
                <span style={{ color: "var(--color-text)", fontWeight: "600" }}>
                  {currentUser?.login}
                </span>
              </div>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{
                  color: "var(--color-textSecondary)",
                }}
                title="Logout"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="tw-p-6">
          <Card
            className="tw-max-w-7xl tw-mx-auto tw-shadow-md"
            style={{
              backgroundColor: "var(--color-bgPrimary)",
            }}
            bodyStyle={{ padding: "24px 32px" }}
          >
            <Spin spinning={loading} tip="Loading..." size="large">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: "users",
                    label: (
                      <span>
                        <UserOutlined style={{ marginRight: "10px" }} />
                        User Management ({userList.length})
                      </span>
                    ),
                    children: (
                      <UserManagementTab
                        users={userList}
                        repos={repos}
                        onPreviewUser={handlePreviewUser}
                        onRemoveUser={handleRemoveCollaborator}
                        onRemoveFromAll={handleRemoveFromAll}
                        onAddUser={() => setAddUserModalVisible(true)}
                        loading={loading}
                      />
                    ),
                  },
                  {
                    key: "repos",
                    label: (
                      <span>
                        <BookOutlined style={{ marginRight: "10px" }} />
                        Repositories ({repos.length})
                      </span>
                    ),
                    children: (
                      <RepoTab
                        repos={getFilteredRepos()}
                        collaboratorsMap={collaboratorsMap}
                        organizations={organizations}
                        currentUserLogin={currentUser?.login}
                        orgFilter={orgFilter}
                        setOrgFilter={setOrgFilter}
                        onRemoveCollaborator={handleRemoveCollaborator}
                        loading={loading}
                      />
                    ),
                  },
                ]}
              />
            </Spin>
          </Card>
        </div>
      </div>

      {/* User Repository Modal */}
      <UserRepoModal
        visible={userModalVisible}
        user={selectedUser}
        onClose={() => setUserModalVisible(false)}
        onRemoveFromRepo={handleRemoveCollaborator}
        onRemoveFromAll={handleRemoveFromAll}
        loading={actionLoading}
      />

      {/* Add User Modal */}
      <AddUserModal
        visible={addUserModalVisible}
        repos={repos}
        onClose={() => setAddUserModalVisible(false)}
        onAdd={handleAddUser}
      />
    </ConfigProvider>
  );
}

export default App;
