import { PlayIcon, PauseIcon, SkipIcon } from "@/Constants/AppIcons";
import { dispatch, pickStore } from "@/Support/Stores/PrimaryStore";
import { ActionType, PeerOperationMode, SongPlayStatus } from "@/Support/Stores/Types";
import { Log, LogError, LogInfo, LogVerbose } from "@/Support/Utilities/Logger";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "react-bootstrap";
import { useParams } from "react-router";
import { SongOverview, SetComplete, TrackFormat } from "@shared/services/syncuprocks/musician/Types";
import SongView from "./SongView";
import { ApiResponseBase } from "./Types";
import { getSongStore } from "@/Support/Stores/SongStore";

interface IProp {
	mode: PeerOperationMode
}

const SetView = ({mode}:IProp) => {
	const { currentSetId, currentSongId, songPlayStatus, connectedChannelDetail } = pickStore<'currentSetId'|'currentSongId'|'songPlayStatus'|'connectedChannelDetail'>();
	const { setId } = useParams();
	const songStore = getSongStore();

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (mode !== PeerOperationMode.Guest) {
				dispatch({type: ActionType.UPDATE, update: {currentSetId: parseInt(setId!, 10), peerMode: mode}});
			}
		}, 1);

		return () => {
			clearTimeout(timeout);
		}
	}, [mode, setId, currentSetId]);

	const { data, isLoading } = useQuery({
		queryKey: ['setlist', currentSetId],
		queryFn: async () => {
			LogVerbose(`Downloading set overview for setId=${currentSetId} host=${connectedChannelDetail?.hostUser ?? 'none'}`);
			const data = await fetch(`/api/legacy/user/sets/complete/${currentSetId}`, { method: "GET", headers: { "Content-Type": "application/json" }});
			const response: ApiResponseBase<SetComplete> = await data.json();

			return response.data;
		},
		refetchInterval: false,
		staleTime: 0,
		// TODO: ?? cacheTime: 60000,
		refetchOnMount: 'always',
		refetchOnWindowFocus: false,
		enabled: currentSetId !== undefined,
	});

	const { data: trackData, isLoading: loadingTracks } = useQuery({
		queryKey: ['song.track', currentSongId],
		queryFn: async () => {
			if (!data) {
				throw Error('Invalid Set State');
			}

			const set = data;
			const song = currentSongId;
			const songDetails = set.songs.find((s) => s.id === song);
			if (!songDetails) {
				throw Error(`Invalid Set State - song ${song} not found in set ${set.id}`);
			}

			songDetails.tracks.forEach(async (t) => {
				// Check if file already found...
				if (!(await songStore.exists(song!, t.id))) {
					LogInfo(`Downloading track information for ${set.id}/${song}/${t.id} ${t.name}`);
					let trackUrl = `/api/legacy/user/song/track/${currentSetId}/${t.id}/data`;
					if (t.format === TrackFormat.Lyric) {
						const trackResponse = await fetch(trackUrl, { method: "GET", headers: { 'pragma': 'no-cache', 'cache-control': 'no-store', 'cache': 'no-store' }});
						if (trackResponse.ok) {
							const track = await trackResponse.blob();
							if (!data) {
								throw Error(`Invalid Set Track '${song}' - no track data!`);
							}

							LogInfo(`Downloaded ${trackUrl}`);
							await songStore.put({
								data: track,
								format: t.format,
								songId: song!,
								trackId: t.id,
								timestamp: 1
							})
						}
					} else {
						LogError(`Unsupported Track Format: ${t.format}`);
					}
				} else {
					Log('verbose', `Found in cache: ${set.id}/${song}/${t.id} ${t.name}`);
				}
			});

			return songDetails;
		},
		staleTime: Infinity,
		// TODO: cacheTime: Infinity,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		enabled: currentSongId !== undefined && data != null,
	});

	useEffect(() => {
		if (!data) {
			return;
		}

		if (data.songs.length === 0) {
			dispatch({type: ActionType.UPDATE, update: {currentSongId: undefined}});
		} else {
			dispatch({type: ActionType.UPDATE, update: {currentSongId: data.songs[0].id}});
		}
	}, [data])

	useEffect(() => {
		// Note, must be secure context (https/localhost) to use
		// chrome://flags/#unsafely-treat-insecure-origin-as-secure
		// TODO: handle visibility switch - reenable (or pause playback)
		if (!navigator.wakeLock) {
			Log('error', 'navigator.wakeLock not available');
			return;
		}
		
		let wake: WakeLockSentinel | undefined;
		if (songPlayStatus === SongPlayStatus.Play) {
			navigator.wakeLock.request('screen').then((wl) => {
				wake = wl;
				Log('info', 'WakeLock acquired');
			})
			.catch((e) => {
				Log('error', `WakeLock.request failed: ${e}`);
			});
		}

		return () => {
			if (wake) {
				wake.release().then(() => {
					wake = undefined;
					Log('info', 'WakeLock released');
				})
				.catch((e) => Log('error', `WakeLock.release failed: ${e}`));
			}
		}
	}, [songPlayStatus]);

	if (isLoading) {
		return <>Loading Set...</>
	}

	if (!currentSongId) {
		return <></>
	}

	const loadSong = (song: SongOverview) => {
		dispatch({type: ActionType.UPDATE, update: {currentSongId: song.id, songPlayStatus: SongPlayStatus.Play}});
	};

	const playSong = () => {
		dispatch({type: ActionType.UPDATE, update: {songPlayStatus: SongPlayStatus.Play}});
	};

	const pauseSong = () => {
		dispatch({type: ActionType.UPDATE, update: {songPlayStatus: SongPlayStatus.Pause}});
	};

	const currentSet = data!;
	const song = currentSongId && data ? data.songs.find((x) => x.id === currentSongId) : undefined;

	return (
		<div style={{flex: '1', display: 'flex', flexDirection: 'row', margin: '1px', padding: '2px', overflowY: 'auto'}}>
			<div style={{width: '195px', background: 'rgba(0,0,0,.5)', display: 'flex', flexDirection: 'column'}}>
				<div style={{padding: '2px 2px 10px', borderBottom: '1px solid rgba(255,255,255,.5)'}}>
					<Button style={{margin: '2px', padding: '5px 19px'}} className={songPlayStatus === SongPlayStatus.Play ? 'pulse' : 'inherit'} variant='dark' onClick={() => playSong()} title={'Start playing'}>
						<FontAwesomeIcon icon={PlayIcon} size='lg'/>
					</Button>
					<Button style={{margin: '2px', padding: '5px 19px'}} variant='dark' onClick={() => pauseSong()} title={'Pause Playback'}>
						<FontAwesomeIcon icon={PauseIcon} size='lg'/>
					</Button>
					<Button style={{margin: '2px', padding: '5px 19px'}} variant='dark' onClick={() => pauseSong()} title={'Next'}>
						<FontAwesomeIcon icon={SkipIcon} size='lg'/>
					</Button>
				</div>
				
				<div style={{flex: 'auto', overflowX: 'hidden', overflowY: 'auto', color: 'white', padding: '20px 0px'}}>
					<ul style={{margin: '0', padding: '0'}}>
						{currentSet.songs.map((s) => {
							return <li key={s.id}>
								{/* TODO: Show current song, and queued song {background: currentSongId === s.id ? 'rgba(100,100,200,.8) */}
								<div style={{overflow: 'hidden', userSelect: 'none', whiteSpace: 'nowrap', padding: '2px 5px 2px 4px'}}>
									<Button style={{padding: '4px', margin: '1px 0px', width: '100%', textOverflow: 'ellipsis', textAlign: 'start', overflow: 'clip'}} variant='dark' title={`Play ${s.name}`} onClick={() => loadSong(s)} size='lg'>
										<FontAwesomeIcon icon={PlayIcon} size='lg'/>
										{` ${s.name}`}
									</Button>
								</div>
							</li>
						})}
					</ul>
				</div>
			</div>

			<div style={{ flex: '1', background: 'rgba(255,255,255,.2'}}>
				{loadingTracks && (<div>{`Loading Song ${currentSongId}...`}</div>)}
				{trackData && song && (
					<SongView song={song} tracks={trackData.tracks} key={song.id}/>
				)}
			</div>
		</div>
	)
};

export default SetView;
