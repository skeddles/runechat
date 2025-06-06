import type { ReactNode } from 'react';
import Tooltip from './Tooltip';
import '../styles/TabBar.css';

export interface Tab {
	id: string;
	label: string;
	icon: string;
	content: ReactNode;
}

interface TabBarProps {
	tabs: Tab[];
	selectedTab: string;
	onTabSelect: (tabId: string) => void;
	position: 'top' | 'bottom';
	isFirst?: boolean;
	isLast?: boolean;
}

function TabBar({ tabs, selectedTab, onTabSelect, position, isFirst, isLast }: TabBarProps) {
	return (
		<div className={`tab-bar ${position}`}>
			{tabs.map((tab, index) => {
				const isFirstTab = index === 0;
				const isLastTab = index === tabs.length - 1;
				const buttonClass = `tab-button ${selectedTab === tab.id ? 'selected' : ''} ${position === 'top'
					? (isFirstTab ? 'first-top' : isLastTab ? 'last-top' : 'middle')
					: (isFirstTab ? 'first-bottom' : isLastTab ? 'last-bottom' : 'middle')
					}`;

				return (
					<Tooltip key={tab.id} text={tab.label}>
						<button
							className={buttonClass}
							onClick={() => onTabSelect(tab.id)}
						>
							<img src={`/${tab.icon}`} alt={tab.label} />
						</button>
					</Tooltip>
				);
			})}
		</div>
	);
}

export default TabBar;
