import { useState, useEffect } from 'react';

interface ToastProps {
	message: string;
	duration?: number;
	onClose?: () => void;
}

function Toast({ message, duration = 3000, onClose }: ToastProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Small delay before showing to ensure initial state is hidden
		const showTimer = setTimeout(() => {
			setIsVisible(true);
		}, 100);

		const hideTimer = setTimeout(() => {
			setIsVisible(false);
			if (onClose) {
				setTimeout(onClose, 300); // Wait for fade out animation
			}
		}, duration + 100); // Add the initial delay to the duration

		return () => {
			clearTimeout(showTimer);
			clearTimeout(hideTimer);
		};
	}, [duration, onClose]);

	return (
		<div className={`toast ${isVisible ? 'show' : ''}`}>
			<div className="toast-content" dangerouslySetInnerHTML={{ __html: message }} />
		</div>
	);
}

export default Toast;
