import { useState } from 'react';

interface LoginProps {
	onLogin: (username: string) => void;
}

function Login({ onLogin }: LoginProps) {
	const [username, setUsername] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (username.trim()) {
			onLogin(username.trim());
		}
	};

	return (
		<div className="login-container">
			<form onSubmit={handleSubmit} className="login-form">
				<h1>Welcome to RuneChat</h1>
				<div className="form-group">
					<label htmlFor="username">Username:</label>
					<input
						type="text"
						id="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="*"
						required
					/>
				</div>
				<button type="submit">Login</button>
			</form>
		</div>
	);
}

export default Login;
