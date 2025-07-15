//   // img upload
//   // viedo upload
//   // pdf upload
  









//   /////////////////////////////////////////////////////
//   // =======================================================
// // SERVER-SIDE IMPLEMENTATION (server.ts)
// // =======================================================

// import express from 'express';
// import Ably from 'ably';
// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import rateLimit from 'express-rate-limit';
// import { createHash } from 'crypto';

// const prisma = new PrismaClient();
// const app = express();

// // Ably Configuration
// const ably = new Ably.Realtime({
//   key: process.env.ABLY_API_KEY!,
//   clientId: 'messaging-server'
// });

// // Rate limiting
// const messageRateLimit = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 100, // 100 messages per minute
//   message: 'Too many messages sent'
// });

// app.use(express.json());
// app.use('/messages', messageRateLimit);

// // Authentication middleware
// const authenticateToken = (req: any, res: any, next: any) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ error: 'Access token required' });
//   }

//   jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
//     if (err) return res.status(403).json({ error: 'Invalid token' });
//     req.user = decoded;
//     next();
//   });
// };

// // =======================================================
// // ENHANCED MESSAGING SERVICE WITH HYBRID FEATURES
// // =======================================================

// class HybridMessagingService {
//   private ably: Ably.Realtime;
//   private prisma: PrismaClient;
//   private messageCache: Map<string, any> = new Map();
//   private onlineUsers: Set<string> = new Set();

//   constructor(ablyClient: Ably.Realtime, prismaClient: PrismaClient) {
//     this.ably = ablyClient;
//     this.prisma = prismaClient;
//     this.initializePresenceTracking();
//   }

//   // Initialize presence tracking
//   private initializePresenceTracking() {
//     const presenceChannel = this.ably.channels.get('presence:global');
    
//     presenceChannel.presence.subscribe('enter', (member) => {
//       this.onlineUsers.add(member.clientId);
//       console.log(`User ${member.clientId} came online`);
//     });

//     presenceChannel.presence.subscribe('leave', (member) => {
//       this.onlineUsers.delete(member.clientId);
//       console.log(`User ${member.clientId} went offline`);
//     });
//   }

//   // Enhanced Personal Message with optimistic updates
//   async sendPersonalMessage(senderId: string, receiverId: string, content: string, imageUrl?: string, tempId?: string) {
//     try {
//       // 1. IMMEDIATE: Send optimistic update to sender
//       const optimisticMessage = {
//         id: tempId || `temp-${Date.now()}`,
//         content,
//         senderId,
//         receiverId,
//         imageUrl,
//         timestamp: new Date(),
//         messageType: 'personal' as const,
//         status: 'sending',
//         isOptimistic: true
//       };

//       // Send optimistic update to sender immediately
//       const senderChannel = this.ably.channels.get(`personal:${senderId}`);
//       await senderChannel.publish('optimistic-message', optimisticMessage);

//       // 2. PERSISTENCE: Save to database
//       const message = await this.prisma.message.create({
//         data: {
//           content,
//           senderId,
//           receiverId,
//           imageUrl,
//           status: 'UNDELIVERED'
//         },
//         include: {
//           sender: {
//             select: {
//               id: true,
//               name: true,
//               profile: { select: { profileImageUrl: true } }
//             }
//           },
//           receiver: {
//             select: {
//               id: true,
//               name: true,
//               profile: { select: { profileImageUrl: true } }
//             }
//           }
//         }
//       });

//       // 3. REAL-TIME: Send to receiver if online
//       const messagePayload = {
//         id: message.id,
//         content: message.content,
//         senderId: message.senderId,
//         receiverId: message.receiverId!,
//         imageUrl: message.imageUrl,
//         timestamp: message.createdAt,
//         messageType: 'personal' as const,
//         senderName: message.sender.name,
//         senderProfile: message.sender.profile?.profileImageUrl,
//         status: 'delivered'
//       };

//       // Send to receiver's channel
//       const receiverChannel = this.ably.channels.get(`personal:${receiverId}`);
//       await receiverChannel.publish('new-message', messagePayload);

//       // 4. CONFIRMATION: Update sender with real message ID
//       await senderChannel.publish('message-confirmed', {
//         tempId: tempId,
//         realId: message.id,
//         status: 'sent',
//         timestamp: message.createdAt
//       });

//       // 5. PUSH NOTIFICATION: If receiver is offline
//       if (!this.onlineUsers.has(receiverId)) {
//         await this.sendPushNotification(receiverId, `New message from ${message.sender.name}`, content);
//       }

//       // 6. UPDATE MESSAGE STATUS
//       await this.prisma.message.update({
//         where: { id: message.id },
//         data: { status: 'DELIVERED' }
//       });

//       return message;
//     } catch (error) {
//       console.error('Error sending personal message:', error);
      
