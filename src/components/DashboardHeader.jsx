/**
 * DashboardHeader Component
 * Displays key metrics and statistics about repos and collaborators
 */

import React, { useMemo } from "react";
import { Card, Row, Col, Statistic, Space, Typography } from "antd";
import {
  DatabaseOutlined,
  TeamOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * DashboardHeader Component
 * @param {Object} props - Component props
 * @param {Array} props.repos - Array of repositories
 * @param {Array} props.users - Array of aggregated users
 * @param {Map} props.collaboratorsMap - Map of repo ID to collaborators
 */
function DashboardHeader({
  repos = [],
  users = [],
  collaboratorsMap = new Map(),
}) {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalPermissions = Array.from(collaboratorsMap.values()).reduce(
      (sum, collabs) => sum + collabs.length,
      0,
    );

    const publicRepos = repos.filter((r) => !r.private).length;
    const privateRepos = repos.filter((r) => r.private).length;

    const avgCollaboratorsPerRepo =
      repos.length > 0 ? (totalPermissions / repos.length).toFixed(1) : 0;

    return {
      totalRepos: repos.length,
      publicRepos,
      privateRepos,
      totalUsers: users.length,
      totalPermissions,
      avgCollaboratorsPerRepo,
    };
  }, [repos, users, collaboratorsMap]);

  return (
    <div style={{ marginBottom: "var(--spacing-xl)" }}>
      <Row gutter={[16, 16]}>
        {/* Total Repositories */}
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            style={{
              backgroundColor: "var(--color-bgPrimary)",
              borderColor: "var(--color-border)",
              height: "190px",
            }}
          >
            <Statistic
              title="Total Repositories"
              value={stats.totalRepos}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: "var(--color-primary)" }}
            />
            <Space
              direction="vertical"
              size={0}
              style={{ marginTop: "var(--spacing-md)" }}
            >
              <Text
                type="secondary"
                style={{ fontSize: "var(--font-size-xs)" }}
              >
                {stats.publicRepos} public
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: "var(--font-size-xs)" }}
              >
                {stats.privateRepos} private
              </Text>
            </Space>
          </Card>
        </Col>

        {/* Total Collaborators */}
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            style={{
              backgroundColor: "var(--color-bgPrimary)",
              borderColor: "var(--color-border)",
              height: "190px",
            }}
          >
            <Statistic
              title="Total Collaborators"
              value={stats.totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "var(--color-success)" }}
            />
            <Text
              type="secondary"
              style={{
                fontSize: "var(--font-size-xs)",
                display: "block",
                marginTop: "var(--spacing-md)",
              }}
            >
              Unique users
            </Text>
          </Card>
        </Col>

        {/* Total Permissions */}
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            style={{
              backgroundColor: "var(--color-bgPrimary)",
              borderColor: "var(--color-border)",
              height: "190px",
            }}
          >
            <Statistic
              title="Total Permissions"
              value={stats.totalPermissions}
              prefix={<LinkOutlined />}
              valueStyle={{ color: "var(--color-warning)" }}
            />
            <Text
              type="secondary"
              style={{
                fontSize: "var(--font-size-xs)",
                display: "block",
                marginTop: "var(--spacing-md)",
              }}
            >
              Avg: {stats.avgCollaboratorsPerRepo} per repo
            </Text>
          </Card>
        </Col>

        {/* Summary Text */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              border: "1px solid var(--color-border)",
            }}
          >
            <Title
              level={5}
              style={{ marginBottom: "var(--spacing-md)", marginTop: 0 }}
            >
              Summary
            </Title>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text>
                You're managing <strong>{stats.totalPermissions}</strong>{" "}
                collaborator access rights across{" "}
                <strong>{stats.totalRepos}</strong> repositories.
              </Text>
              <Text>
                <strong>{stats.totalUsers}</strong> unique users have access to
                your repositories.
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: "var(--font-size-sm)" }}
              >
                Use the filters below to find and manage collaborators by
                organization, visibility, and access count.
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardHeader;
