<script lang="ts">
	import { auth } from "@/Auth.svelte";
	import { getSetsOverview } from "@shared/services/syncuprocks/musician/Api";
	import type { SetOverview } from "@shared/services/syncuprocks/musician/Types";
	import Upload from "./components/setlist/Upload.svelte";

	let sets: SetOverview[] = [];
	let selectedSet: SetOverview | null = null;
	let loading = false;
	let error: string | null = null;
	let searchQuery = '';
	let editingSetId: number | null = null;
	let editingName = '';
	let showDeleteConfirm = false;
	let nextTempId = -1;

	// Mock tags for each setlist
	const mockTags: Record<number, string[]> = {
		1: ['rock', 'wedding'],
		2: ['ska', 'punk'],
		3: ['jazz', 'blues'],
		4: ['pop', 'cover']
	};

	// Reactive statement to fetch sets when user changes
	$: if (auth.user?.userId) {
		fetchSets();
	}

	// Filter sets based on search query
	$: filteredSets = sets.filter(set => 
		set.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

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

	function selectSet(set: SetOverview) {
		selectedSet = set;
		editingSetId = null;
		console.log('Selected set:', set);
	}

	function getTags(setId: number): string[] {
		return mockTags[setId] || ['untagged'];
	}

	function createNewSetlist() {
		const newSet: SetOverview = {
			id: nextTempId,
			musicianId: parseInt(auth.user?.userId || '0'),
			name: 'New Setlist',
			createdAtMsUtc: Date.now(),
			songs: []
		};
		nextTempId--;
		sets = [newSet, ...sets];
		selectedSet = newSet;
		editingSetId = newSet.id;
		editingName = newSet.name;
	}

	function startEditName(set: SetOverview) {
		editingSetId = set.id;
		editingName = set.name;
	}

	function cancelEdit() {
		// If it was a new setlist that hasn't been saved, remove it
		if (editingSetId && editingSetId < 0) {
			sets = sets.filter(s => s.id !== editingSetId);
		}
		editingSetId = null;
		editingName = '';
	}

	function saveEdit() {
		if (editingSetId === null) return;
		const setIndex = sets.findIndex(s => s.id === editingSetId);
		if (setIndex !== -1) {
			sets[setIndex].name = editingName;
			sets = sets; // Trigger reactivity
		}
		editingSetId = null;
		editingName = '';
	}

	function handleDeleteClick() {
		showDeleteConfirm = true;
	}

	function confirmDelete() {
		if (selectedSet) {
			deleteMe(selectedSet.id);
			showDeleteConfirm = false;
		}
	}

	function cancelDelete() {
		showDeleteConfirm = false;
	}

	function deleteMe(setId: number) {
		console.log('Deleting setlist:', setId);
		// TODO: Implement actual delete API call
		sets = sets.filter(s => s.id !== setId);
		selectedSet = null;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			saveEdit();
		} else if (e.key === 'Escape') {
			cancelEdit();
		}
	}
</script>

