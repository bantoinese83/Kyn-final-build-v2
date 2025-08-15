import { supabase } from "./supabase";
import {
  ServiceResponse,
  User,
  Family,
  Post,
  Recipe,
  Event,
  PostWithAuthor,
  EventWithDetails,
  WeatherData,
  FamilyQuote,
} from "../types/database";

// Helper function to unwrap service responses
export function unwrapServiceResponse<T>(response: ServiceResponse<T>): T {
  if (!response.success || !response.data) {
    throw new Error(response.error || "Service request failed");
  }
  return response.data;
}

// Helper function to safely unwrap service responses with fallback
export function safeUnwrap<T>(response: ServiceResponse<T>, fallback: T): T {
  if (!response.success || !response.data) {
    return fallback;
  }
  return response.data;
}

// Generic data fetching with error handling
async function fetchData<T>(query: any): Promise<ServiceResponse<T>> {
  try {
    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    };
  }
}

// User operations
export const userData = {
  async getCurrentUser(): Promise<ServiceResponse<User>> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return { data: null, error: "No authenticated user", success: false };

    return fetchData(
      supabase.from("users").select("*").eq("id", user.id).single(),
    );
  },

  async getUserById(id: string): Promise<ServiceResponse<User>> {
    return fetchData(supabase.from("users").select("*").eq("id", id).single());
  },

  async updateUserProfile(
    id: string,
    updates: Partial<User>,
  ): Promise<ServiceResponse<User>> {
    return fetchData(
      supabase.from("users").update(updates).eq("id", id).select().single(),
    );
  },

  async getUserPostsCount(userId: string): Promise<ServiceResponse<number>> {
    return fetchData(
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("authorId", userId),
    ).then((result) => ({
      ...result,
      data: result.data ? (result.data as any[]).length : 0,
    }));
  },

  async getUserPhotosCount(userId: string): Promise<ServiceResponse<number>> {
    // Mock data for now - replace with actual photos table query
    return {
      data: 0,
      error: null,
      success: true,
    };
  },

  async getUserEventsCount(userId: string): Promise<ServiceResponse<number>> {
    return fetchData(
      supabase
        .from("event_attendees")
        .select("id", { count: "exact", head: true })
        .eq("userId", userId),
    ).then((result) => ({
      ...result,
      data: result.data ? (result.data as any[]).length : 0,
    }));
  },

  async getUserRecipesCount(userId: string): Promise<ServiceResponse<number>> {
    return fetchData(
      supabase
        .from("recipes")
        .select("id", { count: "exact", head: true })
        .eq("authorId", userId),
    ).then((result) => ({
      ...result,
      data: result.data ? (result.data as any[]).length : 0,
    }));
  },
};

// Family operations
export const familyData = {
  async getFamilyById(id: string): Promise<ServiceResponse<Family>> {
    return fetchData(
      supabase.from("families").select("*").eq("id", id).single(),
    );
  },

  async getUserFamilies(userId: string): Promise<ServiceResponse<Family[]>> {
    return fetchData(
      supabase
        .from("families")
        .select(
          `
          *,
          family_members!inner(userId)
        `,
        )
        .eq("family_members.userId", userId),
    );
  },

  async removeFamilyMember(
    familyId: string,
    userId: string,
  ): Promise<ServiceResponse<any>> {
    return fetchData(
      supabase
        .from("family_members")
        .delete()
        .eq("familyId", familyId)
        .eq("userId", userId),
    );
  },

  async getFamilyMission(familyId: string): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual family_mission table query
    return {
      data: {
        id: "1",
        familyId: familyId,
        mission:
          "To create a loving, supportive environment where every family member can grow and thrive.",
        values: ["Love", "Respect", "Honesty"],
        mascot: "Oak Tree",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      error: null,
      success: true,
    };
  },

  async createOrUpdateFamilyMission(
    familyId: string,
    missionData: any,
  ): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual family_mission table upsert
    return {
      data: {
        id: "1",
        familyId: familyId,
        ...missionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      error: null,
      success: true,
    };
  },

  async getFamilyMilestones(familyId: string): Promise<ServiceResponse<any[]>> {
    // Mock data for now - replace with actual family_milestones table query
    return {
      data: [],
      error: null,
      success: true,
    };
  },

  async getFamilyPolls(familyId: string): Promise<ServiceResponse<any[]>> {
    // Mock data for now - replace with actual family_polls table query
    return {
      data: [],
      error: null,
      success: true,
    };
  },

  async createPoll(pollData: any): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual poll creation
    return {
      data: {
        id: "1",
        ...pollData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      error: null,
      success: true,
    };
  },

  async updatePoll(
    pollId: string,
    pollData: any,
  ): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual poll update
    return {
      data: {
        id: pollId,
        ...pollData,
        updatedAt: new Date().toISOString(),
      },
      error: null,
      success: true,
    };
  },

  async deletePoll(pollId: string): Promise<ServiceResponse<boolean>> {
    // Mock data for now - replace with actual poll deletion
    return {
      data: true,
      error: null,
      success: true,
    };
  },

  async votePoll(
    pollId: string,
    optionId: string,
    userId: string,
  ): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual poll voting
    return {
      data: { success: true },
      error: null,
      success: true,
    };
  },

  async rateRecipe(
    recipeId: string,
    rating: number,
  ): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual recipe rating
    return {
      data: { success: true },
      error: null,
      success: true,
    };
  },
};