//       // Send error to sender
//       const senderChannel = this.ably.channels.get(`personal:${senderId}`);
//       await senderChannel.publish('message-error', {
//         tempId: tempId,
//         error: 'Failed to send message'
//       });
      
//       throw error;
//     }
//   }

//   // Enhanced Group Message with member presence
//   async sendGroupMessage(senderId: string, groupId: string, content: string, imageUrl?: string, tempId?: string) {
//     try {
//       // 1. AUTHORIZATION: Check group membership
//       const group = await this.prisma.group.findFirst({
//         where: {
//           id: groupId,
//           members: { some: { id: senderId } }
//         },
//         include: {
//           members: {
//             select: {
//               id: true,
//               name: true,
//               profile: { select: { profileImageUrl: true } }
//             }
//           }
//         }
//       });

//       if (!group) {
//         throw new Error('User not authorized to send to this group');
//       }

//       // 2. OPTIMISTIC: Send to sender immediately
//       const optimisticMessage = {
//         id: tempId || `temp-${Date.now()}`,
//         content,
//         senderId,
//         groupId,
//         imageUrl,
//         timestamp: new Date(),
//         messageType: 'group' as const,
//         status: 'sending',
//         isOptimistic: true
//       };

//       const senderChannel = this.ably.channels.get(`personal:${senderId}`);
//       await senderChannel.publish('optimistic-message', optimisticMessage);

//       // 3. PERSISTENCE: Save to database
//       const message = await this.prisma.message.create({
//         data: {
//           content,
//           senderId,
//           groupId,
//           imageUrl,
//           status: 'DELIVERED'
//         },
//         include: {
//           sender: {
//             select: {
//               id: true,
//               name: true,
//               profile: { select: { profileImageUrl: true } }
//             }
//           }
//         }
//       });

//       // 4. REAL-TIME: Send to all group members
//       const messagePayload = {
//         id: message.id,
//         content: message.content,
//         senderId: message.senderId,
//         groupId: message.groupId!,
//         imageUrl: message.imageUrl,
//         timestamp: message.createdAt,
//         messageType: 'group' as const,
//         senderName: message.sender.name,
//         senderProfile: message.sender.profile?.profileImageUrl,
//         groupName: group.name,
//         memberCount: group.members.length
//       };

//       // Send to group channel
//       const groupChannel = this.ably.channels.get(`group:${groupId}`);
//       await groupChannel.publish('new-message', messagePayload);

//       // 5. PUSH NOTIFICATIONS: To offline members
//       const offlineMembers = group.members.filter(member => 
//         member.id !== senderId && !this.onlineUsers.has(member.id)
//       );

//       for (const member of offlineMembers) {
//         await this.sendPushNotification(
//           member.id,
//           `${group.name}: ${message.sender.name}`,
//           content
//         );
//       }

//       // 6. CONFIRMATION: Update sender
//       await senderChannel.publish('message-confirmed', {
//         tempId: tempId,
//         realId: message.id,
//         status: 'sent',
//         timestamp: message.createdAt
//       });

//       return message;
//     } catch (error) {
//       console.error('Error sending group message:', error);
      
//       const senderChannel = this.ably.channels.get(`personal:${senderId}`);
//       await senderChannel.publish('message-error', {
//         tempId: tempId,
//         error: 'Failed to send group message'
//       });
      
//       throw error;
//     }
//   }

//   // Enhanced Broadcast with analytics
//   async sendBroadcastMessage(senderId: string, content: string, imageUrl?: string) {
//     try {
//       // 1. AUTHORIZATION: Check admin role
//       const user = await this.prisma.user.findUnique({
//         where: { id: senderId },
//         select: { role: true, name: true }
//       });

//       if (!user || user.role !== 'ADMIN') {
//         throw new Error('Only admins can send broadcast messages');
//       }

//       // 2. PERSISTENCE: Save message
//       const message = await this.prisma.message.create({
//         data: {
//           content,
//           senderId,
//           imageUrl,
//           status: 'DELIVERED'
//         },
//         include: {
//           sender: {
//             select: {
//               id: true,
//               name: true,
//               profile: { select: { profileImageUrl: true } }
//             }
//           }
//         }
//       });

//       // 3. REAL-TIME: Send to all users
//       const messagePayload = {
//         id: message.id,
//         content: message.content,
//         senderId: message.senderId,
//         imageUrl: message.imageUrl,
//         timestamp: message.createdAt,
//         messageType: 'broadcast' as const,
//         senderName: message.sender.name,
//         senderProfile: message.sender.profile?.profileImageUrl,
//         priority: 'high'
//       };

//       const broadcastChannel = this.ably.channels.get('broadcast:all');
//       await broadcastChannel.publish('new-message', messagePayload);

