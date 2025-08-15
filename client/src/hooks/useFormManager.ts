// Form Manager Hook - Comprehensive form state management
// Eliminates duplicate form logic and provides consistent patterns

import { useState, useCallback, useMemo } from "react";
import { useToast } from "./use-toast";

export interface ValidationRule<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T[keyof T], allValues: T) => string | undefined;
}

export interface ValidationSchema<T> {
  [key: string]: ValidationRule<T> | undefined;
}

export interface FormField<T> {
  name: keyof T;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "date"
    | "file";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: ValidationRule<T>;
  disabled?: boolean;
  className?: string;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormManagerOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  onSubmit?: (values: T) => Promise<void>;
  onReset?: () => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useFormManager<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  onReset,
  validateOnChange = true,
  validateOnBlur = true,
}: FormManagerOptions<T>) {
  const { toast } = useToast();

  // Form state
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed properties
  const isValid = useMemo(() => {
    if (!validationSchema) return true;
    return Object.keys(validationSchema).every((field) => {
      const fieldKey = field as keyof T;
      return !errors[fieldKey];
    });
  }, [errors, validationSchema]);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  // Validation functions
  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): string | undefined => {
      if (!validationSchema || !validationSchema[field]) return undefined;

      const rule = validationSchema[field]!;
      const fieldValue = value;

      // Required validation
      if (
        rule.required &&
        (!fieldValue ||
          (typeof fieldValue === "string" && fieldValue.trim() === ""))
      ) {
        return `${String(field).charAt(0).toUpperCase() + String(field).slice(1)} is required`;
      }

      // Skip other validations if field is empty and not required
      if (!fieldValue) return undefined;

      // Min length validation
      if (
        rule.minLength &&
        typeof fieldValue === "string" &&
        fieldValue.length < rule.minLength
      ) {
        return `${String(field).charAt(0).toUpperCase() + String(field).slice(1)} must be at least ${rule.minLength} characters`;
      }

      // Max length validation
      if (
        rule.maxLength &&
        typeof fieldValue === "string" &&
        fieldValue.length > rule.maxLength
      ) {
        return `${String(field).charAt(0).toUpperCase() + String(field).slice(1)} must be no more than ${rule.maxLength} characters`;
      }

      // Pattern validation
      if (
        rule.pattern &&
        typeof fieldValue === "string" &&
        !rule.pattern.test(fieldValue)
      ) {
        return `${String(field).charAt(0).toUpperCase() + String(field).slice(1)} format is invalid`;
      }

      // Custom validation
      if (rule.custom) {
        return rule.custom(fieldValue, values);
      }

      return undefined;
    },
    [validationSchema, values],
  );

  const validateForm = useCallback((): boolean => {
    if (!validationSchema) return true;

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach((field) => {
      const fieldKey = field as keyof T;
      const error = validateField(fieldKey, values[fieldKey]);
      if (error) {
        newErrors[fieldKey] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationSchema, validateField, values]);

  // Field change handlers
  const setFieldValue = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Clear error when field is modified
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }

      // Validate on change if enabled
      if (validateOnChange) {
        const error = validateField(field, value);
        if (error !== errors[field]) {
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      }
    },
    [errors, validateOnChange, validateField],
  );

  const setFieldTouched = useCallback(
    (field: keyof T, touched: boolean = true) => {
      setTouched((prev) => ({ ...prev, [field]: touched }));

      // Validate on blur if enabled
      if (validateOnBlur && touched) {
        const error = validateField(field, values[field]);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [validateOnBlur, validateField, values],
  );

  const handleFieldChange = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setFieldValue(field, value);
    },
    [setFieldValue],
  );

  const handleFieldBlur = useCallback(
    (field: keyof T) => {
      setFieldTouched(field, true);
    },
    [setFieldTouched],
  );

  // Form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (!onSubmit) return;

      // Validate form before submission
      if (!validateForm()) {
        toast({
          title: "Validation Error",
          description: "Please fix the errors in the form",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);

        // Show success message
        toast({
          title: "Success",
          description: "Form submitted successfully",
        });

        // Reset form if no custom reset handler
        if (!onReset) {
          resetForm();
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to submit form",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, values, validateForm, toast, onReset],
  );

  // Form reset
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const resetField = useCallback(
    (field: keyof T) => {
      setValues((prev) => ({ ...prev, [field]: initialValues[field] }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setTouched((prev) => ({ ...prev, [field]: false }));
    },
    [initialValues],
  );

  // Field helpers
  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      return errors[field];
    },
    [errors],
  );

  const isFieldTouched = useCallback(
    (field: keyof T): boolean => {
      return !!touched[field];
    },
    [touched],
  );

  const isFieldValid = useCallback(
    (field: keyof T): boolean => {
      return !errors[field];
    },
    [errors],
  );

  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: values[field],
      onChange: (value: T[keyof T]) => handleFieldChange(field, value),
      onBlur: () => handleFieldBlur(field),
      error: getFieldError(field),
      touched: isFieldTouched(field),
      valid: isFieldValid(field),
      disabled: isSubmitting,
    }),
    [
      field,
      values,
      handleFieldChange,
      handleFieldBlur,
      getFieldError,
      isFieldTouched,
      isFieldValid,
      isSubmitting,
    ],
  );

  // Bulk operations
  const setMultipleFields = useCallback((updates: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...updates }));
  }, []);

  const setMultipleErrors = useCallback(
    (errorUpdates: Partial<Record<keyof T, string>>) => {
      setErrors((prev) => ({ ...prev, ...errorUpdates }));
    },
    [],
  );

  const setMultipleTouched = useCallback(
    (touchedUpdates: Partial<Record<keyof T, boolean>>) => {
      setTouched((prev) => ({ ...prev, ...touchedUpdates }));
    },
    [],
  );

  // Form state object
  const formState: FormState<T> = {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
  };

  return {
    // Form state
    formState,
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    hasErrors,

    // Field operations
    setFieldValue,
    setFieldTouched,
    handleFieldChange,
    handleFieldBlur,
    getFieldError,
    isFieldTouched,
    isFieldValid,
    getFieldProps,

    // Form operations
    handleSubmit,
    resetForm,
    resetField,
    validateForm,
    validateField,

    // Bulk operations
    setMultipleFields,
    setMultipleErrors,
    setMultipleTouched,

    // Utilities
    setValues,
    setErrors,
    setTouched,
    setIsSubmitting,
  };
}

// Convenience hook for simple forms
export function useSimpleForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit?: (values: T) => Promise<void>,
) {
  return useFormManager({
    initialValues,
    onSubmit,
    validateOnChange: false,
    validateOnBlur: false,
  });
}

// Convenience hook for forms with validation
export function useValidatedForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ValidationSchema<T>,
  onSubmit?: (values: T) => Promise<void>,
) {
  return useFormManager({
    initialValues,
    validationSchema,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
  });
}
