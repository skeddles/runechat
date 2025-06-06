import { useState, useEffect } from 'react';

interface LoadingScreenProps {
	onLoadComplete: () => void;
}

function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
	const [loadingStatus, setLoadingStatus] = useState({ text: 'Loading Fonts', progress: 0 });
	const [maxProgress, setMaxProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);

	// Helper function to get random delay between min and max
	const getRandomDelay = (min: number, max: number) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	// Helper function to update loading status with progress protection
	const updateLoadingStatus = (text: string, progress: number) => {
		const newProgress = Math.max(progress, maxProgress);
		setMaxProgress(newProgress);
		setLoadingStatus({ text, progress: newProgress });
	};

	useEffect(() => {
		const loadAssets = async () => {
			try {
				// Define all assets to load
				const images = [
					'/login-background.png',
					'/login-box.png',
					'/login-button.png',
					'/button.png',
					'/panel-background.png',
					'/background.png',
					'/chatbox-frame.png',
					'/chatbox-bg.png',
					'/scroll-bg.png',
					'/report-button.png',
					'/column-separator-ends.png',
					'/column-separator-middle.png',
					'/flags.png',
					'/avatars.png',
					'/logout-button.png',
					'/column-bar-texture.png',
					'/rock-pattern.png',
					'/tab-buttons.png',
					'/sorting-arrows.png',
					'/world-stars.png',
					'/stats.png',
					'/rooms-list.png',
					'/options.png',
					'/music.png',
					'/logout.png',
					'/equipment.png',
					'/user-list.png',
					'/new-room.png',
					'/icons/logo.png',
					'/icons/favicon.svg',
					'/icons/apple-touch-icon.png',
					'/icons/web-app-manifest-512x512.png',
					'/icons/web-app-manifest-192x192.png',
					'/icons/favicon-96x96.png',
					'/cursors/default.png',
					'/cursors/gold.png',
					'/cursors/silver.png',
					'/cursors/trout.png',
					'/cursors/dragon-dagger.png',
					'/cursors/dragon-dagger-p.png',
					'/cursors/dragon-scimitar.png'
				];

				// Calculate total number of assets and delay per asset
				const totalAssets = images.length + 3; // +3 for fonts, audio, and server connection
				const targetTotalTime = 5000; // 5 seconds total
				const baseDelayPerAsset = Math.floor(targetTotalTime / totalAssets);
				const minDelay = Math.floor(baseDelayPerAsset * 0.5);
				const maxDelay = Math.floor(baseDelayPerAsset * 1.5);

				// Define progress ranges for each group
				const PROGRESS_RANGES = {
					FONTS: { start: 0, end: 20 },
					IMAGES: { start: 20, end: 70 },
					AUDIO: { start: 70, end: 75 },
					SERVER: { start: 75, end: 85 },
					FINAL: { start: 85, end: 100 }
				};

				// Load fonts
				updateLoadingStatus('Loading Fonts', PROGRESS_RANGES.FONTS.start);
				await document.fonts.load('1em RuneScape');
				await document.fonts.load('1em RuneScapeBold');
				await document.fonts.load('1em RuneScapeSmall');
				updateLoadingStatus('Loading Fonts', PROGRESS_RANGES.FONTS.end);
				await new Promise(resolve => setTimeout(resolve, getRandomDelay(minDelay, maxDelay)));

				// Load images
				updateLoadingStatus('Loading Images', PROGRESS_RANGES.IMAGES.start);
				for (let i = 0; i < images.length; i++) {
					const progress = PROGRESS_RANGES.IMAGES.start +
						Math.floor((i + 1) * ((PROGRESS_RANGES.IMAGES.end - PROGRESS_RANGES.IMAGES.start) / images.length));
					updateLoadingStatus('Loading Images', progress);

					await new Promise((resolve, reject) => {
						const img = new Image();
						img.onload = resolve;
						img.onerror = reject;
						img.src = images[i];
					});

					await new Promise(resolve => setTimeout(resolve, getRandomDelay(minDelay, maxDelay)));
				}
				updateLoadingStatus('Loading Images', PROGRESS_RANGES.IMAGES.end);

				// Load audio
				updateLoadingStatus('Loading Music', PROGRESS_RANGES.AUDIO.start);
				await new Promise((resolve, reject) => {
					const audio = new Audio('/scape-main.mp3');
					audio.oncanplaythrough = resolve;
					audio.onerror = reject;
					audio.load();
				});
				updateLoadingStatus('Loading Music', PROGRESS_RANGES.AUDIO.end);
				await new Promise(resolve => setTimeout(resolve, getRandomDelay(minDelay, maxDelay)));

				// Connect to server
				updateLoadingStatus('Connecting to Server', PROGRESS_RANGES.SERVER.start);
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
				updateLoadingStatus('Connecting to Server', PROGRESS_RANGES.SERVER.end);

				// Final steps
				updateLoadingStatus('Verifying Connection', PROGRESS_RANGES.FINAL.start);
				await new Promise(resolve => setTimeout(resolve, getRandomDelay(minDelay, maxDelay)));

				updateLoadingStatus('Initializing Chat', Math.floor((PROGRESS_RANGES.FINAL.start + PROGRESS_RANGES.FINAL.end) / 2));
				await new Promise(resolve => setTimeout(resolve, getRandomDelay(minDelay, maxDelay)));

				updateLoadingStatus('Complete', PROGRESS_RANGES.FINAL.end);
				await new Promise(resolve => setTimeout(resolve, 500)); // Shorter final delay
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
				<img src="/icons/logo.png" alt="RuneChat Logo" className="loading-logo" />
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
