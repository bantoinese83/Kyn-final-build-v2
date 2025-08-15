import { useState, useEffect } from "react";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import {
  Music,
  Search,
  Plus,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  Share2,
  Edit3,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileNav } from "@/components/MobileNav";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { familyService, playlistService } from "@/services";
import { Playlist as ServicePlaylist } from "@/services/playlist-service";
import {
  spotifyService,
  isAuthenticated,
  getAuthUrl,
  parseTokenFromUrl,
  setAccessToken,
  clearAccessToken,
  initializeSpotifyApi,
} from "@/services/spotify";
import { PlaylistCard, PlaylistForm } from "@/components/playlists";

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  uri: string;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name?: string };
  collaborative: boolean;
  public: boolean;
}

// Use the service Playlist interface consistently
type Playlist = SpotifyPlaylist | ServicePlaylist;

export function Playlists() {
  const { user, loading } = useAuth();

  // Show call-to-action if not authenticated
  if (!loading && !user) {
    return (
      <AuthCallToAction
        icon={<Music />}
        title="Share Music & Create Family Playlists"
        description="Connect through music by creating shared playlists, discovering new favorites, and building your family's soundtrack together."
        features={[
          "Create and share family music playlists",
          "Connect with Spotify for seamless music sharing",
          "Discover new music through family recommendations",
          "Build collaborative playlists for events and occasions",
          "Share favorite songs and musical memories",
          "Create the perfect soundtrack for family gatherings",
        ]}
        accentColor="#1DB954"
        bgGradient="from-green-50 to-emerald-50"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylist[]>(
    [],
  );
  const [databasePlaylists, setDatabasePlaylists] = useState<ServicePlaylist[]>(
    [],
  );
  const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null,
  );
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlaylist, setEditingPlaylist] =
    useState<ServicePlaylist | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [newPlaylistCollaborative, setNewPlaylistCollaborative] =
    useState(false);
  const [newPlaylistPublic, setNewPlaylistPublic] = useState(false);
  const { success, error } = useToast();

  // Get user's family ID from auth context
  const [currentFamily, setCurrentFamily] = useState<any>(null);

  // Check for Spotify authentication on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Get user's families first
      const familiesResult = await familyService.getUserFamilies(user.id);
      if (
        !familiesResult.success ||
        !familiesResult.data ||
        familiesResult.data.length === 0
      ) {
        setDatabasePlaylists([]);
        setAllPlaylists([]);
        setIsLoading(false);
        return;
      }

      const primaryFamily = familiesResult.data[0];
      setCurrentFamily(primaryFamily);

      const dbPlaylistsResult = await playlistService.getFamilyPlaylists(
        primaryFamily.id,
      );
      if (dbPlaylistsResult.success && dbPlaylistsResult.data) {
        const dbPlaylists = dbPlaylistsResult.data;
        setDatabasePlaylists(dbPlaylists);
        setAllPlaylists(dbPlaylists);
      }

      // Check for Spotify authentication
      const urlParams = parseTokenFromUrl();
      if (urlParams.access_token) {
        setAccessToken(urlParams.access_token, urlParams.expires_in);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        setIsSpotifyConnected(true);
        await loadSpotifyData();
      } else if (isAuthenticated()) {
        setIsSpotifyConnected(true);
        initializeSpotifyApi();
        await loadSpotifyData();
      }
    } catch (err) {
      console.error("Error loading playlists:", err);
      error("Failed to load playlists", "Please try refreshing the page");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpotifyData = async () => {
    try {
      const [profile, userPlaylists] = await Promise.all([
        spotifyService.getProfile(),
        spotifyService.getPlaylists(20),
      ]);

      setUserProfile(profile);
      setSpotifyPlaylists(userPlaylists.items);

      // Combine database and Spotify playlists
      setAllPlaylists([...databasePlaylists, ...userPlaylists.items]);

      success("Connected to Spotify", "Your playlists have been loaded");
    } catch (err) {
      error("Failed to load Spotify data", "Please try reconnecting");
      console.error("Spotify error:", err);
    }
  };

  const handleSpotifyConnect = () => {
    window.location.href = getAuthUrl();
  };

  const handleSpotifyDisconnect = () => {
    clearAccessToken();
    setIsSpotifyConnected(false);
    setUserProfile(null);
    setSpotifyPlaylists([]);
    setAllPlaylists(databasePlaylists);
    setSelectedPlaylist(null);
    setPlaylistTracks([]);
    success("Disconnected from Spotify", "Now showing only family playlists");
  };

  const handlePlaylistSelect = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setIsLoading(true);

    try {
      // Check if it's a Spotify playlist
      if ("tracks" in playlist && isSpotifyConnected) {
        const tracks = await spotifyService.getPlaylistTracks(playlist.id);
        setPlaylistTracks(
          tracks.items
            .filter(
              (item) =>
                "track" in item && item.track && "artists" in item.track,
            )
            .map((item) => ({
              id: item.track.id,
              name: item.track.name,
              artists: (item.track as any).artists || [],
              album: (item.track as any).album || { name: "", images: [] },
              duration_ms: (item.track as any).duration_ms || 0,
              uri: item.track.uri || "",
            })),
        );
      } else {
        // Database playlist - show empty for now (could implement track storage later)
        setPlaylistTracks([]);
      }
    } catch (err) {
      error("Failed to load tracks", "Please try again");
      console.error("Error loading tracks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      error("Playlist name required", "Please enter a name for your playlist");
      return;
    }

    setIsLoading(true);
    try {
      if (isSpotifyConnected) {
        // Create on both Spotify and database
        const spotifyPlaylist = await spotifyService.createPlaylist(
          newPlaylistName.trim(),
          newPlaylistDescription.trim() || undefined,
          newPlaylistPublic,
        );

        // Also save to database
        const dbPlaylistData = {
          familyId: currentFamily?.id || "",
          authorId: user?.id || "", // Add missing authorId field
          spotifyPlaylistId: spotifyPlaylist.id,
          name: newPlaylistName.trim(),
          description: newPlaylistDescription.trim() || "A family playlist",
          collaborative: newPlaylistCollaborative,
          public: newPlaylistPublic,
          trackCount: 0,
          createdBy: user?.id || "",
        };

        const dbPlaylist = await playlistService.createPlaylist(dbPlaylistData);

        if (dbPlaylist.success && dbPlaylist.data) {
          setSpotifyPlaylists([spotifyPlaylist, ...spotifyPlaylists]);
          setDatabasePlaylists([dbPlaylist.data, ...databasePlaylists]);
          setAllPlaylists([dbPlaylist.data, spotifyPlaylist, ...allPlaylists]);

          success(
            "Playlist created!",
            `"${newPlaylistName}" has been added to Spotify and your family`,
          );
        } else {
          error("Failed to create playlist", "Please try again");
        }
      } else {
        // Create only in database
        const playlistData = {
          familyId: currentFamily?.id || "",
          authorId: user?.id || "", // Add missing authorId field
          name: newPlaylistName.trim(),
          description: newPlaylistDescription.trim() || "A family playlist",
          collaborative: newPlaylistCollaborative,
          public: newPlaylistPublic,
          trackCount: 0,
          createdBy: user?.id || "",
        };

        const newPlaylist = await playlistService.createPlaylist(playlistData);
        if (newPlaylist.success && newPlaylist.data) {
          setDatabasePlaylists([newPlaylist.data, ...databasePlaylists]);
          setAllPlaylists([newPlaylist.data, ...allPlaylists]);

          success(
            "Family playlist created!",
            `"${newPlaylistName}" has been added to your family playlists`,
          );
        } else {
          error("Failed to create playlist", "Please try again");
        }
      }

      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setNewPlaylistCollaborative(false);
      setNewPlaylistPublic(false);
      setShowCreateForm(false);
    } catch (err) {
      error("Failed to create playlist", "Please try again");
      console.error("Error creating playlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPlaylist = async () => {
    if (!editingPlaylist || !newPlaylistName.trim()) {
      error("Playlist name required", "Please enter a name for your playlist");
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        name: newPlaylistName.trim(),
        description: newPlaylistDescription.trim() || "A family playlist",
        collaborative: newPlaylistCollaborative,
        public: newPlaylistPublic,
      };

      const updatedPlaylist = await playlistService.updatePlaylist(
        editingPlaylist.id,
        updateData,
      );

      // Update the local state
      const updatedDbPlaylists = databasePlaylists.map((p) =>
        p.id === editingPlaylist.id ? updatedPlaylist : p,
      );
      setDatabasePlaylists(updatedDbPlaylists);

      const updatedAllPlaylists = allPlaylists.map((p) =>
        "createdBy" in p && p.id === editingPlaylist.id ? updatedPlaylist : p,
      );
      setAllPlaylists(updatedAllPlaylists);

      success("Playlist updated!", `"${newPlaylistName}" has been updated`);
      setEditingPlaylist(null);
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setNewPlaylistCollaborative(false);
      setNewPlaylistPublic(false);
    } catch (err) {
      error("Failed to update playlist", "Please try again");
      console.error("Error updating playlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlaylist = async (playlist: ServicePlaylist) => {
    try {
      const deleteSuccess = await playlistService.deletePlaylist(playlist.id);
      if (!deleteSuccess) {
        error("Failed to delete playlist", "Please try again");
        return;
      }

      const updatedDbPlaylists = databasePlaylists.filter(
        (p) => p.id !== playlist.id,
      );
      setDatabasePlaylists(updatedDbPlaylists);

      const updatedAllPlaylists = allPlaylists.filter(
        (p) => !("createdBy" in p) || p.id !== playlist.id,
      );
      setAllPlaylists(updatedAllPlaylists);

      if (
        selectedPlaylist &&
        "createdBy" in selectedPlaylist &&
        selectedPlaylist.id === playlist.id
      ) {
        setSelectedPlaylist(null);
        setPlaylistTracks([]);
      }

      success("Playlist deleted", `"${playlist.name}" has been removed`);
    } catch (err) {
      error("Failed to delete playlist", "Please try again");
      console.error("Error deleting playlist:", err);
    }
  };

  const handleSavePlaylist = async (playlistData: any) => {
    try {
      if (editingPlaylist) {
        // Update existing playlist
        await handleEditPlaylist();
      } else {
        // Create new playlist
        await handleCreatePlaylist();
      }
    } catch (error) {
      console.error("Error saving playlist:", error);
    }
  };

  const startEditingPlaylist = (playlist: ServicePlaylist) => {
    setEditingPlaylist(playlist);
    setNewPlaylistName(playlist.name);
    setNewPlaylistDescription(playlist.description);
    setNewPlaylistCollaborative(playlist.collaborative);
    setNewPlaylistPublic(playlist.public);
  };

  const handlePlayTrack = (trackId: string) => {
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(trackId);
      // In a real implementation, you would use Spotify Web Playback SDK
      setTimeout(() => setCurrentlyPlaying(null), 3000); // Demo: auto-stop after 3s
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const filteredPlaylists = allPlaylists.filter(
    (playlist) =>
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isSpotifyPlaylist = (
    playlist: Playlist,
  ): playlist is SpotifyPlaylist => {
    return "tracks" in playlist;
  };

  const isDatabasePlaylist = (
    playlist: Playlist,
  ): playlist is ServicePlaylist => {
    return "createdBy" in playlist;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
      <MobileNav />
      <div className="max-w-6xl mx-auto">
        <main className="flex-1 p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-tenor font-normal text-foreground mb-3">
              Family Playlists
            </h1>
            <p className="text-lg text-muted-foreground">
              Shared music collections for the whole family
            </p>
          </div>

          {/* Spotify Connection Status */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: isSpotifyConnected
                        ? "#1DB954"
                        : "#5D6739",
                    }}
                  >
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {isSpotifyConnected
                        ? "Connected to Spotify"
                        : "Family Playlists Only"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isSpotifyConnected
                        ? `Logged in as ${userProfile?.display_name || "User"} - Showing Spotify + Family playlists`
                        : "Connect to Spotify to sync your playlists"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isSpotifyConnected ? (
                    <Button
                      variant="outline"
                      onClick={handleSpotifyDisconnect}
                      className="border-gray-300"
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSpotifyConnect}
                      className="text-white hover:opacity-90"
                      style={{ backgroundColor: "#1DB954" }}
                    >
                      Connect Spotify
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Playlists Section */}
            <div className="lg:col-span-2">
              {/* Create Playlist & Search */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Search playlists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Playlist
                  </Button>
                </div>
              </div>

              {/* Playlists List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                    <p className="text-lg text-muted-foreground">
                      Loading playlists...
                    </p>
                  </div>
                </div>
              ) : allPlaylists.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No playlists yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start by creating your first family playlist
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Playlist
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {allPlaylists
                    .filter(
                      (playlist) =>
                        playlist.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        playlist.description
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                    )
                    .map((playlist) => (
                      <PlaylistCard
                        key={playlist.id}
                        playlist={playlist}
                        isCurrentlyPlaying={currentlyPlaying === playlist.id}
                        onPlay={() => setCurrentlyPlaying(playlist.id)}
                        onPause={() => setCurrentlyPlaying(null)}
                        onEdit={handleEditPlaylist}
                        onDelete={(playlistId) => {
                          const playlist = allPlaylists.find(
                            (p) => p.id === playlistId,
                          );
                          if (playlist && "createdBy" in playlist) {
                            handleDeletePlaylist(playlist);
                          }
                        }}
                        onViewTracks={(pl) => handlePlaylistSelect(pl)}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Playlists
                    </span>
                    <span className="font-medium">{allPlaylists.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Family Playlists
                    </span>
                    <span className="font-medium">
                      {databasePlaylists.length}
                    </span>
                  </div>
                  {isSpotifyConnected && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Spotify Playlists
                      </span>
                      <span className="font-medium">
                        {spotifyPlaylists.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create/Edit Playlist Dialog */}
      {(showCreateForm || editingPlaylist) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PlaylistForm
              playlist={editingPlaylist}
              onSave={handleSavePlaylist}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingPlaylist(null);
              }}
              isEditing={!!editingPlaylist}
            />
          </div>
        </div>
      )}
    </div>
  );
}
