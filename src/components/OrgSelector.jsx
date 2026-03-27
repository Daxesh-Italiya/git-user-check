import React, { useState } from "react";
import {
  Card,
  Checkbox,
  Button,
  Typography,
  Avatar,
  Divider,
  Space,
  Alert,
} from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * Organization Selector Component
 * Allows user to select which organizations to fetch data from
 */
const OrgSelector = ({ organizations, onContinue, onBack, loading }) => {
  // Initialize with all orgs selected
  const [selectedOrgs, setSelectedOrgs] = useState(() =>
    organizations.map((org) => org.login)
  );

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedOrgs(organizations.map((org) => org.login));
    } else {
      setSelectedOrgs([]);
    }
  };

  const handleOrgToggle = (login, checked) => {
    if (checked) {
      setSelectedOrgs((prev) => [...prev, login]);
    } else {
      setSelectedOrgs((prev) => prev.filter((l) => l !== login));
    }
  };

  // Derive selectAll state from selectedOrgs
  const selectAll =
    organizations.length > 0 && selectedOrgs.length === organizations.length;

  const handleContinue = () => {
    const selectedOrgObjects = organizations.filter((org) =>
      selectedOrgs.includes(org.login)
    );
    onContinue(selectedOrgObjects);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "48px 24px",
        backgroundColor: "var(--color-background)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          borderRadius: "16px",
          boxShadow: `
            0 8px 32px 0 rgba(31, 38, 135, 0.37),
            inset 0 1px 1px rgba(255, 255, 255, 0.3),
            inset 0 -1px 1px rgba(0, 0, 0, 0.1)
          `,
        }}
        bodyStyle={{ padding: "40px 32px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <Title
            level={3}
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "600",
              color: "var(--color-text)",
              marginBottom: "8px",
            }}
          >
            Select Organizations
          </Title>
          <Text
            style={{
              fontSize: "14px",
              color: "var(--color-textSecondary)",
            }}
          >
            Choose which accounts to fetch repositories from
          </Text>
        </div>

        {organizations.length === 0 && !loading && (
          <Alert
            message="No organizations found"
            description="No organizations were found for this account. Only personal repositories will be available."
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )}

        {/* Select All */}
        {organizations.length > 0 && (
          <>
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                marginBottom: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Checkbox
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "var(--color-text)",
                }}
              >
                Select All
              </Checkbox>
            </div>

            <Divider style={{ margin: "12px 0", borderColor: "rgba(255, 255, 255, 0.1)" }} />
          </>
        )}

        {/* Organization List */}
        <div
          style={{
            maxHeight: "320px",
            overflowY: "auto",
            marginBottom: "24px",
            paddingRight: "4px",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            {organizations.map((org) => (
              <div
                key={org.login}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  backgroundColor: selectedOrgs.includes(org.login)
                    ? "rgba(24, 144, 255, 0.1)"
                    : "rgba(255, 255, 255, 0.02)",
                  borderRadius: "8px",
                  border: `1px solid ${
                    selectedOrgs.includes(org.login)
                      ? "rgba(24, 144, 255, 0.3)"
                      : "rgba(255, 255, 255, 0.05)"
                  }`,
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onClick={() => handleOrgToggle(org.login, !selectedOrgs.includes(org.login))}
              >
                <Checkbox
                  checked={selectedOrgs.includes(org.login)}
                  onChange={(e) => handleOrgToggle(org.login, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginRight: "12px" }}
                />
                <Avatar
                  src={org.avatar_url}
                  icon={!org.avatar_url && <UserOutlined />}
                  size="small"
                  style={{
                    marginRight: "12px",
                    backgroundColor: "var(--color-primary)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--color-text)",
                      display: "block",
                    }}
                  >
                    {org.login}
                  </Text>
                  {org.type === "personal" && (
                    <Text
                      style={{
                        fontSize: "11px",
                        color: "var(--color-textSecondary)",
                      }}
                    >
                      Personal Account
                    </Text>
                  )}
                </div>
              </div>
            ))}
          </Space>
        </div>

        {/* Selection Summary */}
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(24, 144, 255, 0.05)",
            borderRadius: "8px",
            marginBottom: "24px",
            border: "1px solid rgba(24, 144, 255, 0.1)",
          }}
        >
          <Text
            style={{
              fontSize: "13px",
              color: "var(--color-textSecondary)",
            }}
          >
            <span style={{ color: "var(--color-primary)", fontWeight: "600" }}>
              {selectedOrgs.length}
            </span>{" "}
            of{" "}
            <span style={{ fontWeight: "600" }}>{organizations.length}</span>{" "}
            {selectedOrgs.length === 1 ? "organization" : "organizations"} selected
          </Text>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{
              flex: 1,
              height: "44px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "var(--color-text)",
            }}
          >
            Back
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={handleContinue}
            disabled={selectedOrgs.length === 0 || loading}
            loading={loading}
            style={{
              flex: 2,
              height: "44px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              backgroundColor: "var(--color-primary)",
              borderColor: "var(--color-primary)",
            }}
          >
            {loading ? "Loading..." : "Continue"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OrgSelector;
