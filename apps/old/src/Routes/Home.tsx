import { useEffect } from "react";
import { Button } from "react-bootstrap"
import { useNavigate } from "react-router"
import { dispatch, pickStore } from '@/Support/Stores/PrimaryStore';
import { ActionType, PeerOperationMode } from '@/Support/Stores/Types';
import { Log, LogError } from "@shared/services/Logger";
import { getSongStore } from '@/Support/Stores/SongStore';

const Home = () => {
	const { peerMode } = pickStore<'peerMode'>();
	const navigate = useNavigate();
	const songStore = getSongStore();

	useEffect(() => {
		const initStartup = async () => {
			Log('verbose', 'Starting up IndexDb Services...');
			await songStore.initialize();
		};

		if (peerMode !== PeerOperationMode.Solo) {
			Log('verbose', 'Resetting Peer Mode');
			dispatch({type: ActionType.UPDATE, update: {peerMode: PeerOperationMode.Solo}});
		}

		initStartup().catch((error) => LogError(`${error}`));
	}, []);

	return (
		<div>
			<Button onClick={() => navigate('solo/sets')}>Jam Solo</Button>
			<Button onClick={() => navigate('host/sets')}>Lead a band!</Button>
			<Button onClick={() => navigate('guest')}>Join a band!</Button>
		</div>
	)
}

export default Home
