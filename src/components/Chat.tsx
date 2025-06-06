import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tooltip from './Tooltip';
import TabBar from './TabBar';
import type { Tab } from './TabBar';
import RoomsListTab from './tabs/RoomsListTab';
import NewRoomTab from './tabs/NewRoomTab';
import EquipmentTab from './tabs/EquipmentTab';
import StatsTab from './tabs/StatsTab';
import UserListTab from './tabs/UserListTab';
import LogoutTab from './tabs/LogoutTab';
import OptionsTab from './tabs/OptionsTab';
import MusicTab from './tabs/MusicTab';
import '../styles/tabs.css';

interface ChatProps {
	username: string;
	onShowToast: (message: string) => void;
	onLogout: () => void;
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

interface Stats {
	pageLoads: number;
	messagesSent: number;
	roomsCreated: number;
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

function Chat({ username, onShowToast, onLogout }: ChatProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [rooms, setRooms] = useState<Room[]>([]);
	const [users, setUsers] = useState<string[]>([]);
	const [newMessage, setNewMessage] = useState('');
	const [newRoomName, setNewRoomName] = useState('');
	const [ws, setWs] = useState<WebSocket | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [sortConfig, setSortConfig] = useState<{ key: keyof Room; direction: 'asc' | 'desc' }>({
		key: 'worldId',
		direction: 'asc'
	});
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const { roomId } = useParams();
	const navigate = useNavigate();
	const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 950);
	const [leftSelectedTab, setLeftSelectedTab] = useState('rooms');
	const [rightSelectedTab, setRightSelectedTab] = useState('users');

	// Function to get time difference message
	const getLastLoginMessage = () => {
		const lastLogin = localStorage.getItem('lastLogin');
		if (!lastLogin) return 'Welcome back!';

		const lastLoginDate = new Date(lastLogin);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - lastLoginDate.getTime());
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return 'You last logged in <strong>earlier today</strong>';
		} else if (diffDays === 1) {
			return 'You last logged in <strong>yesterday</strong>';
		} else {
			return `You last logged in <strong>${diffDays} days ago</strong>`;
		}
	};

	// Handle window resize
	useEffect(() => {
		const handleResize = () => {
			setIsSmallScreen(window.innerWidth < 950);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		// Store current login time
		localStorage.setItem('lastLogin', new Date().toISOString());

		// Show welcome toast with last login info
		onShowToast(getLastLoginMessage());

		// Initialize audio
		audioRef.current = new Audio('/autumn-voyage.mp3');
		audioRef.current.volume = 0.5;
		audioRef.current.loop = true;

		// Add event listeners for debugging
		audioRef.current.addEventListener('play', () => console.log('Autumn Voyage started playing'));
		audioRef.current.addEventListener('ended', () => console.log('Autumn Voyage finished playing'));
		audioRef.current.addEventListener('error', (e) => console.error('Error with Autumn Voyage:', e));

		// Try to play
		console.log('Attempting to play Autumn Voyage...');
		audioRef.current.play().catch(err => console.error('Play failed:', err));

		// Cleanup function
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
			}
		};
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

	// Helper function to update stats
	const updateStats = (key: keyof Stats) => {
		const storedStats = localStorage.getItem('chatStats');
		if (storedStats) {
			const stats = JSON.parse(storedStats);
			stats[key]++;
			localStorage.setItem('chatStats', JSON.stringify(stats));
			// Dispatch custom event for stats update
			window.dispatchEvent(new CustomEvent('statsUpdated'));
		}
	};

	// Initialize stats and track page load
	useEffect(() => {
		console.log('Stats effect running');
		const storedStats = localStorage.getItem('chatStats');
		const currentTime = Date.now();
		const lastUpdate = localStorage.getItem('lastStatsUpdate');

		// Only update if it's been more than 1 second since last update
		if (!lastUpdate || (currentTime - parseInt(lastUpdate)) > 1000) {
			if (!storedStats) {
				localStorage.setItem('chatStats', JSON.stringify({
					pageLoads: 1,
					messagesSent: 0,
					roomsCreated: 0
				}));
				window.dispatchEvent(new CustomEvent('statsUpdated'));
			} else {
				updateStats('pageLoads');
			}
			localStorage.setItem('lastStatsUpdate', currentTime.toString());
		}
	}, []);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (newMessage.trim() && ws) {
			ws.send(JSON.stringify({
				type: 'message',
				content: newMessage.trim()
			}));
			updateStats('messagesSent');
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
			updateStats('roomsCreated');
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

	// Define left sidebar tabs
	const leftTabs: Tab[] = [
		{
			id: 'rooms',
			label: 'Rooms',
			icon: 'rooms-list.png',
			content: (
				<RoomsListTab
					rooms={sortedRooms}
					selectedRoom={roomId || null}
					onJoinRoom={handleJoinRoom}
					onSort={handleSort}
					sortConfig={sortConfig}
				/>
			)
		},
		{
			id: 'newRoom',
			label: 'New World',
			icon: 'new-room.png',
			content: (
				<NewRoomTab
					newRoomName={newRoomName}
					onNewRoomNameChange={setNewRoomName}
					onCreateRoom={handleCreateRoom}
				/>
			)
		},
		{
			id: 'equipment',
			label: 'Equipment',
			icon: 'equipment.png',
			content: <EquipmentTab />
		},
		{
			id: 'stats',
			label: 'Stats',
			icon: 'stats.png',
			content: <StatsTab />
		}
	];

	// Define right sidebar tabs
	const rightTabs: Tab[] = [
		{
			id: 'users',
			label: 'Users',
			icon: 'user-list.png',
			content: <UserListTab users={users} onShowToast={onShowToast} />
		},
		{
			id: 'logout',
			label: 'Logout',
			icon: 'logout.png',
			content: <LogoutTab onLogout={onLogout} />
		},
		{
			id: 'options',
			label: 'Options',
			icon: 'options.png',
			content: <OptionsTab />
		},
		{
			id: 'music',
			label: 'Music',
			icon: 'music.png',
			content: <MusicTab />
		}
	];

	// When screen is small, combine all tabs into left sidebar
	const allTabs = isSmallScreen ? [...leftTabs, ...rightTabs] : leftTabs;
	const selectedTab = isSmallScreen ? leftSelectedTab : (leftSelectedTab === 'rooms' ? rightSelectedTab : leftSelectedTab);

	return (
		<div className="chat-container">
			<div className="rooms-panel">
				<TabBar
					tabs={leftTabs}
					selectedTab={leftSelectedTab}
					onTabSelect={setLeftSelectedTab}
					position="top"
				/>
				{leftTabs.find(tab => tab.id === leftSelectedTab)?.content}
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

			{!isSmallScreen && (
				<>
					<div className="column-separator">
						<div className="middle" />
					</div>

					<div className="users-panel">
						<TabBar
							tabs={rightTabs}
							selectedTab={rightSelectedTab}
							onTabSelect={setRightSelectedTab}
							position="top"
						/>
						{rightTabs.find(tab => tab.id === rightSelectedTab)?.content}
					</div>
				</>
			)}

			{isSmallScreen && (
				<TabBar
					tabs={rightTabs}
					selectedTab={rightSelectedTab}
					onTabSelect={setRightSelectedTab}
					position="bottom"
				/>
			)}
		</div>
	);
}

export default Chat;
