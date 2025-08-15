// PollCard Component - Displays individual family polls with voting options
// Extracted from Polls.tsx to improve maintainability and reusability

import { useState } from "react";
import {
  Vote,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Edit3,
  Trash2,
  MoreHorizontal,
  Eye,
  Share2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Poll {
  id: string;
  title: string;
  description?: string;
  type: "multiple_choice" | "yes_no" | "rating" | "ranking";
  totalVotes: number;
  endDate: Date;
  isAnonymous: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  options: Array<{
    id: string;
    text: string;
    votes: number;
    percentage: number;
    order?: number;
  }>;
  userVote?: {
    optionId: string;
    votedAt: string;
  };
  isActive: boolean;
  tags: string[];
  allowMultipleVotes: boolean;
  maxVotes?: number;
}

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string, optionId: string) => void;
  onEdit: (poll: Poll) => void;
  onDelete: (pollId: string) => void;
  onShare: (poll: Poll) => void;
  onViewResults: (poll: Poll) => void;
  isAuthor: boolean;
  className?: string;
}

const POLL_TYPE_LABELS = {
  multiple_choice: "Multiple Choice",
  yes_no: "Yes/No",
  rating: "Rating",
  ranking: "Ranking",
};

const POLL_TYPE_COLORS = {
  multiple_choice: "bg-blue-100 text-blue-800 border-blue-200",
  yes_no: "bg-green-100 text-green-800 border-green-200",
  rating: "bg-purple-100 text-purple-800 border-purple-200",
  ranking: "bg-orange-100 text-orange-800 border-orange-200",
};

export function PollCard({
  poll,
  onVote,
  onEdit,
  onDelete,
  onShare,
  onViewResults,
  isAuthor,
  className = "",
}: PollCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    poll.userVote ? [poll.userVote.optionId] : [],
  );

  const handleOptionSelect = (optionId: string) => {
    if (poll.type === "multiple_choice" && poll.allowMultipleVotes) {
      setSelectedOptions((prev) => {
        if (prev.includes(optionId)) {
          return prev.filter((id) => id !== optionId);
        } else {
          const maxVotes = poll.maxVotes || poll.options.length;
          if (prev.length < maxVotes) {
            return [...prev, optionId];
          }
          return prev;
        }
      });
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = () => {
    if (selectedOptions.length > 0) {
      selectedOptions.forEach((optionId) => {
        onVote(poll.id, optionId);
      });
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const endDate = new Date(date);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Ended";
    if (diffDays === 0) return "Ends today";
    if (diffDays === 1) return "Ends tomorrow";
    if (diffDays < 7) return `Ends in ${diffDays} days`;
    return `Ends ${endDate.toLocaleDateString()}`;
  };

  const getStatusColor = (isActive: boolean, endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);

    if (!isActive || now > end)
      return "bg-gray-100 text-gray-800 border-gray-200";
    if (end.getTime() - now.getTime() < 24 * 60 * 60 * 1000)
      return "bg-red-100 text-red-800 border-red-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const renderVotingOptions = () => {
    switch (poll.type) {
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {poll.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-3">
                <input
                  type={poll.allowMultipleVotes ? "checkbox" : "radio"}
                  id={option.id}
                  name={`poll-${poll.id}`}
                  value={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onChange={() => handleOptionSelect(option.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={option.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {option.text}
                    </span>
                    {poll.totalVotes > 0 && (
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={option.percentage}
                          className="w-20 h-2"
                        />
                        <span className="text-xs text-gray-500 w-12 text-right">
                          {option.votes} ({option.percentage}%)
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>
        );

      case "yes_no":
        return (
          <div className="grid grid-cols-2 gap-3">
            {poll.options.map((option) => (
              <Button
                key={option.id}
                variant={
                  selectedOptions.includes(option.id) ? "default" : "outline"
                }
                onClick={() => handleOptionSelect(option.id)}
                className="h-12 text-sm font-medium"
              >
                {option.text}
                {poll.totalVotes > 0 && (
                  <span className="ml-2 text-xs opacity-75">
                    {option.votes} ({option.percentage}%)
                  </span>
                )}
              </Button>
            ))}
          </div>
        );

      case "rating":
        return (
          <div className="space-y-3">
            {poll.options.map((option, index) => (
              <div key={option.id} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900 w-16">
                  {option.text}
                </span>
                <div className="flex-1 flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <input
                      key={rating}
                      type="radio"
                      name={`rating-${option.id}`}
                      value={rating}
                      checked={selectedOptions.includes(
                        `${option.id}-${rating}`,
                      )}
                      onChange={() =>
                        setSelectedOptions([`${option.id}-${rating}`])
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                  ))}
                </div>
                {poll.totalVotes > 0 && (
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {option.votes} votes
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      case "ranking":
        return (
          <div className="space-y-3">
            {poll.options.map((option, index) => (
              <div key={option.id} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900 w-8">
                  {index + 1}.
                </span>
                <span className="flex-1 text-sm text-gray-700">
                  {option.text}
                </span>
                {poll.totalVotes > 0 && (
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {option.votes} votes
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const canVote =
    poll.isActive && new Date() < new Date(poll.endDate) && !poll.userVote;

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold text-dark-blue">
                {poll.title}
              </CardTitle>
              <Badge className={getStatusColor(poll.isActive, poll.endDate)}>
                {poll.isActive && new Date() < new Date(poll.endDate)
                  ? "Active"
                  : "Ended"}
              </Badge>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Badge className={POLL_TYPE_COLORS[poll.type]}>
                {POLL_TYPE_LABELS[poll.type]}
              </Badge>
              {poll.isAnonymous && (
                <Badge variant="outline" className="text-gray-600">
                  Anonymous
                </Badge>
              )}
              {poll.allowMultipleVotes && (
                <Badge variant="outline" className="text-gray-600">
                  Multiple Votes
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
                <DropdownMenuLabel>Poll Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(poll)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Poll
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewResults(poll)}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Results
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(poll)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Poll
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(poll.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Poll
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {poll.description && (
          <p className="text-gray-600 text-sm">{poll.description}</p>
        )}

        {/* Poll Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Options:</h4>
          {renderVotingOptions()}
        </div>

        {/* Voting Actions */}
        {canVote && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleVote}
              disabled={selectedOptions.length === 0}
              className="flex-1"
            >
              <Vote className="w-4 h-4 mr-2" />
              Vote
            </Button>
            <Button
              variant="outline"
              onClick={() => onViewResults(poll)}
              size="sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          </div>
        )}

        {/* Poll Info */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(poll.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{poll.totalVotes} votes</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>{poll.options.length} options</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tags */}
        {poll.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {poll.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Author Info */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Created by:</span>
            <Avatar className="w-6 h-6">
              <AvatarImage src={poll.author.avatar} />
              <AvatarFallback className="text-xs">
                {poll.author.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-900">
              {poll.author.name}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
