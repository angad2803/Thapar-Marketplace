# WebSocket Chat Implementation Guide

## Setup Instructions

### 1. Clear Disk Space and Install Dependencies

```bash
cd d:\SE\server
npm install socket.io
```

### 2. Update index.js

Replace `d:\SE\server\index.js` with the contents of `index-with-socket.js`, or rename:

```bash
# Backup current index.js
mv index.js index-old.js

# Use the Socket.IO version
mv index-with-socket.js index.js
```

### 3. Restart Server

```bash
node index.js
```

## Frontend Implementation

### Install Socket.IO Client

```bash
cd d:\SE\client
npm install socket.io-client
```

### Create Chat Hook (src/hooks/useChat.ts)

```typescript
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  senderId: { _id: string; name: string; profileImage?: string };
  receiverId: { _id: string; name: string };
  content: string;
  createdAt: string;
  isRead: boolean;
}

export const useChat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io('http://localhost:3000', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    newSocket.on('message:new', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('message:received', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('users:online', (users: string[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('user:online', ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => [...prev, userId]);
    });

    newSocket.on('user:offline', ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = useCallback(
    (receiverId: string, content: string, listingId?: string) => {
      if (!socket) return;
      socket.emit('message:send', { receiverId, content, listingId });
    },
    [socket]
  );

  const startTyping = useCallback(
    (receiverId: string) => {
      if (!socket) return;
      socket.emit('typing:start', receiverId);
    },
    [socket]
  );

  const stopTyping = useCallback(
    (receiverId: string) => {
      if (!socket) return;
      socket.emit('typing:stop', receiverId);
    },
    [socket]
  );

  const markAsRead = useCallback(
    (messageId: string) => {
      if (!socket) return;
      socket.emit('message:read', messageId);
    },
    [socket]
  );

  return {
    socket,
    isConnected,
    messages,
    onlineUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
};
```

### Example Chat Component

```typescript
import { useChat } from '@/hooks/useChat';
import { useState } from 'react';

export const ChatBox = ({ receiverId, receiverName }: { receiverId: string; receiverName: string }) => {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, isConnected } = useChat();

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(receiverId, message);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <h3 className="font-semibold">{receiverName}</h3>
        {isConnected ? (
          <span className="text-sm text-green-600">● Online</span>
        ) : (
          <span className="text-sm text-gray-500">○ Offline</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-3 rounded ${
              msg.senderId._id === 'current-user-id'
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-200'
            } max-w-[70%]`}
          >
            <p>{msg.content}</p>
            <span className="text-xs opacity-70">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
```

## Socket Events

### Client → Server
- `message:send` - Send a new message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `message:read` - Mark message as read

### Server → Client
- `message:new` - New message received
- `message:received` - Confirmation of sent message
- `message:read` - Message was read by recipient
- `user:online` - User came online
- `user:offline` - User went offline
- `users:online` - List of online users
- `user:typing` - Someone is typing
- `user:stop-typing` - Someone stopped typing

## Next Steps

1. Free up disk space on your system
2. Install socket.io: `npm install socket.io`
3. Replace index.js with the Socket.IO version
4. Restart the server
5. Install socket.io-client in frontend
6. Implement the chat UI with the useChat hook