// Post operations
export const postData = {
  async getPostsWithAuthor(
    familyId: string,
  ): Promise<ServiceResponse<PostWithAuthor[]>> {
    return fetchData(
      supabase
        .from("posts")
        .select(
          `
          *,
          author:users!posts_authorId_fkey(*)
        `,
        )
        .eq("familyId", familyId)
        .order("createdAt", { ascending: false }),
    );
  },

  async getPostById(id: string): Promise<ServiceResponse<PostWithAuthor>> {
    return fetchData(
      supabase
        .from("posts")
        .select(
          `
          *,
          author:users!posts_authorId_fkey(*)
        `,
        )
        .eq("id", id)
        .single(),
    );
  },
};

// Event operations
export const eventData = {
  async getEventsWithDetails(
    familyId: string,
  ): Promise<ServiceResponse<EventWithDetails[]>> {
    return fetchData(
      supabase
        .from("events")
        .select(
          `
          *,
          attendees:event_attendees(*)
        `,
        )
        .eq("familyId", familyId)
        .order("date", { ascending: true }),
    );
  },

  async getEventById(id: string): Promise<ServiceResponse<EventWithDetails>> {
    return fetchData(
      supabase
        .from("events")
        .select(
          `
          *,
          attendees:event_attendees(*)
        `,
        )
        .eq("id", id)
        .single(),
    );
  },

  async getFamilyEvents(familyId: string): Promise<ServiceResponse<Event[]>> {
    return fetchData(
      supabase
        .from("events")
        .select("*")
        .eq("familyId", familyId)
        .order("date", { ascending: true }),
    );
  },

  async rsvpEvent(
    eventId: string,
    userId: string,
    status: string,
  ): Promise<ServiceResponse<any>> {
    return fetchData(
      supabase
        .from("event_attendees")
        .upsert({ eventId, userId, status })
        .select(),
    );
  },

  async getEventAttendees(eventId: string): Promise<ServiceResponse<any[]>> {
    return fetchData(
      supabase.from("event_attendees").select("*").eq("eventId", eventId),
    );
  },
};

// Chat operations
export const chatData = {
  async getChatMessages(
    senderId: string,
    receiverId: string,
  ): Promise<ServiceResponse<any[]>> {
    return fetchData(
      supabase
        .from("chat_messages")
        .select("*")
        .or(
          `and(senderId.eq.${senderId},receiverId.eq.${receiverId}),and(senderId.eq.${receiverId},receiverId.eq.${senderId})`,
        )
        .order("timestamp", { ascending: true }),
    );
  },

  async sendChatMessage(message: any): Promise<ServiceResponse<any>> {
    return fetchData(
      supabase.from("chat_messages").insert(message).select().single(),
    );
  },

  async sendTypingIndicator(indicator: any): Promise<ServiceResponse<any>> {
    return fetchData(
      supabase.from("typing_indicators").upsert(indicator).select().single(),
    );
  },

  subscribeToChatMessages(
    senderId: string,
    receiverId: string,
    callback: (payload: any) => void,
  ) {
    return supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `or(and(senderId.eq.${senderId},receiverId.eq.${receiverId}),and(senderId.eq.${receiverId},receiverId.eq.${senderId}))`,
        },
        callback,
      )
      .subscribe();
  },

  subscribeToTypingIndicators(
    receiverId: string,
    callback: (payload: any) => void,
  ) {
    return supabase
      .channel("typing_indicators")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_indicators",
          filter: `receiverId.eq.${receiverId}`,
        },
        callback,
      )
      .subscribe();
  },
};

