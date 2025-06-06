interface MusicTabProps {
	onStopMusic: () => void;
	onPlayMusic: () => void;
	isPlaying: boolean;
}

function MusicTab({ onStopMusic, onPlayMusic, isPlaying }: MusicTabProps) {
	return (
		<div className="music-tab">
			<h2>Music</h2>

			<button className="stop-music-button" onClick={isPlaying ? onStopMusic : onPlayMusic}>
				{isPlaying ? 'Stop Music' : 'Play Music'}
			</button>
		</div>
	);
}

export default MusicTab;
