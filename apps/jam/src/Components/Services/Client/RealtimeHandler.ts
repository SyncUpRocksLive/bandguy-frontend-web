import { BroadcastMessage } from "@/Support/Stores/MessageBus";
import { LogError, LogInfo } from "@shared/services/Logger";
import { Client } from "@/Types/Client";
import { RProtocolAction, RProtocolMessageType } from "@/Types/JProtocol/Types";
import { MessageBusActionType } from "@/Types/MessageBus";

export function deleteGuestRealtimeChannel(client: Client) {
	if (client.peerChannelRealtime) {
		client.peerChannelRealtime.close();
		client.peerChannelRealtime.onopen = null;
		client.peerChannelRealtime.onclose = null;
		client.peerChannelRealtime.onerror = null;
		client.peerChannelRealtime.onmessage = null;
		client.peerChannelRealtime = undefined;
	}
}

export function createGuestRealtimeChannel(client: Client) {
	client.peerChannelRealtime = client.peerConnection!.createDataChannel('sync', {
		id: 1,
		//maxPacketLifeTime: 100,
		maxRetransmits: 0,
		negotiated: true,
		ordered: false,
		protocol: 'rpro'
	});

	// If messages come out of order, discard - only look at latest messages
	let lastSequence = -1;
	
	client.peerChannelRealtime.onopen = () => { LogInfo(`_peerChannelRealtime.onopen`); };
	client.peerChannelRealtime.onclose  = () => { LogInfo(`_peerChannelRealtime.onclose`); };
	client.peerChannelRealtime.onerror = () => { LogInfo(`_peerChannelRealtime.onerror`); };
	client.peerChannelRealtime.onmessage = (e) => { 
		try {
			const message = <RProtocolMessageType>JSON.parse(e.data)
			// TODO: Handle wrap around test
			if (message && message.ver === 1 && message.seq > lastSequence) {
				lastSequence = message.seq;
				switch(message.typ) {
					case RProtocolAction.HostPlayClockTick:
						//console.log(`Got server tick: ${message.tick}`);
						//TODO
						BroadcastMessage({data: {type: MessageBusActionType.PLAY_CLOCK_TICK, tick: message.tick}})
						break;
					default:
						break;
				}
			} else {
				LogError(`GUEST: peerChannelRealtime onmessage discarded message: seq:${message?.seq}. Last Seq: ${lastSequence}`);	
			}
		} catch(error) {
			LogError(`GUEST: peerChannelRealtime onmessage Error ${JSON.stringify(error)}\nData: ${e.data}`);
		}
	};
}
