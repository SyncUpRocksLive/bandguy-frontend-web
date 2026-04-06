<script lang="ts">

	// Generic types
	export interface ColumnDefinition<T> {
		key: string;
		header: string;
		width?: string;
		editable?: boolean;
		display?: (item: T) => string;
		render?: (item: T, isEditing: boolean, value: any, onChange: (value: any) => void) => any;
		searchable?: boolean;
	}

	export interface TableConfig<T> {
		columns: ColumnDefinition<T>[];
		searchPlaceholder?: string;
		createButtonText?: string;
		deleteButtonText?: string;
		confirmDeleteMessage?: (item: T) => string;
		getItemId: (item: T) => string | number;
		getItemDisplayName?: (item: T) => string;
	}

	// Component props
	interface Props<T> {
		items: T[];
		config: TableConfig<T>;
		loading?: boolean;
		error?: string | null;
		selectedItem?: T | null;
		onselect?: (item: T) => void;
		oncreate?: () => void;
		ondelete?: (item: T) => void;
		onsave?: (item: T, changes: Record<string, any>) => void;
		oncancel?: (item: T) => void;
	}

	let {
		items = $bindable(),
		config,
		loading = $bindable(),
		error = $bindable(),
		selectedItem = $bindable(),
		onselect,
		oncreate,
		ondelete,
		onsave,
		oncancel
	}: Props<any> = $props();

	// Internal state
	let searchQuery = $state('');
	let editingItemId: string | number | null = $state(null);
	let editingValues: Record<string, any> = $state({});
	let showDeleteConfirm = $state(false);
	let itemToDelete: any = $state(null);

	// Filter items based on search query
	let filteredItems = $derived(items.filter(item => {
		if (!searchQuery) return true;
		return config.columns
			.filter(col => col.searchable !== false)
			.some(col => {
				const value = col.display ? col.display(item) : (item as any)[col.key];
				return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
			});
	}));

	// Grid template columns
	let gridTemplateColumns = $derived(config.columns.map(col => col.width || '1fr').join(' ') + ' 0.5fr');

	function selectItem(item: any) {
		selectedItem = item;
		onselect?.(item);
		editingItemId = null;
		editingValues = {};
	}

	function handleCreate() {
		oncreate && oncreate();
	}

	function handleDeleteClick(item: any) {
		console.log('Delete clicked for item:', item);
		itemToDelete = item;

		if (itemToDelete.id < 0) {
			ondelete?.(itemToDelete);
			itemToDelete = null;
			return;
		}

		showDeleteConfirm = true;
	}

	function confirmDelete() {
		console.log('Delete confirmed for item:', itemToDelete);
		if (itemToDelete) {
			ondelete?.(itemToDelete);
			showDeleteConfirm = false;
			itemToDelete = null;
		}
	}

	function cancelDelete() {
		showDeleteConfirm = false;
		itemToDelete = null;
	}

	function startEdit(item: any) {
		editingItemId = config.getItemId(item);
		editingValues = {};
		config.columns.forEach(col => {
			if (col.editable) {
				editingValues[col.key] = (item as any)[col.key];
			}
		});
	}

	function cancelEdit() {
		editingItemId = null;
		editingValues = {};
		oncancel && oncancel({ item: items.find(item => config.getItemId(item) === editingItemId) });
	}

	function saveEdit() {
		if (editingItemId === null) return;
		const item = items.find(item => config.getItemId(item) === editingItemId);
		if (item) {
			onsave && onsave(item, { changes: editingValues });
		}

		editingItemId = null;
		editingValues = {};
	}

	function updateEditingValue(key: string, value: any) {
		editingValues[key] = value;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			saveEdit();
		} else if (e.key === 'Escape') {
			cancelEdit();
		}
	}
</script>

