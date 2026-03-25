import { Outlet } from 'react-router';
import { dispatch, pickStore } from '@/Support/Stores/PrimaryStore';
import TopNavBar from '@/Components/Header/TopNavBar';
import LoginForm from '@/Components/Login/Login';
import { ActionType, PeerOperationMode } from '@/Support/Stores/Types';
import { Log, LogVerbose } from '@/Support/Utilities/Logger';
import BandLeaderService from '@/Components/Services/Host/BandLeader';
import MessageChannelService from '@/Components/Services/MessageChannelService';
import { useQuery } from '@tanstack/react-query';

const Layout = () => {
	const { user, peerMode } = pickStore<'user'|'peerMode'>();
	LogVerbose('Render Layout');

	const { isLoading } = useQuery({
		queryKey: ['login.state'],
		queryFn: async () => {
			Log('verbose', 'Checking login state...');
			const data = await fetch(`/api/auth/loggedin`, { method: "GET", headers: { "Content-Type": "application/json" }});
			const json = await data.json();
			Log('verbose', `Checking login state... ${data.status} ${JSON.stringify(json)}`);
			if (data.status === 401 || json.data.isLoggedIn === false) {
				Log('verbose', 'Checking login state... Unauthorized');
				// TODO: Capture logInUrl
				return {};
			}
			else if (!json.success || !json.data || !json.data.userProfileName) {
				Log('verbose', `Checking login state... unknown failure ${json.errorMessage}`);
				// TODO: Capture logInUrl
				return {};
			}

			// TODO: Capture logout URL logOutUrl
			dispatch({type: ActionType.UPDATE, update: { user: { username: json.data.userProfileName, displayName: json.data.userProfileName } }});
			return json;
		},
		staleTime: Infinity,
		refetchInterval: 0,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		enabled: !user
	});

	if (isLoading) {
		return <></>
	}

	return (
		<div style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'clip'}}>
			<TopNavBar/>
			{user && peerMode === PeerOperationMode.Host && (<BandLeaderService/>)}
			{user && peerMode !== PeerOperationMode.Solo && (<MessageChannelService/>)}
			
			{!user && <LoginForm />}

			{user && (<Outlet />)}
		</div>
	)
}

export default Layout
