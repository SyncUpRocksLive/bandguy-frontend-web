<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { appState } from '../State.svelte';
	import { SongPlayStatus } from '../Types/Types';
	import type { Song } from '../Types/Client';

	interface Props {
		song: Song;
		mode: 'host' | 'solo';
	}

	let { song, mode }: Props = $props();

	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let videoElement = $state<HTMLVideoElement>();

	const dispatch = createEventDispatcher();

	onMount(() => {
		// Initialize video player if available
		if (videoElement) {
			videoElement.addEventListener('timeupdate', handleTimeUpdate);
			videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
			videoElement.addEventListener('ended', handleEnded);
		}
	});

	function handleTimeUpdate() {
		if (videoElement) {
			currentTime = videoElement.currentTime * 1000; // Convert to milliseconds
		}
	}

	function handleLoadedMetadata() {
		if (videoElement) {
			duration = videoElement.duration * 1000; // Convert to milliseconds
		}
	}

	function handleEnded() {
		isPlaying = false;
		appState.updateStore({ songPlayStatus: SongPlayStatus.Stop });
		dispatch('ended');
	}

	function play() {
		if (videoElement) {
			videoElement.play();
			isPlaying = true;
			appState.updateStore({ songPlayStatus: SongPlayStatus.Play });
		}
	}

	function pause() {
		if (videoElement) {
			videoElement.pause();
			isPlaying = false;
			appState.updateStore({ songPlayStatus: SongPlayStatus.Pause });
		}
	}

	function stop() {
		if (videoElement) {
			videoElement.pause();
			videoElement.currentTime = 0;
			isPlaying = false;
			currentTime = 0;
			appState.updateStore({ songPlayStatus: SongPlayStatus.Stop });
		}
	}

	function seek(time: number) {
		if (videoElement) {
			videoElement.currentTime = time / 1000; // Convert from milliseconds
			currentTime = time;
		}
	}

	function formatTime(ms: number): string {
		const totalSeconds = Math.floor(ms / 1000);
		const mins = Math.floor(totalSeconds / 60);
		const secs = totalSeconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Reactive statement to sync with global state
	$effect(() => {
		if (appState.store.songPlayStatus === SongPlayStatus.Play && !isPlaying) {
			play();
		} else if (appState.store.songPlayStatus === SongPlayStatus.Pause && isPlaying) {
			pause();
		} else if (appState.store.songPlayStatus === SongPlayStatus.Stop) {
			stop();
		}
	});
</script>

<div class="song-view">
	<div class="song-header">
		<h2>{song?.title || song?.name || 'Untitled Song'}</h2>
		{#if song?.artist}
			<p class="artist">{song.artist}</p>
		{/if}
	</div>

	<div class="player-controls">
		<div class="time-display">
			{formatTime(currentTime)} / {formatTime(duration)}
		</div>

		<div class="controls">
			<button class="control-btn" onclick={play} disabled={isPlaying}>
				▶ Play
			</button>
			<button class="control-btn" onclick={pause} disabled={!isPlaying}>
				⏸ Pause
			</button>
			<button class="control-btn" onclick={stop}>
				⏹ Stop
			</button>
		</div>

		<input
			type="range"
			min="0"
			max={duration}
			value={currentTime}
			oninput={(e) => seek(parseInt(e.currentTarget.value))}
			class="seek-bar"
		/>
	</div>

	<div class="video-container">
		{#if song?.videoUrl}
			<video
				bind:this={videoElement}
				width="100%"
				height="400"
				controls={false}
				preload="metadata"
			>
				<source src={song.videoUrl} type="video/mp4" />
				Your browser does not support the video tag.
			</video>
		{:else}
			<div class="no-video">
				<p>No video available for this song</p>
				<p>Audio playback would go here</p>
			</div>
		{/if}
	</div>

	<div class="lyrics-container">
		<!-- Basic lyrics display - could be enhanced with BasicLyricViewer logic -->
		{#if song?.lyrics}
			<div class="lyrics">
				<pre>{song.lyrics}</pre>
			</div>
		{:else}
			<div class="no-lyrics">
				<p>No lyrics available</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.song-view {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 20px;
		color: white;
	}

	.song-header {
		margin-bottom: 20px;
	}

	.song-header h2 {
		margin: 0 0 10px 0;
		font-size: 1.5rem;
	}

	.artist {
		margin: 0;
		color: rgba(255, 255, 255, 0.8);
		font-style: italic;
	}

	.player-controls {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 20px;
		padding: 15px;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 8px;
	}

	.time-display {
		text-align: center;
		font-size: 1.1rem;
		font-weight: bold;
	}

	.controls {
		display: flex;
		gap: 10px;
		justify-content: center;
	}

	.control-btn {
		padding: 8px 16px;
		background-color: #343a40;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
	}

	.control-btn:hover:not(:disabled) {
		background-color: #495057;
	}

	.control-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.seek-bar {
		width: 100%;
		height: 6px;
		border-radius: 3px;
		background: rgba(255, 255, 255, 0.3);
		outline: none;
		-webkit-appearance: none;
	}

	.seek-bar::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #007bff;
		cursor: pointer;
	}

	.seek-bar::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #007bff;
		cursor: pointer;
		border: none;
	}

	.video-container {
		flex: 1;
		margin-bottom: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		min-height: 300px;
	}

	.video-container video {
		max-width: 100%;
		max-height: 100%;
		border-radius: 8px;
	}

	.no-video {
		text-align: center;
		color: rgba(255, 255, 255, 0.7);
	}

	.lyrics-container {
		flex: 1;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		padding: 20px;
		overflow-y: auto;
	}

	.lyrics pre {
		margin: 0;
		white-space: pre-wrap;
		font-family: inherit;
		line-height: 1.5;
	}

	.no-lyrics {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: rgba(255, 255, 255, 0.7);
	}
</style>
