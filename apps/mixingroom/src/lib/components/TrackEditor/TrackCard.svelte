<script lang="ts">
	import type { Track } from '@shared/services/syncuprocks/musician/Types';

	interface Props {
		track: Track;
		isSelected?: boolean;
		onselect?: () => void;
		ondelete?: () => void;
	}

	const { track, isSelected = false, onselect, ondelete }: Props = $props();

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

	function handleDelete(e: Event) {
		e.stopPropagation();
		ondelete?.();
	}
</script>

<div class="track-card" class:selected={isSelected} onclick={onselect}>
	<div class="track-content">
		<div class="track-icon">{getIcon(track.type)}</div>
		<div class="track-info">
			<div class="track-name">{track.name}</div>
			<div class="track-meta">
				<span class="track-type">{track.type}</span>
				<span class={formatBadgeClass(track.format)}>{track.format}</span>
			</div>
		</div>
	</div>
	<button
		class="btn-delete"
		title="Delete track"
		onclick={handleDelete}
		aria-label="Delete {track.name}"
	>
		🗑️
	</button>
</div>

<style>
	.track-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		background-color: #fff;
		border-bottom: 1px solid #eee;
		cursor: pointer;
		transition: all 0.2s;
		border-left: 4px solid transparent;
	}

	.track-card:hover {
		background-color: #f9f9f9;
	}

	.track-card.selected {
		background-color: #e8f4ff;
		border-left-color: #0066cc;
	}

	.track-content {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
		min-width: 0;
	}

	.track-icon {
		font-size: 20px;
		flex-shrink: 0;
	}

	.track-info {
		flex: 1;
		min-width: 0;
	}

	.track-name {
		font-size: 14px;
		font-weight: 500;
		color: #333;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.track-meta {
		display: flex;
		gap: 8px;
		align-items: center;
		font-size: 12px;
		margin-top: 4px;
	}

	.track-type {
		color: #666;
		padding: 2px 8px;
		background-color: #f0f0f0;
		border-radius: 2px;
	}

	.format-badge {
		padding: 2px 8px;
		border-radius: 12px;
		font-weight: 500;
		text-transform: capitalize;
	}

	.format-audio {
		background-color: #dbe9f6;
		color: #0052a3;
	}

	.format-metronome {
		background-color: #fff3cd;
		color: #856404;
	}

	.format-lyric {
		background-color: #d1ecf1;
		color: #0c5460;
	}

	.format-tab {
		background-color: #d1ecf1;
		color: #0c5460;
	}

	.btn-delete {
		flex-shrink: 0;
		background: none;
		border: none;
		font-size: 16px;
		cursor: pointer;
		padding: 4px 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.track-card:hover .btn-delete {
		opacity: 1;
	}

	.btn-delete:hover {
		transform: scale(1.2);
	}
</style>
