<script lang="ts">
	import TrackStack from './TrackStack.svelte';
	import ContextualEditor from './ContextualEditor.svelte';
	import AddTrackModal from './AddTrackModal.svelte';
	import type { Track } from '@shared/services/syncuprocks/musician/Types';

	interface Props {
		tracks?: Track[];
		loading?: boolean;
		error?: string | null;
		ondelete?: (trackId: number) => void;
		oncreatetrack?: (track: Omit<Track, 'songId' | 'fileSetId' | 'id' | 'createdAtMsUtc'>) => void;
	}

	let {
		tracks = $bindable([]),
		loading = $bindable(false),
		error = $bindable(null),
		ondelete,
		oncreatetrack
	}: Props = $props();

	let selectedTrack: Track | null = $state(null);
	let originalTrack: Track | null = $state(null);
	let showAddTrackModal = $state(false);
	let hasChanges = $state(false);

	function selectTrack(track: Track) {
		if (hasChanges && selectedTrack) {
			const confirmed = confirm('You have unsaved changes. Do you want to discard them?');
			if (!confirmed) 
				return;
		}

		selectedTrack = track;
		originalTrack = JSON.parse(JSON.stringify(track));
		hasChanges = false;
	}

	function handleTrackChange(track: Track, fields: [string]) {
		if (selectedTrack) {
			console.log('TrackEditor: Track updated: id', track.id, fields);
			
			hasChanges = true;
		}
	}

	function handleRevert() {
		if (originalTrack) {
			selectedTrack = JSON.parse(JSON.stringify(originalTrack));
			hasChanges = false;
		}
	}

	function handleDeleteTrack(trackId: number) {
		if (confirm('Are you sure you want to delete this track?')) {
			ondelete?.(trackId);
			if (selectedTrack?.id === trackId) {
				selectedTrack = null;
				originalTrack = null;
				hasChanges = false;
			}
		}
	}

	function handleAddTrack() {
		showAddTrackModal = true;
	}

	function handleCreateTrack(event: CustomEvent<Omit<Track, 'id' | 'createdAtMsUtc'>>) {
		console.log('TrackEditor::handleCreateTrack() Creating new track with data:', event.detail);
		const newTrack = event.detail;
		oncreatetrack?.(newTrack);
		showAddTrackModal = false;
	}

	let contextualEditorRef: ContextualEditor | null = $state(null);
</script>

<div class="track-editor">
	{#if error}
		<div class="error-message">
			Error: {error}
		</div>
	{/if}

	<div class="editor-layout">
		<!-- Left Pane: Track Stack -->
		<TrackStack
			{tracks}
			{selectedTrack}
			onselect={selectTrack}
			ondelete={handleDeleteTrack}
			onadd={handleAddTrack}
		/>

		<!-- Right Pane: Contextual Editor -->
		{#if selectedTrack}
			<ContextualEditor
				bind:track={selectedTrack}
				bind:hasChanges={hasChanges}
				bind:loading={loading}
				onchange={handleTrackChange}
				onrevert={handleRevert}
			/>
		{:else}
			<div class="no-selection">
				<p>Select a track to edit or create a new one</p>
			</div>
		{/if}
	</div>

	<!-- Add Track Modal -->
	{#if showAddTrackModal}
		<AddTrackModal
			oncreate={handleCreateTrack}
			oncancel={() => (showAddTrackModal = false)}
		/>
	{/if}
</div>

<style>
	.track-editor {
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 0;
	}

	.error-message {
		background-color: #fee;
		color: #c33;
		padding: 12px;
		border-bottom: 1px solid #fcc;
	}

	.editor-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
		gap: 0;
	}

	.no-selection {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		color: #999;
		font-size: 16px;
	}
</style>
