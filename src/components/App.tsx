import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './Login';
import Chat from './Chat';
import Toast from './Toast';
import '../styles/App.css';
import '../styles/text-effects.css';

function App() {
	const [username, setUsername] = useState<string | null>(null);
	const [toast, setToast] = useState<{ message: string; key: number } | null>(null);

	useEffect(() => {
		const savedUsername = localStorage.getItem('username');
		if (savedUsername) {
			setUsername(savedUsername);
		}
	}, []);

	const handleLogin = (name: string) => {
		localStorage.setItem('username', name);
		setUsername(name);
	};

	const showToast = (message: string) => {
		setToast({ message, key: Date.now() });
	};

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
									showWelcomeToast={() => showToast('<strong>Welcome to RuneChat</strong><br/>You last logged in <strong>earlier today.</strong>')}
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
									showWelcomeToast={() => showToast('<strong>Welcome to RuneChat</strong><br/>You last logged in <strong>earlier today.</strong>')}
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
