import React, { useState } from "react";
import { Form, Input, Button, Alert, Card, Typography } from "antd";

const { Title, Text } = Typography;

const TokenInput = ({ onSubmit, loading }) => {
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setError(null);
    try {
      await onSubmit(values.token);
    } catch (err) {
      setError(
        err.message || "Failed to authenticate. Please check your token.",
      );
    }
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
          maxWidth: "480px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          borderRadius: "16px",
          boxShadow: `
            0 8px 32px 0 rgba(53, 183, 41, 0.25),
            inset 0 1px 1px rgba(255, 255, 255, 0.3),
            inset 0 -1px 1px rgba(0, 0, 0, 0.1)
          `,
        }}
        bodyStyle={{ padding: "56px 48px" }}
      >
        {/* Logo Area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: "48px",
            gap: "16px",
          }}
        >
          <img
            src="/logo.png"
            alt="Company Logo"
            style={{
              height: "56px",
              borderRadius: "12px",
              objectFit: "contain",
            }}
          />
          <div>
            <Title
              level={2}
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "700",
                color: "var(--color-text)",
                lineHeight: "1.2",
              }}
            >
              GitHub Manager
            </Title>
            <Text
              style={{
                fontSize: "13px",
                color: "var(--color-textSecondary)",
                display: "block",
                marginTop: "6px",
              }}
            >
              Secure access management
            </Text>
          </div>
        </div>

        {error && (
          <Alert
            message="Authentication Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{
              marginBottom: "24px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 77, 79, 0.2)",
              backgroundColor: "rgba(255, 77, 79, 0.05)",
            }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label={
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-text)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                GitHub Personal Access Token
              </span>
            }
            name="token"
            rules={[
              { required: true, message: "Please enter your GitHub token" },
              { min: 10, message: "Token appears to be too short" },
            ]}
            style={{ marginBottom: "24px" }}
          >
            <Input.Password
              placeholder="ghp_xxxxxxxxxxxx"
              size="large"
              visibilityToggle
              style={{
                borderRadius: "10px",
                fontSize: "14px",
                padding: "10px 16px",

                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow:
                  "inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 255, 255, 0.05)",
                transition: "all 0.3s ease",
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                fontSize: "15px",
                fontWeight: "600",
                height: "44px",
                marginTop: "50px",
                borderRadius: "10px",
                backgroundColor: "var(--color-primary)",
                borderColor: "var(--color-primary)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--color-primaryHover)";
                e.target.style.borderColor = "var(--color-primaryHover)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "var(--color-primary)";
                e.target.style.borderColor = "var(--color-primary)";
              }}
            >
              {loading ? "Connecting..." : "Connect to GitHub"}
            </Button>
          </Form.Item>
        </Form>

        {/* Security Info */}
        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            backgroundColor: "rgba(53, 183, 41, 0.04)",
            border: "1px solid rgba(53, 183, 41, 0.1)",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Text
            style={{
              fontSize: "12px",
              color: "var(--color-textSecondary)",
              display: "block",
              lineHeight: "1.6",
            }}
          >
            <span style={{ marginRight: "4px" }}>🔒</span> Your token is stored
            only in memory and never persisted.
            <br />
            <span
              style={{ fontSize: "11px", marginTop: "4px", display: "block" }}
            >
              Required scopes:{" "}
              <code
                style={{
                  fontSize: "11px",
                  color: "var(--color-primary)",
                  fontWeight: "500",
                }}
              >
                repo, read:org
              </code>
            </span>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default TokenInput;
