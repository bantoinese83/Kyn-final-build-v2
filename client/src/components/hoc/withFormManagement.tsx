// withFormManagement HOC - Eliminates repeated form logic
// Provides consistent form state, validation, and submission handling

import React, { ComponentType } from "react";
import { useFormManager, ValidationSchema } from "@/hooks/useFormManager";

export interface WithFormManagementProps<T> {
  formState: {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    isValid: boolean;
    isDirty: boolean;
  };
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  hasErrors: boolean;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  handleFieldChange: (field: keyof T, value: T[keyof T]) => void;
  handleFieldBlur: (field: keyof T) => void;
  getFieldError: (field: keyof T) => string | undefined;
  isFieldTouched: (field: keyof T) => boolean;
  isFieldValid: (field: keyof T) => boolean;
  getFieldProps: (field: keyof T) => {
    value: T[keyof T];
    onChange: (value: T[keyof T]) => void;
    onBlur: () => void;
    error: string | undefined;
    touched: boolean;
    valid: boolean;
    disabled: boolean;
  };
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  resetField: (field: keyof T) => void;
  validateForm: () => boolean;
  validateField: (field: keyof T, value: T[keyof T]) => string | undefined;
  setMultipleFields: (updates: Partial<T>) => void;
  setMultipleErrors: (errorUpdates: Partial<Record<keyof T, string>>) => void;
  setMultipleTouched: (
    touchedUpdates: Partial<Record<keyof T, boolean>>,
  ) => void;
}

export interface WithFormManagementOptions<T> {
  displayName?: string;
  showFormWrapper?: boolean;
  formClassName?: string;
  submitButtonText?: string;
  resetButtonText?: string;
  showResetButton?: boolean;
  showSubmitButton?: boolean;
  onSubmit?: (values: T) => Promise<void>;
  onReset?: () => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function withFormManagement<T extends Record<string, any>>(
  WrappedComponent: ComponentType<any>,
  initialValues: T,
  validationSchema?: ValidationSchema<T>,
  options: WithFormManagementOptions<T> = {},
) {
  const {
    displayName = "WithFormManagement",
    showFormWrapper = true,
    formClassName = "",
    submitButtonText = "Submit",
    resetButtonText = "Reset",
    showResetButton = true,
    showSubmitButton = true,
    onSubmit,
    onReset,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const EnhancedComponent = (props: any) => {
    const form = useFormManager({
      initialValues,
      validationSchema,
      onSubmit,
      onReset,
      validateOnChange,
      validateOnBlur,
    });

    // Pass form props to wrapped component
    const enhancedProps = {
      ...props,
      ...form,
    };

    // If form wrapper is disabled, render component directly
    if (!showFormWrapper) {
      return <WrappedComponent {...enhancedProps} />;
    }

    // Render with form wrapper
    return (
      <form
        onSubmit={form.handleSubmit}
        className={`space-y-6 ${formClassName}`}
      >
        <WrappedComponent {...enhancedProps} />

        {/* Form Actions */}
        {(showSubmitButton || showResetButton) && (
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            {showResetButton && (
              <button
                type="button"
                onClick={form.resetForm}
                disabled={form.isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetButtonText}
              </button>
            )}

            {showSubmitButton && (
              <button
                type="submit"
                disabled={!form.isValid || form.isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {form.isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  submitButtonText
                )}
              </button>
            )}
          </div>
        )}
      </form>
    );
  };

  // Set display name for debugging
  EnhancedComponent.displayName = `${displayName}(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return EnhancedComponent;
}

// Convenience HOC for simple forms
export function withSimpleForm<T extends Record<string, any>>(
  WrappedComponent: ComponentType<any>,
  initialValues: T,
  onSubmit?: (values: T) => Promise<void>,
) {
  return withFormManagement(WrappedComponent, initialValues, undefined, {
    showFormWrapper: true,
    showResetButton: false,
    onSubmit,
  });
}

// Convenience HOC for validated forms
export function withValidatedForm<T extends Record<string, any>>(
  WrappedComponent: ComponentType<any>,
  initialValues: T,
  validationSchema: ValidationSchema<T>,
  onSubmit?: (values: T) => Promise<void>,
) {
  return withFormManagement(WrappedComponent, initialValues, validationSchema, {
    showFormWrapper: true,
    showResetButton: true,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
  });
}

// Convenience HOC for forms without wrapper
export function withFormLogic<T extends Record<string, any>>(
  WrappedComponent: ComponentType<any>,
  initialValues: T,
  validationSchema?: ValidationSchema<T>,
  onSubmit?: (values: T) => Promise<void>,
) {
  return withFormManagement(WrappedComponent, initialValues, validationSchema, {
    showFormWrapper: false,
    onSubmit,
  });
}
