/**
 * SearchFilterPanel Component
 * Provides advanced search, filtering, and sorting UI
 * Flexible component for filtering repos, users, and other data
 */

import React, { useState } from "react";
import {
  Input,
  Button,
  Tag,
  Space,
  Dropdown,
  Row,
  Col,
  Collapse,
  Select,
  Segmented,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useTheme } from "../context/ThemeContext";

/**
 * SearchFilterPanel Component
 * @param {Object} props - Component props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Callback when search changes
 * @param {Object} props.filterCriteria - Current filter criteria
 * @param {Function} props.onFilterChange - Callback when filters change
 * @param {Function} props.onClearFilters - Callback to clear all filters
 * @param {number} props.activeFilterCount - Number of active filters
 * @param {Array} props.filterOptions - Array of filter configuration objects
 * @param {string} props.sortBy - Current sort column
 * @param {string} props.sortOrder - Current sort order ('ascend' | 'descend')
 * @param {Function} props.onSortChange - Callback when sort changes
 * @param {number} props.resultCount - Number of results after filtering
 * @param {string} props.placeholder - Search input placeholder
 * @param {React.ReactNode} props.children - Custom filter content (optional)
 */
function SearchFilterPanel({
  searchTerm = "",
  onSearchChange = () => {},
  filterCriteria = {},
  onFilterChange = () => {},
  onClearFilters = () => {},
  activeFilterCount = 0,
  filterOptions = [],
  sortBy = null,
  sortOrder = "ascend",
  onSortChange = () => {},
  resultCount = 0,
  placeholder = "Search...",
  children = null,
  compactMode = false,
}) {
  const { theme } = useTheme();
  const [filterPanelExpanded, setFilterPanelExpanded] = useState(!compactMode);

  // Render individual filter UI based on type
  const renderFilterUI = (option) => {
    const { key, label, type, values } = option;
    const currentValue = filterCriteria[key];

    switch (type) {
      case "select":
        return (
          <div key={key}>
            <label
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                display: "block",
                marginBottom: "var(--spacing-sm)",
              }}
            >
              {label}
            </label>
            <Select
              mode="multiple"
              placeholder={`Select ${label.toLowerCase()}...`}
              options={values.map((v) => ({ label: v, value: v }))}
              value={Array.isArray(currentValue) ? currentValue : []}
              onChange={(val) => onFilterChange(key, val)}
              style={{ width: "100%" }}
              maxTagCount="responsive"
            />
          </div>
        );

      case "checkbox":
        return (
          <div key={key}>
            <label
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                display: "block",
                marginBottom: "var(--spacing-sm)",
              }}
            >
              {label}
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--spacing-md)",
              }}
            >
              {values.map((v) => (
                <Tag
                  key={v}
                  color={
                    Array.isArray(currentValue) && currentValue.includes(v)
                      ? "blue"
                      : "default"
                  }
                  onClick={() => {
                    const newVal = Array.isArray(currentValue)
                      ? currentValue
                      : [];
                    if (newVal.includes(v)) {
                      onFilterChange(
                        key,
                        newVal.filter((x) => x !== v),
                      );
                    } else {
                      onFilterChange(key, [...newVal, v]);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    padding: "var(--spacing-xs) var(--spacing-md)",
                  }}
                >
                  {v}
                </Tag>
              ))}
            </div>
          </div>
        );

      case "range":
        return (
          <div key={key}>
            <label
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                display: "block",
                marginBottom: "var(--spacing-sm)",
              }}
            >
              {label}
            </label>
            <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
              <Input
                type="number"
                placeholder="Min"
                value={currentValue?.[0] ?? ""}
                onChange={(e) => {
                  const newVal = [
                    parseInt(e.target.value) || 0,
                    currentValue?.[1] ?? 100,
                  ];
                  onFilterChange(key, newVal);
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                value={currentValue?.[1] ?? ""}
                onChange={(e) => {
                  const newVal = [
                    currentValue?.[0] ?? 0,
                    parseInt(e.target.value) || 100,
                  ];
                  onFilterChange(key, newVal);
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Sort options dropdown menu
  const sortMenuItems = [
    {
      key: "asc",
      label: (
        <span>
          <SortAscendingOutlined /> Ascending
        </span>
      ),
      onClick: () => onSortChange(sortBy, "ascend"),
    },
    {
      key: "desc",
      label: (
        <span>
          <SortDescendingOutlined /> Descending
        </span>
      ),
      onClick: () => onSortChange(sortBy, "descend"),
    },
  ];

  // Show results indicator
  const resultsText =
    resultCount > 0
      ? `${resultCount} result${resultCount !== 1 ? "s" : ""} found`
      : "No results";

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--spacing-lg)",
        marginBottom: "var(--spacing-lg)",
      }}
    >
      {/* Search Input Row */}
      <Row
        gutter={[16, 16]}
        align="middle"
        style={{ marginBottom: "var(--spacing-lg)" }}
      >
        <Col xs={24} sm={24} md={16}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            size="large"
            style={{
              backgroundColor: "var(--color-bgPrimary)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            {activeFilterCount > 0 && (
              <Button
                type="text"
                icon={<ClearOutlined />}
                onClick={onClearFilters}
                danger
              >
                Clear ({activeFilterCount})
              </Button>
            )}
            <Button
              type={filterPanelExpanded ? "primary" : "default"}
              icon={<FilterOutlined />}
              onClick={() => setFilterPanelExpanded(!filterPanelExpanded)}
            >
              {activeFilterCount > 0
                ? `Filters (${activeFilterCount})`
                : "Filters"}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Filter Panel */}
      {filterPanelExpanded && filterOptions.length > 0 && (
        <div
          style={{
            marginBottom: "var(--spacing-lg)",
            paddingBottom: "var(--spacing-lg)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <Row gutter={[24, 24]}>
            {filterOptions.map((option) => (
              <Col xs={24} sm={12} md={8} lg={6} key={option.key}>
                {renderFilterUI(option)}
              </Col>
            ))}
          </Row>
          {children && (
            <div style={{ marginTop: "var(--spacing-lg)" }}>{children}</div>
          )}
        </div>
      )}

      {/* Sort & Results Row */}
      <Row justify="space-between" align="middle">
        <Col>
          <span
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-textSecondary)",
            }}
          >
            {resultsText}
          </span>
        </Col>
        {sortBy && (
          <Col>
            <Dropdown menu={{ items: sortMenuItems }}>
              <Button type="text" size="small">
                {sortOrder === "ascend" ? (
                  <SortAscendingOutlined />
                ) : (
                  <SortDescendingOutlined />
                )}
                Sort <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        )}
      </Row>
    </div>
  );
}

export default SearchFilterPanel;
