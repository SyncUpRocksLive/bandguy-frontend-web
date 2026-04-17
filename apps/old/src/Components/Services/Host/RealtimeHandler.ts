import { LogInfo } from "@shared/services/Logger";
import { Client } from "@/Types/Client";

export function deleteClientRealtimChannel(client: Client) {
	if (client.peerChannelRealtime) {
		LogInfo(`HOST: Deleting client peerChannelRealtime ${client.name}`);
		client.peerChannelRealtime.onmessage = null;
		client.peerChannelRealtime.close();
		client.peerChannelRealtime = undefined;
	}
}

export function createClientRealtimChannel(client: Client) {
	client.peerChannelRealtime = client.peerConnection!.createDataChannel('sync', {
		id: 1,
		//maxPacketLifeTime: 100,
		maxRetransmits: 0,
		negotiated: true,
		ordered: false,
		protocol: 'rpro'
	});
	//client.peerChannelRealtime.onopen = () => { LogInfo(`_peerChannelRealtime.onopen`); };
	//client.peerChannelRealtime.onclose  = () => { LogInfo(`_peerChannelRealtime.onclose`); };
	//client.peerChannelRealtime.onerror = () => { LogInfo(`_peerChannelRealtime.onerror`); };
	client.peerChannelRealtime.onmessage = (e) => { 
		LogInfo(`HOST: peerChannelRealtime onmessage: ${e.data}`);
	};
}