//       // 4. PUSH NOTIFICATIONS: To all offline users
//       const allUsers = await this.prisma.user.findMany({
//         where: { id: { not: senderId } },
//         select: { id: true }
//       });

//       const offlineUsers = allUsers.filter(user => !this.onlineUsers.has(user.id));
      
//       for (const user of offlineUsers) {
//         await this.sendPushNotification(
//           user.id,
//           `📢 Broadcast from ${message.sender.name}`,
//           content
//         );
//       }

//       return message;
//     } catch (error) {
//       console.error('Error sending broadcast message:', error);
//       throw error;
//     }
//   }

//   // Smart message status updates with read receipts
//   async updateMessageStatus(messageId: string, status: 'DELIVERED' | 'UNDELIVERED', userId: string) {
//     try {
//       const message = await this.prisma.message.update({
//         where: { id: messageId },
//         data: { status },
//         include: { sender: true, receiver: true }
//       });

//       // Notify sender about status change
//       if (message.senderId !== userId) {
//         const senderChannel = this.ably.channels.get(`personal:${message.senderId}`);
//         await senderChannel.publish('message-status', {
//           messageId,
//           status,
//           timestamp: new Date(),
//           updatedBy: userId
//         });
//       }

//       return message;
//     } catch (error) {
//       console.error('Error updating message status:', error);
//       throw error;
//     }
//   }

//   // Enhanced read receipts with typing indicators
//   async markMessageAsRead(messageId: string, userId: string) {
//     try {
//       const message = await this.prisma.message.update({
//         where: {
//           id: messageId,
//           OR: [
//             { receiverId: userId },
//             { groupId: { not: null } }
//           ]
//         },
//         data: { isRead: true },
//         include: { sender: true, group: true }
//       });

//       // Send read receipt to sender
//       const senderChannel = this.ably.channels.get(`personal:${message.senderId}`);
//       await senderChannel.publish('message-read', {
//         messageId,
//         readBy: userId,
//         timestamp: new Date(),
//         isGroup: !!message.groupId
//       });

//       return message;
//     } catch (error) {
//       console.error('Error marking message as read:', error);
//       throw error;
//     }
//   }

//   // Typing indicator system
//   async sendTypingIndicator(senderId: string, receiverId?: string, groupId?: string, isTyping: boolean = true) {
//     try {
//       const typingData = {
//         senderId,
//         isTyping,
//         timestamp: new Date()
//       };

//       if (receiverId) {
//         // Personal chat typing
//         const channel = this.ably.channels.get(`personal:${receiverId}`);
//         await channel.publish('typing-indicator', typingData);
//       } else if (groupId) {
//         // Group chat typing
//         const channel = this.ably.channels.get(`group:${groupId}`);
//         await channel.publish('typing-indicator', typingData);
//       }
//     } catch (error) {
//       console.error('Error sending typing indicator:', error);
//     }
//   }

//   // Message search with caching
//   async searchMessages(userId: string, query: string, type: 'personal' | 'group' | 'all' = 'all', limit: number = 50) {
//     try {
//       const cacheKey = `search:${userId}:${createHash('md5').update(query).digest('hex')}`;
      
//       // Check cache first
//       if (this.messageCache.has(cacheKey)) {
//         return this.messageCache.get(cacheKey);
//       }

//       const whereCondition: any = {
//         content: {
//           contains: query,
//           mode: 'insensitive'
//         }
//       };

//       if (type === 'personal') {
//         whereCondition.OR = [
//           { senderId: userId },
//           { receiverId: userId }
//         ];
//       } else if (type === 'group') {
//         whereCondition.groupId = { not: null };
//         whereCondition.group = {
//           members: { some: { id: userId } }
//         };
//       } else {
//         whereCondition.OR = [
//           { senderId: userId },
//           { receiverId: userId },
//           {
//             groupId: { not: null },
//             group: { members: { some: { id: userId } } }
//           }
//         ];
//       }

//       const messages = await this.prisma.message.findMany({
//         where: whereCondition,
//         include: {
//           sender: {
//             select: {
//               id: true,
//               name: true,
//               profile: { select: { profileImageUrl: true } }
//             }
//           },
//           receiver: {
//             select: {
//               id: true,
//               name: true,
//               profile: { select: { profileImageUrl: true } }
//             }
//           },
//           group: {
//             select: {
//               id: true,
//               name: true
//             }
//           }
//         },
//         orderBy: { createdAt: 'desc' },
//         take: limit
//       });

//       // Cache results for 5 minutes
//       this.messageCache.set(cacheKey, messages);
//       setTimeout(() => this.messageCache.delete(cacheKey), 5 * 60 * 1000);

//       return messages;
//     } catch (error) {
//       console.error('Error searching messages:', error);
//       throw error;
//     }
//   }

