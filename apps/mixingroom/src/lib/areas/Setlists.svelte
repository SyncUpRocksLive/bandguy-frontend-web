<script lang="ts">
	import { auth } from "@/Auth.svelte";
	import { deleteSet, getSetsOverview, saveSet, saveSetsOverview } from "@shared/services/syncuprocks/musician/Api";
	import type { SetOverview } from "@shared/services/syncuprocks/musician/Types";
	import BasicTableEdit, { type ColumnDefinition, type TableConfig } from "@/lib/components/BasicTableEdit.svelte";
	import Upload from "./components/setlist/Upload.svelte";
	import { router } from "@/Router.svelte";
	import SongEditor from "./components/setlist/SongEditor.svelte";
	import { isTemplateSpan } from "typescript";

	let tableRef: BasicTableEdit;
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
				display: (set) => getTags(set.id).join(', ') || '',
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

		tableRef.startEdit(newSet);
	}

	async function handleTableDelete(item: SetOverview) {
		const setToDelete = item;
		console.log('Deleting setlist:', setToDelete.id);
		
		if (!auth.user?.userId) 
			return;

		if (setToDelete.id < 0) {
			sets = sets.filter(s => s.id !== setToDelete.id);
			return;
		}
		
		loading = true;
		error = null;
		try {
			const result = await deleteSet(setToDelete.id);
			if (result.ok) {
				sets = [...sets.filter(s => s.id !== setToDelete.id)];
			} else {
				error = result.error.message;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	async function handleTableSave(item: SetOverview, changes: Record<string, any>) {
		if (!auth.user?.userId) 
			return;

		console.log('Saving changes for set:', item, changes);
		const setIndex = sets.findIndex(s => s.id === item.id);
		if (setIndex !== -1) {
			const orgSet = sets[setIndex];
			console.log('Original set before save:', orgSet);
			const item = { ...sets[setIndex], ...changes };
			console.log('Updated set to save:', item);

			// If item already exists, and no detectable changes, skip save
			if (item.id > 0 && orgSet.name === item.name) {
				// TODO: show better UI. And, and revert change
				console.log('No changes detected, skipping save');
				return;
			}

			const cleanNewName = item.name.trim();

			if (cleanNewName === '') {
				error = 'Setlist name cannot be empty';
				return;
			}

			item.name = cleanNewName;

			// TODO: Check locally for duplicated set name before saving. TServer will force new name, lets prevent
			const duplicate = sets.find(s => s.id !== item.id && s.name.trim().toLowerCase() === cleanNewName.toLowerCase());
			if (duplicate) {	
				error = `A setlist with the name "${cleanNewName}" already exists. Please choose a different name.`;
				return;
			}

			loading = true;
			error = null;
			try {
				// TODO: SaveSet should return the full updated set name, id, and createdAtMsUtc, tags, etc to avoid any discrepancies. For now we just update the id for new sets.
				// IF a "Copy 1" was added in backend, we wouldn't know about it here and it would be lost on next save. This is a band-aid to at least update the id for new sets created in the UI.
				const result = await saveSet(item.id > 0 ? item.id : null, cleanNewName);
				if (result.ok) {
				 	item.id = result.value.id;
					item.createdAtMsUtc = result.value.createdAtMsUtc;
					item.name = result.value.name;
				} else {
				 	error = result.error.message;
				}
			} catch (err) {
				error = err instanceof Error ? err.message : 'Unknown error';
			} finally {
				loading = false;
			}

			sets[setIndex] = item;
			sets = sets; // Trigger reactivity
		}
	}

	function handleTableCancel(item: SetOverview) {
		// If it was a new setlist that hasn't been saved, remove it
		if (item.id < 0) {
			sets = sets.filter(s => s.id !== item.id);
		}
	}

	async function handleTableClone(item: SetOverview) {
		if (!auth.user?.userId) 
			return;

		if (item.id <= 0 || item.songs.length === 0) {
			error = 'Cannot clone an unsaved setlist or a setlist with no songs.';
			return;
		}

		if (sets.length >= 10) {
			error = 'You have reached the maximum number of setlists allowed (100). Please delete some setlists before creating new ones.';
			return;
		}

		const newItem = { ...item, 
			id: nextTempId, 
			name: item.name + ' Copy', 
			createdAtMsUtc: Date.now() 
		};
		nextTempId--;

		loading = true;
		error = null;
		try {
			const result = await saveSet(null, newItem.name);
			if (result.ok) {
				newItem.id = result.value.id;
				newItem.createdAtMsUtc = result.value.createdAtMsUtc;
				newItem.name = result.value.name;
			} else {
				error = result.error.message;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
			return;
		} finally {
			loading = false;
		}

		loading = true;
		error = null;
		try {
			const result = await saveSetsOverview(newItem.id, newItem.songs);
			if (!result.ok) {
				error = result.error.message;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}

		sets = [newItem, ...sets].sort((a, b) => a.name.localeCompare(b.name));
		tableRef.startEdit(newItem);
	}

	function handleTableOpen(item: SetOverview) {
		console.log('Opening setlist:', item);
		router.navigate('Setlists', [`${item.id}`]);
	}

</script>

<div class="setlist-library">

	{#if router.route.params && router.route.params.length > 0}
		<SongEditor 
			setId={parseInt(router.route.params[0])}
		/>
	{:else}
		<section class="setlist-header">
			<div class="upload-section">
				<Upload />
			</div>
		</section>

		<BasicTableEdit
			bind:this={tableRef}
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
