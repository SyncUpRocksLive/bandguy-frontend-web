<script lang="ts">
	import TrackEditor from '@/lib/components/track_editor/TrackEditor.svelte';
	import SongItemEditor from './SongItemEditor.svelte';
	import { msToHMS } from '@shared/display/DisplayHelpers';
	import { getSongComplete, saveTrack, deleteTrack, createTrack, type SongSaveRequest, songSave } from '@shared/services/syncuprocks/musician/Api';
	import type { Song, Track } from '@shared/services/syncuprocks/musician/Types';

	interface Props {
		songId?: number;
	}

	const { songId }: Props = $props();

	let song: Song | null = $state(null);
	let tracks: Track[] = $state([]);
	let loading = $state(false);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let editName = $state('');
	let editDuration = $state(0);

	// Initialize: Fetch song and tracks
	async function loadSong() {
		console.log('Loading song with ID:', songId);
		if (!songId || songId <= 0) {
			song = {
				id: 0,
				musicianId: "",
				createdAtMsUtc: Date.now(),
				name: 'Untitled',
				durationMilliseconds: 60 * 1000, // Default to 1 minute
				tracks: [],
				setOrder: 0
			};
			tracks = [];
			return;
		}

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
			const result = await saveTrack(songId!, track);
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
			const result = await deleteTrack(songId!, trackId);
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
			const result = await createTrack(songId!, newTrack);
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

	// Handle saving the song
	async function handleSaveSongItem(data: { name: string; durationMs: number }) {
		if (!song) {
			console.error('No song loaded, cannot save');
			return;
		}

		const needsSaving = song.id <= 0 || data.name !== song.name || data.durationMs !== song.durationMilliseconds;
		if (!needsSaving) {
			console.log('No changes detected, skipping save');
			showEditModal = false;
			return;
		}

		loading = true;
		error = null;
		try {
			console.log('Saving song with data:', data);

			const request: SongSaveRequest = { ...song, 
				id: song.id > 0 ? song.id : undefined,
				name: data.name, 
				durationMilliseconds: data.durationMs 
			};
			const result = await songSave(request);
			if (!result.ok) {
				error = result.error.message;
				return;
			}

			song.id = result.value.id!;
			song.name = result.value.name;
			song.durationMilliseconds = result.value.durationMilliseconds;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update song';
		} finally {
			loading = false;
			showEditModal = false;
		}
	}

	// Load song on mount
	$effect(() => {
		loadSong();
	});
</script>

<div class="song-editor">
	<header class="editor-header">
		<div class="header-info">
			<div class="title-row">
				<h2>Song - {song?.name ?? ''}</h2>
				<button class="edit-btn" onclick={() => { editName = song?.name || ''; editDuration = song?.durationMilliseconds || 0; showEditModal = true; }} aria-label="Edit song">✏️</button>
			</div>
			<p class="song-meta">
				Song ID: {song?.id} • {tracks.length} track{tracks.length !== 1 ? 's' : ''} • Duration: {song ? msToHMS(song.durationMilliseconds) : '--'}
			</p>
		</div>
		<div class="header-actions">
			<!-- Future: Add global save, publish, etc. -->
			 Psdsd
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

{#if showEditModal}
	<SongItemEditor
		name={editName}
		durationMs={editDuration}
		onsave={handleSaveSongItem}
		oncancel={() => showEditModal = false}
	/>
{/if}

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

	.title-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.editor-header h2 {
		margin: 0;
		font-size: 24px;
		font-weight: 600;
		color: #333;
	}

	.edit-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 16px;
		padding: 4px;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.edit-btn:hover {
		background-color: #eee;
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
