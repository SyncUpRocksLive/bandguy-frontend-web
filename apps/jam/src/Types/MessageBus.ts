import { StoreItems } from "@/Types/Types";
import { Client } from "./Client";

// Placeholder - TODO: import from shared
interface Message {
	id: string;
	content: string;
}

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