// Recipe operations
export const recipeData = {
  async getRecipes(familyId: string): Promise<ServiceResponse<Recipe[]>> {
    return fetchData(
      supabase
        .from("recipes")
        .select("*")
        .eq("familyId", familyId)
        .order("createdAt", { ascending: false }),
    );
  },

  async getRecipeById(id: string): Promise<ServiceResponse<Recipe>> {
    return fetchData(
      supabase.from("recipes").select("*").eq("id", id).single(),
    );
  },
};

// Game operations
export const gameData = {
  async getFamilyGames(familyId: string): Promise<ServiceResponse<any[]>> {
    // Mock data for now - replace with actual game table queries
    return {
      data: [],
      error: null,
      success: true,
    };
  },

  async getGameLeaderboard(familyId: string): Promise<ServiceResponse<any[]>> {
    // Mock data for now - replace with actual game leaderboard queries
    return {
      data: [],
      error: null,
      success: true,
    };
  },

  async getGameStats(familyId: string): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual game stats queries
    return {
      data: {
        totalGames: 0,
        totalPlayTime: 0,
        favoriteGame: null,
        averageScore: 0,
      },
      error: null,
      success: true,
    };
  },

  async createGame(gameData: any): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual game creation
    return {
      data: {
        id: "1",
        ...gameData,
        createdAt: new Date().toISOString(),
      },
      error: null,
      success: true,
    };
  },

  async updateGame(
    gameId: string,
    updates: any,
  ): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual game updates
    return {
      data: {
        id: gameId,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      error: null,
      success: true,
    };
  },

  async deleteGame(gameId: string): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual game deletion
    return {
      data: null,
      error: null,
      success: true,
    };
  },

  async recordGamePlay(
    gameId: string,
    playData: any,
  ): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual game play recording
    return {
      data: {
        id: "1",
        gameId,
        ...playData,
        timestamp: new Date().toISOString(),
      },
      error: null,
      success: true,
    };
  },
};

// Fitness operations
export const fitnessData = {
  async getFamilyFitnessChallenges(
    familyId: string,
  ): Promise<ServiceResponse<any[]>> {
    // Mock data for now - replace with actual fitness challenge queries
    return {
      data: [],
      error: null,
      success: true,
    };
  },

  async getFamilyFitnessGoals(
    familyId: string,
  ): Promise<ServiceResponse<any[]>> {
    // Mock data for now - replace with actual fitness goal queries
    return {
      data: [],
      error: null,
      success: true,
    };
  },

  async getFamilyFitnessStats(familyId: string): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual fitness stats queries
    return {
      data: {
        totalChallenges: 0,
        activeChallenges: 0,
        completedGoals: 0,
        currentStreak: 0,
      },
      error: null,
      success: true,
    };
  },

  async createFitnessChallenge(
    challengeData: any,
  ): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual fitness challenge creation
    return {
      data: {
        id: "1",
        ...challengeData,
        createdAt: new Date().toISOString(),
      },
      error: null,
      success: true,
    };
  },
};

// Kynnect operations
export const kynnectData = {
  async getActiveCalls(familyId: string): Promise<ServiceResponse<any[]>> {
    // Mock data for now - replace with actual active calls queries
    return {
      data: [],
      error: null,
      success: true,
    };
  },

  async getCallHistory(familyId: string): Promise<ServiceResponse<any[]>> {
    // Mock data for now - replace with actual call history queries
    return {
      data: [],
      error: null,
      success: true,
    };
  },

  async createCall(callData: any): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual call creation
    return {
      data: {
        id: "1",
        ...callData,
        createdAt: new Date().toISOString(),
        status: "active",
      },
      error: null,
      success: true,
    };
  },

  async joinCall(
    callId: string,
    participantData: any,
  ): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual call joining
    return {
      data: {
        id: "1",
        callId,
        ...participantData,
        joinedAt: new Date().toISOString(),
      },
      error: null,
      success: true,
    };
  },

  async getCallById(callId: string): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual call queries
    return {
      data: {
        id: callId,
        title: "Family Call",
        status: "active",
        participants: [],
        createdAt: new Date().toISOString(),
      },
      error: null,
      success: true,
    };
  },

  async leaveCall(
    callId: string,
    participantData: any,
  ): Promise<ServiceResponse<any>> {
    // Mock data for now - replace with actual call leaving
    return {
      data: {
        id: "1",
        callId,
        ...participantData,
        leftAt: new Date().toISOString(),
      },
      error: null,
      success: true,
    };
  },
};

