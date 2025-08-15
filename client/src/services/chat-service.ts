// Chat Service - Handles all chat-related data operations
// Refactored to extend FamilyService base class for consistency and performance

import { FamilyService, FamilyEntity, FamilyFilters } from "./base";
import { supabase } from "./supabase";
import { ServiceResponse } from "@/types/database";
import {
  globalCache,
  cacheGet,
  cacheSet,
  cacheDelete,
} from "@/lib/cache-manager";
import { measureAsync } from "@/lib/performance-monitor";

export interface ChatMessage extends FamilyEntity {
  content: string;
  messageType: "text" | "image" | "file" | "system" | "reaction";
  senderId: string;
  recipientId?: string; // For direct messages
  chatRoomId?: string; // For group chats
  replyToId?: string; // For reply messages
  attachments?: ChatAttachment[];
  reactions?: MessageReaction[];
  isEdited?: boolean;
  editedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  metadata?: Record<string, any>;
}

export interface ChatAttachment {
  id: string;
  messageId: string;
  type: "image" | "file" | "audio" | "video";
  url: string;
  filename: string;
  size?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  duration?: number; // For audio/video
  width?: number; // For images/videos
  height?: number; // For images/videos
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
}

export interface ChatRoom extends FamilyEntity {
  name: string;
  description?: string;
  type: "direct" | "group" | "family" | "event";
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  isActive?: boolean;
  settings?: ChatRoomSettings;
  metadata?: Record<string, any>;
}

export interface ChatParticipant {
  id: string;
  chatRoomId: string;
  userId: string;
  role: "admin" | "moderator" | "member" | "viewer";
  joinedAt: string;
  lastSeen?: string;
  isMuted?: boolean;
  isBlocked?: boolean;
  user: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
    isOnline?: boolean;
  };
}

