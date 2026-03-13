import { PlayIcon } from '@/Constants/AppIcons';
import { ActionType, PeerOperationMode } from '@/Support/Stores/Types';
import { Log } from '@/Support/Utilities/Logger';
import { SetOverview } from '@/Types/Sets/SetOverview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { SetQueryResponse } from './Types';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { dispatch } from '@/Support/Stores/PrimaryStore';

interface IProp {
	mode: PeerOperationMode
}

const SetList = ({mode}:IProp) => {
	const navigate = useNavigate();

	useEffect(() => {
		const timeout = setTimeout(() => {
			dispatch({type: ActionType.UPDATE, update: {peerMode: mode}});
		}, 1);

		return () => {
			clearTimeout(timeout);
		}
	}, [mode]);

	const { data, isLoading } = useQuery(['my.setlist'], async () => {
		const data = await fetch(`/api/sets`, { method: "GET", headers: { "Content-Type": "application/json" }});
		const json: SetQueryResponse = await data.json()
		return json.sets;
	},
	{
		refetchInterval: 60000,
		staleTime: 60000,
		cacheTime: 60000,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		enabled: true,
	});

	const playSet = (set:SetOverview) => {
		Log('verbose', `Staring set ${set.name}`);
		navigate(`/${mode}/sets/${set.id}`);
	}

	// const songName = (song: SongOverview) => {
	// 	let name = song.title;
	// 	if (song.artist) {
	// 		let metadata = song.artist;
	// 		if (song.year) {
	// 			metadata += ` ${song.year}`;
	// 		}

	// 		name = `${name} (${metadata})`;
	// 	}

	// 	return name;
	// } 

	// TODO: Make bootstrap cards
	const getSetDetails = (set:SetOverview) => {
		return (
			<Button variant='dark' style={{padding: '2px 10px 2px 10px'}} onClick={() => playSet(set)}>
				<FontAwesomeIcon icon={PlayIcon} size='lg'/>
				{` ${set.name} : ${set.songs.length} songs 5:23:12\x20hrs`}
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
