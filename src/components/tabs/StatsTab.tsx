import { useEffect, useState } from 'react';
import Tooltip from '../Tooltip';

interface Stats {
	pageLoads: number;
	messagesSent: number;
	roomsCreated: number;
}

function StatsTab() {
	const [stats, setStats] = useState<Stats>({
		pageLoads: 0,
		messagesSent: 0,
		roomsCreated: 0
	});

	// Load initial stats and set up event listeners
	useEffect(() => {
		// Load initial stats
		const loadStats = () => {
			const storedStats = localStorage.getItem('chatStats');
			if (storedStats) {
				setStats(JSON.parse(storedStats));
			}
		};

		// Load stats initially
		loadStats();

		// Listen for storage changes from other tabs
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'chatStats') {
				loadStats();
			}
		};

		// Listen for custom event from same tab
		const handleStatsUpdate = () => {
			loadStats();
		};

		window.addEventListener('storage', handleStorageChange);
		window.addEventListener('statsUpdated', handleStatsUpdate);

		// Cleanup
		return () => {
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener('statsUpdated', handleStatsUpdate);
		};
	}, []);

	return (
		<div className="stats-tab">
			<Tooltip text="View your chat statistics">
				<h2>Stats</h2>
			</Tooltip>
			<div className="stats-list">
				<div className="stat-item">
					<span className="stat-label">Logins:</span>
					<span className="stat-value">{stats.pageLoads}</span>
				</div>
				<div className="stat-item">
					<span className="stat-label">Messages Sent:</span>
					<span className="stat-value">{stats.messagesSent}</span>
				</div>
				<div className="stat-item">
					<span className="stat-label">Worlds Created:</span>
					<span className="stat-value">{stats.roomsCreated}</span>
				</div>
			</div>
		</div>
	);
}

export default StatsTab;
