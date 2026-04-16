import { ApiResponseBase } from '@shared/services/syncuprocks/Types';
import { Message, MessageData } from './MessageTypes';
import { getUnixTime } from 'date-fns'
import { LogError, LogInfo, LogObject } from '@shared/services/Logger';

export class Messages {
	static async getMessages() {
		const data = await fetch(`/api/legacy/message/read`, { method: "POST", headers: { "Content-Type": "application/json" }});
		const response: ApiResponseBase<Message[]> = await data.json()
		if (response.success)
			return response.data!;

		LogError(`Failed to get messages: ${response.errorMessage}`);
		return []
	}

	static async sendMessage(toUserId:string, data: MessageData) {
		const msg: Message = {
			toUserId: toUserId,
			// Backend will populate - ensuring we cannot lie about who we are
			fromUserId: '00000000-0000-0000-0000-000000000000',
			fromUsername: '',
			sentUtc: getUnixTime(new Date()),
			messageData: data
		};

		LogInfo(`Trying to connect: ${JSON.stringify(msg)}`)
		await fetch(`/api/legacy/message/send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(msg)});
	}
}
