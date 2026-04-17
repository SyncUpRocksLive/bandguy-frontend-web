<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { router } from '../Router.svelte';
	import { appState } from '../State.svelte';
	import { PeerOperationMode, SongPlayStatus } from '../Types/Types';
	import { Log, LogVerbose } from '@shared/services/Logger';
	import SongView from './SongView.svelte';
	import { getSongStore } from '../Support/Stores/SongStore';

// Placeholder types - TODO: import from shared
interface SetComplete {
	musicianId: number;
	id: number;
	name: string;
	createdAtMsUtc: number;
	songs: any[]; // Song[]
}

interface ApiResponseBase<T> {
	success: boolean;
	data?: T;
	errorMessage?: string;
}

	interface Props {
		mode: 'host' | 'solo';
		setId: string;
	}

	let { mode, setId }: Props = $props();

	// Update state
	$effect(() => {
		const peerMode = mode === 'host' ? PeerOperationMode.Host : PeerOperationMode.Solo;
		appState.setPeerMode(peerMode);
		appState.setCurrentSet(parseInt(setId, 10));
	});

	const query = createQuery({
		queryKey: ['setlist', appState.store.currentSetId],
		queryFn: async () => {
			if (!appState.store.currentSetId) return null;
			LogVerbose(`Downloading set overview for setId=${appState.store.currentSetId}`);
			const data = await fetch(`/api/legacy/user/sets/complete/${appState.store.currentSetId}`, {
				method: "GET",
				headers: { "Content-Type": "application/json" }
			});
			const response: ApiResponseBase<SetComplete> = await data.json();
			return response.data;
		},
		refetchInterval: false,
		staleTime: 0,
		refetchOnMount: 'always',
		refetchOnWindowFocus: false,
		enabled: !!appState.store.currentSetId,
	});

	// Auto-select first song when set loads
	$effect(() => {
		if ($query.data && $query.data.songs.length > 0 && !appState.store.currentSongId) {
			appState.updateStore({ currentSongId: $query.data.songs[0].id });
		}
	});

	function loadSong(song: any) {
		appState.updateStore({
			currentSongId: song.id,
			songPlayStatus: SongPlayStatus.Play
		});
	}

	function playSong() {
		appState.updateStore({ songPlayStatus: SongPlayStatus.Play });
	}

	function pauseSong() {
		appState.updateStore({ songPlayStatus: SongPlayStatus.Pause });
	}

	function formatDuration(duration: number): string {
		const totalSeconds = Math.floor(duration / 1000);
		const mins = Math.floor(totalSeconds / 60);
		const secs = totalSeconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="set-view">
	{#if $query.isLoading}
		<div>Loading set...</div>
	{:else if $query.data}
		<div class="set-container">
			<!-- Sidebar with controls and song list -->
			<div class="sidebar">
				<div class="controls">
					<button
						class="control-btn play-btn"
						class:pulse={appState.store.songPlayStatus === SongPlayStatus.Play}
						onclick={playSong}
						title="Start playing"
					>
						▶
					</button>
					<button
						class="control-btn"
						onclick={pauseSong}
						title="Pause Playback"
					>
						⏸
					</button>
					<button
						class="control-btn"
						onclick={pauseSong}
						title="Next"
					>
						⏭
					</button>
				</div>

				<div class="song-list">
					<ul>
						{#each $query.data.songs as song (song.id)}
							<li>
								<button
									class="song-btn"
									class:active={appState.store.currentSongId === song.id}
									onclick={() => loadSong(song)}
									title={`Play ${song.title || song.name || 'Untitled'}`}
								>
									▶ {song.title || song.name || 'Untitled'}
								</button>
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<!-- Main content area -->
			<div class="main-content">
				{#if appState.store.currentSongId}
					<SongView
						song={$query.data.songs.find(s => s.id === appState.store.currentSongId)}
						mode={mode}
					/>
				{:else}
					<div class="no-song">Select a song to begin</div>
				{/if}
			</div>
		</div>
	{:else}
		<div>No set data</div>
	{/if}

	<button class="back-btn" onclick={() => router.navigate(mode === 'host' ? 'HostSets' : 'SoloSets')}>
		Back to Sets
	</button>
</div>

<style>
	.set-view {
		position: relative;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.back-btn {
		position: absolute;
		bottom: 10px;
		right: 10px;
		padding: 0.5rem 1rem;
		background-color: #6c757d;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		z-index: 10;
	}

	.back-btn:hover {
		background-color: #5a6268;
	}

	.set-container {
		display: flex;
		flex: 1;
		height: calc(100vh - 60px); /* Account for navbar */
	}

	.sidebar {
		width: 200px;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		flex-direction: column;
		border-right: 1px solid rgba(255, 255, 255, 0.3);
	}

	.controls {
		padding: 10px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
		display: flex;
		gap: 5px;
		justify-content: center;
	}

	.control-btn {
		padding: 8px 15px;
		background-color: #343a40;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1.2rem;
	}

	.control-btn:hover {
		background-color: #495057;
	}

	.play-btn.pulse {
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0% { opacity: 1; }
		50% { opacity: 0.7; }
		100% { opacity: 1; }
	}

	.song-list {
		flex: 1;
		overflow-y: auto;
		padding: 10px 0;
	}

	.song-list ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.song-list li {
		margin: 2px 0;
	}

	.song-btn {
		width: 100%;
		padding: 8px 10px;
		background-color: #343a40;
		color: white;
		border: none;
		text-align: left;
		cursor: pointer;
		font-size: 0.9rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		border-radius: 0;
	}

	.song-btn:hover {
		background-color: #495057;
	}

	.song-btn.active {
		background-color: rgba(100, 100, 200, 0.8);
	}

	.main-content {
		flex: 1;
		background: rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
	}

	.no-song {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: white;
		font-size: 1.2rem;
	}
</style>