//   // Push notification helper
//   private async sendPushNotification(userId: string, title: string, body: string) {
//     try {
//       // Add your push notification service here (FCM, APNS, etc.)
//       console.log(`📱 Push notification to ${userId}: ${title} - ${body}`);
      
//       // Create notification record
//       await this.prisma.notification.create({
//         data: {
//           userId,
//           type: 'message',
//           message: `${title}: ${body}`,
//           read: false
//         }
//       });
//     } catch (error) {
//       console.error('Error sending push notification:', error);
//     }
//   }

//   // Message analytics
//   async getMessageAnalytics(userId: string, days: number = 30) {
//     try {
//       const startDate = new Date();
//       startDate.setDate(startDate.getDate() - days);

//       const analytics = await this.prisma.message.groupBy({
//         by: ['createdAt'],
//         where: {
//           senderId: userId,
//           createdAt: { gte: startDate }
//         },
//         _count: { id: true }
//       });

//       return analytics;
//     } catch (error) {
//       console.error('Error getting message analytics:', error);
//       throw error;
//     }
//   }
// }

// // =======================================================
// // SERVER ENDPOINTS
// // =======================================================

// const messagingService = new HybridMessagingService(ably, prisma);

// // Ably token endpoint
// app.post('/auth/ably-token', authenticateToken, async (req: any, res: any) => {
//   try {
//     const { userId, name } = req.user;
    
//     const tokenRequest = await ably.auth.createTokenRequest({
//       clientId: userId,
//       capability: {
//         [`personal:${userId}`]: ['publish', 'subscribe', 'presence'],
//         [`presence:global`]: ['subscribe', 'presence'],
//         [`broadcast:*`]: ['subscribe'],
//         [`group:*`]: ['publish', 'subscribe', 'presence'],
//         [`typing:*`]: ['publish', 'subscribe']
//       }
//     });

//     res.json(tokenRequest);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to generate Ably token' });
//   }
// });

// // Enhanced message endpoints
// app.post('/messages/personal', authenticateToken, async (req: any, res: any) => {
//   try {
//     const { receiverId, content, imageUrl, tempId } = req.body;
//     const senderId = req.user.userId;

//     const message = await messagingService.sendPersonalMessage(
//       senderId, receiverId, content, imageUrl, tempId
//     );

//     res.json({ success: true, message });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to send personal message' });
//   }
// });

// app.post('/messages/group', authenticateToken, async (req: any, res: any) => {
//   try {
//     const { groupId, content, imageUrl, tempId } = req.body;
//     const senderId = req.user.userId;

//     const message = await messagingService.sendGroupMessage(
//       senderId, groupId, content, imageUrl, tempId
//     );

//     res.json({ success: true, message });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to send group message' });
//   }
// });

// app.post('/messages/broadcast', authenticateToken, async (req: any, res: any) => {
//   try {
//     const { content, imageUrl } = req.body;
//     const senderId = req.user.userId;

//     const message = await messagingService.sendBroadcastMessage(
//       senderId, content, imageUrl
//     );

//     res.json({ success: true, message });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to send broadcast message' });
//   }
// });

// // Typing indicator endpoint
// app.post('/messages/typing', authenticateToken, async (req: any, res: any) => {
//   try {
//     const { receiverId, groupId, isTyping } = req.body;
//     const senderId = req.user.userId;

//     await messagingService.sendTypingIndicator(senderId, receiverId, groupId, isTyping);
//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to send typing indicator' });
//   }
// });

// // Message search endpoint
// app.get('/messages/search', authenticateToken, async (req: any, res: any) => {
//   try {
//     const { q, type = 'all', limit = 50 } = req.query;
//     const userId = req.user.userId;

//     const messages = await messagingService.searchMessages(
//       userId, q, type, parseInt(limit)
//     );

//     res.json(messages);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to search messages' });
//   }
// });

// // Message analytics endpoint
// app.get('/messages/analytics', authenticateToken, async (req: any, res: any) => {
//   try {
//     const { days = 30 } = req.query;
//     const userId = req.user.userId;

//     const analytics = await messagingService.getMessageAnalytics(
//       userId, parseInt(days)
//     );

//     res.json(analytics);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to get message analytics' });
//   }
// });

// // Mark message as read
// app.put('/messages/:messageId/read', authenticateToken, async (req: any, res: any) => {
//   try {
//     const { messageId } = req.params;
//     const userId = req.user.userId;

//     const message = await messagingService.markMessageAsRead(messageId, userId);
//     res.json({ success: true, message });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to mark message as read' });
//   }
// });

// // Server startup
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Hybrid Messaging Server running on port ${PORT}`);
//   console.log(`🔄 Features: Optimistic UI, Real-time sync, Push notifications, Message search, Analytics`);
// });

// export { messagingService, app };
