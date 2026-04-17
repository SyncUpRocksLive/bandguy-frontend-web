import { dispatch, getStore, pickStore } from '@/Support/Stores/PrimaryStore';
import { ActionType, PeerOperationMode } from '@/Support/Stores/Types';
import { useEffect } from 'react';
import BandJoin from './BandJoin';
import SetView from '../SetList/SetView';
import FollowerService from '../Services/Client/FollowerService';

const Guest = () => {
	const { connectedChannelDetail } = pickStore<'connectedChannelDetail'>();

	useEffect(() => {
		const timeout = setTimeout(() => {
			const store = getStore();
			if (store.peerMode !== PeerOperationMode.Guest) {
				dispatch({type: ActionType.UPDATE, update: {peerMode: PeerOperationMode.Guest}});
			}
		}, 1);

		return () => {
			clearTimeout(timeout);
		}
	}, []);

	return (
		<>
			<FollowerService/>
			<div style={{flex: '1', display: 'flex', flexDirection: 'column', margin: '1px', padding: '5px', overflowY: 'auto'}}>
				{!connectedChannelDetail && <BandJoin/>}
				{connectedChannelDetail && <SetView mode={PeerOperationMode.Guest} />}
			</div>
		</>
	)
}

export default Guest;
