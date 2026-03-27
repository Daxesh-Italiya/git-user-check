import React, { useState } from "react";
import { Table, Tag, Button, Space, Typography, Avatar, Tooltip } from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  GlobalOutlined,
  LockOutlined,
  BankOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAdvancedFilter } from "../hooks/useAdvancedFilter";
import SearchFilterPanel from "./SearchFilterPanel";
import DashboardHeader from "./DashboardHeader";
import EmptyState from "./EmptyState";

const { Text } = Typography;

const RepoTab = ({
  repos,
  collaboratorsMap,
  organizations,
  currentUserLogin,
  orgFilter,
  setOrgFilter,
  onRemoveCollaborator,
  loading,
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // Prepare filter options
  const orgOptions = [];
  if (repos.some((r) => r.owner.login === currentUserLogin)) {
    orgOptions.push("Personal");
  }
  organizations.forEach((org) => {
    orgOptions.push(org.login);
  });

  const visibilityOptions = [
    { label: "Public", value: false },
    { label: "Private", value: true },
  ];

  // Advanced filter hook
  const {
    searchTerm,
    handleSearchChange,
    filterCriteria,
    setFilter,
    clearFilters,
    sortBy,
    sortOrder,
    handleSort,
    activeFilterCount,
    sortedItems: filteredRepos,
    resultCount,
  } = useAdvancedFilter(repos, {
    getSearchableFields: (repo) => [repo.name, repo.full_name],
    filterFn: (repo, filters) => {
      // Organization filter
      if (filters.organization && filters.organization.length > 0) {
        const org = filters.organization[0];
        if (org === "Personal") {
          if (repo.owner.login !== currentUserLogin) return false;
        } else {
          if (repo.owner.login !== org) return false;
        }
      }

      // Visibility filter
      if (filters.visibility && filters.visibility.length > 0) {
        const visibility = filters.visibility[0];
        const isPrivate = visibility === "Private";
        if (repo.private !== isPrivate) return false;
      }

      // Collaborator count range filter
      if (filters.collaboratorRange) {
        const count = (collaboratorsMap.get(repo.id) || []).length;
        const [min, max] = filters.collaboratorRange;
        if (count < min || count > max) return false;
      }

      return true;
    },
  });

  const getOrgFilterOptions = () => {
    const options = [{ label: "All Organizations", value: "" }];
    if (repos.some((r) => r.owner.login === currentUserLogin)) {
      options.push({ label: "Personal", value: "Personal" });
    }
    organizations.forEach((org) => {
      options.push({ label: org.login, value: org.login });
    });
    return options;
  };

  const getOrganizationTag = (repo) => {
    const isPersonal = repo.owner.login === currentUserLogin;

    if (isPersonal) {
      return (
        <Tag icon={<UserOutlined />} color="blue">
          Personal
        </Tag>
      );
    }

    return (
      <Tag icon={<BankOutlined />} color="purple">
        {repo.owner.login}
      </Tag>
    );
  };

  const expandedRowRender = (record) => {
    const collaborators = collaboratorsMap.get(record.id) || [];

    if (collaborators.length === 0) {
      return (
        <Text type="secondary" style={{ padding: "16px" }}>
          No collaborators found or no access
        </Text>
      );
    }

    return (
      <div style={{ padding: "16px", backgroundColor: "rgba(0, 0, 0, 0.02)" }}>
        <Text
          strong
          style={{ marginBottom: "12px", display: "block", fontSize: "14px" }}
        >
          Collaborators ({collaborators.length})
        </Text>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {collaborators.map((collab) => (
            <div
              key={collab.login}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 12px",
                backgroundColor: "var(--color-bgPrimary)",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
              }}
            >
              <Avatar src={collab.avatar_url} size={28} />
              <div style={{ minWidth: 0 }}>
                <Text style={{ fontSize: "13px", fontWeight: "500" }}>
                  {collab.login}
                </Text>
              </div>
              <Tag
                style={{
                  backgroundColor: "rgba(53, 183, 41, 0.08)",
                  color: "var(--color-primary)",
                  border: "1px solid rgba(53, 183, 41, 0.2)",
                  marginRight: 0,
                  fontSize: "11px",
                }}
              >
                {collab.role_name}
              </Tag>
              <Tooltip title="Remove collaborator">
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    onRemoveCollaborator(
                      record.owner.login,
                      record.name,
                      collab.login,
                    )
                  }
                  style={{ marginLeft: "8px" }}
                />
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: "Repository",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div style={{ padding: "8px 0" }}>
          <a
            href={record.html_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontWeight: "500",
              fontSize: "14px",
              color: "var(--color-primary)",
              textDecoration: "none",
            }}
          >
            {text}
          </a>
          <div
            style={{
              fontSize: "12px",
              color: "var(--color-textSecondary)",
              marginTop: "4px",
            }}
          >
            {record.full_name}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: "Organization",
      key: "organization",
      render: (_, record) => (
        <div style={{ padding: "8px 0" }}>{getOrganizationTag(record)}</div>
      ),
      width: 150,
    },
    {
      title: "Visibility",
      dataIndex: "private",
      key: "private",
      render: (private_) => (
        <div style={{ padding: "8px 0" }}>
          {private_ ? (
            <Tag
              icon={<LockOutlined />}
              style={{
                backgroundColor: "rgba(255, 77, 79, 0.08)",
                color: "rgb(255, 77, 79)",
                border: "1px solid rgba(255, 77, 79, 0.2)",
              }}
            >
              Private
            </Tag>
          ) : (
            <Tag
              icon={<GlobalOutlined />}
              style={{
                backgroundColor: "rgba(52, 211, 153, 0.08)",
                color: "rgb(52, 211, 153)",
                border: "1px solid rgba(52, 211, 153, 0.2)",
              }}
            >
              Public
            </Tag>
          )}
        </div>
      ),
      width: 110,
    },
    {
      title: "Collaborators",
      key: "collaboratorCount",
      render: (_, record) => {
        const count = (collaboratorsMap.get(record.id) || []).length;
        return (
          <div style={{ padding: "8px 0" }}>
            <Tag
              style={{
                backgroundColor: "rgba(53, 183, 41, 0.08)",
                color: "var(--color-primary)",
                border: "1px solid rgba(53, 183, 41, 0.2)",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {count}
            </Tag>
          </div>
        );
      },
      sorter: (a, b) => {
        const countA = (collaboratorsMap.get(a.id) || []).length;
        const countB = (collaboratorsMap.get(b.id) || []).length;
        return countA - countB;
      },
      width: 110,
    },
  ];

  const filterOptions = [
    {
      key: "organization",
      label: "Organization",
      type: "select",
      values: orgOptions,
    },
    {
      key: "visibility",
      label: "Visibility",
      type: "checkbox",
      values: ["Public", "Private"],
    },
    {
      key: "collaboratorRange",
      label: "Collaborator Count Range",
      type: "range",
      values: [],
    },
  ];

  return (
    <div style={{ padding: "0" }}>
      <div style={{ marginBottom: "28px" }}>
        <DashboardHeader
          repos={repos}
          users={[]}
          collaboratorsMap={collaboratorsMap}
        />
      </div>

      <SearchFilterPanel
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterCriteria={filterCriteria}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
        filterOptions={filterOptions}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSort}
        resultCount={resultCount}
        placeholder="Search repositories by name..."
      />

      <div style={{ marginTop: "24px" }}>
        {resultCount === 0 && repos.length > 0 ? (
          <EmptyState
            type={activeFilterCount > 0 ? "filter" : "search"}
            title={
              activeFilterCount > 0
                ? "No repositories match your filters"
                : "No repositories found"
            }
            description={
              activeFilterCount > 0
                ? "Try adjusting your filters to find repositories."
                : "Try a different search term."
            }
            onClear={activeFilterCount > 0 ? clearFilters : null}
            icon={activeFilterCount > 0 ? "filter" : "search"}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredRepos}
            rowKey="id"
            loading={loading}
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              onExpandedRowsChange: setExpandedRowKeys,
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total) => `Total ${total} repositories`,
              style: { marginTop: "16px" },
            }}
            style={{
              borderRadius: "8px",
              overflow: "hidden",
            }}
            rowClassName={() => "repo-table-row"}
          />
        )}
      </div>
    </div>
  );
};

export default RepoTab;
