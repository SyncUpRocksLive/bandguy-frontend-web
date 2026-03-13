import { SongOverview } from "@/Types/Sets/SetOverview";
import { SongTrack, TrackFormat } from "@/Types/Sets/SongDetail";
import { useEffect, useRef, useState } from "react";
import { getSongStore } from "@/Support/Stores/SongStore";
import { LogError } from "@/Support/Utilities/Logger";
import { lyricsParser } from "@/Support/Utilities/LyricsFileParser";
import { Lyric } from "@/Types/Lyrics";
import BasicLyricViewer from "@/Components/Viewer/BasicLyricViewer";
import { pickStore } from "@/Support/Stores/PrimaryStore";
import { PeerOperationMode, SongPlayStatus } from "@/Support/Stores/Types";
import { msToHMS } from "@/Support/Utilities/DisplayHelpers";
import { BroadcastMessage, IMessageBusHandler, RemoveMessageHandler, SubscribeMessageHandler } from "@/Support/Stores/MessageBus";
import { MessageBusActionType, MessageBusEvent } from "@/Types/MessageBus";
import { Metronome } from "@/Components/Viewer/Metronome";

interface IProps {
	song: SongOverview;
	tracks: SongTrack[];
}

type LoadedTrackDataType =
|{id: string, loaded: false, error: true, message: string }
|{id: string, loaded: true, format: TrackFormat.Lyric, lyrics: Lyric};

function updateLoadedList(loaded: LoadedTrackDataType, current: LoadedTrackDataType[], update: (v:LoadedTrackDataType[]) => void) {
	const newList = current.filter((x) => x.id !== loaded.id);
	newList.push(loaded);
	update(newList);
	return newList;
}

class SongViewSync implements IMessageBusHandler {
	_mode: PeerOperationMode;
	_localTick: number;
	_setTick: (tick: number) => void;
	_timer: NodeJS.Timeout | undefined;
	_started: number;

	constructor(mode: PeerOperationMode, setTick: (tick: number) => void) {
		this._mode = mode;
		this._setTick = setTick;
		this._localTick = 0;
		this._started = 0;
	}

	start(maxDuration: number): void {
		if (this._mode === PeerOperationMode.Guest) {
			console.log('listen for ticks');
			SubscribeMessageHandler(this);
		}

		this._started = Date.now();
		this._timer = setInterval(() => {
			this._localTick = Date.now() - this._started; // milliseconds elapsed since start

			// TODO: Check for end
			if (this._localTick > maxDuration) {
				this._started = Date.now();
				this._localTick = 0;
			}

			if (this._mode === PeerOperationMode.Host) {
				// We need to send our clock
				BroadcastMessage({data: {type: MessageBusActionType.PLAY_CLOCK_TICK, tick: this._localTick}})
			}

			this._setTick(this._localTick);
		}, 100);
	}

	stop(): void {
		RemoveMessageHandler(this);

		if (this._timer) {
			clearInterval(this._timer);
			this._timer = undefined;
		}
	}

	messageBusEvent(event: MessageBusEvent): void {
		//console.log('event');
		if (this._mode !== PeerOperationMode.Guest) {
			return;
		}

		switch(event.data.type) {
			case MessageBusActionType.PLAY_CLOCK_TICK: {
				const diff = event.data.tick - this._localTick;
				// TODO: Take into account latency (sending messages from host to us could take many ms - and we are actually behind)
				// Don't want to immediately snap to server time, but let's get closer
				const adjust = Math.trunc(diff / 2);

				console.log(`S: ${event.data.tick} U:${this._localTick}, A:${adjust}`);
				// We just move our start time around, next tick will calc delta from this
				this._started -= adjust;
				break;
			}
			default:
				break
		}
	}
}

const SongView = ({song, tracks}: IProps) => {
	const [tick, setTick] = useState(0);
	const [duration, setDuration] = useState(0);
	const { songPlayStatus, peerMode } = pickStore<'songPlayStatus'|'peerMode'>();
	const [loadedData, setLoadedData] = useState<LoadedTrackDataType[]>([]);
	const syncRef = useRef(new SongViewSync(peerMode, setTick));

	useEffect(() => {
		let maxDuration = 0;

		if (loadedData) {
			loadedData.forEach((s) => {
				if (s.loaded && s.lyrics.duration > maxDuration) {
					maxDuration = s.lyrics.duration;
					setDuration(maxDuration);
				}
			})
		}

		const sync = syncRef.current;
		if (songPlayStatus === SongPlayStatus.Play && loadedData) {
			sync.start(maxDuration);
		}

		return () => {
			sync.stop();
		};
	}, [songPlayStatus, loadedData, peerMode]);

	useEffect(() => {
		let active = true;
		const songStore = getSongStore();
		let dataArray: LoadedTrackDataType[] = [];

		const loadTracks = async () => {
			tracks.forEach(async (t) => {
				const loadedTrack = await songStore.get(song.id, t.id);
				if (!active) {
					return;
				}

				if (!loadedTrack) {
					dataArray = updateLoadedList({id: `${song.id}-${t.id}`, loaded: false, error: true, message: 'Could not load track from store'}, dataArray, setLoadedData);
				} else if (loadedTrack.format === TrackFormat.Lyric) {
					const lrcData = await loadedTrack.data.text();
					if (!active) {
						return;
					}

					const lyrics = lyricsParser(lrcData);
					dataArray = updateLoadedList({id: `${song.id}-${t.id}`, loaded: true,  format: loadedTrack.format, lyrics: lyrics}, dataArray, setLoadedData);
				} else {
					dataArray = updateLoadedList({id: `${song.id}-${t.id}`, loaded: false, error: true, message: 'Format not yet supported'}, dataArray, setLoadedData);
				}
			})
		};

		loadTracks().catch((e) => LogError(e));

		return () => {
			active = false;
		}
	}, [song, tracks]);

	const trackElement = (track: SongTrack) => {
		if (track.format === TrackFormat.Lyric) {
			const data = loadedData.find((l) => l.id === `${song.id}-${track.id}`);
			if (!data) {
				return <>LOADING...</>
			}

			if (data.loaded && data.format === track.format)
				return <BasicLyricViewer lyrics={data.lyrics} tick={tick} />
			else if (!data.loaded)
				return <>{data.message}</>
		}

		return <>Unsupported</>
	};

	return <div style={{height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column'}}>
		<div style={{fontSize: '1em', lineHeight: '20px'}}>
			<input type='range' value={tick} min={0} step={40} max={544289} onChange={(e) => e.currentTarget.value} />
			{msToHMS(tick)} : {duration > 0 && msToHMS(duration)} [mm:ss]
		</div>
		
		{tracks.map((t) => {
			return (
			<div key={t.id} style={{background: 'black', margin: '4px'}}>
				Track {t.id}, {t.description}, {t.type}, {t.format}
				{trackElement(t)}
			</div>)
		})}

		<Metronome tick={tick} />
	</div>
}

export default SongView;
