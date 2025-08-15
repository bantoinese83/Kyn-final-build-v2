// Centralized Constants
// Contains all application-wide constants, validation rules, and configuration values

// Application Configuration
export const APP_CONFIG = {
  NAME: "Flare World",
  VERSION: "1.0.0",
  DESCRIPTION: "Family Connection Platform",
  SUPPORT_EMAIL: "support@flareworld.com",
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  SUPPORTED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/ogg"],
  DEFAULT_AVATAR: "/placeholder.svg",
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Validation Rules
export const VALIDATION = {
  USER: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MAX_BIO_LENGTH: 500,
    MAX_INTERESTS: 10,
    MAX_TAGS: 20,
  },
  POST: {
    MIN_CONTENT_LENGTH: 1,
    MAX_CONTENT_LENGTH: 2000,
    MAX_IMAGES_PER_POST: 5,
  },
  COMMENT: {
    MIN_CONTENT_LENGTH: 1,
    MAX_CONTENT_LENGTH: 500,
  },
  FAMILY: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 50,
    MAX_GUIDELINES_LENGTH: 2000,
  },
  RECIPE: {
    MIN_TITLE_LENGTH: 3,
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_INGREDIENTS: 50,
    MAX_INSTRUCTIONS: 20,
  },
  EVENT: {
    MIN_TITLE_LENGTH: 3,
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_LOCATION_LENGTH: 200,
  },
  POLL: {
    MIN_QUESTION_LENGTH: 10,
    MAX_QUESTION_LENGTH: 200,
    MIN_OPTIONS: 2,
    MAX_OPTIONS: 10,
    MAX_OPTION_LENGTH: 100,
  },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
  MAX_PAGE: 1000,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: "/auth/signup",
    SIGNIN: "/auth/signin",
    SIGNOUT: "/auth/signout",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },
  USER: {
    PROFILE: "/user/profile",
    AVATAR: "/user/avatar",
    PREFERENCES: "/user/preferences",
  },
  FAMILY: {
    CREATE: "/family/create",
    JOIN: "/family/join",
    MEMBERS: "/family/members",
    SETTINGS: "/family/settings",
  },
  POSTS: {
    CREATE: "/posts",
    UPDATE: "/posts/:id",
    DELETE: "/posts/:id",
    LIKE: "/posts/:id/like",
    COMMENT: "/posts/:id/comments",
  },
  EVENTS: {
    CREATE: "/events",
    UPDATE: "/events/:id",
    DELETE: "/events/:id",
    RSVP: "/events/:id/rsvp",
  },
} as const;

