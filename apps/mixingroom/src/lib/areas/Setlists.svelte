<script lang="ts">
	import { auth } from "@/Auth.svelte";
	import { getSetsOverview } from "@shared/services/syncuprocks/musician/Api";
	import type { SetOverview } from "@shared/services/syncuprocks/musician/Types";
	import BasicTableEdit, { type ColumnDefinition, type TableConfig } from "@/lib/components/BasicTableEdit.svelte";
	import Upload from "./components/setlist/Upload.svelte";

	let sets: SetOverview[] = [];
	let selectedSet: SetOverview | null = null;
	let loading = false;
	let error: string | null = null;
	let nextTempId = -1;

	// Mock tags for each setlist
	const mockTags: Record<number, string[]> = {
		1: ['rock', 'wedding'],
		2: ['ska', 'punk'],
		3: ['jazz', 'blues'],
		4: ['pop', 'cover']
	};

	// Table configuration
	const tableConfig: TableConfig<SetOverview> = {
		columns: [
			{
				key: 'name',
				header: 'Setlist Name',
				width: '2fr',
				editable: true,
				display: (set) => set.name,
				searchable: true
			},
			{
				key: 'songs',
				header: 'Songs',
				width: '0.75fr',
				display: (set) => set.songs.length.toString()
			},
			{
				key: 'tags',
				header: 'Tags',
				width: '1.5fr',
				display: (set) => getTags(set.id).join(', ') || 'No tags',
				render: (set, isEditing, value, onChange) => {
					const tags = getTags(set.id);
					return `<div class="tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`;
				}
			},
			{
				key: 'createdAtMsUtc',
				header: 'Created',
				width: '1fr',
				display: (set) => new Date(set.createdAtMsUtc).toLocaleDateString()
			},
		],
		searchPlaceholder: 'Search setlists...',
		createButtonText: 'Create New',
		deleteButtonText: 'Delete',
		confirmDeleteMessage: (set) => `Are you sure you want to delete "${set.name}"? Important: Songs will not be deleted`,
		getItemId: (set) => set.id,
		getItemDisplayName: (set) => set.name
	};

	// Reactive statement to fetch sets when user changes
	$: if (auth.user?.userId) {
		fetchSets();
	}

	async function fetchSets() {
		if (!auth.user?.userId) return;
		
		loading = true;
		error = null;
		try {
			const result = await getSetsOverview(auth.user.userId);
			if (result.ok) {
				sets = result.value;
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

	function handleTableSelect(item: SetOverview) {
		console.log('Selected set:', selectedSet);
	}

	function handleTableCreate() {
		const newSet: SetOverview = {
			id: nextTempId,
			musicianId: 0,
			name: 'Setlist',
			createdAtMsUtc: Date.now(),
			songs: []
		};
		nextTempId--;
		sets = [newSet, ...sets];
		selectedSet = newSet;
		// The table component will handle putting it in edit mode
	}

	function handleTableDelete(item: SetOverview) {
		const setToDelete = item;
		console.log('Deleting setlist:', setToDelete.id);
		// TODO: Implement actual delete API call
		sets = [...sets.filter(s => s.id !== setToDelete.id)];
		//selectedSet = null;
	}

	function handleTableSave(item: SetOverview, changes: Record<string, any>) {
		const setIndex = sets.findIndex(s => s.id === item.id);
		if (setIndex !== -1) {
			sets[setIndex] = { ...sets[setIndex], ...changes };
			sets = sets; // Trigger reactivity
		}
	}

	function handleTableCancel(item: SetOverview) {
		// If it was a new setlist that hasn't been saved, remove it
		if (item.id < 0) {
			sets = sets.filter(s => s.id !== item.id);
		}
	}

</script>

<div class="setlist-library">
	<h3>Setlists</h3>

	<section class="setlist-header">
		<div class="upload-section">
			<Upload />
		</div>
	</section>

	<BasicTableEdit
		bind:items={sets}
		config={tableConfig}
		bind:loading={loading}
		bind:error={error}
		bind:selectedItem={selectedSet}
		onselect={handleTableSelect}
		oncreate={handleTableCreate}
		ondelete={handleTableDelete}
		onsave={handleTableSave}
		oncancel={handleTableCancel}
	/>
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
