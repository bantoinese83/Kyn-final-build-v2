import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabaseDataService } from "@/services";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Phone,
  Video,
  UserPlus,
  Search,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderInitials?: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export function Chat() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [participant, setParticipant] = useState<ChatParticipant | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user && memberId) {
      loadChatData();
      setupRealTimeSubscriptions();
    }

    return () => {
      // Cleanup subscriptions
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, memberId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    if (!user || !memberId) return;

    try {
      setIsLoading(true);

      // Get participant info
      const participantDataResult =
        await supabaseDataService.getUserById(memberId);
      if (participantDataResult.success && participantDataResult.data) {
        const participantData = participantDataResult.data;
        setParticipant({
          id: participantData.id,
          name: participantData.name,
          avatar: participantData.avatar,
          initials: participantData.initials,
          isOnline: participantData.isOnline,
        });
      }

      // Get chat messages
      const chatMessagesResult = await supabaseDataService.getChatMessages(
        user.id,
        memberId,
      );
      if (chatMessagesResult.success && chatMessagesResult.data) {
        setMessages(chatMessagesResult.data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading chat data:", error);
      toast({
        title: "Error",
        description: "Failed to load chat messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    if (!user || !memberId) return;

    // Subscribe to new messages
    const messagesSubscription = supabaseDataService.subscribeToChatMessages(
      user.id,
      memberId,
      (payload) => {
        if (payload.eventType === "INSERT") {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      },
    );

    // Subscribe to typing indicators
    const typingSubscription = supabaseDataService.subscribeToTypingIndicators(
      memberId,
      (payload) => {
        if (payload.eventType === "INSERT") {
          const typingData = payload.new;
          if (typingData.userId !== user.id) {
            setTypingUsers((prev) => new Set(prev).add(typingData.userId));

            // Clear typing indicator after 3 seconds
            setTimeout(() => {
              setTypingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(typingData.userId);
                return newSet;
              });
            }, 3000);
          }
        }
      },
    );

    return () => {
      messagesSubscription?.unsubscribe();
      typingSubscription?.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!user || !memberId || !newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        senderId: user.id,
        receiverId: memberId,
        timestamp: new Date().toISOString(),
      };

      const sentMessageResult =
        await supabaseDataService.sendChatMessage(messageData);

      if (sentMessageResult.success && sentMessageResult.data) {
        const sentMessage = sentMessageResult.data;
        setNewMessage("");

        // Add message to local state
        const chatMessage: ChatMessage = {
          id: sentMessage.id,
          content: sentMessage.content,
          senderId: user.id,
          senderName: user.user_metadata?.name || user.email || "You",
          senderAvatar: user.user_metadata?.avatar,
          senderInitials: user.user_metadata?.initials,
          timestamp: sentMessage.timestamp,
          isRead: false,
        };

        setMessages((prev) => [...prev, chatMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTyping = () => {
    if (!user || !memberId) return;

    // Send typing indicator
    supabaseDataService.sendTypingIndicator({
      userId: user.id,
      receiverId: memberId,
      isTyping: true,
      timestamp: new Date().toISOString(),
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString();
    }
  };

  const startVideoCall = () => {
    if (participant) {
      navigate(`/kynnect/room/${Date.now()}`, {
        state: {
          participants: [user?.id, participant.id],
          isGroupCall: false,
        },
      });
    }
  };

  const startVoiceCall = () => {
    if (participant) {
      toast({
        title: "Voice Call",
        description: "Voice calling feature coming soon!",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-blue mb-4">
            Please log in to chat
          </h1>
          <Button onClick={() => navigate("/welcome")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-blue mb-4">
            Participant not found
          </h1>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Chat Header */}
        <Card className="rounded-none border-b border-gray-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="p-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>

                <Avatar className="w-10 h-10">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    {participant.initials || participant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <CardTitle className="text-lg font-semibold text-dark-blue">
                    {participant.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={participant.isOnline ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        participant.isOnline
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {participant.isOnline ? "Online" : "Offline"}
                    </Badge>
                    {typingUsers.has(participant.id) && (
                      <span className="text-sm text-muted-foreground italic">
                        typing...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startVoiceCall}
                  className="p-2 text-blue-600 hover:text-blue-700"
                >
                  <Phone className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startVideoCall}
                  className="p-2 text-purple-600 hover:text-purple-700"
                >
                  <Video className="w-4 h-4" />
                </Button>

                <Button variant="ghost" size="sm" className="p-2">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-dark-blue mb-2">
                  No messages yet
                </h3>
                <p className="text-muted-foreground">
                  Start the conversation with {participant.name}!
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.senderId === user.id
                    ? "justify-end"
                    : "justify-start",
                )}
              >
                {message.senderId !== user.id && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                      {message.senderInitials || message.senderName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                    message.senderId === user.id
                      ? "bg-accent text-accent-foreground ml-auto"
                      : "bg-white border border-gray-200",
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      message.senderId === user.id
                        ? "text-accent-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>

                {message.senderId === user.id && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                      {message.senderInitials || message.senderName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <Card className="rounded-none border-t border-gray-200 bg-white">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  } else {
                    handleTyping();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1"
                disabled={isLoading}
              />

              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="bg-accent hover:bg-accent/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
