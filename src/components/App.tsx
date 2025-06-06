import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Login from './Login';
import Chat from './Chat';
import Toast from './Toast';
import LoadingScreen from './LoadingScreen';
import '../styles/App.css';
import '../styles/text-effects.css';

function App() {
	const [username, setUsername] = useState<string | null>(null);
	const [toast, setToast] = useState<{ message: string; key: number } | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		const savedUsername = localStorage.getItem('username');
		if (savedUsername) {
			setUsername(savedUsername);
		}
	}, []);

	// Initialize and manage audio
	useEffect(() => {
		// Initialize audio
		audioRef.current = new Audio('/scape-main.mp3');
		audioRef.current.volume = 0.5;
		audioRef.current.loop = true;

		// Add event listeners for debugging
		audioRef.current.addEventListener('play', () => console.log('Scape Main started playing'));
		audioRef.current.addEventListener('ended', () => console.log('Scape Main finished playing'));
		audioRef.current.addEventListener('error', (e) => console.error('Error with Scape Main:', e));

		// Start playing
		console.log('Attempting to play Scape Main...');
		audioRef.current.play().catch(err => console.error('Play failed:', err));

		// Cleanup function
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
			}
		};
	}, []);

	const handleLogin = (name: string) => {
		// Stop Scape Main when user logs in
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
		localStorage.setItem('username', name);
		setUsername(name);
	};

	const handleLogout = () => {
		// Stop any playing audio
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
		// Clear username from state
		setUsername(null);
		// Clear localStorage
		localStorage.removeItem('username');
		localStorage.removeItem('chatStats');
	};

	const showToast = (message: string) => {
		setToast({ message, key: Date.now() });
	};

	if (isLoading) {
		return <LoadingScreen onLoadComplete={() => setIsLoading(false)} />;
	}

	// Stop Scape Main when transitioning to chat (either from login or auto-login)
	if (username && audioRef.current) {
		audioRef.current.pause();
		audioRef.current.currentTime = 0;
	}

	return (
		<Router>
			<div className="app">
				{toast && (
					<Toast
						key={toast.key}
						message={toast.message}
						onClose={() => setToast(null)}
					/>
				)}
				<Routes>
					<Route
						path="/"
						element={username ? <Navigate to="/chat" /> : <Login onLogin={handleLogin} />}
					/>
					<Route
						path="/chat"
						element={
							username ? (
								<Chat
									username={username}
									onShowToast={showToast}
									onLogout={handleLogout}
								/>
							) : (
								<Navigate to="/" />
							)
						}
					/>
					<Route
						path="/chat/:roomId"
						element={
							username ? (
								<Chat
									username={username}
									onShowToast={showToast}
									onLogout={handleLogout}
								/>
							) : (
								<Navigate to="/" />
							)
						}
					/>
				</Routes>
			</div>
		</Router>
	);
}

export default App;
