

interface AvatarProps {
	avatarId: number;
	size?: number;
	className?: string;
}

function Avatar({ avatarId, size = 48, className = '' }: AvatarProps) {
	// Calculate position in the sprite sheet
	// Grid is 10 wide, 7 tall
	const row = Math.floor(avatarId / 10);
	const col = avatarId % 10;

	const style = {
		width: size,
		height: size,
		backgroundImage: 'url(/avatars.png)',
		backgroundPosition: `${-col * 48}px ${-row * 48}px`,
		backgroundSize: '480px 336px', // 10 * 48, 7 * 48
		imageRendering: 'pixelated' as const,
	};

	return (
		<div
			className={`avatar ${className}`}
			style={style}
		/>
	);
}

export default Avatar;
