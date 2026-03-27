/**
 * useAdvancedFilter Hook
 * Centralized filter and sort logic for tables
 * Handles: multi-criteria filtering, debounced search, sorting, memoization
 */

import { useState, useCallback, useMemo } from "react";

/**
 * Hook for managing advanced filtering and sorting
 * @param {Array} items - Array of items to filter
 * @param {Object} config - Configuration for filtering
 * @param {Function} config.getSearchableFields - (item) => string[] of fields to search in
 * @param {Function} config.filterFn - (item, filters) => boolean - custom filter logic
 * @returns {Object} Filter state and methods
 */
export function useAdvancedFilter(items = [], config = {}) {
  const {
    getSearchableFields = null,
    filterFn = null,
    debounceMs = 300,
  } = config;

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState({});
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("ascend"); // 'ascend' | 'descend'

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search input
  const handleSearchChange = useCallback(
    (value) => {
      setSearchTerm(value);

      // Clear existing timer if any
      clearTimeout(handleSearchChange._timeout);

      // Set new timer
      handleSearchChange._timeout = setTimeout(() => {
        setDebouncedSearchTerm(value);
      }, debounceMs);
    },
    [debounceMs],
  );

  // Update single filter criterion
  const setFilter = useCallback((key, value) => {
    setFilterCriteria((prev) => ({
      ...prev,
      [key]: value === undefined ? undefined : value,
    }));
  }, []);

  // Update multiple filter criteria at once
  const setFilters = useCallback((newFilters) => {
    setFilterCriteria((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(newFilters).filter(([_, v]) => v !== undefined),
      ),
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setFilterCriteria({});
    setSortBy(null);
    setSortOrder("ascend");
  }, []);

  // Apply search and filtering
  const filteredItems = useMemo(() => {
    let result = items;

    // Apply search filter
    if (debouncedSearchTerm && getSearchableFields) {
      const lowerTerm = debouncedSearchTerm.toLowerCase();

      result = result.filter((item) => {
        const fields = getSearchableFields(item);
        return fields.some((field) =>
          (field || "").toString().toLowerCase().includes(lowerTerm),
        );
      });
    }

    // Apply custom filter function
    if (filterFn) {
      result = result.filter((item) => filterFn(item, filterCriteria));
    }

    return result;
  }, [
    items,
    debouncedSearchTerm,
    filterCriteria,
    getSearchableFields,
    filterFn,
  ]);

  // Apply sorting
  const sortedItems = useMemo(() => {
    if (!sortBy) return filteredItems;

    const sorted = [...filteredItems];

    sorted.sort((a, b) => {
      const aVal = typeof sortBy === "function" ? sortBy(a) : a[sortBy];
      const bVal = typeof sortBy === "function" ? sortBy(b) : b[sortBy];

      if (aVal < bVal) return sortOrder === "ascend" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "ascend" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredItems, sortBy, sortOrder]);

  // Handle sort change (toggle order if same column)
  const handleSort = useCallback(
    (column) => {
      if (sortBy === column) {
        // Toggle order
        setSortOrder((prev) => (prev === "ascend" ? "descend" : "ascend"));
      } else {
        // Set new sort column
        setSortBy(column);
        setSortOrder("ascend");
      }
    },
    [sortBy],
  );

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSearchTerm) count++;
    count += Object.values(filterCriteria).filter(
      (v) => v !== null && v !== undefined && v !== "" && v.length !== 0,
    ).length;
    return count;
  }, [debouncedSearchTerm, filterCriteria]);

  return {
    // State
    searchTerm,
    debouncedSearchTerm,
    filterCriteria,
    sortBy,
    sortOrder,
    activeFilterCount,

    // Results
    filteredItems,
    sortedItems,
    resultCount: sortedItems.length,

    // Methods
    handleSearchChange,
    setFilter,
    setFilters,
    clearFilters,
    handleSort,
  };
}

export default useAdvancedFilter;
