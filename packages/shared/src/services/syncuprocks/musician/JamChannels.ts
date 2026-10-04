import { ApiResponseBase } from "@shared/services/syncuprocks/Types";

export interface JamChannelDetail {
	hostUser: string;
	identifier: string;
	friendlyName: string;
	timestamp: number;
	code: string;
}

export class JamChannels {
	static async getChannelList() {
		const data = await fetch(`/api/musician/jam/channel`, { method: "GET", headers: { "Content-Type": "application/json" }});
		const json: ApiResponseBase<JamChannelDetail[]> = await data.json()
		return json.data!;
	}

	static async createChannel(detail: JamChannelDetail) {
		const data = await fetch(`/api/musician/jam/channel/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(detail)});
		const response: ApiResponseBase<JamChannelDetail> = await data.json()
		return response.data;
	}

	static async deleteChannel(identifier: string) {
		await fetch(`/api/musician/jam/channel/delete/${identifier}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
	}
}