// Route Definitions
export const ROUTES = {
  HOME: "/",
  WELCOME: "/welcome",
  SIGNUP: "/signup",
  LOGIN: "/login",
  PROFILE: "/profile",
  FAMILY: {
    CREATE: "/create-family",
    JOIN: "/join-family",
    MANAGEMENT: "/family-management",
    CONTACTS: "/contacts",
    HISTORY: "/history",
    MISSION: "/mission",
  },
  FEATURES: {
    EVENTS: "/events",
    PHOTOS: "/photos",
    RECIPES: "/recipes",
    POLLS: "/polls",
    GAMES: "/games",
    MILESTONES: "/milestones",
    HEALTH: "/health",
    FITNESS: "/fitness",
    RESOURCES: "/resources",
    MEDIA: "/media",
    PLAYLISTS: "/playlists",
  },
  COMMUNICATION: {
    CHAT: "/chat",
    KYNNECT: "/kynnect",
  },
  LEGAL: {
    TERMS: "/terms-and-conditions",
    PRIVACY: "/privacy-policy",
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  COMMON: {
    UNEXPECTED: "An unexpected error occurred. Please try again.",
    NETWORK_ERROR: "Network error. Please check your connection.",
    PERMISSION_DENIED: "You do not have permission to perform this action.",
    NOT_FOUND: "The requested resource was not found.",
    VALIDATION_FAILED: "Please check your input and try again.",
    SERVER_ERROR: "Server error. Please try again later.",
  },
  AUTH: {
    INVALID_CREDENTIALS: "Invalid email or password.",
    EMAIL_NOT_CONFIRMED:
      "Please check your email and click the verification link.",
    USER_EXISTS: "An account with this email already exists.",
    WEAK_PASSWORD: "Password must be at least 8 characters long.",
    INVALID_EMAIL: "Please enter a valid email address.",
  },
  FAMILY: {
    INVALID_PASSWORD: "Invalid family password.",
    ALREADY_MEMBER: "You are already a member of this family.",
    FAMILY_NOT_FOUND: "Family not found.",
    MAX_MEMBERS_REACHED: "Maximum family members reached.",
  },
  POSTS: {
    CONTENT_TOO_LONG: "Post content is too long.",
    CONTENT_EMPTY: "Post content cannot be empty.",
    DELETE_FAILED: "Failed to delete post.",
    UPDATE_FAILED: "Failed to update post.",
  },
  UPLOAD: {
    FILE_TOO_LARGE: "File size exceeds the maximum limit.",
    INVALID_FILE_TYPE: "File type not supported.",
    UPLOAD_FAILED: "File upload failed.",
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    SIGNUP_SUCCESS: "Account created successfully! Please check your email.",
    SIGNIN_SUCCESS: "Welcome back!",
    PASSWORD_RESET: "Password reset email sent.",
    PROFILE_UPDATED: "Profile updated successfully.",
  },
  FAMILY: {
    CREATED: "Family created successfully!",
    JOINED: "Welcome to the family!",
    MEMBER_ADDED: "Member added successfully.",
    MEMBER_REMOVED: "Member removed successfully.",
    SETTINGS_UPDATED: "Family settings updated.",
  },
  POSTS: {
    CREATED: "Post created successfully!",
    UPDATED: "Post updated successfully.",
    DELETED: "Post deleted successfully.",
    LIKED: "Post liked!",
    COMMENT_ADDED: "Comment added successfully.",
  },
  EVENTS: {
    CREATED: "Event created successfully!",
    UPDATED: "Event updated successfully.",
    DELETED: "Event deleted successfully.",
    RSVP_UPDATED: "RSVP updated successfully.",
  },
  UPLOAD: {
    SUCCESS: "File uploaded successfully!",
    AVATAR_UPDATED: "Avatar updated successfully.",
  },
} as const;

// UI Constants
export const UI = {
  ANIMATION: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
    },
    EASING: {
      EASE_IN: "cubic-bezier(0.4, 0, 1, 1)",
      EASE_OUT: "cubic-bezier(0, 0, 0.2, 1)",
      EASE_IN_OUT: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
  BREAKPOINTS: {
    MOBILE: 640,
    TABLET: 768,
    DESKTOP: 1024,
    WIDE: 1280,
  },
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },
  SPACING: {
    XS: "0.25rem",
    SM: "0.5rem",
    MD: "1rem",
    LG: "1.5rem",
    XL: "2rem",
    "2XL": "3rem",
    "3XL": "4rem",
  },
} as const;

// Feature Flags
export const FEATURES = {
  ENABLED: {
    REAL_TIME_CHAT: true,
    VIDEO_CALLS: true,
    PHOTO_SHARING: true,
    RECIPE_COLLECTION: true,
    FAMILY_GAMES: true,
    HEALTH_TRACKING: true,
    MILESTONE_TRACKING: true,
    POLLS_VOTING: true,
    EVENT_PLANNING: true,
    FAMILY_HISTORY: true,
  },
  BETA: {
    AI_SUGGESTIONS: false,
    VOICE_NOTES: false,
    FAMILY_TREE_VISUALIZATION: false,
    ADVANCED_ANALYTICS: false,
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "flare_auth_token",
  USER_DATA: "flare_user_data",
  FAMILY_DATA: "flare_family_data",
  THEME: "flare_theme",
  LANGUAGE: "flare_language",
  NOTIFICATIONS: "flare_notifications",
  RECENT_SEARCHES: "flare_recent_searches",
  DRAFT_POSTS: "flare_draft_posts",
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  MEMBER: "member",
  GUEST: "guest",
} as const;

// Event Types
export const EVENT_TYPES = {
  BIRTHDAY: "birthday",
  ANNIVERSARY: "anniversary",
  GATHERING: "gathering",
  HOLIDAY: "holiday",
  MILESTONE: "milestone",
  ACTIVITY: "activity",
} as const;

// Health Record Types
export const HEALTH_RECORD_TYPES = {
  APPOINTMENT: "appointment",
  MEDICATION: "medication",
  ALLERGY: "allergy",
  CONDITION: "condition",
  VACCINATION: "vaccination",
  TEST_RESULT: "test_result",
} as const;

// Game Types
export const GAME_TYPES = {
  QUIZ: "quiz",
  PUZZLE: "puzzle",
  TRIVIA: "trivia",
  WORD_GAME: "word_game",
  MATH_GAME: "math_game",
  MEMORY_GAME: "memory_game",
} as const;

// Export all constants for easy access
export default {
  APP_CONFIG,
  VALIDATION,
  PAGINATION,
  API_ENDPOINTS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI,
  FEATURES,
  STORAGE_KEYS,
  NOTIFICATION_TYPES,
  USER_ROLES,
  EVENT_TYPES,
  HEALTH_RECORD_TYPES,
  GAME_TYPES,
};
