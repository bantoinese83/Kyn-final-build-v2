import express from "express";
import cors from "cors";
import { AccessToken } from "livekit-server-sdk";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

app.post("/api/livekit/token", (req, res) => {
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
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
