<script lang="ts">
	import { auth } from "@/Auth.svelte";
	import { msToHMS } from "@shared/display/DisplayHelpers";
	import { deleteSong, getSongsOverview } from "@shared/services/syncuprocks/musician/Api";
	import type { SongOverview } from "@shared/services/syncuprocks/musician/Types";
	import BasicTableEdit, { type ColumnDefinition, type TableConfig } from "@/lib/components/BasicTableEdit.svelte";
	import { router } from "@/Router.svelte";
	import SongEditor from "./components/song_library/SongEditor.svelte";

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
		console.log('Auth user changed, fetching songs for userId:', auth.user.userId);
		fetchSongs();
	} else {
		console.log('No auth user or userId, auth.user:', auth.user);
	}

	async function fetchSongs() {
		if (!auth.user?.userId) {
			console.log('fetchSongs called but no userId');
			return;
		}

		console.log('fetchSongs called with userId:', auth.user.userId);
		loading = true;
		error = null;
		try {
			const result = await getSongsOverview(auth.user.userId);
			console.log('getSongsOverview result:', result);
			if (result.ok) {
				songs = result.value.sort((a, b) => a.name.localeCompare(b.name));
				console.log('Songs loaded:', songs.length);
			} else {
				error = result.error.message;
				console.error('Error loading songs:', error);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
			console.error('Exception in fetchSongs:', err);
		} finally {
			loading = false;
		}
	}

	function getTags(setId: number): string[] {
		return mockTags[setId] || [];
	}

	function handleTableCreate() {
		router.navigate('SongLibrary', ['create']);
	}

	async function handleTableDelete(item: SongOverview) {
		if (!auth.user?.userId) 
			return;

		if (item.id <= 0) {
			songs = songs.filter(s => s.id !== item.id);
			return;
		}

		console.log('Deleting song:', item.id);
	
		loading = true;
		error = null;
		try {
			const result = await deleteSong(item.id);
			if (result.ok) {
				songs = [...songs.filter(s => s.id !== item.id)];
			} else {
				error = result.error.message;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}

		selectedSong = null;
	}

	function handleTableOpen(item: SongOverview) {
		console.log('Opening song:', item);
		router.navigate('SongLibrary', [`${item.id}`]);
	}

</script>

<div class="setlist-library">

	{#if router.route.params && router.route.params.length > 0}
		<!-- <TrackEditor /> -->
		<SongEditor 
		songId={parseInt(router.route.params[0])} 
		songName={songs.find(s => s.id === parseInt(router.route.params[0]))?.name || 'Untitled Song'}
		/>
	{:else}
	<BasicTableEdit
		bind:this={tableRef}
		bind:items={songs}
		config={tableConfig}
		bind:loading={loading}
		bind:error={error}
		bind:selectedItem={selectedSong}
		oncreate={handleTableCreate}
		ondelete={handleTableDelete}
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
