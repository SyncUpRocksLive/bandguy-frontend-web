<script lang="ts">
	import TrackCard from './TrackCard.svelte';
	import type { Track } from '@shared/services/syncuprocks/musician/Types';

	interface Props {
		tracks?: Track[];
		selectedTrack?: Track | null;
		onselect?: (track: Track) => void;
		ondelete?: (trackId: number) => void;
		onadd?: () => void;
	}

	const { tracks = [], selectedTrack = null, onselect, ondelete, onadd }: Props = $props();

	const typeIcons: Record<string, string> = {
		vocals: '🎤',
		drums: '🥁',
		bass: '🎸',
		guitar: '🎸',
		metronome: '⏱️',
		keyboard: '🎹',
		text: '📝',
		default: '🎵'
	};

	function getIcon(type: string): string {
		return typeIcons[type.toLowerCase()] || typeIcons.default;
	}

	function formatBadgeClass(format: string): string {
		return `format-badge format-${format.toLowerCase()}`;
	}
</script>

<div class="track-stack">
	<div class="stack-header">
		<h3>Tracks</h3>
		<button class="btn btn-add" title="Add track" onclick={onadd}>
			<span>+</span>
		</button>
	</div>

	<div class="track-list">
		{#if tracks.length === 0}
			<div class="empty-state">
				<p>No tracks yet</p>
				<button class="btn btn-primary" onclick={onadd}>Create First Track</button>
			</div>
		{:else}
			{#each tracks as track (track.id)}
				<TrackCard
					{track}
					isSelected={selectedTrack?.id === track.id}
					onselect={() => onselect?.(track)}
					ondelete={() => ondelete?.(track.id!)}
				/>
			{/each}
		{/if}
	</div>
</div>

<style>
	.track-stack {
		display: flex;
		flex-direction: column;
		width: 30%;
		background-color: #f5f5f5;
		border-right: 1px solid #ddd;
		min-width: 250px;
	}

	.stack-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 1px solid #ddd;
		background-color: #fff;
	}

	.stack-header h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
	}

	.btn-add {
		width: 32px;
		height: 32px;
		padding: 0;
		border: 1px solid #0066cc;
		background-color: #0066cc;
		color: white;
		border-radius: 4px;
		cursor: pointer;
		font-size: 18px;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s;
	}

	.btn-add:hover {
		background-color: #0052a3;
	}

	.track-list {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 32px 16px;
		color: #999;
		text-align: center;
	}

	.empty-state p {
		margin: 0 0 16px 0;
		font-size: 14px;
	}

	.btn-primary {
		padding: 8px 16px;
		background-color: #0066cc;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
	}

	.btn-primary:hover {
		background-color: #0052a3;
	}
</style>
