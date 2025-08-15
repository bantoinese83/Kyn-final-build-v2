// withValidation HOC - Form validation and error handling
// Provides consistent validation patterns across components

import { ComponentType, useState, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ValidationRule<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: T[keyof T], allValues: T) => string | undefined;
  async?: (value: T[keyof T], allValues: T) => Promise<string | undefined>;
}

export interface ValidationSchema<T> {
  [key: string]: ValidationRule<T> | undefined;
}

export interface ValidationState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  asyncValidations: Set<keyof T>;
}

export interface WithValidationProps<T> {
  validation: {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isValid: boolean;
    isDirty: boolean;
    isSubmitting: boolean;
    asyncValidations: Set<keyof T>;
    setFieldValue: (field: keyof T, value: T[keyof T]) => void;
    setFieldTouched: (field: keyof T, touched?: boolean) => void;
    setFieldError: (field: keyof T, error: string | undefined) => void;
    validateField: (
      field: keyof T,
      value?: T[keyof T],
    ) => Promise<string | undefined>;
    validateForm: () => Promise<boolean>;
    resetValidation: () => void;
    resetField: (field: keyof T) => void;
    getFieldError: (field: keyof T) => string | undefined;
    isFieldTouched: (field: keyof T) => boolean;
    isFieldValid: (field: keyof T) => boolean;
    hasErrors: boolean;
  };
}

export interface WithValidationOptions<T> {
  displayName?: string;
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  showValidationErrors?: boolean;
  asyncValidationDelay?: number;
  onValidationChange?: (
    isValid: boolean,
    errors: Partial<Record<keyof T, string>>,
  ) => void;
}

export function withValidation<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  options: WithValidationOptions<T>,
) {
  const {
    displayName = "WithValidation",
    initialValues,
    validationSchema,
    validateOnChange = true,
    validateOnBlur = true,
    onValidationChange,
  } = options;

  const EnhancedComponent = (props: T) => {
    const { toast } = useToast();

    // Validation state
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>(
      {},
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [asyncValidations, setAsyncValidations] = useState<Set<keyof T>>(
      new Set(),
    );

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
      async (
        field: keyof T,
        value?: T[keyof T],
      ): Promise<string | undefined> => {
        if (!validationSchema || !validationSchema[String(field)])
          return undefined;

        const fieldValue = value !== undefined ? value : values[field];
        const rule = validationSchema[String(field)];

        if (!rule) return undefined;

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

        // Email validation
        if (rule.email && typeof fieldValue === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(fieldValue)) {
            return `${String(field).charAt(0).toUpperCase() + String(field).slice(1)} must be a valid email address`;
          }
        }

        // URL validation
        if (rule.url && typeof fieldValue === "string") {
          try {
            new URL(fieldValue);
          } catch {
            return `${String(field).charAt(0).toUpperCase() + String(field).slice(1)} must be a valid URL`;
          }
        }

        // Custom validation
        if (rule.custom) {
          const customError = rule.custom(fieldValue, values);
          if (customError) return customError;
        }

        // Async validation
        if (rule.async) {
          setAsyncValidations((prev) => new Set(prev).add(field));

          try {
            const asyncError = await rule.async(fieldValue, values);
            setAsyncValidations((prev) => {
              const newSet = new Set(prev);
              newSet.delete(field);
              return newSet;
            });

            if (asyncError) return asyncError;
          } catch (error) {
            setAsyncValidations((prev) => {
              const newSet = new Set(prev);
              newSet.delete(field);
              return newSet;
            });

            return "Validation failed";
          }
        }

        return undefined;
      },
      [validationSchema, values],
    );

    const validateForm = useCallback(async (): Promise<boolean> => {
      if (!validationSchema) return true;

      const newErrors: Partial<Record<keyof T, string>> = {};
      let hasErrors = false;

      for (const field of Object.keys(validationSchema)) {
        const fieldKey = field as keyof T;
        const error = await validateField(fieldKey);
        if (error) {
          newErrors[fieldKey] = error;
          hasErrors = true;
        }
      }

      setErrors(newErrors);

      if (onValidationChange) {
        onValidationChange(!hasErrors, newErrors);
      }

      return !hasErrors;
    }, [validationSchema, validateField, onValidationChange]);

    // Field management functions
    const setFieldValue = useCallback(
      (field: keyof T, value: T[keyof T]) => {
        setValues((prev) => ({ ...prev, [field]: value }));

        if (validateOnChange) {
          validateField(field, value).then((error) => {
            setErrors((prev) => ({
              ...prev,
              [field]: error,
            }));
          });
        }
      },
      [validateOnChange, validateField],
    );

    const setFieldTouched = useCallback(
      (field: keyof T, touched: boolean = true) => {
        setTouched((prev) => ({ ...prev, [field]: touched }));

        if (validateOnBlur && touched) {
          validateField(field).then((error) => {
            setErrors((prev) => ({
              ...prev,
              [field]: error,
            }));
          });
        }
      },
      [validateOnBlur, validateField],
    );

    const setFieldError = useCallback(
      (field: keyof T, error: string | undefined) => {
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
      },
      [],
    );

    const resetField = useCallback(
      (field: keyof T) => {
        setValues((prev) => ({ ...prev, [field]: initialValues[field] }));
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        setTouched((prev) => {
          const newTouched = { ...prev };
          delete newTouched[field];
          return newTouched;
        });
      },
      [initialValues],
    );

    const resetValidation = useCallback(() => {
      setValues(initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
      setAsyncValidations(new Set());
    }, [initialValues]);

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

    // Enhanced props
    const enhancedProps = {
      ...props,
      validation: {
        values,
        errors,
        touched,
        isValid,
        isDirty,
        isSubmitting,
        asyncValidations,
        setFieldValue,
        setFieldTouched,
        setFieldError,
        validateField,
        validateForm,
        resetValidation,
        resetField,
        getFieldError,
        isFieldTouched,
        isFieldValid,
        hasErrors,
      },
    };

    return <WrappedComponent {...enhancedProps} />;
  };

  // Set display name for debugging
  EnhancedComponent.displayName = `${displayName}(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return EnhancedComponent;
}

// Convenience HOC for simple validation
export function withSimpleValidation<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  initialValues: T,
  validationSchema?: ValidationSchema<T>,
) {
  return withValidation(WrappedComponent, {
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnSubmit: true,
  });
}

// Convenience HOC for strict validation
export function withStrictValidation<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  initialValues: T,
  validationSchema: ValidationSchema<T>,
) {
  return withValidation(WrappedComponent, {
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnSubmit: true,
    showValidationErrors: true,
  });
}

// Convenience HOC for lazy validation
export function withLazyValidation<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  initialValues: T,
  validationSchema?: ValidationSchema<T>,
) {
  return withValidation(WrappedComponent, {
    initialValues,
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    validateOnSubmit: true,
  });
}

// Convenience HOC for async validation
export function withAsyncValidation<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  initialValues: T,
  validationSchema: ValidationSchema<T>,
  asyncValidationDelay: number = 500,
) {
  return withValidation(WrappedComponent, {
    initialValues,
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    validateOnSubmit: true,
    asyncValidationDelay,
  });
}
