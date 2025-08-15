import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AccessToken } from "livekit-server-sdk";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomName, participantName, metadata } = req.body || {};
    
    if (!roomName || !participantName) {
      return res
        .status(400)
        .json({ error: "Missing roomName or participantName" });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitHost = process.env.LIVEKIT_HOST;
    
    if (!apiKey || !apiSecret || !livekitHost) {
      return res.status(500).json({ error: "LiveKit server not configured" });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      metadata,
    });
    
    at.addGrant({ roomJoin: true, room: roomName });
    at.addGrant({ canPublish: true, canSubscribe: true });

    const token = at.toJwt();
    res.json({ token, host: livekitHost });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to issue token" });
  }
}