<div class="table-container">
	<section class="table-header">
		<div class="header-controls">
			<div class="search-section">
				<input
					type="text"
					placeholder={config.searchPlaceholder || "Search..."}
					bind:value={searchQuery}
					class="search-input"
				/>
			</div>
			<div class="action-buttons">
				<button class="btn btn-create" onclick={handleCreate}>
					{config.createButtonText || 'Create New'}
				</button>
				<button
					class="btn btn-delete"
					onclick={() => selectedItem && handleDeleteClick(selectedItem)}
					disabled={!selectedItem}
				>
					{config.deleteButtonText || 'Delete'}
				</button>
			</div>
		</div>
	</section>

	<section class="table-content">
		{#if loading}
			<p>Loading...</p>
		{:else if error}
			<p>Error: {error}</p>
		{:else if items.length === 0}
			<p>No items found.</p>
		{:else}
			<div class="table-grid" style="grid-template-columns: {gridTemplateColumns}">
				<!-- Header row -->
				{#each config.columns as col}
					<div class="header-cell">{col.header}</div>
				{/each}
				<div class="header-cell">Actions</div>

				<!-- Data rows -->
				{#each filteredItems as item (config.getItemId(item))}
					{@const itemId = config.getItemId(item)}
					{@const isEditing = editingItemId === itemId}
					{@const isSelected = selectedItem && config.getItemId(selectedItem) === itemId}

					<div class="table-row" class:selected={isSelected} onclick={() => !isEditing && selectItem(item)}>
						{#each config.columns as col, idx}
							<div class="data-cell" class:first-cell={idx === 0}>
								{#if isEditing && col.editable}
									{#if col.render}
										{@html col.render(item, isEditing, editingValues[col.key], (value) => updateEditingValue(col.key, value))}
									{:else}
										<input
											type="text"
											value={editingValues[col.key] || ''}
											oninput={(e) => updateEditingValue(col.key, (e.target as HTMLInputElement).value)}
											onkeydown={handleKeyDown}
											onclick={(e) => e.stopPropagation()}
											class="edit-input"
											autofocus
										/>
									{/if}
								{:else}
									{col.display ? col.display(item) : (item as any)[col.key]}
								{/if}
							</div>
						{/each}

						<div class="data-cell actions-cell last-cell">
							{#if isEditing}
								<div class="edit-actions" onclick={(e) => e.stopPropagation()}>
									<button class="btn-small btn-save" onclick={saveEdit}>✓</button>
									<button class="btn-small btn-cancel" onclick={cancelEdit}>✕</button>
								</div>
							{:else}
								<button
									class="btn-small btn-edit"
									onclick={(e) => { e.stopPropagation(); startEdit(item); }}
									title="Edit"
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
				<h4>Delete Item?</h4>
				<p>
					{config.confirmDeleteMessage ?
						config.confirmDeleteMessage(itemToDelete) :
						`Are you sure you want to delete "${config.getItemDisplayName ? config.getItemDisplayName(itemToDelete) : 'this item'}"?`
					}
				</p>
				<div class="modal-buttons">
					<button class="btn btn-danger" onclick={confirmDelete}>Delete</button>
					<button class="btn btn-secondary" onclick={cancelDelete}>Cancel</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.table-container {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.table-header {
		flex-shrink: 0;
		margin-bottom: 1.5rem;
	}

	.header-controls {
		display: flex;
		gap: 2rem;
		align-items: center;
		justify-content: space-between;
	}

	.search-section {
		flex: 1;
		max-width: 300px;
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

	.search-input {
		width: 100%;
		padding: 0.5rem 1rem;
		border: 1px solid #cccccc;
		border-radius: 6px;
		font-size: 1rem;
		background-color: rgba(237, 250, 255, 0.687);
	}

	.search-input:focus {
		outline: none;
		border-color: #007bff;
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
	}

	.table-content {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}

	.table-grid {
		display: grid;
		gap: 0.5rem 0;
		align-items: center;
	}

	.table-row {
		display: contents;
	}

	.table-row:hover .data-cell {
		background-color: #f9f9f941;
	}

	.table-row.selected .data-cell {
		background-color: #033c649f;
		border-color: #7491b0;
	}

	.header-cell {
		padding: 0.75rem;
		font-weight: regular;
		background-color: #4d020246;
		border: 1px solid #452929;
		border-radius: 4px;
	}

	.data-cell {
		padding: 0.75rem;
		border: 1px solid #000000;
		transition: background-color 0.2s;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* First cell in row - left rounded corners */
	.data-cell.first-cell {
		border-radius: 6px 0 0 6px;
	}

	/* Last cell in row - right rounded corners */
	.data-cell.last-cell {
		border-radius: 0 6px 6px 0;
	}

	.actions-cell {
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
		justify-content: flex-end;
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
