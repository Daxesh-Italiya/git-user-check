import React, { useState, useMemo } from "react";
import {
  Table,
  Avatar,
  Button,
  Space,
  Tag,
  Typography,
  Badge,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  UserAddOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useAdvancedFilter } from "../hooks/useAdvancedFilter";
import SearchFilterPanel from "./SearchFilterPanel";
import EmptyState from "./EmptyState";

const { Text } = Typography;

const UserManagementTab = ({
  users,
  repos,
  onPreviewUser,
  onRemoveUser,
  onRemoveFromAll,
  onAddUser,
  loading,
}) => {
  // Get unique organizations from repos
  const organizationsList = useMemo(() => {
    const orgs = new Set();
    repos.forEach((repo) => orgs.add(repo.owner.login));
    return Array.from(orgs).sort();
  }, [repos]);

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
    sortedItems: filteredUsers,
    resultCount,
  } = useAdvancedFilter(users, {
    getSearchableFields: (user) => [user.user.login],
    filterFn: (user, filters) => {
      // Organization filter
      if (filters.organization && filters.organization.length > 0) {
        const userOrgs = new Set(user.repos.map((r) => r.repo.owner.login));
        const matchesOrg = filters.organization.some((org) =>
          userOrgs.has(org),
        );
        if (!matchesOrg) return false;
      }

      // Repository count range filter
      if (filters.repoCountRange) {
        const [min, max] = filters.repoCountRange;
        const count = user.repos.length;
        if (count < min || count > max) return false;
      }

      return true;
    },
  });

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div
          className="tw-flex tw-items-center tw-gap-4"
          style={{
            padding: "8px 0",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Avatar
            src={record.user.avatar_url}
            size={44}
            style={{ flexShrink: 0 }}
          />
          <div>
            <Text
              strong
              className="tw-block"
              style={{ fontSize: "14px", marginBottom: "4px" }}
            >
              <a
                href={record.user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-primary)",
                  textDecoration: "none",
                }}
              >
                {record.user.login}
              </a>
            </Text>
            <br></br>
            <Text
              type="secondary"
              className="tw-text-xs"
              style={{ fontSize: "12px", color: "var(--color-textSecondary)" }}
            >
              ID: {record.user.id}
            </Text>
          </div>
        </div>
      ),
      sorter: (a, b) => a.user.login.localeCompare(b.user.login),
      width: 220,
    },
    {
      title: "Repositories",
      key: "repoCount",
      render: (_, record) => (
        <div style={{ padding: "8px 0" }}>
          <Badge
            count={record.repos.length}
            showZero
            style={{
              backgroundColor:
                record.repos.length > 0
                  ? "var(--color-primary)"
                  : "var(--color-border)",
              fontSize: "12px",
              fontWeight: "600",
              minWidth: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </div>
      ),
      sorter: (a, b) => a.repos.length - b.repos.length,
      defaultSortOrder: "descend",
      width: 110,
    },
    {
      title: "Organizations",
      key: "organizations",
      render: (_, record) => {
        const orgs = [...new Set(record.repos.map((r) => r.repo.owner.login))];
        return (
          <Space size={6} wrap style={{ padding: "8px 0" }}>
            {orgs.slice(0, 3).map((org) => (
              <Tag
                key={org}
                icon={<BankOutlined />}
                style={{
                  backgroundColor: "rgba(53, 183, 41, 0.08)",
                  color: "var(--color-primary)",
                  border: "1px solid rgba(53, 183, 41, 0.2)",
                  padding: "4px 10px",
                  fontSize: "12px",
                  cursor: "default",
                }}
              >
                {org}
              </Tag>
            ))}
            {orgs.length > 3 && (
              <Tag
                style={{
                  backgroundColor: "var(--color-border)",
                  color: "var(--color-textSecondary)",
                  border: "1px solid var(--color-border)",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              >
                +{orgs.length - 3} more
              </Tag>
            )}
          </Space>
        );
      },
      width: 240,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size={8} style={{ padding: "8px 0" }}>
          <Tooltip title="View repositories">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => onPreviewUser(record)}
              size="small"
              style={{
                fontSize: "12px",
                height: "32px",
              }}
            >
              Preview
            </Button>
          </Tooltip>

          <Tooltip title="Remove from all repositories">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemoveFromAll(record.user.login)}
              size="small"
              style={{
                fontSize: "12px",
                height: "32px",
              }}
            >
              Remove
            </Button>
          </Tooltip>
        </Space>
      ),
      width: 160,
    },
  ];

  const filterOptions = [
    {
      key: "organization",
      label: "Organization",
      type: "select",
      values: organizationsList,
    },
    {
      key: "repoCountRange",
      label: "Repository Count Range",
      type: "range",
      values: [],
    },
  ];

  return (
    <div style={{ padding: "0" }}>
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
        placeholder="Search users by username..."
      >
        <div className="tw-flex tw-justify-end" style={{ marginTop: "16px" }}>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={onAddUser}
            size="large"
            style={{
              fontSize: "14px",
              fontWeight: "500",
              height: "36px",
              paddingLeft: "20px",
              paddingRight: "20px",
            }}
          >
            Add User to Repos
          </Button>
        </div>
      </SearchFilterPanel>

      <div style={{ marginTop: "24px" }}>
        {resultCount === 0 && users.length > 0 ? (
          <EmptyState
            type={activeFilterCount > 0 ? "filter" : "search"}
            title={
              activeFilterCount > 0
                ? "No users match your filters"
                : "No users found"
            }
            description={
              activeFilterCount > 0
                ? "Try adjusting your filters to find users."
                : "Try a different search term."
            }
            onClear={activeFilterCount > 0 ? clearFilters : null}
            icon={activeFilterCount > 0 ? "filter" : "search"}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey={(record) => record.user.login}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total) => `Total ${total} users`,
              style: { marginTop: "16px" },
            }}
            style={{
              borderRadius: "8px",
              overflow: "hidden",
            }}
            rowClassName={() => "user-table-row"}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagementTab;
