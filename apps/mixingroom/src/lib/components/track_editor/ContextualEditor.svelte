<script lang="ts">
	import AudioTrackEditor from './editors/AudioTrackEditor.svelte';
	import MetronomeTrackEditor from './editors/MetronomeTrackEditor.svelte';
	import TextTrackEditor from './editors/TextTrackEditor.svelte';
	import type { Track, TrackFormat } from '@shared/services/syncuprocks/musician/Types';

	interface Props {
		track: Track;
		hasChanges?: boolean;
		loading?: boolean;
		onchange?: (track: Track, fields: [string]) => void;
		onrevert?: () => void;
	}

	let { 
		track, 
		hasChanges = $bindable(false), 
		loading = $bindable(false), 
		onchange, 
		onrevert 
	}: Props = $props();

	function handleSave() {
		if (loading || !hasChanges) {
			return;
		}

		if (currentEditorRef) {
			let [isValid, errorMessage] = currentEditorRef.isStateValid();
			if (!isValid) {
				// TODO: Replace with proper UI error display
				console.error('ContextualEditor: Track state is invalid:', errorMessage);
				return;
			}

			console.log('ContextualEditor: Save invoked...');
			currentEditorRef.save();
			hasChanges = false;
		} else {
			console.warn('ContextualEditor: No editor reference available to save');
		}
	}

	let currentEditorRef: AudioTrackEditor | MetronomeTrackEditor | TextTrackEditor | null = $state(null);
</script>

<div class="contextual-editor">
	<!-- Top Bar -->
	<div class="editor-top-bar">
		<div class="track-header">
			<span class="track-display"
				>Track: <strong>{track.name}</strong>
				<em>({track.type})</em></span
			>
		</div>
		<div class="button-group">
			<button
				class="btn btn-secondary"
				disabled={!hasChanges || loading}
				onclick={onrevert}
				title="Discard changes"
			>
				Revert
			</button>
			<button
				class="btn btn-primary"
				disabled={!hasChanges || loading}
				onclick={handleSave}
				title="Save changes"
			>
				{loading ? 'Saving...' : 'Save Track'}
			</button>
		</div>
	</div>

	<!-- Content Area (Format-specific editor) -->
	<div class="editor-content">
		{#if track.format === 'audio'}
			<!-- <AudioTrackEditor {track} {onchange} /> -->
			 <b>Unsupported format</b>
		{:else if track.format === 'metronome'}
			<!-- <MetronomeTrackEditor {track} {onchange} /> -->
			 <b>Unsupported format</b>
		{:else if track.format === 'Lyric' || track.format === 'tab' || track.format === 'Text' || track.format === 'Text,'}
			<TextTrackEditor 
				bind:this={currentEditorRef}
				{track} 
				{onchange} />
		{:else}
			<div class="unsupported-format">
				<p>Format <strong>{track.format}</strong> is not yet supported</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.contextual-editor {
		display: flex;
		flex-direction: column;
		flex: 1;
		background-color: #fff;
		overflow: hidden;
	}

	.editor-top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 1px solid #ddd;
		background-color: #fafafa;
		flex-shrink: 0;
		gap: 16px;
	}

	.track-header {
		font-size: 14px;
		font-weight: 500;
	}

	.track-display {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.track-display strong {
		color: #0066cc;
	}

	.track-display em {
		color: #666;
		font-style: normal;
		font-weight: normal;
	}

	.button-group {
		display: flex;
		gap: 8px;
	}

	.btn {
		padding: 8px 16px;
		border: 1px solid transparent;
		border-radius: 4px;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: 500;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: #0066cc;
		color: white;
	}

	.btn-primary:not(:disabled):hover {
		background-color: #0052a3;
	}

	.btn-secondary {
		background-color: #f0f0f0;
		color: #333;
		border-color: #ddd;
	}

	.btn-secondary:not(:disabled):hover {
		background-color: #e0e0e0;
	}

	.editor-content {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
	}

	.unsupported-format {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #999;
	}

	.unsupported-format p {
		margin: 0;
	}
</style>
