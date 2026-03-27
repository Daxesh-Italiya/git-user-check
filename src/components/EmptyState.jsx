/**
 * EmptyState Component
 * Reusable empty state for tables, lists, and searches
 */

import React from "react";
import { Empty, Button, Space, Typography } from "antd";
import {
  InboxOutlined,
  SearchOutlined,
  ClearOutlined,
} from "@ant-design/icons";

const { Text, Paragraph } = Typography;

/**
 * EmptyState Component
 * @param {Object} props - Component props
 * @param {string} props.type - Type of empty state: 'search', 'filter', 'data', 'error'
 * @param {string} props.title - Title of empty state
 * @param {string} props.description - Description text
 * @param {Function} props.onClear - Callback for clear/reset button
 * @param {React.ReactNode} props.action - Custom action element
 * @param {string} props.icon - Icon type: 'inbox', 'search', 'filter', etc.
 */
function EmptyState({
  type = "data",
  title = "No Data",
  description = "Nothing to display here",
  onClear = null,
  action = null,
  icon = "inbox",
}) {
  const getIcon = () => {
    switch (icon) {
      case "search":
        return (
          <SearchOutlined
            style={{ fontSize: "48px", color: "var(--color-textTertiary)" }}
          />
        );
      case "filter":
        return (
          <ClearOutlined
            style={{ fontSize: "48px", color: "var(--color-textTertiary)" }}
          />
        );
      case "inbox":
      default:
        return (
          <InboxOutlined
            style={{ fontSize: "48px", color: "var(--color-textTertiary)" }}
          />
        );
    }
  };

  const getDefaultAction = () => {
    switch (type) {
      case "search":
        return (
          <Paragraph
            style={{ color: "var(--color-textSecondary)", marginBottom: 0 }}
          >
            Try adjusting your search terms or filters
          </Paragraph>
        );

      case "filter":
        return (
          onClear && (
            <Button type="primary" onClick={onClear} icon={<ClearOutlined />}>
              Clear Filters
            </Button>
          )
        );

      case "error":
        return (
          <Paragraph
            style={{ color: "var(--color-textSecondary)", marginBottom: 0 }}
          >
            An error occurred. Please try again later.
          </Paragraph>
        );

      case "data":
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--spacing-3xl)",
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        minHeight: "200px",
      }}
    >
      <div style={{ marginBottom: "var(--spacing-lg)" }}>{getIcon()}</div>

      <Text
        strong
        style={{
          fontSize: "var(--font-size-lg)",
          marginBottom: "var(--spacing-md)",
        }}
      >
        {title}
      </Text>

      <Paragraph
        style={{
          color: "var(--color-textSecondary)",
          textAlign: "center",
          maxWidth: "400px",
          marginBottom: "var(--spacing-lg)",
        }}
      >
        {description}
      </Paragraph>

      <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
        {action || getDefaultAction()}
      </div>
    </div>
  );
}

export default EmptyState;
