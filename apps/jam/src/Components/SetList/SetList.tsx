import { PlayIcon } from '@/Constants/AppIcons';
import { ActionType, PeerOperationMode } from '@/Support/Stores/Types';
import { Log } from '@/Support/Utilities/Logger';
import { SetOverview } from '@/Types/Sets/SetOverview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { dispatch, pickStore } from '@/Support/Stores/PrimaryStore';
import { ApiResponseBase } from './Types';

interface IProp {
	mode: PeerOperationMode
}

const SetList = ({mode}:IProp) => {
	const { user } = pickStore<'user'>();
	const navigate = useNavigate();

	useEffect(() => {
		const timeout = setTimeout(() => {
			dispatch({type: ActionType.UPDATE, update: {peerMode: mode}});
		}, 1);

		return () => {
			clearTimeout(timeout);
		}
	}, [mode]);

	const { data, isLoading } = useQuery({
		queryKey: ['my.setlist', user?.userId ?? 'none'],
		queryFn: async () => {
			Log('verbose', `my.setlist: downloading for userId=${user.userId}`);
			const data = await fetch(`/api/legacy/user/sets/overview/${user.userId}`, { method: "GET", headers: { "Content-Type": "application/json" }});
			const response: ApiResponseBase<SetOverview[]> = await data.json();
			Log('verbose', `my.setlist: ${JSON.stringify(response)}`);
			return response.data ?? [];
		},
		refetchInterval: 600000,
		staleTime: 0,
		// TODO ??? cacheTime: 60000,
		refetchOnMount: 'always',
		refetchOnWindowFocus: true,
		enabled: user?.userId !== undefined,
	});

	const playSet = (set:SetOverview) => {
		const destination = `/${mode.toLowerCase()}/sets/${set.id}`;
		Log('verbose', `Starting set=${set.name} route=${destination}`);
		navigate(destination);
	}

	// TODO: Make bootstrap cards
	const getSetDetails = (set:SetOverview) => {
		return (
			<Button variant='dark' style={{padding: '2px 10px 2px 10px'}} onClick={() => playSet(set)}>
				<FontAwesomeIcon icon={PlayIcon} size='lg'/>
				{` ${set.name} : ${set.songs.length} songs 00:00:00\x20hrs`}
			</Button>
		)
	};

	return (
	<div style={{flex: '1', display: 'flex', flexDirection: 'column', margin: '1px', padding: '5px', overflowY: 'auto'}}>
		<div style={{background: 'rgba(255,255,255,.7)', padding: '0px', justifyContent: 'center', alignItems: 'center'}}>
			<p style={{fontWeight: 'bold', margin: '0px', padding: '2px'}}>Set List</p>
		</div>

		<div style={{flex: '1', display: 'flex', flexDirection: 'row', background: 'rgba(0,0,0,.9)', padding: '10px', color: 'white', overflowY: 'auto'}}>
			{isLoading && <div>Loading...</div>}
			{data && (
				<>
					{data.map((s) => {
						return (<div style={{width: '200px', height: '100px', margin: '4px'}} key={s.id}>{getSetDetails(s)}</div>)
					})}
				</>
			)}
		</div>
	</div>
	)
}

export default SetList;
