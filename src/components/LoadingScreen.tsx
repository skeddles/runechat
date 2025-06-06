import { useState, useEffect } from 'react';

interface LoadingScreenProps {
	onLoadComplete: () => void;
}

function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
	const [loadingStatus, setLoadingStatus] = useState({ text: 'Loading Fonts', progress: 0 });
	const [error, setError] = useState<string | null>(null);

	// Helper function to get random delay between min and max
	const getRandomDelay = (min: number, max: number) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	useEffect(() => {
		const loadAssets = async () => {
			try {
				// Load fonts with individual steps
				setLoadingStatus({ text: 'Loading RuneScape Font', progress: 5 });
				await document.fonts.load('1em RuneScape');
				await new Promise(resolve => setTimeout(resolve, getRandomDelay(200, 400)));

				setLoadingStatus({ text: 'Loading RuneScape Bold Font', progress: 15 });
				await document.fonts.load('1em RuneScapeBold');
				await new Promise(resolve => setTimeout(resolve, getRandomDelay(200, 400)));

				setLoadingStatus({ text: 'Loading RuneScape Small Font', progress: 25 });
				await document.fonts.load('1em RuneScapeSmall');
				await new Promise(resolve => setTimeout(resolve, getRandomDelay(200, 400)));

				// Load images
				const images = [
					{ src: '/login-background.png', name: 'Login Background' },
					{ src: '/login-box.png', name: 'Login Box' },
					{ src: '/login-button.png', name: 'Login Button' },
					{ src: '/button.png', name: 'Button' },
					{ src: '/panel-background.png', name: 'Sidebar Background' },
					{ src: '/background.png', name: 'Chat Background' },
					{ src: '/chatbox-frame.png', name: 'Chatbox Frame' },
					{ src: '/chatbox-bg.png', name: 'Chatbox Background' },
					{ src: '/scroll-bg.png', name: 'Scroll Background' },
					{ src: '/report-button.png', name: 'Report Button' },
					{ src: '/column-separator-ends.png', name: 'Column Separator Ends' },
					{ src: '/column-separator-middle.png', name: 'Column Separator Middle' },
					{ src: '/flags.png', name: 'Flags' }
				];

				for (let i = 0; i < images.length; i++) {
					const image = images[i];
					const progress = 25 + Math.floor((i + 1) * (45 / images.length));
					setLoadingStatus({ text: `Loading ${image.name}`, progress });

					await new Promise((resolve, reject) => {
						const img = new Image();
						img.onload = resolve;
						img.onerror = reject;
						img.src = image.src;
					});

					await new Promise(resolve => setTimeout(resolve, getRandomDelay(100, 300)));
				}

				// Load audio
				setLoadingStatus({ text: 'Loading Music', progress: 70 });
				await new Promise((resolve, reject) => {
					const audio = new Audio('/scape-main.mp3');
					audio.oncanplaythrough = resolve;
					audio.onerror = reject;
					audio.load();
				});
				await new Promise(resolve => setTimeout(resolve, getRandomDelay(100, 300)));

				// Connect to server
				setLoadingStatus({ text: 'Connecting to Server', progress: 75 });
				const wsUrl = import.meta.env.VITE_SERVER_URL || 'ws://localhost:3001';
				const ws = new WebSocket(wsUrl);

				await new Promise((resolve, reject) => {
					ws.onopen = resolve;
					ws.onerror = (event) => {
						console.error('WebSocket connection error:', event);
						reject(new Error(`Failed to connect to server at ${wsUrl}. Please check if the server is running and the URL is correct.`));
					};
					setTimeout(() => reject(new Error(`Connection timeout - server at ${wsUrl} did not respond within 5 seconds`)), 5000);
				});

				ws.close();

				// Final steps
				setLoadingStatus({ text: 'Verifying Connection', progress: 85 });
				await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 500)));

				setLoadingStatus({ text: 'Initializing Chat', progress: 95 });
				await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 500)));

				setLoadingStatus({ text: 'Complete', progress: 100 });
				await new Promise(resolve => setTimeout(resolve, 1000));
				onLoadComplete();
			} catch (err) {
				console.error('Loading error:', err);
				setError(err instanceof Error ? err.message : 'An unknown error occurred during loading');
			}
		};

		loadAssets();
	}, [onLoadComplete]);

	if (error) {
		return (
			<div className="login-container">
				<div className="loading-screen">
					<h1>An error occurred while loading:</h1>
					<p>{error}</p>
					<p>Please refresh the page to try again.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="login-container">
			<div className="loading-screen">
				<h1>RuneChat is loading - please wait...</h1>
				<div className="loading-bar-container">
					<div
						className="loading-bar"
						style={{ width: `${loadingStatus.progress}%` }}
					/>
					<span className="loading-text">{loadingStatus.text} - {loadingStatus.progress}%</span>
				</div>
			</div>
			<div className="floating-text">
				this is just a free fan project pls dont pk me jagex - <a href="https://github.com/skeddles/runechat/" target="_blank" rel="noopener noreferrer">github</a>
			</div>
		</div>
	);
}

export default LoadingScreen;
