import SpotifyWebApi from "spotify-web-api-js";
import { logServiceError } from "../lib/logger";

// Spotify configuration
export const SPOTIFY_CLIENT_ID =
  import.meta.env.VITE_SPOTIFY_CLIENT_ID || "your-spotify-client-id";
export const SPOTIFY_REDIRECT_URI =
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI ||
  `${window.location.origin}/playlists`;
export const SPOTIFY_SCOPES = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
  "user-read-email",
  "user-library-read",
  "user-top-read",
].join(" ");

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi();

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("spotify_access_token");
  const expiry = localStorage.getItem("spotify_token_expiry");

  if (!token || !expiry) return false;

  return Date.now() < parseInt(expiry);
};

// Get stored access token
export const getAccessToken = (): string | null => {
  if (!isAuthenticated()) return null;
  return localStorage.getItem("spotify_access_token");
};

// Set access token
export const setAccessToken = (
  token: string,
  expiresIn: number = 3600,
): void => {
  localStorage.setItem("spotify_access_token", token);
  localStorage.setItem(
    "spotify_token_expiry",
    (Date.now() + expiresIn * 1000).toString(),
  );
  spotifyApi.setAccessToken(token);
};

// Clear access token
export const clearAccessToken = (): void => {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_token_expiry");
  localStorage.removeItem("spotify_refresh_token");
};

// Generate Spotify authorization URL
export const getAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "token",
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    show_dialog: "true",
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// Parse token from URL hash (after redirect)
export const parseTokenFromUrl = (): {
  access_token?: string;
  expires_in?: number;
} => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);

  return {
    access_token: params.get("access_token") || undefined,
    expires_in: parseInt(params.get("expires_in") || "3600"),
  };
};

// Initialize API with stored token
export const initializeSpotifyApi = (): boolean => {
  const token = getAccessToken();
  if (token) {
    spotifyApi.setAccessToken(token);
    return true;
  }
  return false;
};

// API wrapper functions
export const spotifyService = {
  // Get user profile
  getProfile: async () => {
    try {
      return await spotifyApi.getMe();
    } catch (error) {
      logServiceError("SpotifyService", "getProfile", error as Error);
      throw error;
    }
  },

  // Get user playlists
  getPlaylists: async (limit: number = 20, offset: number = 0) => {
    try {
      const user = await spotifyApi.getMe();
      return await spotifyApi.getUserPlaylists(user.id, { limit, offset });
    } catch (error) {
      logServiceError("SpotifyService", "getPlaylists", error as Error, {
        limit,
        offset,
      });
      throw error;
    }
  },

  // Get playlist details
  getPlaylist: async (playlistId: string) => {
    try {
      return await spotifyApi.getPlaylist(playlistId);
    } catch (error) {
      logServiceError("SpotifyService", "getPlaylist", error as Error, {
        playlistId,
      });
      throw error;
    }
  },

  // Get playlist tracks
  getPlaylistTracks: async (
    playlistId: string,
    limit: number = 50,
    offset: number = 0,
  ) => {
    try {
      return await spotifyApi.getPlaylistTracks(playlistId, { limit, offset });
    } catch (error) {
      logServiceError("SpotifyService", "getPlaylistTracks", error as Error, {
        playlistId,
        limit,
        offset,
      });
      throw error;
    }
  },

  // Search for tracks
  searchTracks: async (query: string, limit: number = 20) => {
    try {
      return await spotifyApi.searchTracks(query, { limit });
    } catch (error) {
      logServiceError("SpotifyService", "searchTracks", error as Error, {
        query,
        limit,
      });
      throw error;
    }
  },

  // Get user's top tracks
  getTopTracks: async (
    limit: number = 20,
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  ) => {
    try {
      return await spotifyApi.getMyTopTracks({ limit, time_range: timeRange });
    } catch (error) {
      logServiceError("SpotifyService", "getTopTracks", error as Error, {
        limit,
        timeRange,
      });
      throw error;
    }
  },

  // Create playlist
  createPlaylist: async (
    name: string,
    description?: string,
    isPublic: boolean = false,
  ) => {
    try {
      const user = await spotifyApi.getMe();
      return await spotifyApi.createPlaylist(user.id, {
        name,
        description,
        public: isPublic,
      });
    } catch (error) {
      logServiceError("SpotifyService", "createPlaylist", error as Error, {
        name,
        description,
        isPublic,
      });
      throw error;
    }
  },

  // Add tracks to playlist
  addTracksToPlaylist: async (playlistId: string, trackUris: string[]) => {
    try {
      return await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
    } catch (error) {
      logServiceError("SpotifyService", "addTracksToPlaylist", error as Error, {
        playlistId,
        trackUris,
      });
      throw error;
    }
  },

  // Remove tracks from playlist
  removeTracksFromPlaylist: async (playlistId: string, trackUris: string[]) => {
    try {
      const tracks = trackUris.map((uri) => ({ uri }));
      return await spotifyApi.removeTracksFromPlaylist(playlistId, tracks);
    } catch (error) {
      logServiceError(
        "SpotifyService",
        "removeTracksFromPlaylist",
        error as Error,
        { playlistId, trackUris },
      );
      throw error;
    }
  },
};

// Mock data for demo purposes (when Spotify is not configured)
export const mockPlaylists = [
  {
    id: "mock1",
    name: "Family Road Trip Hits",
    description: "Perfect songs for our next family adventure",
    images: [{ url: "" }],
    tracks: { total: 25 },
    owner: { display_name: "Lauren" },
    collaborative: true,
    public: false,
  },
  {
    id: "mock2",
    name: "Sunday Morning Vibes",
    description: "Relaxing tunes for family breakfast",
    images: [{ url: "" }],
    tracks: { total: 18 },
    owner: { display_name: "Mom" },
    collaborative: true,
    public: false,
  },
  {
    id: "mock3",
    name: "Workout with Family",
    description: "High energy songs for family fitness time",
    images: [{ url: "" }],
    tracks: { total: 32 },
    owner: { display_name: "Sister Kate" },
    collaborative: false,
    public: true,
  },
  {
    id: "mock4",
    name: "Grandparents' Greatest Hits",
    description: "Classic songs that bring back memories",
    images: [{ url: "" }],
    tracks: { total: 42 },
    owner: { display_name: "Grandpa Joe" },
    collaborative: false,
    public: false,
  },
];

export const mockTracks = [
  {
    track: {
      id: "track1",
      name: "Don't Stop Believin'",
      artists: [{ name: "Journey" }],
      album: { name: "Escape", images: [{ url: "" }] },
      duration_ms: 251000,
      uri: "spotify:track:4bHsxqR3GMrXTxEPLuK5ue",
    },
  },
  {
    track: {
      id: "track2",
      name: "Sweet Caroline",
      artists: [{ name: "Neil Diamond" }],
      album: {
        name: "Brother Love's Travelling Salvation Show",
        images: [{ url: "" }],
      },
      duration_ms: 203000,
      uri: "spotify:track:5UVsbUh5494VsKyaFir5oy",
    },
  },
  {
    track: {
      id: "track3",
      name: "Here Comes the Sun",
      artists: [{ name: "The Beatles" }],
      album: { name: "Abbey Road", images: [{ url: "" }] },
      duration_ms: 185000,
      uri: "spotify:track:6dGnYIeXmHdcikdzNNDMm2",
    },
  },
];
