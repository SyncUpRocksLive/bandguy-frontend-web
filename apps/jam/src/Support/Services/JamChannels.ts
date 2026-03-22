export interface JamChannelDetail {
	hostUser: string;
	identifier: string;
	friendlyName: string;
	timestamp: number;
}

export interface JamChannelListResponse {
	[keyof:string]: JamChannelDetail[];
}

export class JamChannels {
	static async getChannelList() {
		const data = await fetch(`/api/legacy/channel`, { method: "GET", headers: { "Content-Type": "application/json" }});
		const json: JamChannelListResponse = await data.json()
		return json;
	}

	static async createChannel(detail: JamChannelDetail) {
		const data = await fetch(`/api/legacy/channel/create/${detail.hostUser}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(detail)});
		const json: JamChannelListResponse = await data.json()
		return json;
	}

	static async deleteChannel(detail: JamChannelDetail) {
		await fetch(`/api/legacy/channel/delete/${detail.hostUser}/${detail.identifier}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
	}
}
