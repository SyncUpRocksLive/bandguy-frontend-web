<script lang="ts">
	import { auth } from "@/Auth.svelte";
	import { msToHMS } from "@shared/display/DisplayHelpers";
	import { getSetComplete, getSongsOverview } from "@shared/services/syncuprocks/musician/Api";
	import type { SetComplete, SongOverview } from "@shared/services/syncuprocks/musician/Types";

	interface Props<T> {
		setId: number;
	}

	let {
		setId = $bindable(),
	}: Props<any> = $props();

	let songs: SongOverview[] = $state([]);
	let setSongs: SongOverview[] = $state([]);
	let loading = $state(false);
	let error: string | null = $state(null);
	let setComplete: SetComplete | null = $state(null);
	let draggedSongId: number | null = $state(null);
	let dragOverSongId: number | null = $state(null);
	let dragPosition: 'above' | 'below' | null = $state(null);
	let availableFilter = $state('');

	let availableSongs = $derived(
		songs.filter(song => !setSongs.some(setSong => setSong.id === song.id))
	);

	let filteredAvailableSongs = $derived(
		availableSongs.filter(song => song.name.toLowerCase().includes(availableFilter.toLowerCase()))
	);

	$effect(() => {
		if (setId > 0) {
			loadSet();
		}

		fetchSongs();
	});

	async function loadSet() {
		if (!auth.user?.userId) return;

		loading = true;
		error = null;
		try {
			const result = await getSetComplete(setId);
			if (result.ok) {
				setComplete = result.value!;
				console.log('Fetched set details:', setComplete);
				setSongs = setComplete.songs
					.map((song) => ({ id: song.id, name: song.name, setOrder: song.setOrder }))
					.sort((a, b) => a.setOrder - b.setOrder);
			} else {
				error = result.error.message;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	async function fetchSongs() {
		if (!auth.user?.userId) return;

		loading = true;
		error = null;
		try {
			const result = await getSongsOverview(auth.user.userId);
			if (result.ok) {
				songs = result.value.sort((a, b) => a.name.localeCompare(b.name));
				console.log('Fetched songs:', songs);
			} else {
				error = result.error.message;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	function addSong(song: SongOverview) {
		if (setSongs.some((setSong) => setSong.id === song.id)) 
			return;

		// Add to front of set and adjust everything down
		song.setOrder = 0;
		let newSetOrder = 1;
		for (const setSong of setSongs) {
			setSong.setOrder = newSetOrder++;
		}

		setSongs = [song, ...setSongs];
	}

	function removeSong(song: SongOverview) {
		setSongs = setSongs
			.filter((setSong) => setSong.id !== song.id)
			.map((setSong, index) => ({ ...setSong, setOrder: index + 1 }));
	}

	function dragStart(event: DragEvent, songId: number) {
		draggedSongId = songId;
		event.dataTransfer?.setData('text/plain', String(songId));
		event.dataTransfer?.setData('application/x-song', String(songId));
		event.dataTransfer!.effectAllowed = 'move';
	}

	function dragEnd() {
		draggedSongId = null;
		dragOverSongId = null;
		dragPosition = null;
	}

	function dragOver(event: DragEvent, songId: number) {
		event.preventDefault();

		if (draggedSongId === null || draggedSongId === songId) {
			dragOverSongId = null;
			dragPosition = null;
			return;
		}

		dragOverSongId = songId;

		// Find the song row element (traverse up from event target if needed)
		let targetElement = event.target as HTMLElement;
		while (targetElement && !targetElement.classList.contains('song-row')) {
			targetElement = targetElement.parentElement as HTMLElement;
		}

		if (!targetElement) return;

		// Determine if we're above or below the middle of the song row
		const rect = targetElement.getBoundingClientRect();
		const y = event.clientY - rect.top;
		const height = rect.height;
		const deadZone = 8; // pixels of dead zone in center to prevent flickering

		if (y < height / 2 - deadZone) {
			dragPosition = 'above';
		} else if (y > height / 2 + deadZone) {
			dragPosition = 'below';
		}
		// If in dead zone, keep current position
	}

	function dropOnSong(event: DragEvent, songId: number) {
		event.preventDefault();
		if (draggedSongId === null || draggedSongId === songId || dragPosition === null) {
			dragEnd();
			return;
		}

		reorderSong(draggedSongId, songId, dragPosition);
		dragEnd();
	}

	function reorderSong(dragSongId: number, targetSongId: number, position: 'above' | 'below') {
		const currentIndex = setSongs.findIndex((song) => song.id === dragSongId);
		const targetIndex = setSongs.findIndex((song) => song.id === targetSongId);
		if (currentIndex < 0 || targetIndex < 0 || currentIndex === targetIndex) return;

		const nextSongs = [...setSongs];
		const [moved] = nextSongs.splice(currentIndex, 1);

		// Insert at the correct position
		let insertIndex = targetIndex;
		if (position === 'below') {
			insertIndex = targetIndex + 1;
		}

		// Adjust insert index if we removed an item before this position
		if (currentIndex < insertIndex) {
			insertIndex--;
		}

		nextSongs.splice(insertIndex, 0, moved);

		// Update setOrder for all songs
		setSongs = nextSongs.map((song, index) => ({ ...song, setOrder: index + 1 }));
	}
</script>

<section class="song-editor-form">
	<div class="form-heading">
		<div>
			<h2>Set {setId} Editor</h2>
			{#if setComplete}
				<p class="set-meta">{setComplete.Name}</p>
			{/if}
		</div>
		<p class="hint">Drag songs on the right to reorder the set. Add available songs from the left.</p>
	</div>

	{#if loading}
		<div class="status-box">Loading songs...</div>
	{:else if error}
		<div class="status-box error">{error}</div>
	{:else}
		<div class="song-panels">
			<div class="song-panel available-panel">
				<div class="panel-header">
					<h3>Available Songs</h3>
				</div>
				<div class="filter-row">
				<input
					type="text"
					placeholder="Filter available songs..."
					class="search-input"
					bind:value={availableFilter}
				/>
			</div>
			{#if filteredAvailableSongs.length > 0}
					<ul class="song-list">
						{#each filteredAvailableSongs as song}
							<li class="song-row">
								<div class="song-details">
									<span class="song-title">{song.name}</span>
									<span class="song-meta">{song.setOrder ? `Order ${song.setOrder}` : 'Not in set'}{song.durationMs ? ` • ${msToHMS(song.durationMs)}` : ''}</span>
								</div>
								<button type="button" class="btn btn-small btn-add" on:click={() => addSong(song)}>
									Add
								</button>
							</li>
						{/each}
					</ul>
				{:else}
				<div class="empty-state">
					{availableSongs.length === 0
						? 'All songs are currently in the set.'
						: 'No available songs match your filter.'}
				</div>

			<div class="song-panel set-panel">
				<div class="panel-header">
					<h3>Set Songs</h3>
					<span class="panel-count">{setSongs.length} song{setSongs.length === 1 ? '' : 's'}</span>
				</div>
				{#if setSongs.length > 0}
					<ul class="song-list" on:dragover|preventDefault>
						{#each setSongs as song, index (song.id)}
							<li
								class="song-row right-row {dragOverSongId === song.id ? `drag-over drag-${dragPosition}` : ''}"
								draggable="true"
								on:dragstart={(event) => dragStart(event, song.id)}
								on:dragend={dragEnd}
								on:dragover|preventDefault={(event) => dragOver(event, song.id)}
								on:drop={(event) => dropOnSong(event, song.id)}
							>
								<div class="song-drag-handle">☰</div>
								<div class="song-details">
									<span class="song-title">{song.name}</span>
									<span class="song-meta">Order {index + 1}{song.durationMs ? ` • ${msToHMS(song.durationMs)}` : ''}</span>
								</div>
								<button type="button" class="btn btn-small btn-remove" on:click={() => removeSong(song)}>
									🗑️
								</button>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="empty-state">No songs are currently assigned to this set.</div>
				{/if}
			</div>
		</div>
	{/if}
</section>

<style>
	.song-editor-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-heading {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-heading h2 {
		margin: 0;
		font-size: 1.4rem;
	}

	.set-meta {
		margin: 0.25rem 0 0;
		color: #555;
	}

	.hint {
		font-size: 0.95rem;
		color: #666;
	}

	.song-panels {
		display: grid;
		grid-template-columns: 0.3fr 1fr;
		gap: 1rem;
		min-height: 360px;
	}

	.song-panel {
		background: #fff;
		border: 1px solid #d8d8d8;
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		border-bottom: 1px solid #eee;
		padding-bottom: 0.75rem;
	}

	.filter-row {
		display: flex;
		padding: 0 0.25rem;
	}

	.panel-header h3 {
		margin: 0;
		font-size: 1.05rem;
	}

	.panel-count {
		font-size: 0.9rem;
		color: #555;
	}

	.song-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-height: 180px;
	}

	.song-row {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 1rem;
		background: #fafafa;
		border: 1px solid #e4e4e4;
		border-radius: 10px;
		transition: background 0.2s, border-color 0.2s;
		position: relative;
	}

	.song-row:hover {
		background: #f3f7ff;
	}

	.song-row.drag-over {
		border-color: #3b82f6;
		background: rgba(59, 130, 246, 0.08);
	}

	.song-row.drag-over.drag-above::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: #3b82f6;
		border-radius: 1px;
	}

	.song-row.drag-over.drag-below::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: #3b82f6;
		border-radius: 1px;
	}

	.available-panel .song-row {
		cursor: default;
	}

	.right-row {
		cursor: grab;
		padding: 0.6rem 0.8rem;
		grid-template-columns: auto 1fr auto;
	}

	.song-drag-handle {
		width: 24px;
		height: 24px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		color: #4d4d4d;
		border: 1px solid #d8d8d8;
		border-radius: 50%;
		background: #fff;
	}

	.song-details {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.song-title {
		font-weight: 600;
		color: #1f2937;
	}

	.song-meta {
		font-size: 0.85rem;
		color: #71717a;
	}

	.empty-state,
	.status-box {
		padding: 1rem;
		border-radius: 10px;
		background: #f6f6f6;
		color: #555;
	}

	.status-box.error {
		background: #fee2e2;
		color: #991b1b;
	}

	.btn-small {
		padding: 0.3rem 0.5rem;
		font-size: 0.8rem;
		border: 1px solid #c7d2fe;
		border-radius: 6px;
		background: #eff6ff;
		color: #1d4ed8;
		cursor: pointer;
		transition: background 0.2s, transform 0.2s;
		min-width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-small:hover {
		background: #dbeafe;
	}

	.btn-add {
		border-color: #4f46e5;
		background: #eef2ff;
		color: #4338ca;
	}

	.btn-remove {
		border-color: #fca5a5;
		background: #fff1f2;
		color: #b91c1c;
	}

	@media (max-width: 900px) {
		.song-panels {
			grid-template-columns: 1fr;
		}
	}
</style>
