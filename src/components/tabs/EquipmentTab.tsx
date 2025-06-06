import { useState } from 'react';
import Avatar from '../Avatar';

function EquipmentTab() {
	const [selectedAvatar, setSelectedAvatar] = useState<number>(() => {
		const saved = localStorage.getItem('avatarId');
		if (saved !== null) {
			return parseInt(saved);
		}
		// Generate random avatar ID (0-65) and store it
		const randomId = Math.floor(Math.random() * 66);
		localStorage.setItem('avatarId', randomId.toString());
		// Dispatch event to notify other components
		window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: randomId }));
		return randomId;
	});

	const handleAvatarSelect = (avatarId: number) => {
		setSelectedAvatar(avatarId);
		localStorage.setItem('avatarId', avatarId.toString());
		// Dispatch event to notify other components
		window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: avatarId }));
	};

	return (
		<div className="equipment-tab">
			<h2>Avatar</h2>
			<div className="avatar-selector">
				{Array.from({ length: 66 }, (_, i) => (
					<div
						key={i}
						className={`avatar-option ${i === selectedAvatar ? 'selected' : ''}`}
						onClick={() => handleAvatarSelect(i)}
					>
						<Avatar avatarId={i} />
					</div>
				))}
			</div>
		</div>
	);
}

export default EquipmentTab;
