// Auto-generated from Supabase - do not edit manually
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
  };
  public: {
    Tables: {
      users: {
        Row: {
          avatar: string | null;
          createdAt: string;
          email: string;
          id: string;
          initials: string | null;
          interests: string[] | null;
          isOnline: boolean;
          location: string | null;
          name: string;
          phone: string | null;
          role: string | null;
          tags: string[] | null;
          updatedAt: string;
        };
        Insert: {
          avatar?: string | null;
          createdAt?: string;
          email: string;
          id?: string;
          initials?: string | null;
          interests?: string[] | null;
          isOnline?: boolean;
          location?: string | null;
          name: string;
          phone?: string | null;
          role?: string | null;
          tags?: string[] | null;
          updatedAt?: string;
        };
        Update: {
          avatar?: string | null;
          createdAt?: string;
          email?: string;
          id?: string;
          initials?: string | null;
          interests?: string[] | null;
          isOnline?: boolean;
          location?: string | null;
          name?: string;
          phone?: string | null;
          role?: string | null;
          tags?: string[] | null;
          updatedAt?: string;
        };
        Relationships: [];
      };
      families: {
        Row: {
          adminId: string;
          createdAt: string;
          familyGuidelines: string | null;
          familyName: string;
          familyPassword: string;
          features: Json;
          id: string;
          updatedAt: string;
        };
        Insert: {
          adminId: string;
          createdAt?: string;
          familyGuidelines?: string | null;
          familyName: string;
          familyPassword: string;
          features: Json;
          id: string;
          updatedAt?: string;
        };
        Update: {
          adminId?: string;
          createdAt?: string;
          familyGuidelines?: string | null;
          familyName?: string;
          familyPassword?: string;
          features?: Json;
          id?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "families_adminId_fkey";
            columns: ["adminId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          authorId: string;
          comments: number;
          content: string;
          createdAt: string;
          familyId: string;
          hasImage: boolean;
          id: string;
          imageUrl: string | null;
          likes: number;
          updatedAt: string | null;
        };
        Insert: {
          authorId: string;
          comments?: number;
          content: string;
          createdAt?: string;
          familyId: string;
          hasImage?: boolean;
          id: string;
          imageUrl?: string | null;
          likes?: number;
          updatedAt?: string | null;
        };
        Update: {
          authorId?: string;
          comments?: number;
          content?: string;
          createdAt?: string;
          familyId?: string;
          hasImage?: boolean;
          id?: string;
          imageUrl?: string | null;
          likes?: number;
          updatedAt?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "posts_authorId_fkey";
            columns: ["authorId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_familyId_fkey";
            columns: ["familyId"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
        ];
      };
      recipes: {
        Row: {
          authorId: string;
          category: string;
          createdAt: string;
          creator: string;
          familyId: string;
          id: string;
          ingredients: string[] | null;
          instructions: string;
          prepTime: string;
          rating: number;
          reviews: number;
          servings: number;
          tags: string[] | null;
          title: string;
        };
        Insert: {
          authorId: string;
          category: string;
          createdAt?: string;
          creator: string;
          familyId: string;
          id: string;
          ingredients?: string[] | null;
          instructions: string;
          prepTime: string;
          rating?: number;
          reviews?: number;
          servings: number;
          tags?: string[] | null;
          title: string;
        };
        Update: {
          authorId?: string;
          category?: string;
          createdAt?: string;
          creator?: string;
          familyId?: string;
          id?: string;
          ingredients?: string[] | null;
          instructions?: string;
          prepTime?: string;
          rating?: number;
          reviews?: number;
          servings?: number;
          tags?: string[] | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipes_authorId_fkey";
            columns: ["authorId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipes_familyId_fkey";
            columns: ["familyId"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          content: string;
          id: string;
          isRead: boolean;
          receiverId: string;
          senderId: string;
          timestamp: string;
        };
        Insert: {
          content: string;
          id: string;
          isRead?: boolean;
          receiverId: string;
          senderId: string;
          timestamp?: string;
        };
        Update: {
          content?: string;
          id?: string;
          isRead?: boolean;
          receiverId?: string;
          senderId?: string;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_receiverId_fkey";
            columns: ["receiverId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_senderId_fkey";
            columns: ["senderId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      typing_indicators: {
        Row: {
          id: string;
          receiverId: string;
          timestamp: string;
          userId: string;
        };
        Insert: {
          id: string;
          receiverId: string;
          timestamp?: string;
          userId: string;
        };
        Update: {
          id?: string;
          receiverId?: string;
          timestamp?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "typing_indicators_receiverId_fkey";
            columns: ["receiverId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "typing_indicators_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      post_likes: {
        Row: {
          createdAt: string | null;
          id: string;
          postId: string;
          userId: string;
        };
        Insert: {
          createdAt?: string | null;
          id?: string;
          postId: string;
          userId: string;
        };
        Update: {
          createdAt?: string | null;
          id?: string;
          postId?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_likes_postid_fkey";
            columns: ["postId"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_likes_userid_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          id: string;
          familyId: string;
          organizerId: string;
          title: string;
          description: string;
          date: string;
          time: string;
          endTime: string | null;
          location: string | null;
          type: string;
          isRecurring: boolean;
          reminders: boolean;
          tags: string[] | null;
          registryLinks: string[] | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          familyId: string;
          organizerId: string;
          title: string;
          description: string;
          date: string;
          time: string;
          endTime?: string | null;
          location?: string | null;
          type: string;
          isRecurring?: boolean;
          reminders?: boolean;
          tags?: string[] | null;
          registryLinks?: string[] | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          familyId?: string;
          organizerId?: string;
          title?: string;
          description?: string;
          date?: string;
          time?: string;
          endTime?: string | null;
          location?: string | null;
          type?: string;
          isRecurring?: boolean;
          reminders?: boolean;
          tags?: string[] | null;
          registryLinks?: string[] | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_familyId_fkey";
            columns: ["familyId"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_organizerId_fkey";
            columns: ["organizerId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      event_attendees: {
        Row: {
          id: string;
          eventId: string;
          userId: string;
          status: string;
          guestCount: number;
          respondedAt: string;
        };
        Insert: {
          id: string;
          eventId: string;
          userId: string;
          status: string;
          guestCount?: number;
          respondedAt?: string;
        };
        Update: {
          id?: string;
          eventId?: string;
          userId?: string;
          status?: string;
          guestCount?: number;
          respondedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_attendees_eventId_fkey";
            columns: ["eventId"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_attendees_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          postId: string;
          authorId: string;
          content: string;
          createdAt: string;
        };
        Insert: {
          id: string;
          postId: string;
          authorId: string;
          content: string;
          createdAt?: string;
        };
        Update: {
          id?: string;
          postId?: string;
          authorId?: string;
          content?: string;
          createdAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_postId_fkey";
            columns: ["postId"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_authorId_fkey";
            columns: ["authorId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      family_members: {
        Row: {
          id: string;
          familyId: string;
          userId: string;
          isAdmin: boolean;
          joinedAt: string;
        };
        Insert: {
          id: string;
          familyId: string;
          userId: string;
          isAdmin?: boolean;
          joinedAt?: string;
        };
        Update: {
          id?: string;
          familyId?: string;
          userId?: string;
          isAdmin?: boolean;
          joinedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "family_members_familyId_fkey";
            columns: ["familyId"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "family_members_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      update_post_comment_count: {
        Args: { comment_change: number; post_id: string };
        Returns: undefined;
      };
      update_post_like_count: {
        Args: { like_change: number; post_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenient type aliases
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
export type Family = Database["public"]["Tables"]["families"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
export type TypingIndicator =
  Database["public"]["Tables"]["typing_indicators"]["Row"];
export type PostLike = Database["public"]["Tables"]["post_likes"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventAttendee =
  Database["public"]["Tables"]["event_attendees"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type FamilyMember =
  Database["public"]["Tables"]["family_members"]["Row"];

export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
export type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];
export type FamilyInsert = Database["public"]["Tables"]["families"]["Insert"];
export type ChatMessageInsert =
  Database["public"]["Tables"]["chat_messages"]["Insert"];
export type TypingIndicatorInsert =
  Database["public"]["Tables"]["typing_indicators"]["Insert"];
export type PostLikeInsert =
  Database["public"]["Tables"]["post_likes"]["Insert"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventAttendeeInsert =
  Database["public"]["Tables"]["event_attendees"]["Insert"];
export type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"];
export type FamilyMemberInsert =
  Database["public"]["Tables"]["family_members"]["Insert"];

export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];
export type RecipeUpdate = Database["public"]["Tables"]["recipes"]["Update"];
export type FamilyUpdate = Database["public"]["Tables"]["families"]["Update"];
export type ChatMessageUpdate =
  Database["public"]["Tables"]["chat_messages"]["Update"];
export type TypingIndicatorUpdate =
  Database["public"]["Tables"]["typing_indicators"]["Update"];
export type PostLikeUpdate =
  Database["public"]["Tables"]["post_likes"]["Update"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];
export type EventAttendeeUpdate =
  Database["public"]["Tables"]["event_attendees"]["Update"];
export type CommentUpdate = Database["public"]["Tables"]["comments"]["Update"];
export type FamilyMemberUpdate =
  Database["public"]["Tables"]["family_members"]["Update"];

// Extended types used by services
export type PostWithAuthor = Post & { author: User };
export type CommentWithAuthor = Comment & { author: User };
export type EventWithDetails = Event & {
  organizer: User;
  attendees: EventAttendee[];
};
export type FamilyWithMembers = Family & { members: FamilyMember[] };
export type RecipeWithAuthor = Recipe & { author: User };
export type RecipeRating = {
  id: string;
  recipeId: string;
  rating: number;
  createdAt: string;
};

// Service response wrapper
export type ServiceResponse<T> = {
  data: T | null;
  error: string | null;
  success: boolean;
};

// Helper function to unwrap service responses
export function unwrapServiceResponse<T>(response: ServiceResponse<T>): T {
  if (!response.success || !response.data) {
    throw new Error(response.error || "Service request failed");
  }
  return response.data;
}

// Weather and other utility types
export type WeatherData = {
  temperature: number;
  temperatureF: number;
  condition: string;
  humidity: number;
  windSpeed: number;
};

export type FamilyQuote = {
  id: string;
  text: string;
  quote: string;
  author: string;
};
