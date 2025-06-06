import { useCursor } from '../../contexts/CursorContext';
import Tooltip from '../Tooltip';

const CURSORS = [
	{ id: 'default', name: 'Default' },
	{ id: 'gold', name: 'Gold' },
	{ id: 'silver', name: 'Silver' },
	{ id: 'trout', name: 'Trout' },
	{ id: 'dragon-dagger', name: 'Dragon Dagger' },
	{ id: 'dragon-dagger-p', name: 'Poison Dragon Dagger' },
	{ id: 'dragon-scimitar', name: 'Dragon Scimitar' }
];

function OptionsTab() {
	const { cursor, setCursor } = useCursor();

	return (
		<div className="options-tab">
			<h2>Options</h2>
			<div className="cursor-selection">
				<h3>Cursor Style</h3>
				<div className="cursor-selector">
					{CURSORS.map((cursorOption) => (
						<Tooltip key={cursorOption.id} text={cursorOption.name}>
							<div
								className={`cursor-option${cursor === cursorOption.id ? ' selected' : ''}`}
								onClick={() => setCursor(cursorOption.id)}
								tabIndex={0}
								role="button"
								aria-label={cursorOption.name}
							>
								<img
									src={`/cursors/${cursorOption.id}.png`}
									alt={cursorOption.name}
									width={32}
									height={32}
								/>
							</div>
						</Tooltip>
					))}
				</div>
			</div>
		</div>
	);
}

export default OptionsTab;
