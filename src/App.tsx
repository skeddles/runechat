import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';

function App() {
	const [username, setUsername] = useState<string | null>(null);

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

	return (
		<Router>
			<div className="app">
				<Routes>
					<Route
						path="/"
						element={username ? <Navigate to="/chat" /> : <Login onLogin={handleLogin} />}
					/>
					<Route
						path="/chat"
						element={username ? <Chat username={username} /> : <Navigate to="/" />}
					/>
					<Route
						path="/chat/:roomId"
						element={username ? <Chat username={username} /> : <Navigate to="/" />}
					/>
				</Routes>
			</div>
		</Router>
	);
}

export default App;
