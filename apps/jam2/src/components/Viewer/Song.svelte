<script lang="ts">
	interface Song {
		id: number;
		title: string;
		artist?: string;
		duration?: number;
		bpm?: number;
		key?: string;
	}

	interface Props {
		song?: Song;
		playing?: boolean;
		onPlayToggle?: () => void;
		onNext?: () => void;
		onPrevious?: () => void;
	}

	let {
		song,
		playing = false,
		onPlayToggle,
		onNext,
		onPrevious
	}: Props = $props();
</script>

<div class="song-header">
	<div class="song-info">
		{#if song}
			<h2 class="song-title">{song.title}</h2>
			{#if song.artist}
				<p class="song-artist">{song.artist}</p>
			{/if}
			<div class="song-meta">
				{#if song.key}
					<span class="meta-item">Key: <strong>{song.key}</strong></span>
				{/if}
				{#if song.bpm}
					<span class="meta-item">BPM: <strong>{song.bpm}</strong></span>
				{/if}
			</div>
		{:else}
			<h2 class="song-title">No Song Selected</h2>
			<p class="song-artist">Select a song to begin</p>
		{/if}
	</div>

	<div class="song-controls">
		<button
			class="control-button"
			onclick={onPrevious}
			disabled={!onPrevious}
			title="Previous"
		>
			⏮
		</button>

		<button
			class="control-button play-button"
			onclick={onPlayToggle}
			disabled={!onPlayToggle || !song}
			title={playing ? 'Pause' : 'Play'}
		>
			{playing ? '⏸' : '▶'}
		</button>

		<button
			class="control-button"
			onclick={onNext}
			disabled={!onNext}
			title="Next"
		>
			⏭
		</button>
	</div>
</div>

<style>
	.song-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		background: linear-gradient(135deg, rgba(79, 195, 247, 0.1), rgba(129, 212, 250, 0.1));
		border-bottom: 1px solid rgba(79, 195, 247, 0.3);
		color: white;
		gap: 2rem;
	}

	.song-info {
		flex: 1;
	}

	.song-title {
		margin: 0 0 0.5rem 0;
		font-size: 1.75rem;
		font-weight: bold;
	}

	.song-artist {
		margin: 0 0 0.75rem 0;
		color: #aaa;
		font-size: 1rem;
	}

	.song-meta {
		display: flex;
		gap: 1.5rem;
		font-size: 0.9rem;
	}

	.meta-item {
		color: #4fc3f7;
	}

	.song-controls {
		display: flex;
		gap: 0.5rem;
	}

	.control-button {
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 1.2rem;
		transition: all 0.2s;
	}

	.control-button:hover:not(:disabled) {
		background: rgba(79, 195, 247, 0.3);
		border-color: #4fc3f7;
	}

	.control-button:active:not(:disabled) {
		background: rgba(79, 195, 247, 0.5);
	}

	.control-button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.play-button {
		background: rgba(79, 195, 247, 0.2);
		border-color: #4fc3f7;
		font-size: 1.5rem;
	}

	.play-button:hover:not(:disabled) {
		background: rgba(79, 195, 247, 0.4);
	}

	@media (max-width: 768px) {
		.song-header {
			flex-direction: column;
			gap: 1rem;
		}

		.song-title {
			font-size: 1.25rem;
		}

		.song-meta {
			flex-direction: column;
			gap: 0.5rem;
		}

		.control-button {
			padding: 0.5rem 0.75rem;
			font-size: 1rem;
		}
	}
</style>
