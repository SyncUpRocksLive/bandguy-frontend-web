<script lang="ts">
	import { auth } from "@/Auth.svelte";
	import { msToHMS } from "@shared/display/DisplayHelpers";
	import { getSongsOverview } from "@shared/services/syncuprocks/musician/Api";
	import type { SongOverview } from "@shared/services/syncuprocks/musician/Types";
	import BasicTableEdit, { type ColumnDefinition, type TableConfig } from "@/lib/components/BasicTableEdit.svelte";
	import { router } from "@/Router.svelte";
	import TrackEditor from "./components/song_library/TrackEditor.svelte";

	let tableRef: BasicTableEdit;
	let songs: SongOverview[] = [];
	let selectedSong: SongOverview | null = null;
	let loading = false;
	let error: string | null = null;
	let nextTempId = -1;

	// Mock tags for each song
	const mockTags: Record<number, string[]> = {
		1: ['rock', 'wedding'],
		2: ['ska', 'punk'],
		3: ['jazz', 'blues'],
		4: ['pop', 'cover']
	};

	// Table configuration
	const tableConfig: TableConfig<SongOverview> = {
		columns: [
			{
				key: 'name',
				header: 'Song Name',
				width: '2fr',
				editable: true,
				display: (song) => song.name,
				searchable: true
			},
			{
				key: 'tracks',
				header: 'Tracks',
				width: '0.55fr',
				display: (song) => (song.tracks ?? 0).toString()
			},
			{
				key: 'duration',
				header: 'Duration',
				width: '0.75fr',
				display: (song) => song.durationMs ? msToHMS(song.durationMs) : ''
			},
			{
				key: 'tags',
				header: 'Tags',
				width: '1.5fr',
				display: (song) => getTags(song.id).join(', ') || '',
				render: (song, isEditing, value, onChange) => {
					const tags = getTags(song.id);
					return `<div class="tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`;
				}
			},
			{
				key: 'createdAtMsUtc',
				header: 'Created',
				width: '1fr',
				display: (song) => song.createdAtMsUtc ? new Date(song.createdAtMsUtc).toLocaleDateString() : ''
			},
		],
		searchPlaceholder: 'Search songs...',
		createButtonText: 'Create New',
		deleteButtonText: 'Delete',
		confirmDeleteMessage: (song) => `Are you sure you want to delete "${song.name}"? Important: all tracks will be deleted - this is not undoable`,
		getItemId: (song) => song.id,
		getItemDisplayName: (song) => song.name
	};

	// Reactive statement to fetch songs when user changes
	$: if (auth.user?.userId) {
		fetchSongs();
	}

	async function fetchSongs() {
		if (!auth.user?.userId) return;
		
		loading = true;
		error = null;
		try {
			const result = await getSongsOverview(auth.user.userId);
			if (result.ok) {
				songs = result.value.sort((a, b) => a.name.localeCompare(b.name));
			} else {
				error = result.error.message;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	function getTags(setId: number): string[] {
		return mockTags[setId] || [];
	}

	function handleTableSelect(item: SongOverview) {
		console.log('Selected song:', selectedSong);
	}

	function handleTableCreate() {
		const newSong: SongOverview = {
			id: nextTempId,
			name: 'Song',
			createdAtMsUtc: Date.now(),
			setOrder: 0
		};
		nextTempId--;
		songs = [newSong, ...songs];
		selectedSong = newSong;

		tableRef.startEdit(newSong);
	}

	function handleTableDelete(item: SongOverview) {
		const songToDelete = item;
		console.log('Deleting song:', songToDelete.id);
		// TODO: Implement actual delete API call
		songs = [...songs.filter(s => s.id !== songToDelete.id)];
		selectedSong = null;
	}

	function handleTableSave(item: SongOverview, changes: Record<string, any>) {
		const songIndex = songs.findIndex(s => s.id === item.id);
		if (songIndex !== -1) {
			songs[songIndex] = { ...songs[songIndex], ...changes };
			songs = songs; // Trigger reactivity
		}
	}

	function handleTableCancel(item: SongOverview) {
		// If it was a new song that hasn't been saved, remove it
		console.log('Canceling edit for song:', item);
		if (item.id < 0) {
			songs = songs.filter(s => s.id !== item.id);
		}
	}

	function handleTableClone(item: SongOverview) {
		const newSong: SongOverview = {
			...item,
			id: nextTempId,
			name: `${item.name} (Copy)`,
			createdAtMsUtc: Date.now()
		};
		nextTempId--;
		songs = [newSong, ...songs].sort((a, b) => a.name.localeCompare(b.name));
		selectedSong = newSong;

		// TODO: Will need API to clone tracks

		tableRef.startEdit(newSong);
	}

	function handleTableOpen(item: SongOverview) {
		console.log('Opening song:', item);
		router.navigate('SongLibrary', [`${item.id}`]);
	}

</script>

<div class="setlist-library">

	{#if router.route.params && router.route.params.length > 0}
		<button onclick={() => router.replace('SongLibrary')}>Back to SongLibrary</button>
		<h1>Edit Song {router.route.params[0]}</h1>
		<TrackEditor />
	{:else}
	<BasicTableEdit
		bind:this={tableRef}
		bind:items={songs}
		config={tableConfig}
		bind:loading={loading}
		bind:error={error}
		bind:selectedItem={selectedSong}
		onselect={handleTableSelect}
		oncreate={handleTableCreate}
		ondelete={handleTableDelete}
		onsave={handleTableSave}
		oncancel={handleTableCancel}
		onclone={handleTableClone}
		onopen={handleTableOpen}
	/>
	{/if}
</div>

<style>
	.setlist-library {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 0 2rem;
		margin: 0;
	}

	h3 {
		margin: 1rem 0;
		flex-shrink: 0;
	}

	.setlist-header {
		flex-shrink: 0;
		margin-bottom: 1.5rem;
	}

	.upload-section {
		display: flex;
		gap: 1rem;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.tag {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background-color: #e0e0e0;
		border-radius: 12px;
		font-size: 0.75rem;
		color: #333;
	}
</style>
