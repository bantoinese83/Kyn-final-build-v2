// FeedHeader Component - Displays weather, status, and family facts
// Extracted from MainFeed.tsx for better modularity

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FamilyFactPopup } from "@/components/FamilyFactPopup";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { WeatherData, FamilyQuote } from "@/services";
import {
  Sun,
  MapPin,
  Clock,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedHeaderProps {
  weather: WeatherData | null;
  dailyQuote: FamilyQuote | null;
  currentStatus: string;
  awayMessage: string;
  onStatusUpdate: (status: string, awayMessage?: string) => void;
  onRefreshWeather: () => void;
  className?: string;
}

export function FeedHeader({
  weather,
  dailyQuote,
  currentStatus,
  awayMessage,
  onStatusUpdate,
  onRefreshWeather,
  className,
}: FeedHeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFamilyFact, setShowFamilyFact] = useState(false);
  const [factsSilenced, setFactsSilenced] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState(currentStatus);
  const [tempAwayMessage, setTempAwayMessage] = useState(awayMessage);

  const handleStatusSave = () => {
    onStatusUpdate(tempStatus, tempAwayMessage);
    setIsEditingStatus(false);
    toast({
      title: "Status updated",
      description: "Your status has been updated.",
    });
  };

  const handleStatusCancel = () => {
    setTempStatus(currentStatus);
    setTempAwayMessage(awayMessage);
    setIsEditingStatus(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600 bg-green-100";
      case "away":
        return "text-yellow-600 bg-yellow-100";
      case "busy":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return "🟢";
      case "away":
        return "🟡";
      case "busy":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Weather and Status Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Weather Section */}
            <div className="flex items-center space-x-3">
              {weather ? (
                <>
                  <div className="text-2xl">
                    {weather.temperatureF > 0 ? "☀️" : "❄️"}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {weather.temperatureF}°F
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      Weather
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sun className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Loading weather...
                  </span>
                </div>
              )}
            </div>

            {/* Status Section */}
            <div className="flex items-center space-x-3">
              {isEditingStatus ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={tempStatus}
                    onChange={(e) => setTempStatus(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="online">Online</option>
                    <option value="away">Away</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>

                  {tempStatus === "away" && (
                    <Input
                      placeholder="Away message..."
                      value={tempAwayMessage}
                      onChange={(e) => setTempAwayMessage(e.target.value)}
                      className="w-32 text-sm"
                    />
                  )}

                  <Button size="sm" onClick={handleStatusSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleStatusCancel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1",
                      getStatusColor(currentStatus),
                    )}
                  >
                    <span>{getStatusIcon(currentStatus)}</span>
                    <span className="capitalize">{currentStatus}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingStatus(true)}
                    className="h-8 px-2"
                  >
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Weather Refresh Button */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">&nbsp;</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshWeather}
              className="h-8 px-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Family Quote Card */}
      {dailyQuote && !factsSilenced && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Today's Family Quote
                </p>
                <p className="text-sm text-blue-800 italic">
                  "{dailyQuote.quote}"
                </p>
                {dailyQuote.author && (
                  <p className="text-xs text-blue-700 mt-1">
                    — {dailyQuote.author}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFactsSilenced(true)}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Fact Popup */}
      <FamilyFactPopup
        isOpen={showFamilyFact}
        onClose={() => setShowFamilyFact(false)}
        onSilence={() => setFactsSilenced(true)}
      />

      {/* Quick Actions */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFamilyFact(true)}
          className="h-8 px-3"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          Family Fact
        </Button>

        <Button variant="outline" size="sm" className="h-8 px-3">
          <UserPlus className="h-4 w-4 mr-1" />
          Invite Member
        </Button>
      </div>
    </div>
  );
}
