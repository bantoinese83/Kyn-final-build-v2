// PhotoGrid Component - Displays albums in grid or list view
// Extracted from Photos.tsx for better modularity and maintainability

import { AlbumCard } from "./AlbumCard";
import { Album } from "@/types/photos";

interface PhotoGridProps {
  albums: Album[];
  viewMode: "grid" | "list";
  onEdit: (album: Album) => void;
  onDelete: (albumId: string) => Promise<void>;
  onShare: (album: Album) => void;
  onView: (album: Album) => void;
  onDownload: (album: Album) => void;
  isAuthor: (albumId: string) => boolean;
  className?: string;
}

export function PhotoGrid({
  albums,
  viewMode,
  onEdit,
  onDelete,
  onShare,
  onView,
  onDownload,
  isAuthor,
  className = "",
}: PhotoGridProps) {
  if (albums.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mx-auto mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No albums yet</h3>
        <p className="text-muted-foreground mb-4">
          Start creating albums to organize and share your family photos and
          videos!
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onEdit={onEdit}
            onDelete={onDelete}
            onShare={onShare}
            onView={onView}
            onDownload={onDownload}
            isAuthor={isAuthor(album.id)}
            className={viewMode === "list" ? "max-w-none" : ""}
          />
        ))}
      </div>
    </div>
  );
}
