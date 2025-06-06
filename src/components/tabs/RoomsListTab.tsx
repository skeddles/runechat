import Tooltip from '../Tooltip';

interface Room {
	id: string;
	userCount: number;
	isPublic: boolean;
	starId: number;
	worldId: number;
	flagId: number;
}

interface RoomsListTabProps {
	rooms: Room[];
	selectedRoom: string | null;
	onJoinRoom: (roomId: string) => void;
	onSort: (key: keyof Room) => void;
	sortConfig: { key: keyof Room; direction: 'asc' | 'desc' };
}

function RoomsListTab({
	rooms,
	selectedRoom,
	onJoinRoom,
	onSort,
	sortConfig
}: RoomsListTabProps) {
	return (
		<div className="rooms-list-tab">
			<Tooltip text="List of chatrooms">
				<h2>Worlds</h2>
			</Tooltip>
			<div className="room-list">
				<table className="room-table">
					<thead>
						<tr>
							<th onClick={() => onSort('starId')}>
								<Tooltip text="Sort by star level">
									<div style={{ width: '100%', height: '100%' }}>
										<span className={`sort-icon ${sortConfig.key === 'starId' ? `active ${sortConfig.direction}` : ''}`} />
									</div>
								</Tooltip>
							</th>
							<th onClick={() => onSort('worldId')}>
								<Tooltip text="Sort by world number">
									<div style={{ width: '100%', height: '100%' }}>
										<span className={`sort-icon ${sortConfig.key === 'worldId' ? `active ${sortConfig.direction}` : ''}`} />
									</div>
								</Tooltip>
							</th>
							<th onClick={() => onSort('flagId')}>
								<Tooltip text="Sort by flag">
									<div style={{ width: '100%', height: '100%' }}>
										<span className={`sort-icon ${sortConfig.key === 'flagId' ? `active ${sortConfig.direction}` : ''}`} />
									</div>
								</Tooltip>
							</th>
							<th onClick={() => onSort('userCount')}>
								<Tooltip text="Sort by player count">
									<div style={{ width: '100%', height: '100%' }}>
										<span className={`sort-icon ${sortConfig.key === 'userCount' ? `active ${sortConfig.direction}` : ''}`} />
									</div>
								</Tooltip>
							</th>
							<th onClick={() => onSort('id')}>
								<Tooltip text="Sort by world name">
									<div style={{ width: '100%', height: '100%' }}>
										<span className={`sort-icon ${sortConfig.key === 'id' ? `active ${sortConfig.direction}` : ''}`} />
									</div>
								</Tooltip>
							</th>
						</tr>
					</thead>
					<tbody>
						{rooms.map(room => (
							<tr
								key={room.id}
								className={`room-item ${room.id === selectedRoom ? 'active' : ''}`}
								onClick={() => onJoinRoom(room.id)}
							>
								<td>
									<span className="room-star" data-star={room.starId} />
								</td>
								<td>
									<span className="room-world-id" data-star={room.starId}>
										{room.worldId}
									</span>
								</td>
								<td>
									<span className="room-flag" data-flag={room.flagId} />
								</td>
								<td>
									<span className="room-user-count">{room.userCount}</span>
								</td>
								<td>
									<span className="room-name">{room.id}</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default RoomsListTab;
