import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNav } from "@/components/MobileNav";
import { useLiveKit } from "@/contexts/LiveKitContext";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  Users,
  Clock,
  Plus,
  Copy,
  Phone,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseDataService } from "@/services";
import { Link } from "react-router-dom";

interface VideoCall {
  id: string;
  name: string;
  roomId: string;
  isActive: boolean;
  createdAt: string;
  endedAt?: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants: Array<{
    id: string;
    userId: string;
    joinedAt: string;
    leftAt?: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
}

export function Kynnect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show call-to-action if not authenticated
  if (!loading && !user) {
    return (
      <AuthCallToAction
        icon={<Video />}
        title="Face-to-Face Family Time, Anywhere"
        description="Connect with family members through high-quality video calls. Share moments, catch up, and stay close no matter the distance."
        features={[
          "HD video calls with multiple family members",
          "Screen sharing for photos and special moments",
          "Record family calls to preserve memories",
          "Schedule regular family video meetups",
          "Private and secure family-only video rooms",
          "Works on all devices - phones, tablets, computers",
        ]}
        accentColor="#2D548A"
        bgGradient="from-blue-50 to-cyan-50"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  const {
    isConnected,
    isConnecting,
    connectionError,
    createAndJoinRoom,
    joinRoom,
    room,
  } = useLiveKit();
  const { toast } = useToast();

  const [roomName, setRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [activeCalls, setActiveCalls] = useState<VideoCall[]>([]);
  const [recentCalls, setRecentCalls] = useState<VideoCall[]>([]);
  const [isLoadingCalls, setIsLoadingCalls] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [currentFamily, setCurrentFamily] = useState<any>(null);

  useEffect(() => {
    loadCallData();
  }, []);

  const loadCallData = async () => {
    try {
      setIsLoadingCalls(true);
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const familiesResult = await supabaseDataService.getUserFamilies(userId);
      if (
        !familiesResult.success ||
        !familiesResult.data ||
        familiesResult.data.length === 0
      )
        return;

      const primaryFamily = familiesResult.data[0];
      setCurrentFamily(primaryFamily);

      const [activeCallsResult, callHistoryResult] = await Promise.all([
        supabaseDataService.getActiveCalls(primaryFamily.id),
        supabaseDataService.getCallHistory(primaryFamily.id),
      ]);

      if (activeCallsResult.success && activeCallsResult.data) {
        setActiveCalls(activeCallsResult.data);
      }
      if (callHistoryResult.success && callHistoryResult.data) {
        setRecentCalls(callHistoryResult.data);
      }
    } catch (error) {
      console.error("Error loading call data:", error);
      toast({
        title: "Error",
        description: "Failed to load video calls. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCalls(false);
    }
  };

  const handleCreateRoom = async () => {
    if (isConnecting || isCreatingRoom) return;

    try {
      setIsCreatingRoom(true);
      const userId = localStorage.getItem("userId");
      if (!userId || !currentFamily) {
        toast({
          title: "Error",
          description: "Please log in to create video calls.",
          variant: "destructive",
        });
        return;
      }

      const finalRoomName =
        roomName.trim() || `Family Chat ${new Date().toLocaleTimeString()}`;
      const roomId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create call record in backend
      const callData = {
        familyId: currentFamily.id,
        organizerId: userId,
        name: finalRoomName,
        roomId: roomId,
        isActive: true,
      };

      const createdCallResult = await supabaseDataService.createCall(callData);

      if (createdCallResult.success && createdCallResult.data) {
        const createdCall = createdCallResult.data;
        // Join the room using LiveKit
        const userName =
          currentFamily.members?.find((m: any) => m.userId === userId)?.user
            ?.name || "User";
        await createAndJoinRoom(roomId, userName);

        // Join the call as a participant
        await supabaseDataService.joinCall(createdCall.id, { userId });

        toast({
          title: "Room Created!",
          description: `Created "${finalRoomName}" successfully.`,
        });

        navigate(`/kynnect/${roomId}`);
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    if (isConnecting || !joinRoomId.trim()) return;

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast({
          title: "Error",
          description: "Please log in to join video calls.",
          variant: "destructive",
        });
        return;
      }

      // Check if the call exists and join it
      try {
        const callDetailsResult =
          await supabaseDataService.getCallById(joinRoomId);
        if (
          callDetailsResult.success &&
          callDetailsResult.data &&
          callDetailsResult.data.isActive
        ) {
          const callDetails = callDetailsResult.data;
          // Join the call
          await supabaseDataService.joinCall(joinRoomId, { userId });

          // Navigate to the room
          navigate(`/kynnect/${joinRoomId}`);
        } else {
          toast({
            title: "Invalid Room",
            description: "This room doesn't exist or is not active.",
            variant: "destructive",
          });
        }
      } catch (error) {
        // Call might not exist in database, but room might still be active
        console.warn("Call not found in database, attempting direct room join");
      }

      const userName =
        currentFamily?.members?.find((m: any) => m.userId === userId)?.user
          ?.name || "User";
      await joinRoom(joinRoomId, userName);

      navigate(`/kynnect/${joinRoomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
      toast({
        title: "Error",
        description: "Failed to join room. Please check the room ID.",
        variant: "destructive",
      });
    }
  };

  const handleJoinActiveCall = async (call: VideoCall) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      // Join the call as a participant
      await supabaseDataService.joinCall(call.id, { userId });

      const userName =
        currentFamily?.members?.find((m: any) => m.userId === userId)?.user
          ?.name || "User";
      await joinRoom(call.roomId, userName);

      navigate(`/kynnect/${call.roomId}`);
    } catch (error) {
      console.error("Error joining call:", error);
      toast({
        title: "Error",
        description: "Failed to join call. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyRoomId = (roomId: string) => {
    navigator.clipboard.writeText(roomId);
    toast({
      title: "Copied!",
      description: "Room ID copied to clipboard.",
    });
  };

  const getCallDuration = (call: VideoCall) => {
    const start = new Date(call.createdAt);
    const end = call.endedAt ? new Date(call.endedAt) : new Date();
    const diffMinutes = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60),
    );
    return `${diffMinutes} min${diffMinutes !== 1 ? "s" : ""}`;
  };

  const getActiveParticipants = (call: VideoCall) => {
    return call.participants.filter((p) => !p.leftAt);
  };

  if (!currentFamily) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-dark-blue mb-2">
              No Family Found
            </h1>
            <p className="text-muted-foreground mb-6">
              Please create or join a family first.
            </p>
            <Button asChild>
              <Link to="/create-family">Create Family</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20">
      <MobileNav />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 pt-20 sm:pt-6">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-dark-blue mb-2">Kynnect</h1>
          <p className="text-muted-foreground">
            Stay connected with video calls and face-to-face conversations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Create/Join Room Section */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Start New Call
                </h2>

                <div className="space-y-4">
                  <Input
                    placeholder="Enter room name (optional)"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />

                  <Button
                    onClick={handleCreateRoom}
                    className="w-full"
                    size="lg"
                    disabled={isConnecting || isCreatingRoom}
                  >
                    {isCreatingRoom ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2" />
                        Create Room
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Join Existing Call
                </h2>

                <div className="space-y-4">
                  <Input
                    placeholder="Enter room ID"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                  />

                  <Button
                    onClick={handleJoinRoom}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={isConnecting || !joinRoomId.trim()}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-2" />
                        Join Room
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Calls & Recent Section */}
          <div className="space-y-4">
            {/* Active Calls */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Active Calls
                </h2>

                {isLoadingCalls ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : activeCalls.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="h-8 w-8 mx-auto mb-2" />
                    <p>No active calls</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeCalls.map((call) => {
                      const activeParticipants = getActiveParticipants(call);
                      return (
                        <div
                          key={call.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium">{call.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default" className="bg-green-600">
                                Live
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {activeParticipants.length} participant
                                {activeParticipants.length !== 1 ? "s" : ""}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 mt-2">
                              {activeParticipants
                                .slice(0, 3)
                                .map((participant) => (
                                  <Avatar
                                    key={participant.id}
                                    className="h-6 w-6"
                                  >
                                    <AvatarImage
                                      src={participant.user.avatar}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {participant.user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              {activeParticipants.length > 3 && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  +{activeParticipants.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => copyRoomId(call.roomId)}
                              variant="outline"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleJoinActiveCall(call)}
                            >
                              Join
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Calls */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Calls
                </h2>

                {isLoadingCalls ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : recentCalls.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>No recent calls</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCalls.map((call) => (
                      <div
                        key={call.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{call.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">Ended</Badge>
                            <span className="text-sm text-muted-foreground">
                              {getCallDuration(call)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(call.createdAt).toLocaleDateString()} at{" "}
                            {new Date(call.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {call.participants.slice(0, 3).map((participant) => (
                            <Avatar key={participant.id} className="h-6 w-6">
                              <AvatarImage src={participant.user.avatar} />
                              <AvatarFallback className="text-xs">
                                {participant.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {call.participants.length > 3 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              +{call.participants.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
