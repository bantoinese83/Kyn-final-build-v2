import { useState, useCallback } from "react";

export interface ToastOptions {
  title?: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  variant?: "default" | "destructive" | "outline"; // Add variant support
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
}

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = `toast-${++toastCount}`;

    // Map variant to type for compatibility
    let type = options.type;
    if (options.variant === "destructive" && !type) {
      type = "error";
    } else if (options.variant === "outline" && !type) {
      type = "info";
    }

    const toast: ToastItem = {
      id,
      ...options,
      type,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      return addToast(options);
    },
    [addToast],
  );

  const success = useCallback(
    (title: string, description?: string) => {
      return addToast({ title, description, type: "success" });
    },
    [addToast],
  );

  const error = useCallback(
    (title: string, description?: string) => {
      return addToast({ title, description, type: "error" });
    },
    [addToast],
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      return addToast({ title, description, type: "warning" });
    },
    [addToast],
  );

  const info = useCallback(
    (title: string, description?: string) => {
      return addToast({ title, description, type: "info" });
    },
    [addToast],
  );

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    removeToast,
  };
}
