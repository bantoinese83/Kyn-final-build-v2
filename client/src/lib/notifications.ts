// Centralized notification system
// Standardizes toast messages and eliminates duplicate notification logic

export interface NotificationOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Common notification messages for consistency
export const notificationMessages = {
  // Success messages
  success: {
    created: (item: string) => `${item} created successfully!`,
    updated: (item: string) => `${item} updated successfully!`,
    deleted: (item: string) => `${item} deleted successfully!`,
    saved: (item: string) => `${item} saved successfully!`,
    uploaded: (item: string) => `${item} uploaded successfully!`,
    joined: (item: string) => `Successfully joined ${item}!`,
    left: (item: string) => `Successfully left ${item}`,
    shared: (item: string) => `${item} shared successfully!`,
    favorited: (item: string) => `${item} added to favorites!`,
    unfavorited: (item: string) => `${item} removed from favorites`,
    voted: (item: string) => `Vote submitted successfully!`,
    rsvp: (status: string) => `RSVP status updated to ${status}`,
  },

  // Error messages
  error: {
    generic: (action: string) => `Failed to ${action}. Please try again.`,
    notFound: (item: string) => `${item} not found.`,
    unauthorized: () => `You don't have permission to perform this action.`,
    network: () => `Network error. Please check your connection.`,
    validation: (field: string) => `Please check the ${field} field.`,
    fileTooLarge: (maxSize: string) =>
      `File is too large. Maximum size is ${maxSize}.`,
    invalidFileType: (types: string[]) =>
      `Invalid file type. Allowed types: ${types.join(", ")}.`,
    quotaExceeded: () => `Storage quota exceeded. Please remove some files.`,
    familyRequired: () => `Please select a family first.`,
    userRequired: () => `Please log in to continue.`,
  },

  // Warning messages
  warning: {
    unsavedChanges: () =>
      `You have unsaved changes. Are you sure you want to leave?`,
    deleteConfirmation: (item: string) =>
      `Are you sure you want to delete this ${item}?`,
    leaveFamily: () => `Are you sure you want to leave this family?`,
    removeMember: (name: string) =>
      `Are you sure you want to remove ${name} from the family?`,
  },

  // Info messages
  info: {
    loading: (action: string) => `${action}...`,
    processing: (action: string) => `Processing ${action}...`,
    noResults: (item: string) => `No ${item} found.`,
    emptyState: (item: string) => `No ${item} yet. Create your first one!`,
  },
};

// Notification helper functions
export class NotificationHelper {
  private static toast: any = null;

  // Initialize with toast function from useToast hook
  static initialize(toastFunction: any) {
    this.toast = toastFunction;
  }

  // Generic success notification
  static success(title: string, description?: string) {
    if (!this.toast) {
      console.warn(
        "Toast not initialized. Call NotificationHelper.initialize() first.",
      );
      return;
    }

    this.toast({
      title,
      description,
      variant: "success",
    });
  }

  // Generic error notification
  static error(title: string, description?: string) {
    if (!this.toast) {
      console.warn(
        "Toast not initialized. Call NotificationHelper.initialize() first.",
      );
      return;
    }

    this.toast({
      title,
      description,
      variant: "destructive",
    });
  }

  // Generic warning notification
  static warning(title: string, description?: string) {
    if (!this.toast) {
      console.warn(
        "Toast not initialized. Call NotificationHelper.initialize() first.",
      );
      return;
    }

    this.toast({
      title,
      description,
      variant: "warning",
    });
  }

  // Generic info notification
  static info(title: string, description?: string) {
    if (!this.toast) {
      console.warn(
        "Toast not initialized. Call NotificationHelper.initialize() first.",
      );
      return;
    }

    this.toast({
      title,
      description,
      variant: "default",
    });
  }

  // CRUD operation notifications
  static created(item: string, description?: string) {
    this.success(notificationMessages.success.created(item), description);
  }

  static updated(item: string, description?: string) {
    this.success(notificationMessages.success.updated(item), description);
  }

  static deleted(item: string, description?: string) {
    this.success(notificationMessages.success.deleted(item), description);
  }

  static saved(item: string, description?: string) {
    this.success(notificationMessages.success.saved(item), description);
  }

  // Error notifications with common patterns
  static genericError(action: string, description?: string) {
    this.error(notificationMessages.error.generic(action), description);
  }

  static notFound(item: string, description?: string) {
    this.error(notificationMessages.error.notFound(item), description);
  }

  static unauthorized(description?: string) {
    this.error(notificationMessages.error.unauthorized(), description);
  }

  static validationError(field: string, description?: string) {
    this.error(notificationMessages.error.validation(field), description);
  }

  static familyRequired(description?: string) {
    this.error(notificationMessages.error.familyRequired(), description);
  }

  static userRequired(description?: string) {
    this.error(notificationMessages.error.userRequired(), description);
  }

  // File-related notifications
  static fileTooLarge(maxSize: string, description?: string) {
    this.error(notificationMessages.error.fileTooLarge(maxSize), description);
  }

  static invalidFileType(types: string[], description?: string) {
    this.error(notificationMessages.error.invalidFileType(types), description);
  }

  // Family-related notifications
  static joinedFamily(familyName: string, description?: string) {
    this.success(notificationMessages.success.joined(familyName), description);
  }

  static leftFamily(familyName: string, description?: string) {
    this.success(notificationMessages.success.left(familyName), description);
  }

  // Content-related notifications
  static contentShared(item: string, description?: string) {
    this.success(notificationMessages.success.shared(item), description);
  }

  static contentFavorited(item: string, description?: string) {
    this.success(notificationMessages.success.favorited(item), description);
  }

  static contentUnfavorited(item: string, description?: string) {
    this.success(notificationMessages.success.unfavorited(item), description);
  }
}

// Hook for using notifications in components
export const useNotifications = () => {
  return {
    success: NotificationHelper.success.bind(NotificationHelper),
    error: NotificationHelper.error.bind(NotificationHelper),
    warning: NotificationHelper.warning.bind(NotificationHelper),
    info: NotificationHelper.info.bind(NotificationHelper),
    created: NotificationHelper.created.bind(NotificationHelper),
    updated: NotificationHelper.updated.bind(NotificationHelper),
    deleted: NotificationHelper.deleted.bind(NotificationHelper),
    saved: NotificationHelper.saved.bind(NotificationHelper),
    genericError: NotificationHelper.genericError.bind(NotificationHelper),
    notFound: NotificationHelper.notFound.bind(NotificationHelper),
    unauthorized: NotificationHelper.unauthorized.bind(NotificationHelper),
    validationError:
      NotificationHelper.validationError.bind(NotificationHelper),
    familyRequired: NotificationHelper.familyRequired.bind(NotificationHelper),
    userRequired: NotificationHelper.userRequired.bind(NotificationHelper),
    fileTooLarge: NotificationHelper.fileTooLarge.bind(NotificationHelper),
    invalidFileType:
      NotificationHelper.invalidFileType.bind(NotificationHelper),
    joinedFamily: NotificationHelper.joinedFamily.bind(NotificationHelper),
    leftFamily: NotificationHelper.leftFamily.bind(NotificationHelper),
    contentShared: NotificationHelper.contentShared.bind(NotificationHelper),
    contentFavorited:
      NotificationHelper.contentFavorited.bind(NotificationHelper),
    contentUnfavorited:
      NotificationHelper.contentUnfavorited.bind(NotificationHelper),
    initialize: NotificationHelper.initialize.bind(NotificationHelper),
  };
};
