import { ApiResponseBase } from "@shared/services/syncuprocks/Types";

export interface JamChannelDetail {
	hostUser: string;
	leaderIdentifier: string;
	identifier: string;
	friendlyName: string;
	timestamp: number;
	code: string;
}

export interface JamChannelDetailCreate {
	leaderIdentifier: string;
	friendlyName: string;
	code: string;
}

export interface JamChannelDetailJoin {
	identifier: string;
	code: string;
}

export class JamChannels {
	static async getChannelList() {
		const data = await fetch(`/api/musician/jam/channel`, { method: "GET", headers: { "Content-Type": "application/json" }});
		const json: ApiResponseBase<JamChannelDetail[]> = await data.json()
		return json.data!;
	}

	static async createChannel(create: JamChannelDetailCreate) {
		const data = await fetch(`/api/musician/jam/channel/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(create)});
		const response: ApiResponseBase<JamChannelDetail> = await data.json()
		return response;
	}

	static async joinChannel(join: JamChannelDetailJoin) {
		const data = await fetch(`/api/musician/jam/channel/join/${join.identifier}/${join.code}`, { method: "POST", headers: { "Content-Type": "application/json" }});
		const response: ApiResponseBase<JamChannelDetail> = await data.json()
		return response;
	}

	static async deleteChannel(identifier: string) {
		await fetch(`/api/musician/jam/channel/delete/${identifier}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
	}
}
