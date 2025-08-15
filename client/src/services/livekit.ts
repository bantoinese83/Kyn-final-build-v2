import { Room, RoomOptions } from "livekit-client";
import { logServiceError } from "../lib/logger";

// LiveKit configuration
export const LIVEKIT_URL =
  import.meta.env.VITE_LIVEKIT_URL || "wss://kyn-family.livekit.cloud";

// Generate access token for joining a room (simplified for client-side demo)
export async function requestAccessToken(
  roomName: string,
  participantName: string,
  metadata?: string,
): Promise<string> {
  const res = await fetch("/api/livekit/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomName, participantName, metadata }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get LiveKit token: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.token as string;
}

// Mock functions for demo purposes
// In a real application, these would be API calls to your backend

export async function createRoom(
  roomName: string,
  options?: {
    maxParticipants?: number;
    emptyTimeout?: number;
    metadata?: string;
  },
) {
  // In production, this would be an API call to your backend
  console.log("Creating room:", roomName, options);
  return { name: roomName, ...options };
}

export async function listRooms() {
  // In production, this would be an API call to your backend
  console.log("Listing rooms - this should be implemented on your backend");
  return [];
}

export async function deleteRoom(roomName: string) {
  // In production, this would be an API call to your backend
  console.log("Deleting room:", roomName);
}

export async function getRoomInfo(roomName: string) {
  // In production, this would be an API call to your backend
  console.log("Getting room info:", roomName);
  return null;
}

// Connection options for LiveKit client
export const defaultRoomOptions: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: {
    resolution: {
      width: 1280,
      height: 720,
    },
  },
};

// Helper to connect to a room
export async function connectToRoom(
  roomName: string,
  participantName: string,
  token?: string,
): Promise<Room> {
  const room = new Room(defaultRoomOptions);

  // Always prefer server-issued token
  const accessToken =
    token || (await requestAccessToken(roomName, participantName));

  try {
    // For demo - you'll need to replace this with your actual LiveKit server URL and proper token
    await room.connect(LIVEKIT_URL, accessToken);
    return room;
  } catch (error) {
    logServiceError("LiveKitService", "connectToRoom", error as Error, {
      roomName,
      participantName,
    });
    throw error;
  }
}

// Mock function for generating unique room IDs
export function generateRoomId(): string {
  return `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to format participant metadata
export interface ParticipantMetadata {
  avatar?: string;
  role?: string;
  familyMember?: boolean;
}

export function createParticipantMetadata(data: ParticipantMetadata): string {
  return JSON.stringify(data);
}

export function parseParticipantMetadata(
  metadata?: string,
): ParticipantMetadata {
  if (!metadata) return {};
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
}
