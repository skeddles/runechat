import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import cors from 'cors';

const server = createServer();
const wss = new WebSocketServer({ server });

// Store chat rooms and their data
const chatRooms = new Map();

// Cleanup intervals
const USER_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const ROOM_TIMEOUT = 60 * 60 * 1000; // 1 hour

// Helper function to broadcast to all clients in a room
function broadcastToRoom(roomId, message, excludeClient = null) {
  const room = chatRooms.get(roomId);
  if (room) {
    room.clients.forEach(client => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

// Helper function to update room list for all clients
function broadcastRoomList() {
  const roomList = Array.from(chatRooms.keys()).map(roomId => ({
    id: roomId,
    userCount: chatRooms.get(roomId).clients.size
  }));

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'roomList',
        rooms: roomList
      }));
    }
  });
}

wss.on('connection', (ws) => {
  let currentUser = null;
  let currentRoom = null;

  // Set up user timeout
  let userTimeout = null;

  const resetUserTimeout = () => {
    if (userTimeout) clearTimeout(userTimeout);
    userTimeout = setTimeout(() => {
      if (currentRoom && currentUser) {
        const room = chatRooms.get(currentRoom);
        if (room) {
          room.users.delete(currentUser);
          broadcastToRoom(currentRoom, {
            type: 'userList',
            users: Array.from(room.users.keys())
          });
        }
      }
    }, USER_TIMEOUT);
  };

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'setUsername':
        currentUser = data.username;
        ws.send(JSON.stringify({ type: 'usernameSet', username: currentUser }));
        break;

      case 'joinRoom':
        if (!currentUser) {
          ws.send(JSON.stringify({ type: 'error', message: 'Please set username first' }));
          return;
        }

        // Leave current room if any
        if (currentRoom) {
          const oldRoom = chatRooms.get(currentRoom);
          if (oldRoom) {
            oldRoom.clients.delete(ws);
            oldRoom.users.delete(currentUser);
            broadcastToRoom(currentRoom, {
              type: 'userList',
              users: Array.from(oldRoom.users.keys())
            });
          }
        }

        // Join new room
        currentRoom = data.roomId;
        if (!chatRooms.has(currentRoom)) {
          chatRooms.set(currentRoom, {
            clients: new Set(),
            users: new Map(),
            messages: [],
            lastActivity: Date.now()
          });
        }

        const room = chatRooms.get(currentRoom);
        room.clients.add(ws);
        room.users.set(currentUser, Date.now());
        room.lastActivity = Date.now();

        // Send room history
        ws.send(JSON.stringify({
          type: 'roomHistory',
          messages: room.messages
        }));

        // Broadcast user list
        broadcastToRoom(currentRoom, {
          type: 'userList',
          users: Array.from(room.users.keys())
        });

        // Broadcast room list to all clients
        broadcastRoomList();
        resetUserTimeout();
        break;

      case 'createRoom':
        if (!currentUser) {
          ws.send(JSON.stringify({ type: 'error', message: 'Please set username first' }));
          return;
        }

        const newRoomId = data.roomId;
        if (chatRooms.has(newRoomId)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room already exists' }));
          return;
        }

        chatRooms.set(newRoomId, {
          clients: new Set(),
          users: new Map(),
          messages: [],
          lastActivity: Date.now()
        });

        broadcastRoomList();
        break;

      case 'message':
        if (!currentRoom || !currentUser) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not in a room' }));
          return;
        }

        const messageData = {
          type: 'message',
          user: currentUser,
          content: data.content,
          timestamp: Date.now()
        };

        const currentRoomData = chatRooms.get(currentRoom);
        currentRoomData.messages.push(messageData);
        currentRoomData.lastActivity = Date.now();

        broadcastToRoom(currentRoom, messageData);
        resetUserTimeout();
        break;
    }
  });

  ws.on('close', () => {
    if (currentRoom) {
      const room = chatRooms.get(currentRoom);
      if (room) {
        room.clients.delete(ws);
        room.users.delete(currentUser);
        broadcastToRoom(currentRoom, {
          type: 'userList',
          users: Array.from(room.users.keys())
        });

        // Check if room is empty and set timeout for deletion
        if (room.clients.size === 0) {
          setTimeout(() => {
            const roomToCheck = chatRooms.get(currentRoom);
            if (roomToCheck && roomToCheck.clients.size === 0) {
              chatRooms.delete(currentRoom);
              broadcastRoomList();
            }
          }, ROOM_TIMEOUT);
        }
      }
    }
    if (userTimeout) clearTimeout(userTimeout);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
}); 