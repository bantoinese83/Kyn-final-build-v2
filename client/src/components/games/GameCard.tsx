// GameCard Component - Displays individual family games with actions
// Extracted from Games.tsx to improve maintainability and reusability

import { useState } from "react";
import {
  Trophy,
  Play,
  Users,
  Clock,
  Edit3,
  Trash2,
  MoreHorizontal,
  Crown,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FamilyGame {
  id: string;
  title: string;
  category: string;
  description: string;
  players: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isActive: boolean;
  currentChampion?: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  totalPlays: number;
  tags: string[];
  rules?: string;
  equipment?: string[];
  lastPlayed?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface GameCardProps {
  game: FamilyGame;
  onEdit: (game: FamilyGame) => void;
  onDelete: (gameId: string) => void;
  onPlay: (game: FamilyGame) => void;
  isAuthor: boolean;
  className?: string;
}

export function GameCard({
  game,
  onEdit,
  onDelete,
  onPlay,
  isAuthor,
  className = "",
}: GameCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      "Board Games": "bg-blue-100 text-blue-800 border-blue-200",
      "Card Games": "bg-purple-100 text-purple-800 border-purple-200",
      Outdoor: "bg-green-100 text-green-800 border-green-200",
      Puzzles: "bg-orange-100 text-orange-800 border-orange-200",
      "Video Games": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Party Games": "bg-pink-100 text-pink-800 border-pink-200",
      Educational: "bg-teal-100 text-teal-800 border-teal-200",
    };
    return colorMap[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never played";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold text-dark-blue">
                {game.title}
              </CardTitle>
              {game.currentChampion && (
                <div className="flex items-center gap-1">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-600">Champion</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Badge className={getCategoryColor(game.category)}>
                {game.category}
              </Badge>
              <Badge className={getDifficultyColor(game.difficulty)}>
                {game.difficulty}
              </Badge>
              {game.isActive ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Active
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                  Inactive
                </Badge>
              )}
            </div>
          </div>

          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Game Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(game)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Game
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(game.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Game
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm line-clamp-2">{game.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{game.players}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{game.duration}</span>
          </div>
        </div>

        {game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600"
              >
                {tag}
              </Badge>
            ))}
            {game.tags.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600"
              >
                +{game.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              {renderStars(game.rating)}
              <span className="ml-1">({game.rating})</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>{game.totalPlays} plays</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {game.lastPlayed && (
              <span className="text-xs text-gray-500">
                Last: {formatDate(game.lastPlayed)}
              </span>
            )}
            <Button
              onClick={() => onPlay(game)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="w-4 h-4 mr-1" />
              Play
            </Button>
          </div>
        </div>

        {game.currentChampion && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Current Champion:</span>
              <Avatar className="w-6 h-6">
                <AvatarImage src={game.currentChampion.avatar} />
                <AvatarFallback className="text-xs">
                  {game.currentChampion.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-900">
                {game.currentChampion.name}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
