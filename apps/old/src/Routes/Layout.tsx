import { Outlet } from 'react-router';
import { dispatch, pickStore } from '@/Support/Stores/PrimaryStore';
import TopNavBar from '@/Components/Header/TopNavBar';
import LoginForm from '@/Components/Login/Login';
import { ActionType, PeerOperationMode } from '@/Support/Stores/Types';
import { Log, LogVerbose } from '@shared/services/Logger';
import BandLeaderService from '@/Components/Services/Host/BandLeader';
import MessageChannelService from '@/Components/Services/MessageChannelService';
import { useQuery } from '@tanstack/react-query';
import { ApiResponseBase, LoggedInStatus } from '@/Components/SetList/Types';

const Layout = () => {
	const { user, peerMode } = pickStore<'user'|'peerMode'>();
	LogVerbose('Render Layout');

	const { isLoading } = useQuery({
		queryKey: ['login.state'],
		queryFn: async () => {
			Log('verbose', 'Checking login state...');
			const data = await fetch(`/api/auth/loggedin`, { method: "GET", headers: { "Content-Type": "application/json" }});
			const response: ApiResponseBase<LoggedInStatus> = await data.json();
			Log('verbose', `Checking login state... ${data.status}`);
			if (data.status === 401 || response.data.isLoggedIn === false || !response.data.userId || !response.data.username) {
				Log('verbose', 'Checking login state... Unauthorized');
				// TODO: Capture logInUrl
				return {};
			}
			else if (!response.success) {
				Log('verbose', `Checking login state... unknown failure ${response.errorMessage}`);
				// TODO: Capture logInUrl
				return {};
			}

			// TODO: Capture logout URL logOutUrl
			dispatch({type: ActionType.UPDATE, update: { user: { userId: response.data.userId, displayName: response.data.userProfileName, username: response.data.username } }});
			return response;
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
