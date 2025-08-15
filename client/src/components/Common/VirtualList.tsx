// Virtual List Component - Lightweight implementation for placeholder use
// Simple virtual scrolling without external dependencies

import {
  useState,
  useCallback,
  useRef,
} from "react";
import { LoadingState } from "../ui/patterns/LoadingState";
import { EmptyState } from "../ui/patterns/EmptyState";
import {
  ChevronUp,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";

// Virtual list item renderer function type
export type ItemRenderer<T> = (props: {
  item: T;
  index: number;
  style: React.CSSProperties;
  isSelected: boolean;
  onSelect: (item: T, isSelected: boolean) => void;
}) => React.ReactElement;

// Virtual list props interface
export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  itemRenderer: ItemRenderer<T>;
  height: number;
  width?: number | string;
  className?: string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  selectable?: boolean;
  multiSelect?: boolean;
  selectedItems?: Set<string>;
  onSelectionChange?: (selectedItems: Set<string>) => void;
  getItemKey?: (item: T, index: number) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterable?: boolean;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (value: string) => void;
  }>;
  sortable?: boolean;
  sortOptions?: Array<{ key: string; label: string }>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  pagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showScrollToTop?: boolean;
  onScroll?: (scrollOffset: number) => void;
  estimatedItemSize?: number;
  overscanCount?: number;
  useVariableSize?: boolean;
  itemSizeCache?: Map<number, number>;
  onItemSizeChange?: (index: number, size: number) => void;
}

// Virtual list component
export function VirtualList<T>({
  items,
  itemHeight,
  itemRenderer,
  height,
  width = "100%",
  className = "",
  loading = false,
  error = null,
  emptyMessage = "No items found",
  emptyIcon = null,
  selectable = false,
  multiSelect = false,
  selectedItems = new Set(),
  onSelectionChange,
  getItemKey = (_item: T, index: number) => index.toString(),
  searchable = false,
  searchPlaceholder = "Search items...",
  searchValue = "",
  onSearchChange,
  filterable = false,
  filters = [],
  sortable = false,
  sortOptions = [],
  sortBy = "",
  sortOrder = "asc",
  onSortChange,
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showScrollToTop = true,
  onScroll,
}: VirtualListProps<T>) {
  // State for scroll to top button
  const [showScrollToTopState, setShowScrollToTopState] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollToTopRef = useRef<HTMLButtonElement>(null);

  // Memoized item height function
  const getItemHeight = useCallback(
    (index: number): number => {
      if (typeof itemHeight === "function") {
        return itemHeight(index);
      }
      return itemHeight;
    },
    [itemHeight],
  );

  // Handle item selection
  const handleItemSelect = useCallback(
    (item: T, isSelected: boolean) => {
      if (!selectable || !onSelectionChange) return;

      const newSelectedItems = new Set(selectedItems);

      if (isSelected) {
        if (multiSelect) {
          newSelectedItems.add(getItemKey(item, items.indexOf(item)));
        } else {
          newSelectedItems.clear();
          newSelectedItems.add(getItemKey(item, items.indexOf(item)));
        }
      } else {
        newSelectedItems.delete(getItemKey(item, items.indexOf(item)));
      }

      onSelectionChange(newSelectedItems);
    },
    [
      selectable,
      multiSelect,
      selectedItems,
      onSelectionChange,
      getItemKey,
      items,
    ],
  );

  // Handle scroll events
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const scrollOffset = event.currentTarget.scrollTop;
      setShowScrollToTopState(scrollOffset > 100);
      onScroll?.(scrollOffset);
    },
    [onScroll],
  );

  // Scroll to top
  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        onPageChange?.(page);
      }
    },
    [totalPages, onPageChange],
  );

  // Loading state
  if (loading) {
    return (
      <div className={`virtual-list ${className}`} style={{ height, width }}>
        <LoadingState message="Loading items..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`virtual-list ${className}`} style={{ height, width }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Items
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={`virtual-list ${className}`} style={{ height, width }}>
        <EmptyState
          title={emptyMessage}
          icon={emptyIcon}
          className="h-full"
        />
      </div>
    );
  }

  return (
    <div className={`virtual-list ${className}`} style={{ height, width }}>
      {/* Search Bar */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Filters */}
      {filterable && filters.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  {filter.label}:
                </label>
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sort Controls */}
      {sortable && sortOptions.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value, sortOrder)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSortChange?.(sortBy, sortOrder === "asc" ? "desc" : "asc")}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Virtual List Container */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: height - (searchable || filterable || sortable ? 120 : 0) }}
        onScroll={handleScroll}
      >
        <div style={{ height: items.length * getItemHeight(0) }}>
          {items.map((item, index) => {
            const isSelected = selectedItems.has(getItemKey(item, index));
            const style: React.CSSProperties = {
              position: "absolute",
              top: index * getItemHeight(index),
              height: getItemHeight(index),
              width: "100%",
            };

            return (
              <div key={getItemKey(item, index)} style={style}>
                {itemRenderer({
                  item,
                  index,
                  style,
                  isSelected,
                  onSelect: handleItemSelect,
                })}
              </div>
            );
          })}
        </div>

        {/* Scroll to Top Button */}
        {showScrollToTop && showScrollToTopState && (
          <button
            ref={scrollToTopRef}
            onClick={scrollToTop}
            className="absolute bottom-4 right-4 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the component
export default VirtualList;
