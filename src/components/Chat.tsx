import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tooltip from './Tooltip';
import { getWebSocketUrl } from '../config';

interface ChatProps {
	username: string;
	onShowToast: (message: string) => void;
	showWelcomeToast: () => void;
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
	starId: number;
	worldId: number;
	flagId: number;
}

// Text effect types
type TextEffect = 'wave' | 'scroll' | 'slide' | 'flash1' | 'flash2' | 'flash3' | 'glow1' | 'glow2' | 'glow3';

// Function to process message content and extract effect
function processMessageContent(content: string): { effect: TextEffect | null; text: string } {
	const effectMatch = content.match(/^(wave|scroll|slide|flash1|flash2|flash3|glow1|glow2|glow3):/);
	if (effectMatch) {
		return {
			effect: effectMatch[1] as TextEffect,
			text: content.slice(effectMatch[0].length).trim()
		};
	}
	return { effect: null, text: content };
}

// Function to split text into characters for wave effect
function splitTextIntoChars(text: string): JSX.Element[] {
	return text.split('').map((char, index) => (
		<span key={index} className={`char${index + 1}`}>
			{char}
		</span>
	));
}

function Chat({ username, onShowToast, showWelcomeToast }: ChatProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [rooms, setRooms] = useState<Room[]>([]);
	const [users, setUsers] = useState<string[]>([]);
	const [newMessage, setNewMessage] = useState('');
	const [newRoomName, setNewRoomName] = useState('');
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [sortConfig, setSortConfig] = useState<{ key: keyof Room; direction: 'asc' | 'desc' }>({
		key: 'worldId',
		direction: 'asc'
	});
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const { roomId } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		showWelcomeToast();
	}, []);

	useEffect(() => {
		const wsUrl = import.meta.env.VITE_SERVER_URL || 'ws://localhost:3001';
		const websocket = new WebSocket(wsUrl);

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
			onShowToast(`You created a new world called <strong>${roomId}</strong>`);
		}
	};

	const handleSort = (key: keyof Room) => {
		setSortConfig(prev => ({
			key,
			direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
		}));
	};

	const sortedRooms = [...rooms].sort((a, b) => {
		if (a[sortConfig.key] < b[sortConfig.key]) {
			return sortConfig.direction === 'asc' ? -1 : 1;
		}
		if (a[sortConfig.key] > b[sortConfig.key]) {
			return sortConfig.direction === 'asc' ? 1 : -1;
		}
		return 0;
	});

	const renderMessageContent = (content: string) => {
		const { effect, text } = processMessageContent(content);

		if (!effect) {
			return <span>{text}</span>;
		}

		if (effect === 'wave') {
			return (
				<span className="text-effect wave">
					{splitTextIntoChars(text)}
				</span>
			);
		}

		return (
			<span className={`text-effect ${effect}`}>
				{text}
			</span>
		);
	};

	return (
		<div className="chat-container">
			<div className="rooms-panel">
				<Tooltip text="List of chatrooms">
					<h2>Worlds</h2>
				</Tooltip>
				<div className="room-list">
					<table className="room-table">
						<thead>
							<tr>
								<th onClick={() => handleSort('starId')}>
									<Tooltip text="Sort by star level">
										<div style={{ width: '100%', height: '100%' }}>
											<span className={`sort-icon ${sortConfig.key === 'starId' ? `active ${sortConfig.direction}` : ''}`} />
										</div>
									</Tooltip>
								</th>
								<th onClick={() => handleSort('worldId')}>
									<Tooltip text="Sort by world number">
										<div style={{ width: '100%', height: '100%' }}>
											<span className={`sort-icon ${sortConfig.key === 'worldId' ? `active ${sortConfig.direction}` : ''}`} />
										</div>
									</Tooltip>
								</th>
								<th onClick={() => handleSort('flagId')}>
									<Tooltip text="Sort by flag">
										<div style={{ width: '100%', height: '100%' }}>
											<span className={`sort-icon ${sortConfig.key === 'flagId' ? `active ${sortConfig.direction}` : ''}`} />
										</div>
									</Tooltip>
								</th>
								<th onClick={() => handleSort('userCount')}>
									<Tooltip text="Sort by player count">
										<div style={{ width: '100%', height: '100%' }}>
											<span className={`sort-icon ${sortConfig.key === 'userCount' ? `active ${sortConfig.direction}` : ''}`} />
										</div>
									</Tooltip>
								</th>
								<th onClick={() => handleSort('id')}>
									<Tooltip text="Sort by world name">
										<div style={{ width: '100%', height: '100%' }}>
											<span className={`sort-icon ${sortConfig.key === 'id' ? `active ${sortConfig.direction}` : ''}`} />
										</div>
									</Tooltip>
								</th>
							</tr>
						</thead>
						<tbody>
							{sortedRooms.map(room => (
								<tr
									key={room.id}
									className={`room-item ${room.id === roomId ? 'active' : ''}`}
									onClick={() => handleJoinRoom(room.id)}
								>
									<td>
										<span className="room-star" data-star={room.starId} />
									</td>
									<td>
										<span className="room-world-id" data-star={room.starId}>
											{room.worldId}
										</span>
									</td>
									<td>
										<span className="room-flag" data-flag={room.flagId} />
									</td>
									<td>
										<span className="room-user-count">{room.userCount}</span>
									</td>
									<td>
										<span className="room-name">{room.id}</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<form onSubmit={handleCreateRoom} className="create-room-form">
					<label>
						Name:
						<input
							type="text"
							value={newRoomName}
							onChange={(e) => setNewRoomName(e.target.value)}
							placeholder="New room name"
						/>
					</label>
					<Tooltip text="Create a new world">
						<button type="submit" className="standard">Create</button>
					</Tooltip>
				</form>
			</div>

			<div className="column-separator">
				<div className="middle" />
			</div>

			<div className="chat-panel">
				<div className="chat-header">
					Current World - {roomId || 'public'}
				</div>
				<div className="messages">
					{messages.map((message, index) => (
						<div key={index} className="message">
							<span className="message-user">{message.user}:</span>
							<span className="message-content">
								{renderMessageContent(message.content)}
							</span>
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
					<Tooltip text={`Send this message to ${roomId || 'public'}`}>
						<button type="submit" className="standard">Send</button>
					</Tooltip>
				</form>
			</div>

			<div className="column-separator">
				<div className="middle" />
			</div>

			<div className="users-panel">
				<Tooltip text="List of users in this chatroom">
					<h2>Players</h2>
				</Tooltip>
				<div className="user-list">
					{users.map(user => (
						<div key={user} className="user-item">
							{user}
						</div>
					))}
				</div>
				<button className="report-button">Report Abuse</button>
			</div>
		</div>
	);
}

export default Chat;
