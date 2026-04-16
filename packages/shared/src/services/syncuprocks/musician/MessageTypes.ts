export enum MessageDataType {
	RTCSessionDescription = 'RTCSessionDescription',
	RTCIceCandidate = 'RTCIceCandidate',
	Text = 'Text'
}

export type MessageData =
	|{type: MessageDataType.RTCSessionDescription, value: RTCSessionDescription}
	|{type: MessageDataType.RTCIceCandidate, value: RTCIceCandidate}
	|{type: MessageDataType.Text, value: string}

export interface Message {
	toUserId: string;
	fromUserId: string;
	fromUsername: string;
	sentUtc: number;
	messageData: MessageData;
}