export interface ChatRoomSettings {
  allowInvites: boolean;
  allowFileSharing: boolean;
  allowReactions: boolean;
  allowEditing: boolean;
  allowDeletion: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

export interface ChatWithParticipants extends ChatRoom {
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isUserParticipant: boolean;
}

export interface CreateMessageData {
  content: string;
  familyId: string;
  authorId: string;
  messageType: "text" | "image" | "file" | "system" | "reaction";
  recipientId?: string;
  chatRoomId?: string;
  replyToId?: string;
  attachments?: Omit<ChatAttachment, "id" | "messageId">[];
  metadata?: Record<string, any>;
}

export interface UpdateMessageData {
  content?: string;
  messageType?: "text" | "image" | "file" | "system" | "reaction";
  attachments?: ChatAttachment[];
  metadata?: Record<string, any>;
}

export interface CreateChatRoomData {
  name: string;
  description?: string;
  familyId: string;
  authorId: string;
  type: "direct" | "group" | "family" | "event";
  participants: string[]; // User IDs
  settings?: Partial<ChatRoomSettings>;
  metadata?: Record<string, any>;
}

export interface UpdateChatRoomData {
  name?: string;
  description?: string;
  type?: "direct" | "group" | "family" | "event";
  settings?: Partial<ChatRoomSettings>;
  metadata?: Record<string, any>;
}

export interface ChatFilters extends FamilyFilters {
  type?: "direct" | "group" | "family" | "event";
  hasUnread?: boolean;
  participants?: string[];
  lastMessageAfter?: string;
  isActive?: boolean;
}

export interface ChatSearchParams {
  query: string;
  filters?: ChatFilters;
  sortBy?: "recent" | "unread" | "name" | "participants";
  sortOrder?: "asc" | "desc";
}

class ChatService extends FamilyService<
  ChatRoom,
  CreateChatRoomData,
  UpdateChatRoomData
> {
  protected tableName = "chat_rooms";
  protected selectFields = `
    *,
    author:users!chat_rooms_author_id_fkey(
      id,
      name,
      avatar,
      initials
    ),
    participants:chat_participants(
      id,
      user_id,
      role,
      joined_at,
      last_seen,
      is_muted,
      is_blocked,
      user:users!chat_participants_user_id_fkey(
        id,
        name,
        avatar,
        initials
      )
    )
  `;

  /**
   * Get chat rooms with participants for a family
   */
  async getChatRoomsWithParticipants(
    familyId: string,
    filters?: ChatFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<ChatWithParticipants[]>> {
    const cacheKey = `chat_rooms_with_participants_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<ChatWithParticipants[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getChatRoomsWithParticipants",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .order("updated_at", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const chatRooms = (data || []) as unknown as ChatWithParticipants[];

        // Transform and enrich chat rooms with additional data
        const enrichedChatRooms = await Promise.all(
          chatRooms.map(async (room) => {
            const lastMessage = await this.getLastMessage(room.id);
            const unreadCount = await this.getUnreadCount(
              room.id,
              "current-user-id",
            ); // This should come from context
            const isUserParticipant = true; // This should be determined from user context

            return {
              ...room,
              lastMessage: lastMessage.success
                ? lastMessage.data || undefined
                : undefined,
              unreadCount: unreadCount.success ? unreadCount.data || 0 : 0,
              isUserParticipant,
            };
          }),
        );

        cacheSet(cacheKey, enrichedChatRooms, 2 * 60 * 1000, globalCache); // 2 minutes
        return { success: true, data: enrichedChatRooms, error: null };
      },
      "custom",
    );
  }

  /**
   * Get direct chat between two users
   */
  async getDirectChat(
    userId1: string,
    userId2: string,
    familyId: string,
  ): Promise<ServiceResponse<ChatRoom | null>> {
    const cacheKey = `direct_chat_${userId1}_${userId2}_${familyId}`;
    const cached = cacheGet<ChatRoom | null>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getDirectChat",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .eq("type", "direct")
          .contains("participants", [userId1, userId2])
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned
          return { success: false, error: error.message, data: null };
        }

        const chatRoom = data ? (data as unknown as ChatRoom) : null;
        cacheSet(cacheKey, chatRoom, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: chatRoom, error: null };
      },
      "custom",
    );
  }

  /**
   * Get or create direct chat between two users
   */
  async getOrCreateDirectChat(
    userId1: string,
    userId2: string,
    familyId: string,
  ): Promise<ServiceResponse<ChatRoom>> {
    const existingChat = await this.getDirectChat(userId1, userId2, familyId);
    if (existingChat.success && existingChat.data) {
      return existingChat;
    }

    // Create new direct chat
    const createData: CreateChatRoomData = {
      name: `Direct Chat`,
      familyId,
      authorId: userId1,
      type: "direct",
      participants: [userId1, userId2],
    };

    return this.create(createData);
  }

  /**
   * Get messages for a chat room
   */
  async getChatMessages(
    chatRoomId: string,
    page: number = 1,
    pageSize: number = 50,
  ): Promise<ServiceResponse<ChatMessage[]>> {
    const cacheKey = `chat_messages_${chatRoomId}_${page}_${pageSize}`;
    const cached = cacheGet<ChatMessage[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getChatMessages",
      async () => {
        const { data, error } = await supabase
          .from("chat_messages")
          .select(
            `
          *,
          sender:users!chat_messages_sender_id_fkey(
            id,
            name,
            avatar,
            initials
          ),
          attachments:chat_attachments(*),
          reactions:message_reactions(
            id,
            emoji,
            user:users!message_reactions_user_id_fkey(
              id,
              name,
              avatar,
              initials
            )
          )
        `,
          )
          .eq("chat_room_id", chatRoomId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const messages = (data || []) as unknown as ChatMessage[];
        cacheSet(cacheKey, messages, 1 * 60 * 1000, globalCache); // 1 minute for messages
        return { success: true, data: messages, error: null };
      },
      "custom",
    );
  }

  /**
   * Send a message to a chat room
   */
  async sendMessage(
    messageData: CreateMessageData,
  ): Promise<ServiceResponse<ChatMessage>> {
    return measureAsync(
      "sendMessage",
      async () => {
        const { data, error } = await supabase
          .from("chat_messages")
          .insert({
            content: messageData.content,
            family_id: messageData.familyId,
            author_id: messageData.authorId,
            message_type: messageData.messageType,
            recipient_id: messageData.recipientId,
            chat_room_id: messageData.chatRoomId,
            reply_to_id: messageData.replyToId,
            metadata: messageData.metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Create attachments if provided
        if (messageData.attachments && messageData.attachments.length > 0) {
          const attachmentPromises = messageData.attachments.map((attachment) =>
            supabase.from("chat_attachments").insert({
              message_id: data.id,
              type: attachment.type,
              url: attachment.url,
              filename: attachment.filename,
              size: attachment.size,
              mime_type: attachment.mimeType,
              thumbnail_url: attachment.thumbnailUrl,
              duration: attachment.duration,
              width: attachment.width,
              height: attachment.height,
              created_at: new Date().toISOString(),
            }),
          );
          await Promise.all(attachmentPromises);
        }

        // Update chat room's last message timestamp
        if (messageData.chatRoomId) {
          await supabase
            .from(this.tableName)
            .update({ updated_at: new Date().toISOString() })
            .eq("id", messageData.chatRoomId);
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: data as unknown as ChatMessage,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Edit a message
   */
  async editMessage(
    messageId: string,
    updates: UpdateMessageData,
  ): Promise<ServiceResponse<ChatMessage>> {
    return measureAsync(
      "editMessage",
      async () => {
        const { data, error } = await supabase
          .from("chat_messages")
          .update({
            ...updates,
            is_edited: true,
            edited_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", messageId)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: data as unknown as ChatMessage,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "deleteMessage",
      async () => {
        const { error } = await supabase
          .from("chat_messages")
          .update({
            is_deleted: true,
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", messageId);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Add reaction to a message
   */
  async addReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<ServiceResponse<MessageReaction>> {
    return measureAsync(
      "addReaction",
      async () => {
        const { data, error } = await supabase
          .from("message_reactions")
          .insert({
            message_id: messageId,
            user_id: userId,
            emoji,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: data as unknown as MessageReaction,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Remove reaction from a message
   */
  async removeReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "removeReaction",
      async () => {
        const { error } = await supabase
          .from("message_reactions")
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", userId)
          .eq("emoji", emoji);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(
    chatRoomId: string,
    userId: string,
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "markMessagesAsRead",
      async () => {
        const { error } = await supabase
          .from("chat_participants")
          .update({ last_seen: new Date().toISOString() })
          .eq("chat_room_id", chatRoomId)
          .eq("user_id", userId);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Get unread message count for a user in a chat room
   */
  async getUnreadCount(
    chatRoomId: string,
    userId: string,
  ): Promise<ServiceResponse<number>> {
    const cacheKey = `unread_count_${chatRoomId}_${userId}`;
    const cached = cacheGet<number>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUnreadCount",
      async () => {
        const { count, error } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("chat_room_id", chatRoomId)
          .eq("is_deleted", false)
          .gt("created_at", "2024-01-01"); // This should be the user's last seen timestamp

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const unreadCount = count || 0;
        cacheSet(cacheKey, unreadCount, 30 * 1000, globalCache); // 30 seconds for unread count
        return { success: true, data: unreadCount, error: null };
      },
      "custom",
    );
  }

  /**
   * Get last message in a chat room
   */
  async getLastMessage(
    chatRoomId: string,
  ): Promise<ServiceResponse<ChatMessage | null>> {
    const cacheKey = `last_message_${chatRoomId}`;
    const cached = cacheGet<ChatMessage | null>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getLastMessage",
      async () => {
        const { data, error } = await supabase
          .from("chat_messages")
          .select(
            `
          *,
          sender:users!chat_messages_sender_id_fkey(
            id,
            name,
            avatar,
            initials
          )
        `,
          )
          .eq("chat_room_id", chatRoomId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned
          return { success: false, error: error.message, data: null };
        }

        const lastMessage = data ? (data as unknown as ChatMessage) : null;
        cacheSet(cacheKey, lastMessage, 1 * 60 * 1000, globalCache); // 1 minute
        return { success: true, data: lastMessage, error: null };
      },
      "custom",
    );
  }

  /**
   * Search chat messages
   */
  async searchMessages(
    chatRoomId: string,
    query: string,
    limit: number = 20,
  ): Promise<ServiceResponse<ChatMessage[]>> {
    const cacheKey = `search_messages_${chatRoomId}_${query}_${limit}`;
    const cached = cacheGet<ChatMessage[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchMessages",
      async () => {
        const { data, error } = await supabase
          .from("chat_messages")
          .select(
            `
          *,
          sender:users!chat_messages_sender_id_fkey(
            id,
            name,
            avatar,
            initials
          )
        `,
          )
          .eq("chat_room_id", chatRoomId)
          .eq("is_deleted", false)
          .ilike("content", `%${query}%`)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const messages = (data || []) as unknown as ChatMessage[];
        cacheSet(cacheKey, messages, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: messages, error: null };
      },
      "custom",
    );
  }

  /**
   * Get chat statistics for a family
   */
  async getChatStats(familyId: string): Promise<
    ServiceResponse<{
      totalChatRooms: number;
      totalMessages: number;
      totalParticipants: number;
      messagesByType: Record<string, number>;
      mostActiveChats: Array<{ name: string; messageCount: number }>;
      averageMessagesPerDay: number;
    }>
  > {
    const cacheKey = `chat_stats_${familyId}`;
    const cached = cacheGet<any>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getChatStats",
      async () => {
        const [roomsResult, messagesResult] = await Promise.all([
          supabase
            .from(this.tableName)
            .select("name, type")
            .eq("family_id", familyId),
          supabase
            .from("chat_messages")
            .select("message_type, created_at, sender_id")
            .eq("family_id", familyId)
            .eq("is_deleted", false),
        ]);

        if (roomsResult.error || messagesResult.error) {
          return {
            success: false,
            error:
              roomsResult.error?.message ||
              messagesResult.error?.message ||
              "Failed to fetch stats",
            data: null,
          };
        }

        const rooms = roomsResult.data || [];
        const messages = messagesResult.data || [];

        const stats = {
          totalChatRooms: rooms.length,
          totalMessages: messages.length,
          totalParticipants: new Set(messages.map((m) => m.sender_id)).size,
          messagesByType: messages.reduce(
            (acc, m) => {
              const type = m.message_type || "text";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          mostActiveChats: [], // This would require additional queries
          averageMessagesPerDay: messages.length > 0 ? messages.length / 30 : 0, // Simplified calculation
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Invalidate cache for chat
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`chat_rooms_family_${familyId}`),
      new RegExp(`chat_rooms_with_participants_${familyId}`),
      new RegExp(`direct_chat_`),
      new RegExp(`chat_messages_`),
      new RegExp(`chat_stats_${familyId}`),
      new RegExp(`unread_count_`),
      new RegExp(`last_message_`),
      new RegExp(`search_messages_`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const chatService = new ChatService();

// Legacy export for backward compatibility
export const chatsService = chatService;
