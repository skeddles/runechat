import Tooltip from '../Tooltip';

interface UserListTabProps {
	users: string[];
	onShowToast: (message: string) => void;
}

function UserListTab({ users, onShowToast }: UserListTabProps) {
	return (
		<div className="user-list-tab">
			<Tooltip text="List of users in this chatroom">
				<h2>Players</h2>
			</Tooltip>
			<div className="user-list">
				{users.map(user => (
					<div key={user} className="user-item">
						{user}
					</div>
				))}
			</div>
			<button className="report-button" onClick={() => onShowToast('get over it')}>Report Abuse</button>
		</div>
	);
}

export default UserListTab;
