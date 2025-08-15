import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Room, Participant, ConnectionState, RoomEvent } from "livekit-client";
// Placeholder utilities until live integration is enabled
import { generateRoomId } from "../services/livekit";

interface LiveKitContextType {
  // Room state
  room: Room | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Participants
  localParticipant: Participant | null;
  remoteParticipants: Participant[];

  // Room management
  createAndJoinRoom: (
    roomName?: string,
    participantName?: string,
  ) => Promise<string>;
  joinRoom: (roomName: string, participantName?: string) => Promise<void>;
  leaveRoom: () => void;

  // Media controls
  toggleVideo: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;

  // State
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenShareEnabled: boolean;
}

const LiveKitContext = createContext<LiveKitContextType | null>(null);

export function useLiveKit() {
  const context = useContext(LiveKitContext);
  if (!context) {
    throw new Error("useLiveKit must be used within a LiveKitProvider");
  }
  return context;
}

interface LiveKitProviderProps {
  children: ReactNode;
}

export function LiveKitProvider({ children }: LiveKitProviderProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(
    null,
  );
  const [remoteParticipants, setRemoteParticipants] = useState<Participant[]>(
    [],
  );
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);

  // Default participant name (in a real app, this would come from user auth)
  const getParticipantName = () => {
    return localStorage.getItem("kyn-user-name") || "Family Member";
  };

  useEffect(() => {
    if (!room) return;

    const handleConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
    };

    const handleConnecting = () => {
      setIsConnected(false);
      setIsConnecting(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
      setLocalParticipant(null);
      setRemoteParticipants([]);
    };

    const handleParticipantConnected = (participant: Participant) => {
      setRemoteParticipants((prev) => [...prev, participant]);
    };

    const handleParticipantDisconnected = (participant: Participant) => {
      setRemoteParticipants((prev) =>
        prev.filter((p) => p.sid !== participant.sid),
      );
    };

    const handleLocalTrackPublished = () => {
      // Update local track states
      setLocalParticipant(room.localParticipant);
    };

    const handleLocalTrackUnpublished = () => {
      // Update local track states
      setLocalParticipant(room.localParticipant);
    };

    // Set up event listeners
    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Reconnecting, handleConnecting);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
    room.on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished);

    // Set initial state
    setLocalParticipant(room.localParticipant);
    setRemoteParticipants(Array.from(room.remoteParticipants.values()));

    return () => {
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Reconnecting, handleConnecting);
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(
        RoomEvent.ParticipantDisconnected,
        handleParticipantDisconnected,
      );
      room.off(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
      room.off(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished);
    };
  }, [room]);

  const createAndJoinRoom = async (
    customRoomName?: string,
    participantName?: string,
  ): Promise<string> => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const roomName = customRoomName || `family-chat-${generateRoomId()}`;
      const participant = participantName || getParticipantName();

      // For demo purposes - simulate connection
      console.log(
        "Demo mode: Creating room",
        roomName,
        "for participant",
        participant,
      );

      // In a real implementation, you would connect to LiveKit here
      // const newRoom = await connectToRoom(roomName, participant);
      // setRoom(newRoom);

      // For now, we'll simulate a successful connection
      setIsConnecting(false);
      setIsConnected(true);

      return roomName;
    } catch (error) {
      setConnectionError(
        error instanceof Error ? error.message : "Failed to create room",
      );
      setIsConnecting(false);
      throw error;
    }
  };

  const joinRoom = async (
    roomName: string,
    participantName?: string,
  ): Promise<void> => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const participant = participantName || getParticipantName();

      // For demo purposes - simulate joining
      console.log(
        "Demo mode: Joining room",
        roomName,
        "as participant",
        participant,
      );

      // In a real implementation, you would connect to LiveKit here
      // const newRoom = await connectToRoom(roomName, participant);
      // setRoom(newRoom);

      // For now, we'll simulate a successful connection
      setIsConnecting(false);
      setIsConnected(true);
    } catch (error) {
      setConnectionError(
        error instanceof Error ? error.message : "Failed to join room",
      );
      setIsConnecting(false);
      throw error;
    }
  };

  const leaveRoom = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
    }
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
    setLocalParticipant(null);
    setRemoteParticipants([]);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setIsScreenShareEnabled(false);
  };

  const toggleVideo = async (): Promise<void> => {
    if (!room) return;

    try {
      const enabled = room.localParticipant.isCameraEnabled;
      await room.localParticipant.setCameraEnabled(!enabled);
      setIsVideoEnabled(!enabled);
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

  const toggleAudio = async (): Promise<void> => {
    if (!room) return;

    try {
      const enabled = room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(!enabled);
      setIsAudioEnabled(!enabled);
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  const toggleScreenShare = async (): Promise<void> => {
    if (!room) return;

    try {
      const enabled = room.localParticipant.isScreenShareEnabled;
      await room.localParticipant.setScreenShareEnabled(!enabled);
      setIsScreenShareEnabled(!enabled);
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  const value: LiveKitContextType = {
    room,
    isConnected,
    isConnecting,
    connectionError,
    localParticipant,
    remoteParticipants,
    createAndJoinRoom,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    isVideoEnabled,
    isAudioEnabled,
    isScreenShareEnabled,
  };

  return (
    <LiveKitContext.Provider value={value}>{children}</LiveKitContext.Provider>
  );
}
