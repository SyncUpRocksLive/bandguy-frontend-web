import { BroadcastMessage } from "@/Support/Stores/MessageBus";
import { getStore, dispatch } from "@/Support/Stores/PrimaryStore";
import { PeerOperationMode, ActionType } from "@/Support/Stores/Types";
import { LogError, LogInfo } from "@shared/services/Logger";
import { Client, ConnectState } from "@/Types/Client";
import { JProtocolAction, JProtocolMessage } from "@/Types/JProtocol/Types";
import { MessageBusActionType } from "@/Types/MessageBus";

export function deleteClientSignallingChannel(client: Client) {
	if (client.peerChannelSignalling) {
		LogInfo(`HOST: Deleting client peerChannelSignalling ${client.name}`);
		client.peerChannelSignalling.onmessage = null;
		client.peerChannelSignalling.onerror = null;
		client.peerChannelSignalling.onclose  = null;
		client.peerChannelSignalling.onopen = null;
		client.peerChannelSignalling.close();
		client.peerChannelSignalling = undefined;
	}
}

export function createClientSignallingChannel(client: Client) {
	client.peerChannelSignalling = client.peerConnection!.createDataChannel('signalling', {
		id: 2,
		maxRetransmits: 10,
		negotiated: true,
		ordered: true,
		protocol: 'jpro'
	});

	client.peerChannelSignalling.onopen = () => { 
		LogInfo(`HOST: peerChannelSignalling.onopen ${client.name}`);
		const store = getStore();
		if (!store.user || store.peerMode !== PeerOperationMode.Host) {
			return;
		}

		client.state = ConnectState.CONNECTED;
		if (!store.connectedUsers.find((x) => x.userId === client.userId)) {
			const existingUsers = store.connectedUsers.map((x) => x);
			existingUsers.push({
				userId: client.userId,
				username: client.name,
				displayName:  client.name,
				isBandLeader:  false,
				role:  'unset',
				client:  client,
			});

			dispatch({type: ActionType.UPDATE, update: {connectedUsers: existingUsers}});
		}

		// Send current state...
		if (client.peerChannelSignalling) {
			const message: JProtocolMessage = {
				data: { version: 1, type: JProtocolAction.StateSyncPush, state: store }
			};
			client.peerChannelSignalling.send(JSON.stringify(message));
		}
	};

	client.peerChannelSignalling.onclose  = () => {
		LogInfo(`HOST: client signal channel onclose ${client.name}`);
		client.state = ConnectState.DISCONNECTED;
		BroadcastMessage({data: { type: MessageBusActionType.PEER_CLOSED, client }});
	};

	client.peerChannelSignalling.onerror = () => { LogInfo(`HOST: client signal channel onerror`); };

	client.peerChannelSignalling.onmessage = (e) => { 
		LogInfo(`HOST: client signal channel onmessage: ${client.name} len=${e.data.length}`);
		//dispatch({type: ActionType.UPDATE, update: { hostRoute: e.data }});
		try {
			const message = <JProtocolMessage>JSON.parse(e.data)
			if (message.data.version === 1) {
				//
			}
		} catch(error) {
			LogError(`HOST: client signal channel onmessage Error ${JSON.stringify(error)}\nData: ${e.data}`);
		}
	};
}

