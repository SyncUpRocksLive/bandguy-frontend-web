<script lang="ts">
	import TrackEditor from '@/lib/components/TrackEditor/TrackEditor.svelte';
	import { getSongComplete, saveTrack, deleteTrack, createTrack } from '@shared/services/syncuprocks/musician/Api';
	import type { Song, Track } from '@shared/services/syncuprocks/musician/Types';

	interface Props {
		songId: number;
		songName?: string;
	}

	const { songId, songName = 'Untitled Song' }: Props = $props();

	let song: Song | null = $state(null);
	let tracks: Track[] = $state([]);
	let loading = $state(false);
	let error: string | null = $state(null);

	// Initialize: Fetch song and tracks
	async function loadSong() {
		loading = true;
		error = null;
		try {
			const result = await getSongComplete(songId);
			if (!result.ok) {
				error = result.error.message;
				return;
			}

			const songData = result.value;
			if (!songData) {
				error = 'Song not found';
				return;
			}

			song = songData;
			tracks = songData.tracks || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load song';
		} finally {
			loading = false;
		}
	}

	// Handle saving a track
	async function handleSaveTrack(track: Track) {
		loading = true;
		error = null;
		try {
			const result = await saveTrack(songId, track);
			if (!result.ok) {
				error = result.error.message;
				return;
			}

			tracks = tracks.map((t) => (t.id === track.id ? result.value : t));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save track';
		} finally {
			loading = false;
		}
	}

	// Handle deleting a track
	async function handleDeleteTrack(trackId: number) {
		loading = true;
		error = null;
		try {
			const result = await deleteTrack(songId, trackId);
			if (!result.ok) {
				error = result.error.message;
				return;
			}

			tracks = tracks.filter((t) => t.id !== trackId);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete track';
		} finally {
			loading = false;
		}
	}

	// Handle creating a new track
	async function handleCreateTrack(newTrack: Omit<Track, 'id' | 'createdAtMsUtc'>) {
		loading = true;
		error = null;
		try {
			const result = await createTrack(songId, newTrack);
			if (!result.ok) {
				error = result.error.message;
				return;
			}

			tracks = [...tracks, result.value];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create track';
		} finally {
			loading = false;
		}
	}

	// Load song on mount
	$effect(() => {
		if (songId) {
			loadSong();
		}
	});
</script>

<div class="song-editor">
	<header class="editor-header">
		<div class="header-info">
			<h2>{song?.name ?? songName}</h2>
			<p class="song-meta">
				Song ID: {songId} • {tracks.length} track{tracks.length !== 1 ? 's' : ''} • Duration: {song
					? Math.round(song.durationMilliseconds / 1000)
					: 0}s
			</p>
		</div>
		<div class="header-actions">
			<!-- Future: Add global save, publish, etc. -->
		</div>
	</header>

	<main class="editor-main">
		<TrackEditor
			{songId}
			bind:tracks
			bind:loading
			bind:error
			onsave={handleSaveTrack}
			ondelete={handleDeleteTrack}
			oncreatetrack={handleCreateTrack}
		/>
	</main>
</div>

<style>
	.song-editor {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: #fff;
	}

	.editor-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid #ddd;
		background-color: #fafafa;
		flex-shrink: 0;
	}

	.header-info {
		flex: 1;
	}

	.editor-header h2 {
		margin: 0;
		font-size: 24px;
		font-weight: 600;
		color: #333;
	}

	.song-meta {
		margin: 6px 0 0 0;
		font-size: 13px;
		color: #666;
	}

	.header-actions {
		display: flex;
		gap: 12px;
	}

	.editor-main {
		flex: 1;
		overflow: hidden;
	}
</style>
