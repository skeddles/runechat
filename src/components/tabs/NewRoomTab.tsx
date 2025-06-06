import { useState } from 'react';
import Tooltip from '../Tooltip';
import { validateServerName } from '../../utils/validation';

interface NewRoomTabProps {
	newRoomName: string;
	onNewRoomNameChange: (name: string) => void;
	onCreateRoom: (e: React.FormEvent) => void;
}

function NewRoomTab({ newRoomName, onNewRoomNameChange, onCreateRoom }: NewRoomTabProps) {
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const validation = validateServerName(newRoomName.trim());
		if (validation.isValid) {
			onCreateRoom(e);
		} else {
			setError(validation.error || 'Invalid server name');
		}
	};

	return (
		<div className="new-room-tab">
			<Tooltip text="Create a new world">
				<h2>New World</h2>
			</Tooltip>
			<form onSubmit={handleSubmit} className="create-room-form">
				<label>
					Name:
					<input
						type="text"
						value={newRoomName}
						onChange={(e) => {
							onNewRoomNameChange(e.target.value);
							setError(null);
						}}
						placeholder="New world name"
						maxLength={32}
					/>
				</label>
				{error && <div className="error-message">{error}</div>}
				<Tooltip text="Create a new world">
					<button type="submit" className="standard">Create</button>
				</Tooltip>
			</form>
		</div>
	);
}

export default NewRoomTab;
