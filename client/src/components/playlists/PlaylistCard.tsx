// PlaylistCard Component - Displays individual playlists
// Extracted from Playlists.tsx to improve maintainability and reusability

import {
  Music,
  Play,
  Pause,
  Users,
  Lock,
  Globe,
  ExternalLink,
  Edit3,
  Trash2,
  Badge,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Playlist as ServicePlaylist } from "@/services/playlist-service";

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

// Use the service Playlist interface
type Playlist = SpotifyPlaylist | ServicePlaylist;

interface PlaylistCardProps {
  playlist: Playlist;
  isCurrentlyPlaying: boolean;
  onPlay: (playlist: Playlist) => void;
  onPause: () => void;
  onEdit: (playlist: ServicePlaylist) => void;
  onDelete: (playlistId: string) => void;
  onViewTracks: (playlist: Playlist) => void;
  className?: string;
}

export function PlaylistCard({
  playlist,
  isCurrentlyPlaying,
  onPlay,
  onPause,
  onEdit,
  onDelete,
  onViewTracks,
  className = "",
}: PlaylistCardProps) {
  const isSpotifyPlaylist = (p: Playlist): p is SpotifyPlaylist =>
    "tracks" in p;
  const isDatabasePlaylist = (p: Playlist): p is ServicePlaylist =>
    !("tracks" in p);

  const getPlaylistImage = () => {
    if (isSpotifyPlaylist(playlist) && playlist.images.length > 0) {
      return (playlist as SpotifyPlaylist).images[0].url;
    }
    return "/default-playlist-cover.jpg"; // Default image
  };

  const getPlaylistName = () => {
    return playlist.name;
  };

  const getPlaylistDescription = () => {
    return playlist.description || "No description";
  };

  const getTrackCount = () => {
    if (isSpotifyPlaylist(playlist)) {
      return (playlist as SpotifyPlaylist).tracks.total;
    }
    return (playlist as ServicePlaylist).trackCount;
  };

  const getCreatorName = () => {
    if (isSpotifyPlaylist(playlist)) {
      return (playlist as SpotifyPlaylist).owner.display_name || "Unknown";
    }
    return (playlist as ServicePlaylist).creator.name;
  };

  const getVisibilityIcon = () => {
    if (playlist.public) {
      return <Globe className="h-4 w-4 text-blue-500" />;
    }
    return <Lock className="h-4 w-4 text-gray-500" />;
  };

  const getVisibilityText = () => {
    if (playlist.public) {
      return "Public";
    }
    return "Private";
  };

  const getCollaborativeBadge = () => {
    if (playlist.collaborative) {
      return (
        <BadgeUI className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
          <Users className="h-3 w-3 mr-1" />
          Collaborative
        </BadgeUI>
      );
    }
    return null;
  };

  const formatDuration = (durationMs: number) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={getPlaylistImage()}
                alt={getPlaylistName()}
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/default-playlist-cover.jpg";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-black/30"
                  onClick={() =>
                    isCurrentlyPlaying ? onPause() : onPlay(playlist)
                  }
                >
                  {isCurrentlyPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {getPlaylistName()}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {truncateText(getPlaylistDescription())}
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Music className="h-3 w-3" />
                <span>{getTrackCount()} tracks</span>
                <span>•</span>
                <span>by {getCreatorName()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {getCollaborativeBadge()}
            <BadgeUI className="text-xs">
              <div className="flex items-center space-x-1">
                {getVisibilityIcon()}
                <span>{getVisibilityText()}</span>
              </div>
            </BadgeUI>
            {isSpotifyPlaylist(playlist) && (
              <BadgeUI className="bg-green-100 text-green-800 border-green-200 text-xs">
                Spotify
              </BadgeUI>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewTracks(playlist)}
              className="text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Tracks
            </Button>
            {isSpotifyPlaylist && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://open.spotify.com/playlist/${playlist.id}`,
                    "_blank",
                  )
                }
                className="text-xs text-green-600 border-green-300 hover:bg-green-50"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open in Spotify
              </Button>
            )}
          </div>

          {isDatabasePlaylist(playlist) && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(playlist as ServicePlaylist)}
                className="text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(playlist.id)}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
