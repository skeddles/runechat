import { useState, useEffect, useRef } from 'react';

interface TooltipProps {
	text: string;
	children: React.ReactNode;
}

function Tooltip({ text, children }: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const containerRef = useRef<HTMLSpanElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const showTimerRef = useRef<number>();

	const updatePosition = () => {
		if (containerRef.current && tooltipRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const tooltipRect = tooltipRef.current.getBoundingClientRect();
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			// Calculate initial position
			let left = rect.left + (rect.width / 2);
			let top = rect.top - 10;

			// Check horizontal boundaries
			if (left - (tooltipRect.width / 2) < 0) {
				left = tooltipRect.width / 2;
			} else if (left + (tooltipRect.width / 2) > viewportWidth) {
				left = viewportWidth - (tooltipRect.width / 2);
			}

			// Check vertical boundaries
			if (top < 0) {
				// If tooltip would go above viewport, show it below the element instead
				top = rect.bottom + 10;
			}

			setPosition({ top, left });
		}
	};

	const handleMouseEnter = () => {
		showTimerRef.current = window.setTimeout(() => {
			setIsVisible(true);
		}, 800);
	};

	const handleMouseLeave = () => {
		if (showTimerRef.current) {
			clearTimeout(showTimerRef.current);
		}
		setIsVisible(false);
	};

	useEffect(() => {
		if (isVisible) {
			updatePosition();
			window.addEventListener('scroll', updatePosition);
			window.addEventListener('resize', updatePosition);
		}
		return () => {
			window.removeEventListener('scroll', updatePosition);
			window.removeEventListener('resize', updatePosition);
			if (showTimerRef.current) {
				clearTimeout(showTimerRef.current);
			}
		};
	}, [isVisible]);

	return (
		<span
			ref={containerRef}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className="tooltip-container"
		>
			{children}
			{isVisible && (
				<div
					ref={tooltipRef}
					className="tooltip"
					style={{ top: position.top, left: position.left }}
				>
					{text}
				</div>
			)}
		</span>
	);
}

export default Tooltip;
