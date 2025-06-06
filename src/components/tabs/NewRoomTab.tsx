import Tooltip from '../Tooltip';

interface NewRoomTabProps {
	newRoomName: string;
	onNewRoomNameChange: (name: string) => void;
	onCreateRoom: (e: React.FormEvent) => void;
}

function NewRoomTab({ newRoomName, onNewRoomNameChange, onCreateRoom }: NewRoomTabProps) {
	return (
		<div className="new-room-tab">
			<Tooltip text="Create a new world">
				<h2>New World</h2>
			</Tooltip>
			<form onSubmit={onCreateRoom} className="create-room-form">
				<label>
					Name:
					<input
						type="text"
						value={newRoomName}
						onChange={(e) => onNewRoomNameChange(e.target.value)}
						placeholder="New world name"
					/>
				</label>
				<Tooltip text="Create a new world">
					<button type="submit" className="standard">Create</button>
				</Tooltip>
			</form>
		</div>
	);
}

export default NewRoomTab;
