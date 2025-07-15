import express from "express";
import { verifyToken } from "../middleware/authMiddleware";

import Ably from "ably";
import messagingService from "../controllers/Chat.Controller";
const Message_Router = express.Router();

 const ably = new Ably.Realtime({
   key: process.env.ABLY_API_KEY!,
   clientId: 'messaging-server'
 });

// Ably token endpoint
Message_Router.post(
  "/auth/ably-token",
  verifyToken,
  async (req: any, res: any) => {
    try {
      const { userId, name } = req.user;

      const tokenRequest = await ably.auth.createTokenRequest({
        clientId: userId,
        capability: {
          [`personal:${userId}`]: ["publish", "subscribe", "presence"],
          [`presence:global`]: ["subscribe", "presence"],
          [`broadcast:*`]: ["subscribe"],
          [`group:*`]: ["publish", "subscribe", "presence"],
          [`typing:*`]: ["publish", "subscribe"],
        },
      });

      res.json(tokenRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate Ably token" });
    }
  }
);

// Enhanced message endpoints
Message_Router.post("/messages/personal", async (req: any, res: any) => {
  try {
    const { receiverId, content, imageUrl, tempId, senderId } = req.body;
    // const senderId = req.user.userId || req.body.senderId;

    const message = await messagingService.sendPersonalMessage(
      senderId,
      receiverId,
      content,
      imageUrl,
      tempId
    );

    res.json({ success: true, message });
  } catch (error) {
    console.error("Personal message error:", error);
    res.status(500).json({ error: "Failed to send personal message" });
  }
});

Message_Router.post(
  "/messages/group",
  verifyToken,
  async (req: any, res: any) => {
    try {
      const { groupId, content, imageUrl, tempId } = req.body;
      const senderId = req.user.userId;

      const message = await messagingService.sendGroupMessage(
        senderId,
        groupId,
        content,
        imageUrl,
        tempId
      );

      res.json({ success: true, message });
    } catch (error) {
      res.status(500).json({ error: "Failed to send group message" });
    }
  }
);

Message_Router.post(
  "/messages/broadcast",
  verifyToken,
  async (req: any, res: any) => {
    try {
      const { content, imageUrl } = req.body;
      const senderId = req.user.userId;

      const message = await messagingService.sendBroadcastMessage(
        senderId,
        content,
        imageUrl
      );

      res.json({ success: true, message });
    } catch (error) {
      res.status(500).json({ error: "Failed to send broadcast message" });
    }
  }
);

// Typing indicator endpoint
Message_Router.post(
  "/messages/typing",
  verifyToken,
  async (req: any, res: any) => {
    try {
      const { receiverId, groupId, isTyping } = req.body;
      const senderId = req.user.userId;

      await messagingService.sendTypingIndicator(
        senderId,
        receiverId,
        groupId,
        isTyping
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send typing indicator" });
    }
  }
);

// Message search endpoint
Message_Router.get(
  "/messages/search",
  verifyToken,
  async (req: any, res: any) => {
    try {
      const { q, type = "all", limit = 50 } = req.query;
      const userId = req.user.userId;

      const messages = await messagingService.searchMessages(
        userId,
        q,
        type,
        parseInt(limit)
      );

      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to search messages" });
    }
  }
);

// Message analytics endpoint
Message_Router.get(
  "/messages/analytics",
  verifyToken,
  async (req: any, res: any) => {
    try {
      const { days = 30 } = req.query;
      const userId = req.user.userId;

      const analytics = await messagingService.getMessageAnalytics(
        userId,
        parseInt(days)
      );

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to get message analytics" });
    }
  }
);

// Mark message as read
Message_Router.put(
  "/messages/:messageId/read",
  verifyToken,
  async (req: any, res: any) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.userId;

      const message = await messagingService.markMessageAsRead(
        messageId,
        userId
      );
      res.json({ success: true, message });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  }
);

export default Message_Router;
