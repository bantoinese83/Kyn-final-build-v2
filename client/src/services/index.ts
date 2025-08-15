// Services Index - Centralized exports for all services
// Provides a single import point for all service functionality

// Base Services - Foundation for all other services
export * from "./base";

// Core Services
export { supabase } from "./supabase";
export { familyService } from "./family-service";
export {
  photoService,
  albumService,
  photoServiceLegacy,
} from "./photo-service";
export { storageService } from "./storage-service";
export { imageOptimizationService } from "./image-optimization-service";

// Feature Services
export { eventService, eventsService } from "./events-service";
export { postService, postsService } from "./posts-service";
export { recipeService, recipesService } from "./recipes-service";
export { gameService, gamesService } from "./game-service";
export { pollService, pollsService } from "./poll-service";
export { playlistService } from "./playlist-service";
export { healthService, healthRecordsService } from "./health-service";
export { chatService, chatsService } from "./chat-service";
export { userService, usersService } from "./user-service";
export { orderService, ordersService } from "./order-service";
export { paymentService, paymentsService } from "./payment-service";
export { shippingService, shipmentsService } from "./shipping-service";
export { inventoryService, inventoryItemsService } from "./inventory-service";
export { analyticsService, analyticsEventsService } from "./analytics-service";
export {
  notificationService,
  notificationsService,
} from "./notification-service";
export { reviewService, reviewsService } from "./review-service";
export { settingsService, appSettingsService } from "./settings-service";
export { backupService, backupsService } from "./backup-service";

// External API Services
export { googleCalendarService } from "./google-calendar";
export { spotifyService } from "./spotify";
export { geminiService } from "./gemini-ai-service";

// Utility Services
export { utilityService } from "./utility-service";
export { default as supabaseDataService } from "./supabase-data";

// Export service types
// export type { ServiceResponse } from '../types/database'; // Removed duplicate

// Export base service types
export type {
  BaseEntity,
  BaseFilters,
  PaginationResult,
  FamilyEntity,
  FamilyFilters,
  ServiceConfig,
  AuditFields,
  SoftDeleteFields,
  CrudService,
  FamilyCrudService,
} from "./base";

// Export ServiceResponse type (single source of truth)
export type {
  ServiceResponse,
  ServiceResult,
  SuccessResponse,
  ErrorResponse,
} from "@/types/shared";

export type {
  CreatePhotoData,
  CreateAlbumData,
  UpdatePhotoData,
  UpdateAlbumData,
  PhotoFilters,
  Photo,
  Album,
} from "./photo-service";

export type {
  CreateRecipeData,
  UpdateRecipeData,
  RecipeFilters,
} from "./recipe-service";

export type {
  Poll,
  PollOption,
  PollVote,
  CreatePollData,
  PollWithStats,
} from "./poll-service";

export type {
  FamilyGame,
  GamePlay,
  CreateGameData,
  CreateGamePlayData,
  GameWithAuthor,
  GameStats,
} from "./game-service";

export type {
  CreatePostData,
  UpdatePostData,
  CreateCommentData,
} from "./post-service";

export type {
  CreateEventData,
  UpdateEventData,
  EventRSVPData,
} from "./event-service";

export type {
  ChatMessage,
  ChatRoom,
  ChatParticipant,
  CreateMessageData,
  UpdateMessageData,
} from "./chat-service";

export type {
  Playlist,
  PlaylistTrack,
  CreatePlaylistData,
  UpdatePlaylistData,
} from "./playlist-service";

// Export Google Calendar service types
export type {
  GoogleCalendarEvent,
  CreateGoogleCalendarEventData,
  UpdateGoogleCalendarEventData,
  GoogleCalendarListEntry,
  GoogleCalendarServiceResponse,
} from "./google-calendar";

// Export database types
export type {
  WeatherData,
  FamilyQuote,
  PostWithAuthor,
  EventWithDetails,
  ServiceResponse as DatabaseServiceResponse,
} from "../types/database";

// Export performance and caching utilities
export {
  globalCache,
  userCache,
  apiCache,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheClear,
} from "@/lib/cache-manager";

export {
  performanceMonitor,
  measureRender,
  measureAsync,
  measureNetwork,
  addPerformanceThreshold,
  subscribeToPerformance,
  subscribeToPerformanceAlerts,
  getPerformanceReport,
} from "@/lib/performance-monitor";

// Export optimized data structures
export {
  OptimizedTree,
  SearchIndex,
  OptimizedQueue,
  PriorityQueue,
} from "@/lib/optimized-data-structures";

// Export performance hooks
export {
  useMemoizedValue,
  useMemoizedCallback,
  useLazyLoad,
  useDebouncedValue,
  useThrottledCallback,
  usePerformanceMonitor,
  useOptimizedList,
  useResourcePreloader,
  useConcurrentUpdate,
  useMemoryOptimization,
  useBatchUpdates,
} from "@/hooks/usePerformance";
