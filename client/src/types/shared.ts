// Shared TypeScript types centralised for the client

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  initials?: string;
  role?: string;
  location?: string;
  interests: string[];
  isOnline: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  familyName: string;
  familyPassword: string;
  familyGuidelines?: string;
  adminId: string;
  features: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  isAdmin: boolean;
  joinedAt: string;
}

export interface FamilyMission {
  id?: string;
  familyId: string;
  statement: string;
  tagline: string;
  familyMotto: string;
  foundedYear: string;
  values: string[];
  mascotId: string | null;
  mascotName: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export enum UserRole {
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest",
}

export enum EventType {
  BIRTHDAY = "birthday",
  ANNIVERSARY = "anniversary",
  HOLIDAY = "holiday",
  GATHERING = "gathering",
  OTHER = "other",
}

export enum PollType {
  MULTIPLE_CHOICE = "multiple_choice",
  YES_NO = "yes_no",
  RATING = "rating",
  RANKING = "ranking",
}

// Common service response type used across all services
export interface ServiceResponse<T> {
  success: boolean;
  data?: T | null;
  error?: string | null;
  message?: string;
}

// Specialized response types for different use cases
export interface SuccessResponse<T> extends ServiceResponse<T> {
  success: true;
  data: T;
  error: null;
}

export interface ErrorResponse extends ServiceResponse<null> {
  success: false;
  data: null;
  error: string;
}

// Helper type for creating responses
export type ServiceResult<T> = SuccessResponse<T> | ErrorResponse;
