import { StoreItems } from "@/Support/Stores/Types";
import { Client } from "./Client";
import { Message } from "@shared/services/syncuprocks/musician/MessageTypes";

export enum MessageBusActionType {
	MESSAGE = 'MESSAGE',
	KICKOUT = 'KICKOUT',
	PEER_CLOSED = 'PEER_CLOSED',
	STATE_UPDATE = 'STATE_UPDATE',
	PLAY_CLOCK_TICK = 'PLAY_CLOCK_TICK',
}

export type MessageBusEventType = 
|{ type: MessageBusActionType.MESSAGE, message: Message[] }
|{ type: MessageBusActionType.KICKOUT, userId: string, instance: string }
|{ type: MessageBusActionType.PEER_CLOSED, client: Client }
|{ type: MessageBusActionType.STATE_UPDATE, state: StoreItems }
|{ type: MessageBusActionType.PLAY_CLOCK_TICK, tick: number };

export interface MessageBusEvent {
	sender?: unknown;
	data: MessageBusEventType;
}
