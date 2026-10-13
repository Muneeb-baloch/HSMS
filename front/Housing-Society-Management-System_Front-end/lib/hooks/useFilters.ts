
import { debounce } from "lodash";
import { useCallback, useMemo, useState } from "react";

interface UseFiltersOptions<T> {
  initialFilters: T;
  onFilterChange?: (filters: T) => void;
  onSearch?: (search: string) => void;
  debounceDelay?: number;
}

export function useFilters<T extends Record<string, unknown>>({
  initialFilters,
  onFilterChange,
  onSearch,
  debounceDelay = 500,
}: UseFiltersOptions<T>) {
  const [filters, setFilters] = useState<T>(initialFilters);
  const [search, setSearch] = useState<string>("");

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        if (onSearch) onSearch(value);
      }, debounceDelay),
    [onSearch, debounceDelay],
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleFilterChange = useCallback(
    (id: keyof T, value: unknown) => {
      const newFilters = { ...filters };

      // Remove filter if value is empty, 'all', or undefined
      if (value === "" || value === "all" || value === undefined) {
        delete newFilters[id];
      } else {
        newFilters[id] = value as T[keyof T];
      }

      setFilters(newFilters);
      if (onFilterChange) onFilterChange(newFilters);
    },
    [filters, onFilterChange],
  );

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearch("");
    if (onSearch) onSearch("");
    if (onFilterChange) onFilterChange(initialFilters);
  }, [initialFilters, onFilterChange, onSearch]);

  const hasActiveFilters = useMemo(() => {
    return (
      Object.keys(filters).some(
        (key) => filters[key] !== initialFilters[key as keyof T],
      ) || search !== ""
    );
  }, [filters, initialFilters, search]);

  return {
    filters,
    search,
    handleSearch,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
  };
}