<div class="setlist-library">
	<h3>Setlists</h3>

	<section class="setlist-header">
		<div class="header-controls">
			<div class="upload-section">
				<Upload />
			</div>
			<div class="action-buttons">
				<button class="btn btn-create" onclick={createNewSetlist}>Create New</button>
				<button 
					class="btn btn-delete" 
					onclick={handleDeleteClick}
					disabled={!selectedSet}
				>
					Delete
				</button>
			</div>
		</div>
	</section>

	<section class="setlist-search">
		<input
			type="text"
			placeholder="Search setlists..."
			bind:value={searchQuery}
			class="search-input"
		/>
	</section>

	<section class="setlist-items">
		{#if loading}
			<p>Loading setlists...</p>
		{:else if error}
			<p>Error: {error}</p>
		{:else if sets.length === 0}
			<p>No setlists found.</p>
		{:else}
			<div class="setlist-table">
				<div class="setlist-row header-row">
					<div class="col col-name">Name</div>
					<div class="col col-created">Created</div>
					<div class="col col-songs">Songs</div>
					<div class="col col-tags">Tags</div>
					<div class="col col-actions"></div>
				</div>
				{#each filteredSets as set (set.id)}
					<div 
						class="setlist-row" 
						class:selected={selectedSet?.id === set.id} 
						onclick={() => selectSet(set)}
					>
						<div class="col col-name">
							{#if editingSetId === set.id}
								<input
									type="text"
									bind:value={editingName}
									onkeydown={handleKeyDown}
									onclick={(e) => e.stopPropagation()}
									class="edit-input"
									autofocus
								/>
							{:else}
								{set.name}
							{/if}
						</div>
						<div class="col col-created">{new Date(set.createdAtMsUtc).toLocaleDateString()}</div>
						<div class="col col-songs">{set.songs.length}</div>
						<div class="col col-tags">
							<div class="tags">
								{#each getTags(set.id) as tag}
									<span class="tag">{tag}</span>
								{/each}
							</div>
						</div>
						<div class="col col-actions">
							{#if editingSetId === set.id}
							<div class="edit-actions" onclick={(e) => e.stopPropagation()}>
								<button class="btn-small btn-save" onclick={saveEdit}>✓</button>
								<button class="btn-small btn-cancel" onclick={cancelEdit}>✕</button>
								</div>
							{:else}
								<button 
									class="btn-small btn-edit" 
									onclick={(e) => { e.stopPropagation(); startEditName(set); }}
									title="Edit name"
								>
									✎
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	{#if showDeleteConfirm}
		<div class="modal-overlay" onclick={cancelDelete}>
			<div class="modal-dialog" onclick={(e) => e.stopPropagation()}>
				<h4>Delete Setlist?</h4>
				<p>Are you sure you want to delete "{selectedSet?.name}"? Important: Songs will not be deleted</p>
				<div class="modal-buttons">
					<button class="btn btn-danger" onclick={confirmDelete}>Delete</button>
					<button class="btn btn-secondary" onclick={cancelDelete}>Cancel</button>
				</div>
			</div>
		</div>
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

	.header-controls {
		display: flex;
		gap: 2rem;
		align-items: center;
		justify-content: space-between;
	}

	.upload-section {
		display: flex;
		gap: 1rem;
	}

	.action-buttons {
		display: flex;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		background-color: #f5f5f5;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background-color 0.2s, border-color 0.2s;
	}

	.btn:hover:not(:disabled) {
		background-color: #e8e8e8;
		border-color: #999;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-create {
		background-color: #28a745;
		color: white;
		border-color: #28a745;
	}

	.btn-create:hover {
		background-color: #218838;
		border-color: #218838;
	}

	.btn-delete {
		background-color: #dc3545;
		color: white;
		border-color: #dc3545;
	}

	.btn-delete:hover:not(:disabled) {
		background-color: #c82333;
		border-color: #c82333;
	}

	.btn-danger {
		background-color: #dc3545;
		color: white;
		border-color: #dc3545;
	}

	.btn-danger:hover {
		background-color: #c82333;
	}

	.btn-secondary {
		background-color: #6c757d;
		color: white;
		border-color: #6c757d;
	}

	.btn-secondary:hover {
		background-color: #5a6268;
	}

	.setlist-search {
		flex-shrink: 0;
		margin-bottom: 1.5rem;
	}

	.search-input {
		width: 100%;
		max-width: 300px;
		padding: 0.5rem 1rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		font-size: 1rem;
	}

	.search-input:focus {
		outline: none;
		border-color: #007bff;
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
	}

	.setlist-items {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}

	.setlist-table {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.setlist-row {
		display: grid;
		grid-template-columns: 2fr 1fr 0.75fr 1.5fr 0.5fr;
		gap: 1rem;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
		align-items: center;
	}

	.setlist-row.header-row {
		background-color: #0701016b;
		font-weight: bold;
		cursor: default;
		border-color: #999;
	}

	.setlist-row:not(.header-row):hover {
		background-color: #f9f9f965;
	}

	.setlist-row.selected {
		background-color: #054f8468;
		border-color: #007bff;
	}

	.col {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.col-name {
		font-weight: 500;
	}

	.col-created {
		text-align: center;
		font-size: 0.9rem;
	}

	.col-songs {
		text-align: center;
		font-size: 0.9rem;
	}

	.col-actions {
		text-align: right;
	}

	.edit-input {
		width: 100%;
		padding: 0.3rem 0.5rem;
		border: 1px solid #007bff;
		border-radius: 3px;
		font-size: 0.9rem;
	}

	.edit-input:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
	}

	.edit-actions {
		display: flex;
		gap: 0.3rem;
	}

	.btn-small {
		padding: 0.2rem 0.4rem;
		border: 1px solid #ccc;
		border-radius: 3px;
		background-color: #f5f5f5;
		cursor: pointer;
		font-size: 0.85rem;
		transition: background-color 0.2s;
	}

	.btn-small:hover {
		background-color: #e8e8e8;
	}

	.btn-save {
		background-color: #28a745;
		color: white;
		border-color: #28a745;
	}

	.btn-save:hover {
		background-color: #218838;
	}

	.btn-cancel {
		background-color: #dc3545;
		color: white;
		border-color: #dc3545;
	}

	.btn-cancel:hover {
		background-color: #c82333;
	}

	.btn-edit {
		background-color: #007bff;
		color: white;
		border-color: #007bff;
	}

	.btn-edit:hover {
		background-color: #0056b3;
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

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-dialog {
		background-color: white;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		max-width: 400px;
		width: 90%;
	}

	.modal-dialog h4 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.modal-dialog p {
		margin: 0 0 1.5rem 0;
		color: #666;
	}

	.modal-buttons {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}
</style>
