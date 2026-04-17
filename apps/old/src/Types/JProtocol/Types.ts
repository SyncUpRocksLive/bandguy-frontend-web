import { StoreItems } from "@/Support/Stores/Types";

export enum JProtocolAction {
	StateSyncPush = 'StateSyncPush',
	StateUpdatePush = 'StateUpdatePush',
	HostPlayClockTick = 'HostPlayClockTick',
}

export type JProtocolMessageType = 
	|{version: 1, type: JProtocolAction.StateSyncPush, state: StoreItems}
	|{version: 1, type: JProtocolAction.StateUpdatePush, state: Partial<StoreItems>}
	|{version: 1, type: JProtocolAction.HostPlayClockTick, tick: number}
;

export interface JProtocolMessage {
	data: JProtocolMessageType;
}

// Compact messages for realtime messages
export enum RProtocolAction {
	HostPlayClockTick = 'hpct',
}

export type RProtocolMessageType = 
	|{ver: 1, seq: number, typ: RProtocolAction.HostPlayClockTick, tick: number}
;

// export interface RProtocolMessage {
// 	d: RProtocolMessageType;
// }
