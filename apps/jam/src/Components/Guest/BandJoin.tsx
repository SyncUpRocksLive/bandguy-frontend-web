import { JamChannelDetail } from '@/Support/Services/JamChannels';
import { dispatch, pickStore } from '@/Support/Stores/PrimaryStore';
import { ActionType } from '@/Support/Stores/Types';

const BandJoin = () => {
	const { availableRemoteChannels } = pickStore<'availableRemoteChannels'>();

	// Reduce to single entry per host
	const channelData = (availableRemoteChannels ?? []).reduce((accumulator: JamChannelDetail[], channel: JamChannelDetail) => {
		if (!accumulator.find(x => x.hostUser === channel.hostUser)) {
			accumulator.push(channel);
		}
		return accumulator;
	}, []);

	async function joinChannel(channel: JamChannelDetail) {
		dispatch({type: ActionType.UPDATE, update: { connectedChannelDetail: channel}});
	}

	return (<>
		<div style={{background: 'rgba(255,255,255,.7)', padding: '2px', justifyContent: 'center',alignItems: 'center'}}>
			<p style={{fontWeight: 'bold', margin: '0px', padding: '0px'}}>Band List</p>
		</div>
		<div style={{background: 'rgba(0,0,0,.9)', padding: '0px', height: '100%', color: 'white', overflowY: 'auto'}}>
			WAITING... Not yet Implemented...
			<br />
			Enter Code:
			<br />
			Scan Qr:
			<br />
			<b>Available Jam Rooms:</b>
			<ul>
				{ channelData && Object.entries(channelData).map(([key, value]) =>
					(<li key={key}><button type='button' onClick={() => joinChannel(value)}>Join Band '{value.friendlyName}'</button></li>)
				)}
			</ul>
		</div>
	</>)
}

export default BandJoin;
