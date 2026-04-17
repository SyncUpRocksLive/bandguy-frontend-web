import { Client } from "@/Types/Client";
import { JamChannelDetail } from "@shared/services/syncuprocks/musician/JamChannels";

export interface UserState {
	displayName: string;
	username: string;
	userId: string;
}

export interface ConnectedUser extends UserState {
	isBandLeader: boolean;
	role: string; // Not Set, Drummer, Guitar, Vocals, ...
	client: Client;
}

export enum PeerOperationMode {
	Solo = 'Solo',
	Host = 'Host',
	Guest = 'Guest'
}

export enum SongPlayStatus {
	Play = 'Play',
	Pause = 'Pause',
	Stop = 'Stop'
}

export interface StoreItems {
	user?: UserState;
	peerMode: PeerOperationMode;
	connectedUsers: ConnectedUser[];
	availableRemoteChannels?: JamChannelDetail[];
	connectedChannelDetail?: JamChannelDetail;
	currentSetId?: number;
	currentSongId?: number;
	songPlayStatus: SongPlayStatus;
}

export enum ActionType {
	UPDATE = 'UPDATE',
}

export type StoreActions =
	|{ type: ActionType.UPDATE, update: Partial<StoreItems> }
;
