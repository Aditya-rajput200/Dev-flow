// "use client";
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import Ably from 'ably';

// // =======================================================
// // HYBRID MESSAGING CLIENT WITH OPTIMISTIC UI
// // =======================================================

// const HybridMessagingClient = () => {
//   const [ably, setAbly] = useState<Ably.Realtime | null>(null);
//   const [messages, setMessages] = useState<Map<string, any[]>>(new Map());
//   const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
//   const [currentUser, setCurrentUser] = useState({ id: 'user1', name: 'John Doe' });
//   const [selectedChat, setSelectedChat] = useState<string>('personal:user2');
//   const [messageInput, setMessageInput] = useState('');
//   const [isConnected, setIsConnected] = useState(false);

//   const typingTimeoutRef = useRef<NodeJS.Timeout>();
//   const messageEndRef = useRef<HTMLDivElement>(null);
//   const localMessageCache = useRef<Map<string, any>>(new Map());

//   // =======================================================
//   // ABLY INITIALIZATION
//   // =======================================================

//   const initializeAbly = useCallback(async () => {
//     try { 
//       const ablyClient = new Ably.Realtime({
//         authCallback: (data, callback) => {
//           fetch('/auth/ably-token', {
//             method: 'POST',
//             headers: {
//               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
//               'Content-Type': 'application/json'
//             }
//           })
//             .then(res => res.json())
//             .then(token => callback(null, token))
//             .catch(err => callback(err, null));
//         }
//       });

//       ablyClient.connection.on('connected', () => {
//         setIsConnected(true);
//         console.log('✅ Connected to Ably');
//         const presenceChannel = ablyClient.channels.get('presence:global');
//         presenceChannel.presence.enter({ name: currentUser.name });
//       });

//       ablyClient.connection.on('disconnected', () => setIsConnected(false));
//       ablyClient.connection.on('failed', () => setIsConnected(false));

//       setAbly(ablyClient);
//       setupChannelSubscriptions(ablyClient);
//     } catch (error) {
//       console.error('Ably init failed:', error);
//     }
//   }, [currentUser]);

//   useEffect(() => {
//     initializeAbly();
//   }, [initializeAbly]);

//   // =======================================================
//   // CHANNEL SUBSCRIPTIONS
//   // =======================================================

//   const setupChannelSubscriptions = (ablyClient: Ably.Realtime) => {
//     const personalChannel = ablyClient.channels.get(`personal:${currentUser.id}`);
//     personalChannel.subscribe('new-message', msg => handleNewMessage(msg.data));
//     personalChannel.subscribe('optimistic-message', msg => handleOptimisticMessage(msg.data));
//     personalChannel.subscribe('message-confirmed', msg => handleMessageConfirmation(msg.data));
//     personalChannel.subscribe('message-error', msg => handleMessageError(msg.data));
//     personalChannel.subscribe('message-read', msg => handleMessageRead(msg.data));

//     const broadcastChannel = ablyClient.channels.get('broadcast:all');
//     broadcastChannel.subscribe('new-message', msg => handleNewMessage(msg.data));

//     const presenceChannel = ablyClient.channels.get('presence:global');
//     presenceChannel.presence.subscribe('enter', member => {
//       setOnlineUsers(prev => new Set(prev).add(member.clientId));
//     });
//     presenceChannel.presence.subscribe('leave', member => {
//       setOnlineUsers(prev => {
//         const updated = new Set(prev);
//         updated.delete(member.clientId);
//         return updated;
//       });
//     });
//   };

//   // =======================================================
//   // MESSAGE HANDLERS
//   // =======================================================

//   const getChatKey = (msg: any) => {
//     if (msg.messageType === 'group') return `group:${msg.groupId}`;
//     if (msg.messageType === 'broadcast') return 'broadcast';
//     return `personal:${msg.senderId === currentUser.id ? msg.receiverId : msg.senderId}`;
//   };

