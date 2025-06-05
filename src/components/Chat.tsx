import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


interface ChatProps {
	username: string;
}

interface Message {
	type: string;
	user: string;
	content: string;
	timestamp: number;
}

interface Room {
	id: string;
	userCount: number;
	isPublic: boolean;
}

function Chat({ username }: ChatProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [rooms, setRooms] = useState<Room[]>([]);
	const [users, setUsers] = useState<string[]>([]);
	const [newMessage, setNewMessage] = useState('');
	const [newRoomName, setNewRoomName] = useState('');
	const [ws, setWs] = useState<WebSocket | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const { roomId } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		const websocket = new WebSocket('ws://localhost:3001');

		websocket.onopen = () => {
			websocket.send(JSON.stringify({ type: 'setUsername', username }));
			if (roomId) {
				websocket.send(JSON.stringify({ type: 'joinRoom', roomId }));
			} else {
				websocket.send(JSON.stringify({ type: 'joinRoom', roomId: 'public' }));
				navigate('/chat/public');
			}
		};

		websocket.onmessage = (event) => {
			const data = JSON.parse(event.data);

			switch (data.type) {
				case 'roomList':
					setRooms(data.rooms);
					break;
				case 'userList':
					setUsers(data.users);
					break;
				case 'roomHistory':
					setMessages(data.messages);
					break;
				case 'message':
					setMessages(prev => [...prev, data]);
					break;
				case 'error':
					console.error(data.message);
					break;
			}
		};

		websocket.onclose = () => {
			console.log('WebSocket connection closed');
		};

		setWs(websocket);

		return () => {
			websocket.close();
		};
	}, [username, roomId]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (newMessage.trim() && ws) {
			ws.send(JSON.stringify({
				type: 'message',
				content: newMessage.trim()
			}));
			setNewMessage('');
		}
	};

	const handleJoinRoom = (roomId: string) => {
		if (ws) {
			ws.send(JSON.stringify({ type: 'joinRoom', roomId }));
			navigate(`/chat/${roomId}`);
		}
	};

	const handleCreateRoom = (e: React.FormEvent) => {
		e.preventDefault();
		if (newRoomName.trim() && ws) {
			const roomId = newRoomName.trim();
			ws.send(JSON.stringify({
				type: 'createRoom',
				roomId
			}));
			setNewRoomName('');
			handleJoinRoom(roomId);
		}
	};

	return (
		<div className="chat-container">
			<div className="rooms-panel">
				<h2>Worlds</h2>
				<form onSubmit={handleCreateRoom} className="create-room-form">
					<input
						type="text"
						value={newRoomName}
						onChange={(e) => setNewRoomName(e.target.value)}
						placeholder="New room name"
					/>
					<button type="submit" className="standard">Create</button>
				</form>
				<div className="room-list">
					{rooms.map(room => (
						<div
							key={room.id}
							className={`room-item ${room.id === roomId ? 'active' : ''} ${room.isPublic ? 'public-room' : ''}`}
							onClick={() => handleJoinRoom(room.id)}
						>
							{room.id} ({room.userCount} users)
							{room.isPublic && <span className="public-badge">Public</span>}
						</div>
					))}
				</div>
			</div>

			<div className="column-separator">
				<div className="middle" />
			</div>

			<div className="chat-panel">
				<div className="messages">
					{messages.map((message, index) => (
						<div key={index} className="message">
							<span className="message-user">{message.user}</span>
							<span className="message-content">{message.content}</span>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>
				<form onSubmit={handleSendMessage} className="message-form">
					<span style={{ color: 'black', display: 'inline-flex', alignItems: 'center', height: '100%' }}>{username}:</span>
					<input
						type="text"
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder="*"
					/>
					<button type="submit" className="standard">Send</button>
				</form>
			</div>

			<div className="column-separator">
				<div className="middle" />
			</div>

			<div className="users-panel">
				<h2>Players</h2>
				<div className="user-list">
					{users.map(user => (
						<div key={user} className="user-item">
							{user}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default Chat;
