import { ApiResponseBase } from "@/Components/SetList/Types";
import { LogObject, LogVerbose } from "../Utilities/Logger";

export interface JamChannelDetail {
	hostUser: string;
	identifier: string;
	friendlyName: string;
	timestamp: number;
}

export class JamChannels {
	static async getChannelList() {
		const data = await fetch(`/api/legacy/channel`, { method: "GET", headers: { "Content-Type": "application/json" }});
		const json: ApiResponseBase<JamChannelDetail[]> = await data.json()
		return json.data!;
	}

	static async createChannel(detail: JamChannelDetail) {
		const data = await fetch(`/api/legacy/channel/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(detail)});
		const response: ApiResponseBase<JamChannelDetail> = await data.json()
		return response.data;
	}

	static async deleteChannel(detail: JamChannelDetail) {
		await fetch(`/api/legacy/channel/delete/${detail.identifier}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
	}
}
