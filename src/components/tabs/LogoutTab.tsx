import { useNavigate } from 'react-router-dom';
import Tooltip from '../Tooltip';

interface LogoutTabProps {
	onLogout: () => void;
}

function LogoutTab({ onLogout }: LogoutTabProps) {
	const navigate = useNavigate();

	const handleLogout = () => {
		onLogout();
		navigate('/');
	};

	return (
		<div className="logout-tab">
			<h2>Logout</h2>
			<p>
				When you have finished playing RuneChat, always use the button below to logout safely.
			</p>
			<div className="logout-button-container">
				<Tooltip text="Log Out of RuneChat">
					<button
						onClick={handleLogout}
						className="logout-button"
					>
						Click here to logout
					</button>
				</Tooltip>
			</div>
		</div>
	);
}

export default LogoutTab;
