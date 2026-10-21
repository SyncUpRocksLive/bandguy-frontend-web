import { Message, MessageData } from './MessageTypes';
import { getUnixTime } from 'date-fns'

export class Messages {
	static async sendMessage(fromUserConnectionIdentifier: string, channelIdentifier: string, toUserId: string, toUserConnectionIdentifier: string, data: MessageData) {
		await fetch(`/api/musician/jam/message/send/${channelIdentifier}`, { 
			method: "POST", 
			headers: { "Content-Type": "application/json" }, 
			body: JSON.stringify({
				fromUserConnectionIdentifier: fromUserConnectionIdentifier,
				toUserId: toUserId,
				toUserConnectionIdentifier: toUserConnectionIdentifier,
				sentUtc: getUnixTime(new Date()),
				messageData: data
		})});
	}
}
