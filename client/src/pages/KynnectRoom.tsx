import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveKit } from "@/contexts/LiveKitContext";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  MessageCircle,
  Monitor,
  MoreVertical,
  Hand,
  Grid3X3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabaseDataService } from "@/services";
import {
  VideoTrack,
  AudioTrack,
  useParticipants,
  useLocalParticipant,
  useTracks,
  TrackReference,
} from "@livekit/components-react";
import { Track, Participant } from "livekit-client";

export function KynnectRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const {
    room,
    isConnected,
    isConnecting,
    connectionError,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    isVideoEnabled,
    isAudioEnabled,
    isScreenShareEnabled,
  } = useLiveKit();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<"grid" | "speaker">("grid");
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [callDetails, setCallDetails] = useState<any>(null);
  const [isLeavingCall, setIsLeavingCall] = useState(false);

  // Use actual LiveKit hooks for production
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], {
    onlySubscribed: false,
  });

  // Room name from call details or fallback
  const roomName = callDetails?.name || roomId || "Family Video Chat";

  // Auto-join room when component mounts
  useEffect(() => {
    const initializeCall = async () => {
      if (!room && !isConnecting && !isConnected && roomId) {
        try {
          // Try to get call details
          try {
            const details = await supabaseDataService.getCallById(roomId);
            setCallDetails(details);
          } catch (error) {
            console.warn("Could not fetch call details:", error);
          }

          // Join the LiveKit room
          const userId = localStorage.getItem("userId");
          const userName = `User ${userId?.slice(-4) || "Guest"}`;

          await joinRoom(roomId, userName);

          // Join call in backend if we have call details
          if (callDetails && userId) {
            try {
              await supabaseDataService.joinCall(callDetails.id, { userId });
            } catch (error) {
              console.warn("Could not join call in backend:", error);
            }
          }
        } catch (error) {
          console.error("Failed to join room:", error);
          toast({
            title: "Connection Failed",
            description:
              error instanceof Error
                ? error.message
                : "Failed to join the video call",
            variant: "destructive",
          });
          navigate("/kynnect");
        }
      }
    };

    initializeCall();
  }, [
    room,
    isConnecting,
    isConnected,
    roomId,
    joinRoom,
    navigate,
    toast,
    callDetails,
  ]);

  // Update call duration
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Handle leaving the call
  const handleLeaveCall = async () => {
    if (isLeavingCall) return;

    try {
      setIsLeavingCall(true);

      // Leave call in backend
      const userId = localStorage.getItem("userId");
      if (callDetails && userId) {
        try {
          await supabaseDataService.leaveCall(callDetails.id, userId);
        } catch (error) {
          console.warn("Could not leave call in backend:", error);
        }
      }

      // Leave LiveKit room
      await leaveRoom();
      navigate("/kynnect");

      toast({
        title: "Call Ended",
        description: "You have left the video call.",
      });
    } catch (error) {
      console.error("Error leaving call:", error);
      toast({
        title: "Error",
        description: "Failed to leave call properly.",
        variant: "destructive",
      });
      // Still navigate away even if there's an error
      navigate("/kynnect");
    } finally {
      setIsLeavingCall(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    toast({
      title: isHandRaised ? "Hand Lowered" : "Hand Raised",
      description: isHandRaised
        ? "Your hand has been lowered."
        : "Your hand is raised.",
    });
  };

  // Show loading state while connecting
  if (isConnecting) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Connecting to call...</p>
        </div>
      </div>
    );
  }

  // Show error state if connection failed
  if (connectionError) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-white mb-4">Failed to connect to call</p>
          <p className="text-gray-400 mb-6">{connectionError}</p>
          <Button onClick={() => navigate("/kynnect")}>Back to Kynnect</Button>
        </div>
      </div>
    );
  }

  // Show waiting state if not connected yet
  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Video className="h-8 w-8 text-blue-400 mx-auto mb-4" />
          <p className="text-white">Preparing video call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-semibold truncate">{roomName}</h1>
          <Badge variant="secondary" className="bg-green-600 text-white">
            <Users className="w-3 h-3 mr-1" />
            {participants.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-white text-sm font-mono">
            {formatDuration(callDuration)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setViewMode(viewMode === "grid" ? "speaker" : "grid")
            }
            className="text-white hover:bg-gray-700"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="text-white hover:bg-gray-700"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-4">
          <div
            className={cn(
              "grid gap-4 h-full",
              viewMode === "grid"
                ? participants.length <= 1
                  ? "grid-cols-1"
                  : participants.length <= 4
                    ? "grid-cols-2"
                    : "grid-cols-3"
                : "grid-cols-1",
            )}
          >
            {participants.map((participant) => (
              <Card
                key={participant.identity}
                className="relative overflow-hidden bg-gray-800"
              >
                <div className="aspect-video relative">
                  {/* Video Track */}
                  {tracks
                    .filter(
                      (track) =>
                        track.participant.identity === participant.identity &&
                        track.source === Track.Source.Camera,
                    )
                    .map((track) => (
                      <VideoTrack
                        key={track.publication?.trackSid || track.source}
                        trackRef={track}
                        className="w-full h-full object-cover"
                      />
                    ))}

                  {/* Audio Track (invisible) */}
                  {tracks
                    .filter(
                      (track) =>
                        track.participant.identity === participant.identity &&
                        track.source === Track.Source.Microphone,
                    )
                    .map((track) => (
                      <AudioTrack
                        key={track.publication?.trackSid || track.source}
                        trackRef={track}
                      />
                    ))}

                  {/* Participant Info Overlay */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                        {participant.name || participant.identity}
                        {participant.isLocal && " (You)"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {!participant.isMicrophoneEnabled && (
                        <MicOff className="w-4 h-4 text-red-400" />
                      )}
                      {!participant.isCameraEnabled && (
                        <VideoOff className="w-4 h-4 text-red-400" />
                      )}
                      {participant.isLocal && isHandRaised && (
                        <Hand className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>

                  {/* No Video Placeholder */}
                  {!participant.isCameraEnabled && (
                    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <VideoOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-300 text-sm">Camera off</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {/* Empty state for no participants */}
            {participants.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">Waiting for participants...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
            <div className="h-full flex flex-col">
              <h3 className="text-white font-semibold mb-4">Chat</h3>
              <div className="flex-1 bg-gray-700 rounded p-3 mb-4">
                <p className="text-gray-400 text-sm text-center">
                  Chat functionality coming soon
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm"
                  placeholder="Type a message..."
                  disabled
                />
                <Button size="sm" disabled>
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-800 flex items-center justify-center gap-4">
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full w-12 h-12 p-0"
        >
          {isAudioEnabled ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </Button>

        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12 p-0"
        >
          {isVideoEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </Button>

        <Button
          variant={isScreenShareEnabled ? "default" : "outline"}
          size="lg"
          onClick={toggleScreenShare}
          className="rounded-full w-12 h-12 p-0"
        >
          <Monitor className="w-5 h-5" />
        </Button>

        <Button
          variant={isHandRaised ? "default" : "outline"}
          size="lg"
          onClick={toggleHandRaise}
          className="rounded-full w-12 h-12 p-0"
        >
          <Hand className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          <MoreVertical className="w-5 h-5" />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={handleLeaveCall}
          disabled={isLeavingCall}
          className="rounded-full w-12 h-12 p-0"
        >
          {isLeavingCall ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <PhoneOff className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
