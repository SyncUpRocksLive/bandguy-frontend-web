import { useEffect, useRef } from "react";
import { Log } from '@shared/services/Logger';
import { JamChannels } from "@shared/services/syncuprocks/musician/JamChannels";
import { getStore } from '@/Support/Stores/PrimaryStore';
import { IHostConnectionFlow, ServerFlow } from "./ServerFlow";

/* Has no UI component - manages application state when in Host/BandLeader mode */
const BandLeaderService = () => {
	const flow = useRef<IHostConnectionFlow>(new ServerFlow());

	useEffect(() => {
		// Setup
		Log('info', 'Setting up BandLeaderService');
		const newChannel = Math.floor(Math.random() * 10000);
		const store = getStore();
		const username = store.user?.username;
		if (!username) {
			return;
		}

		const channelCreate = async (channel: number) => {
			Log('info', `Creating new channel : ${username}`);
			await JamChannels.createChannel({
				hostUser: "00000000-0000-0000-0000-000000000000",
				identifier: channel.toString(),
				friendlyName: `${username}-${channel}`,
				timestamp: 0
			});
		};

		const channelDelete = async (channel: number) => {
			Log('info', `Deleting channel : ${username}`);
			await JamChannels.deleteChannel({
				hostUser: username,
				identifier: channel.toString(),
				friendlyName: '',
				timestamp: 0
			});
		};

		channelCreate(newChannel).catch((e) => console.log(e));
		flow.current.Listen();

		return () => {
			// TearDown
			Log('info', 'Tearing down BandLeaderService');
			channelDelete(newChannel).catch((e) => console.log(e));
			flow.current.Stop();
		}
	}, []);

	return (
		<></>
	)
}

export default BandLeaderService;