// Utility data
export const utilityData = {
  async getWeatherData(): Promise<ServiceResponse<WeatherData>> {
    // Mock weather data - replace with actual weather API
    return {
      data: {
        temperature: 22, // Celsius
        temperatureF: 72, // Fahrenheit
        condition: "Sunny",
        humidity: 45,
        windSpeed: 8,
      },
      error: null,
      success: true,
    };
  },

  async getFamilyQuote(): Promise<ServiceResponse<FamilyQuote>> {
    // Mock family quote - replace with actual quote API
    return {
      data: {
        id: "1",
        text: "Family is not an important thing, it's everything.",
        quote: "Family is not an important thing, it's everything.",
        author: "Michael J. Fox",
      },
      error: null,
      success: true,
    };
  },
};

// Export all data operations
export default {
  // Nested services for organized access
  user: userData,
  family: familyData,
  post: postData,
  event: eventData,
  chat: chatData,
  game: gameData,
  recipe: recipeData,
  utility: utilityData,

  // Flattened methods for backward compatibility
  // User methods
  getCurrentUser: userData.getCurrentUser,
  getUserById: userData.getUserById,
  updateUserProfile: userData.updateUserProfile,
  getUserPostsCount: userData.getUserPostsCount,
  getUserPhotosCount: userData.getUserPhotosCount,
  getUserEventsCount: userData.getUserEventsCount,
  getUserRecipesCount: userData.getUserRecipesCount,

  // Family methods
  getFamilyById: familyData.getFamilyById,
  getUserFamilies: familyData.getUserFamilies,
  removeFamilyMember: familyData.removeFamilyMember,
  getFamilyMission: familyData.getFamilyMission,
  createOrUpdateFamilyMission: familyData.createOrUpdateFamilyMission,
  getFamilyMilestones: familyData.getFamilyMilestones,
  getFamilyPolls: familyData.getFamilyPolls,
  createPoll: familyData.createPoll,
  updatePoll: familyData.updatePoll,
  deletePoll: familyData.deletePoll,
  votePoll: familyData.votePoll,
  rateRecipe: familyData.rateRecipe,

  // Post methods
  getPostsWithAuthor: postData.getPostsWithAuthor,
  getPostById: postData.getPostById,

  // Event methods
  getEventsWithDetails: eventData.getEventsWithDetails,
  getEventById: eventData.getEventById,
  getFamilyEvents: eventData.getFamilyEvents,
  rsvpEvent: eventData.rsvpEvent,
  getEventAttendees: eventData.getEventAttendees,

  // Chat methods
  getChatMessages: chatData.getChatMessages,
  sendChatMessage: chatData.sendChatMessage,
  sendTypingIndicator: chatData.sendTypingIndicator,
  subscribeToChatMessages: chatData.subscribeToChatMessages,
  subscribeToTypingIndicators: chatData.subscribeToTypingIndicators,

  // Game methods
  getFamilyGames: gameData.getFamilyGames,
  getGameLeaderboard: gameData.getGameLeaderboard,
  getGameStats: gameData.getGameStats,
  createGame: gameData.createGame,
  updateGame: gameData.updateGame,
  deleteGame: gameData.deleteGame,
  recordGamePlay: gameData.recordGamePlay,

  // Recipe methods
  getRecipes: recipeData.getRecipes,
  getRecipeById: recipeData.getRecipeById,

  // Utility methods
  getWeatherData: utilityData.getWeatherData,
  getFamilyQuote: utilityData.getFamilyQuote,

  // Fitness methods
  getFamilyFitnessChallenges: fitnessData.getFamilyFitnessChallenges,
  getFamilyFitnessGoals: fitnessData.getFamilyFitnessGoals,
  getFamilyFitnessStats: fitnessData.getFamilyFitnessStats,
  createFitnessChallenge: fitnessData.createFitnessChallenge,

  // Kynnect methods
  getActiveCalls: kynnectData.getActiveCalls,
  getCallHistory: kynnectData.getCallHistory,
  createCall: kynnectData.createCall,
  joinCall: kynnectData.joinCall,
  getCallById: kynnectData.getCallById,
  leaveCall: kynnectData.leaveCall,
};
