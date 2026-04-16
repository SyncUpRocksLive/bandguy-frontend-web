<script lang="ts">
	import TrackEditor from '@/lib/components/track_editor/TrackEditor.svelte';
	import SongItemEditor from './SongItemEditor.svelte';
	import { msToHMS } from '@shared/display/DisplayHelpers';
	import { getSongComplete, saveTrack, deleteTrack, createTrack, type SongSaveRequest, songSave } from '@shared/services/syncuprocks/musician/Api';
	import type { Song, Track } from '@shared/services/syncuprocks/musician/Types';
	import { tick, untrack } from 'svelte';
	import { router } from '@/Router.svelte';

	interface Props {
		songId?: number;
	}

	let { 
		songId = $bindable()
	}: Props = $props();

	let song: Song | null = $state(null);
	let tracks: Track[] = $state([]);
	let loading = $state(false);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let editName = $state('');
	let editDuration = $state(0);

	// Initialize: Fetch song and tracks
	async function loadSong() {
		if (!songId || songId <= 0) {
			console.log(`SongEditor::loadSong() NULL SONG - setting default song state`);

			song = {
				id: 0,
				musicianId: '',
				createdAtMsUtc: Date.now(),
				name: 'Untitled',
				durationMilliseconds: 60 * 1000, // Default to 1 minute
				tracks: [],
				setOrder: 0
			};

			tracks = [];
			return;
		}

		console.log(`SongEditor::loadSong() SongId: ${songId}`);

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
			if (!songData.tracks) {
				console.warn('SongEditor::loadSong() No tracks found for song, initializing empty array');
				song.tracks = [];
			} else {
				console.log('SongEditor::loadSong() Tracks loaded:', songData.tracks);
				tracks = songData.tracks
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load song';
		} finally {
			loading = false;
		}
	}

	// Handle deleting a track
	async function handleDeleteTrack(trackId: number) {
		if (!song || song.id <= 0 || !trackId || trackId <= 0) {
			console.error('handleDeleteTrack: No song loaded, cannot delete track');
			return;
		}

		loading = true;
		error = null;
		try {
			const result = await deleteTrack(song.id!, trackId);
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
	async function handleCreateTrack(newTrack: Omit<Track, 'songId' | 'fileSetId' | 'id' | 'createdAtMsUtc'>) : Promise<boolean> {
		if (!song) return false;

		if (!songId || song.id <= 0) {
			// Note: on new save, reroutes URL param - causes re-mount 
			console.log('SongEditor::handleCreateTrack: No existing song, attempting to save song before creating track');
			if (!await handleSaveSongItem({ name: song.name, durationMs: song.durationMilliseconds}, false)) {
				console.error('SongEditor::handleCreateTrack: Save returned false, cannot create track without song ID');
				return false;
			}

			await tick(); // Wait for state updates and potential remount
			console.log('SongEditor::handleCreateTrack: Song saved successfully, proceeding to create track with new song ID:', song.id);
		}

		loading = true;
		error = null;
		try {
			const newDto = { 
				songId: song.id!, 
				name: newTrack.name, 
				type: newTrack.type, 
				format: newTrack.format, 
				createdAtMsUtc: Date.now(),
				configuration: newTrack.configuration
			}

			const result = await createTrack(newDto);

			if (!result.ok) {
				error = result.error.message;
				return false;
			}

			console.log('SongEditor::handleCreateTrack() createTrack result:', result);

			tracks = [...tracks, {
				...newTrack,
				...newDto,
				...result.value,
			}];

			console.log('SongEditor::handleCreateTrack() Track created successfully, updated tracks list:', tracks);
			updateRouteOnNewSong();
			return true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create track';
			return false;
		} finally {
			loading = false;
		}
	}

	// Handle saving the song
	async function handleSaveSongItem(data: { name: string; durationMs: number }, updateRoute: boolean = false) : Promise<boolean> {
		if (!song) {
			console.error('handleSaveSongItem: No song loaded, cannot save');
			return false;
		}

		const needsSaving = song.id <= 0 || data.name !== song.name || data.durationMs !== song.durationMilliseconds;
		if (!needsSaving) {
			console.log('SongEditor::handleSaveSongItem() No changes detected, skipping save');
			showEditModal = false;
			return true;
		}

		loading = true;
		error = null;
		try {
			console.log('SongEditor::handleSaveSongItem() saving song with data:', data);

			const request: SongSaveRequest = { ...song, 
				id: song.id > 0 ? song.id : undefined,
				name: data.name, 
				durationMilliseconds: data.durationMs 
			};
			const result = await songSave(request);
			if (!result.ok) {
				error = result.error.message;
				return false;
			}

			if (!song.id) {
				console.log('SongEditor::handleSaveSongItem() New Song saved successfully with ID:', result.value.id);
				songId = result.value.id!;
			}

			song.id = result.value.id!;
			song.name = result.value.name;
			song.durationMilliseconds = result.value.durationMilliseconds;

			if (updateRoute) {
				updateRouteOnNewSong();
			}

			return true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update song';
			return false;
		} finally {
			loading = false;
			showEditModal = false;
		}
	}

	function updateRouteOnNewSong() {
		// Ensure page refresh keeps us on same song if we just created it
		if (song && song.id > 0 && router.route.params && router.route.params.length > 0 && router.route.params[0] === 'create') {
			const newParam = `${song.id}`;
			router.replace('SongLibrary', [newParam]);
		}
	}

	// Load song on mount
	$effect(() => {
		untrack(() => {
			console.log('SongEditor mounted, loading song with ID:', songId);
			loadSong();
		});
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
			<button class="edit-btn" onclick={() => { router.back('SongLibrary') }} aria-label="Edit song">X</button>
		</div>
	</header>

	<main class="editor-main">
		<TrackEditor
			bind:tracks
			bind:loading
			bind:error
			ondelete={handleDeleteTrack}
			oncreatetrack={handleCreateTrack}
		/>
	</main>
</div>

{#if showEditModal}
	<SongItemEditor
		name={editName}
		durationMs={editDuration}
		onsave={(data) => handleSaveSongItem(data, true)}
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
