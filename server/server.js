import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import cors from 'cors';

const server = createServer();
const wss = new WebSocketServer({ server });

// Store chat rooms and their data
const chatRooms = new Map();

// Track used world IDs
const usedWorldIds = new Set();

// Initialize public room
chatRooms.set('public', {
	clients: new Set(),
	users: new Map(),
	messages: [],
	lastActivity: Date.now(),
	isPublic: true,
	starId: 1,
	worldId: 1,
	flagId: 0
});
usedWorldIds.add(1);

// Cleanup intervals
const USER_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const ROOM_TIMEOUT = 60 * 60 * 1000; // 1 hour

// Helper function to get next available world ID
function getNextWorldId() {
	let id = 1;
	while (usedWorldIds.has(id)) {
		id++;
	}
	usedWorldIds.add(id);
	return id;
}

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

// Helper function to broadcast room list for all clients
function broadcastRoomList() {
	const roomList = Array.from(chatRooms.keys())
		.map(roomId => ({
			id: roomId,
			userCount: chatRooms.get(roomId).clients.size,
			isPublic: chatRooms.get(roomId).isPublic || false,
			starId: chatRooms.get(roomId).starId || 0,
			worldId: chatRooms.get(roomId).worldId,
			flagId: chatRooms.get(roomId).flagId
		}))
		.sort((a, b) => {
			// Public room always first
			if (a.isPublic) return -1;
			if (b.isPublic) return 1;
			return a.worldId - b.worldId;
		});

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
	let currentAvatarId = 0;

	// Set up user timeout
	let userTimeout = null;

	const resetUserTimeout = () => {
		if (userTimeout) clearTimeout(userTimeout);
		userTimeout = setTimeout(() => {
			if (currentRoom && currentUser) {
				const room = chatRooms.get(currentRoom);
				if (room && !room.isPublic) { // Don't remove users from public room
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
				currentAvatarId = data.avatarId || Math.floor(Math.random() * 66);
				ws.send(JSON.stringify({
					type: 'usernameSet',
					username: currentUser,
					avatarId: currentAvatarId
				}));
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
						lastActivity: Date.now(),
						isPublic: false,
						starId: 0,
						worldId: getNextWorldId(),
						flagId: Math.floor(Math.random() * 5)
					});
				}

				const room = chatRooms.get(currentRoom);
				room.clients.add(ws);
				room.users.set(currentUser, { lastSeen: Date.now(), avatarId: currentAvatarId });
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
					lastActivity: Date.now(),
					isPublic: false,
					starId: 0,
					worldId: getNextWorldId(),
					flagId: Math.floor(Math.random() * 5)
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
					timestamp: Date.now(),
					avatarId: currentAvatarId
				};

				const currentRoomData = chatRooms.get(currentRoom);
				currentRoomData.messages.push(messageData);

				// Keep only the latest 256 messages
				if (currentRoomData.messages.length > 256) {
					currentRoomData.messages = currentRoomData.messages.slice(-256);
				}

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

				// Check if room is empty and set timeout for deletion (except for public room)
				if (room.clients.size === 0 && !room.isPublic) {
					setTimeout(() => {
						const roomToCheck = chatRooms.get(currentRoom);
						if (roomToCheck && roomToCheck.clients.size === 0) {
							usedWorldIds.delete(roomToCheck.worldId);
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
