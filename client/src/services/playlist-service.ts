// Playlist Service - Handles all playlist operations
// Implements missing playlist functionality from legacy code

import { supabase } from "./supabase";
import { logServiceError } from "../lib/logger";

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface Playlist {
  id: string;
  familyId: string;
  authorId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  collaborative: boolean;
  public: boolean;
  trackCount: number;
  createdBy: string;
  creator: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  tracks: PlaylistTrack[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistTrack {
  id: string;
  playlistId: string;
  trackId: string;
  addedAt: string;
  addedBy: string;
  track?: {
    id: string;
    title: string;
    artist: string;
    album?: string;
    duration: number;
    spotifyId?: string;
  };
}

export interface CreatePlaylistData {
  familyId: string;
  authorId: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  collaborative?: boolean;
  public?: boolean;
  trackCount?: number;
  createdBy?: string;
}

export interface UpdatePlaylistData {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export class PlaylistService {
  /**
   * Get all playlists for a family
   */
  async getFamilyPlaylists(
    familyId: string,
  ): Promise<ServiceResponse<Playlist[]>> {
    try {
      const { data: playlists, error } = await supabase
        .from("playlists")
        .select(
          `
          *,
          tracks:playlist_tracks(
            *,
            track:tracks(*)
          ),
          author:users(id, name, avatar)
        `,
        )
        .eq("familyId", familyId)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      return {
        data: playlists || [],
        error: null,
        success: true,
      };
    } catch (error) {
      logServiceError("PlaylistService", "getFamilyPlaylists", error as Error, {
        familyId,
      });
      return {
        data: null,
        error: "Failed to fetch family playlists",
        success: false,
      };
    }
  }

  /**
   * Get playlist by ID
   */
  async getPlaylistById(
    playlistId: string,
  ): Promise<ServiceResponse<Playlist | null>> {
    try {
      const { data: playlist, error } = await supabase
        .from("playlists")
        .select(
          `
          *,
          tracks:playlist_tracks(
            *,
            track:tracks(*)
          ),
          author:users(id, name, avatar)
        `,
        )
        .eq("id", playlistId)
        .single();

      if (error) throw error;

      return {
        data: playlist,
        error: null,
        success: true,
      };
    } catch (error) {
      logServiceError("PlaylistService", "getPlaylistById", error as Error, {
        playlistId,
      });
      return {
        data: null,
        error: "Failed to fetch playlist",
        success: false,
      };
    }
  }

  /**
   * Create a new playlist
   */
  async createPlaylist(
    playlistData: CreatePlaylistData,
  ): Promise<ServiceResponse<Playlist>> {
    try {
      const { data: playlist, error } = await supabase
        .from("playlists")
        .insert({
          familyId: playlistData.familyId,
          authorId: playlistData.authorId,
          name: playlistData.name,
          description: playlistData.description || "A family playlist",
          isPublic: playlistData.isPublic ?? true,
          collaborative: playlistData.collaborative ?? false,
          public: playlistData.public ?? true,
          trackCount: playlistData.trackCount ?? 0,
          createdBy: playlistData.createdBy || playlistData.authorId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the data to match our Playlist interface
      const transformedPlaylist: Playlist = {
        ...playlist,
        tracks: [],
        creator: {
          id: playlist.authorId,
          name: "Unknown", // TODO: Get actual user name
          email: "",
          avatar: undefined,
        },
      };

      return {
        data: transformedPlaylist,
        error: null,
        success: true,
      };
    } catch (error) {
      logServiceError("PlaylistService", "createPlaylist", error as Error, {
        familyId: playlistData.familyId,
      });
      return {
        data: null,
        error: "Failed to create playlist",
        success: false,
      };
    }
  }

  /**
   * Update a playlist
   */
  async updatePlaylist(
    playlistId: string,
    updates: UpdatePlaylistData,
  ): Promise<Playlist> {
    try {
      const { data: playlist, error } = await supabase
        .from("playlists")
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", playlistId)
        .select()
        .single();

      if (error) throw error;
      return playlist;
    } catch (error) {
      logServiceError("PlaylistService", "updatePlaylist", error as Error, {
        playlistId,
      });
      throw error;
    }
  }

  /**
   * Delete a playlist
   */
  async deletePlaylist(playlistId: string): Promise<boolean> {
    try {
      // First delete all tracks in the playlist
      const { error: tracksError } = await supabase
        .from("playlist_tracks")
        .delete()
        .eq("playlistId", playlistId);

      if (tracksError) throw tracksError;

      // Then delete the playlist
      const { error: playlistError } = await supabase
        .from("playlists")
        .delete()
        .eq("id", playlistId);

      if (playlistError) throw playlistError;

      return true;
    } catch (error) {
      logServiceError("PlaylistService", "deletePlaylist", error as Error, {
        playlistId,
      });
      throw error;
    }
  }

  /**
   * Add a track to a playlist
   */
  async addTrackToPlaylist(
    playlistId: string,
    trackId: string,
    addedBy: string,
  ): Promise<PlaylistTrack> {
    try {
      const { data: track, error } = await supabase
        .from("playlist_tracks")
        .insert({
          playlistId,
          trackId,
          addedBy,
          addedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return track;
    } catch (error) {
      logServiceError("PlaylistService", "addTrackToPlaylist", error as Error, {
        playlistId,
        trackId,
      });
      throw error;
    }
  }

  /**
   * Remove a track from a playlist
   */
  async removeTrackFromPlaylist(
    playlistId: string,
    trackId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("playlist_tracks")
        .delete()
        .eq("playlistId", playlistId)
        .eq("trackId", trackId);

      if (error) throw error;
      return true;
    } catch (error) {
      logServiceError(
        "PlaylistService",
        "removeTrackFromPlaylist",
        error as Error,
        { playlistId, trackId },
      );
      throw error;
    }
  }

  /**
   * Search playlists
   */
  async searchPlaylists(query: string, familyId: string): Promise<Playlist[]> {
    try {
      const { data: playlists, error } = await supabase
        .from("playlists")
        .select(
          `
          *,
          tracks:playlist_tracks(
            *,
            track:tracks(*)
          ),
          author:users(id, name, avatar)
        `,
        )
        .eq("familyId", familyId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("createdAt", { ascending: false });

      if (error) throw error;
      return playlists || [];
    } catch (error) {
      logServiceError("PlaylistService", "searchPlaylists", error as Error, {
        query,
        familyId,
      });
      throw error;
    }
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    try {
      const { data: playlists, error } = await supabase
        .from("playlists")
        .select(
          `
          *,
          tracks:playlist_tracks(
            *,
            track:tracks(*)
          ),
          author:users(id, name, avatar)
        `,
        )
        .eq("authorId", userId)
        .order("createdAt", { ascending: false });

      if (error) throw error;
      return playlists || [];
    } catch (error) {
      logServiceError("PlaylistService", "getUserPlaylists", error as Error, {
        userId,
      });
      throw error;
    }
  }
}

export const playlistService = new PlaylistService();
