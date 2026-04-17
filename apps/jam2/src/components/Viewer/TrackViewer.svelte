<script lang="ts">
	import Metronome from './Metronome.svelte';
	import Song from './Song.svelte';

	interface Track {
		id: number;
		name: string;
		bpm?: number;
		duration?: number;
	}

	interface Props {
		track?: Track;
		tick?: number;
		playing?: boolean;
		onPlayToggle?: () => void;
	}

	let {
		track,
		tick = 0,
		playing = false,
		onPlayToggle
	}: Props = $props();
</script>

<div class="track-viewer">
	<Song
		song={track}
		{playing}
		onPlayToggle={onPlayToggle}
	/>

	<Metronome
		bpm={track?.bpm}
		tick={tick}
		duration={track?.duration}
	/>
</div>

<style>
	.track-viewer {
		display: flex;
		flex-direction: column;
		background: rgba(0, 0, 0, 0.9);
		color: white;
	}
</style>
