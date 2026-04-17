// Forked REPO https://github.com/pjcast/react-superstore.git
//import createStore from 'react-superstore'
import { createStore } from 'react-superstore'
import { PeerOperationMode, SongPlayStatus, StoreItems } from './Types';
import { PrimaryStoreReducer } from './PrimaryStoreReducer';

const intialStore: StoreItems = {
	connectedUsers: [],
	peerMode: PeerOperationMode.Solo,
	songPlayStatus: SongPlayStatus.Stop,
}

export const [useStore, dispatch, getStore, pickStore] = createStore(intialStore, PrimaryStoreReducer)
