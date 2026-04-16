import { BroadcastMessage } from "@/Support/Stores/MessageBus";
import { dispatch } from "@/Support/Stores/PrimaryStore";
import { ActionType, StoreItems } from "@/Support/Stores/Types";
import { LogError, LogInfo } from "@shared/services/Logger";
import { Client, ConnectState } from "@/Types/Client";
import { JProtocolAction, JProtocolMessage } from "@/Types/JProtocol/Types";
import { MessageBusActionType } from "@/Types/MessageBus";

export function deleteGuestSignallingChannel(client: Client) {
	if (client.peerChannelSignalling) {
		client.peerChannelSignalling.close();
		client.peerChannelSignalling.onopen = null;
		client.peerChannelSignalling.onclose = null;
		client.peerChannelSignalling.onerror = null;
		client.peerChannelSignalling.onmessage = null;
		client.peerChannelSignalling = undefined;
	}
}

export function createGuestSignallingChannel(client: Client, setState: (state: ConnectState) => void) {
	
	client.peerChannelSignalling = client.peerConnection!.createDataChannel('signalling', {
		id: 2,
		//maxPacketLifeTime: 100,
		maxRetransmits: 5,
		negotiated: true,
		ordered: true,
		protocol: 'jpro'
	});
	
	client.peerChannelSignalling.onopen = () => { 
		LogInfo(`GUEST: peerChannelSignalling.onopen ${client.name}`);
		client.state = ConnectState.SYNCING;
		setState(ConnectState.SYNCING);
	};

	client.peerChannelSignalling.onclose  = () => { 
		LogInfo(`GUEST: peerChannelSignalling.onclose ${client.name}`);
		//TODO this.Disconnect();
		client.state = ConnectState.DISCONNECTED;
		setState(ConnectState.DISCONNECTED);
		BroadcastMessage({data: { type: MessageBusActionType.PEER_CLOSED, client }});
	};

	client.peerChannelSignalling.onerror = () => { LogInfo(`_peerChannelSignalling.onerror`); };
	client.peerChannelSignalling.onmessage = (e) => { 
		try {
			const message = <JProtocolMessage>JSON.parse(e.data)
			if (message && message.data && message.data.version === 1) {
				LogInfo(`GUEST: client signal channel onmessage: ${message.data.type}`);
				const event = message.data;

				switch(event.type) {
					case JProtocolAction.StateSyncPush:
						client.state = ConnectState.CONNECTED;
						setState(ConnectState.CONNECTED);
						updateLocalState(event.state);
						break;
					case JProtocolAction.StateUpdatePush:
						updateLocalState(event.state);
						break;
					default:
						break;
				}
			}
		} catch(error) {
			LogError(`GUEST: client signal channel onmessage Error ${JSON.stringify(error)}\nData: ${e.data}`);
		}
	};
}

function updateLocalState(newState: Partial<StoreItems>) {
	dispatch({type: ActionType.UPDATE, update: {
		// TODO: Wync our list with remote list
		//connectedUsers: event.state.connectedUsers
		currentSetId: newState.currentSetId,
		currentSongId: newState.currentSongId,
		songPlayStatus: newState.songPlayStatus
	}});
}