//   const handleNewMessage = (data: any) => {
//     const key = getChatKey(data);
//     setMessages(prev => {
//       const newMap = new Map(prev);
//       const list = newMap.get(key) || [];
//       const exists = list.find(msg => msg.id === data.id);
//       if (!exists) {
//         list.push({ ...data, isOptimistic: false, status: 'delivered' });
//         newMap.set(key, list);
//       }
//       return newMap;
//     });
//     messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleOptimisticMessage = (data: any) => {
//     const key = getChatKey(data);
//     setMessages(prev => {
//       const newMap = new Map(prev);
//       const list = newMap.get(key) || [];
//       list.push({ ...data, isOptimistic: true, status: 'sending' });
//       newMap.set(key, list);
//       return newMap;
//     });
//     localMessageCache.current.set(data.id, data);
//   };

//   const handleMessageConfirmation = (data: any) => {
//     const { tempId, realId, status } = data;
//     setMessages(prev => {
//       const newMap = new Map(prev);
//       for (const [key, list] of newMap.entries()) {
//         const i = list.findIndex(msg => msg.id === tempId);
//         if (i !== -1) {
//           list[i] = { ...list[i], id: realId, status, isOptimistic: false };
//           newMap.set(key, [...list]);
//           break;
//         }
//       }
//       return newMap;
//     });
//     const cached = localMessageCache.current.get(tempId);
//     if (cached) {
//       localMessageCache.current.delete(tempId);
//       localMessageCache.current.set(realId, { ...cached, id: realId });
//     }
//   };

//   const handleMessageError = (data: any) => {
//     const { tempId, error } = data;
//     setMessages(prev => {
//       const newMap = new Map(prev);
//       for (const [key, list] of newMap.entries()) {
//         const i = list.findIndex(msg => msg.id === tempId);
//         if (i !== -1) {
//           list[i] = { ...list[i], status: 'failed', error };
//           newMap.set(key, [...list]);
//           break;
//         }
//       }
//       return newMap;
//     });
//   };

//   const handleMessageRead = (data: any) => {
//     // You can implement read status update if needed
//     console.log('📖 Message read:', data);
//   };

//   // =======================================================
//   // SEND MESSAGE
//   // =======================================================

//   const sendMessage = async () => {
//     if (!messageInput || !selectedChat) return;

//     const tempId = `temp-${Date.now()}`;
//     const [type, id] = selectedChat.split(':');
//     const payload = {
//       tempId,
//       content: messageInput,
//       imageUrl: null
//     };

//     const endpoint =
//       type === 'group'
//         ? '/messages/group'
//         : type === 'broadcast'
//         ? '/messages/broadcast'
//         : '/messages/personal';

//     const body =
//       type === 'group'
//         ? { ...payload, groupId: id }
//         : type === 'broadcast'
//         ? { ...payload }
//         : { ...payload, receiverId: id };

//     try {
//       await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('authToken')}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(body)
//       });

//       setMessageInput('');
//     } catch (error) {
//       console.error('Send failed:', error);
//     }
//   };

//   // =======================================================
//   // UI RENDER
//   // =======================================================

//   const currentMessages = messages.get(selectedChat) || [];

//   return (
//     <div className="p-4 max-w-xl mx-auto">
//       <h2 className="text-xl font-bold mb-2">Hybrid Messaging Client</h2>

//       <div className="border p-2 h-64 overflow-y-auto bg-white rounded shadow">
//         {currentMessages.map((msg, i) => (
//           <div key={i} className={`mb-1 ${msg.isOptimistic ? 'opacity-50 italic' : ''}`}>
//             <span className="font-medium">{msg.senderName || msg.senderId}:</span> {msg.content}
//             {msg.status === 'failed' && <span className="text-red-500 ml-2">(Failed)</span>}
//           </div>
//         ))}
//         <div ref={messageEndRef} />
//       </div>

//       <div className="mt-4 flex space-x-2">
//         <input
//           className="border p-2 w-full rounded"
//           value={messageInput}
//           onChange={e => setMessageInput(e.target.value)}
//           onKeyDown={e => e.key === 'Enter' && sendMessage()}
//           placeholder="Type a message..."
//         />
//         <button className="bg-blue-500 text-white px-4 rounded" onClick={sendMessage}>
//           Send
//         </button>
//       </div>

//       <div className="mt-4 text-sm text-gray-500">
//         {isConnected ? '🟢 Connected' : '🔴 Disconnected'} | Online users: {onlineUsers.size}
//       </div>
//     </div>
//   );
// };

// export default HybridMessagingClient;
