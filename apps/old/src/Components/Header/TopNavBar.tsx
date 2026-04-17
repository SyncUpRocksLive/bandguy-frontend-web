import { pickStore } from '@/Support/Stores/PrimaryStore';
import { PeerOperationMode } from '@/Support/Stores/Types';
import { Link } from 'react-router';
import HostModeStatus from './HostModeStatus';
import GuestModeStatus from './GuestModeStatus';
import UserProfile from './UserProfile';
import Configuration from './Configuration';

function TopNavBar() {
	const { user, peerMode } = pickStore<'user'|'peerMode'>();

	if (!user) {
		return <header></header>
	}

	return (
		<header>
			<div style={{padding: '3px 10px 0 10px', width: '100%', display: 'flex', flexDirection: 'row', color: 'white', background: 'rgba(155,155,155,.1)', justifyContent: 'center', alignItems: 'center'}}>
				<a href="/">HOME</a> - 
				<Link to='/'>JAM</Link> -
				<a href="/mixingroom">MIXING ROOM</a> 
				
				<div style={{userSelect: 'none',}}>
					{` - ${peerMode}`}
				</div>

				<div style={{flex: 'auto', display: 'flex', flexDirection: 'row', columnGap: '0', justifyContent: 'right', alignItems: 'right'}}>
					{peerMode === PeerOperationMode.Host && (<HostModeStatus />)}
					{peerMode === PeerOperationMode.Guest && (<GuestModeStatus />)}
					<Configuration />
					<UserProfile />
				</div>
			</div>
		</header>
	)
}

export default TopNavBar;
