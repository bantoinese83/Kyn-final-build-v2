// Centralized component prop interfaces
// Eliminates duplication across components and ensures consistency

import { ReactNode } from "react";

// Base component props that most components should extend
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  "data-testid"?: string;
}

// Common form-related props
export interface FormProps extends BaseComponentProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  isValid?: boolean;
  errors?: Record<string, string>;
}

// Common modal/dialog props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

// Common card props
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  footer?: ReactNode;
  variant?: "default" | "outline" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
}

// Common list item props
export interface ListItemProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  avatarFallback?: string;
  action?: ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  isDisabled?: boolean;
}

// Common button props
export interface ButtonProps extends BaseComponentProps {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

// Common input props
export interface InputProps extends BaseComponentProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

// Common select props
export interface SelectProps extends BaseComponentProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
}

// Common checkbox props
export interface CheckboxProps extends BaseComponentProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
}

// Common radio group props
export interface RadioGroupProps extends BaseComponentProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  direction?: "horizontal" | "vertical";
}

// Common textarea props
export interface TextareaProps extends BaseComponentProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  minLength?: number;
}

// Common avatar props
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  shape?: "circle" | "square";
  status?: "online" | "offline" | "away" | "busy";
}

// Common badge props
export interface BadgeProps extends BaseComponentProps {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

// Common tooltip props
export interface TooltipProps extends BaseComponentProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  children: ReactNode;
}

// Common dropdown props
export interface DropdownProps extends BaseComponentProps {
  trigger: ReactNode;
  items: Array<{
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: ReactNode;
    divider?: boolean;
  }>;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

// Common table props
export interface TableProps extends BaseComponentProps {
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: "left" | "center" | "right";
  }>;
  data: Record<string, any>[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowClick?: (row: Record<string, any>) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

// Common pagination props
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
}

// Common loading states
export interface LoadingStateProps extends BaseComponentProps {
  isLoading: boolean;
  loadingText?: string;
  error?: string;
  onRetry?: () => void;
  children: ReactNode;
}

// Common empty state props
export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  image?: string;
}

// Common error boundary props
export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  children: ReactNode;
}

// Common layout props
export interface LayoutProps extends BaseComponentProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  mainContent: ReactNode;
  sidebarPosition?: "left" | "right";
  sidebarCollapsible?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: (collapsed: boolean) => void;
}
