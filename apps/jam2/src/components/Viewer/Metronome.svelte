<script lang="ts">
	interface Props {
		bpm?: number;
		tick?: number;
		duration?: number;
	}

	let { bpm = 120, tick = 0, duration = 0 }: Props = $props();

	// Format time as MM:SS
	function formatTime(ms: number): string {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	$derived currentTime = formatTime(tick);
	$derived totalTime = formatTime(duration);
	$derived progress = duration > 0 ? (tick / duration) * 100 : 0;
</script>

<div class="metronome">
	<div class="time-display">
		<span class="current-time">{currentTime}</span>
		<span class="separator">/</span>
		<span class="total-time">{totalTime}</span>
	</div>

	<div class="progress-bar">
		<div class="progress-fill" style="width: {progress}%"></div>
	</div>

	<div class="tempo-info">
		<span class="bpm-label">Tempo:</span>
		<span class="bpm-value">{bpm} BPM</span>
	</div>
</div>

<style>
	.metronome {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 0.5rem;
		color: white;
	}

	.time-display {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		font-family: 'Courier New', monospace;
		font-size: 1.5rem;
		font-weight: bold;
	}

	.separator {
		color: #888;
	}

	.current-time {
		color: #4fc3f7;
		min-width: 50px;
		text-align: right;
	}

	.total-time {
		color: #888;
		min-width: 50px;
	}

	.progress-bar {
		height: 4px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #4fc3f7, #81d4fa);
		transition: width 0.1s linear;
	}

	.tempo-info {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.bpm-label {
		color: #aaa;
	}

	.bpm-value {
		color: #4fc3f7;
		font-weight: bold;
	}
</style>
