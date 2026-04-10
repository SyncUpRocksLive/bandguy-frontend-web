<script lang="ts">
	import type { Track } from '@shared/services/syncuprocks/musician/Types';

	interface Props {
		track: Track;
		onchange?: (track: Track) => void;
	}

	const { track, onchange }: Props = $props();

	let config = $state(track.configuration ? JSON.parse(track.configuration) : {});
	let bpm = $state(config.bpm || 120);
	let timeSignature = $state(config.timeSignature || '4/4');
	let accentPattern = $state(config.accentPattern || '1-0-0-0');
	let isTapping = $state(false);
	let lastTapTime = 0;

	function updateConfig() {
		const newConfig = {
			bpm,
			timeSignature,
			accentPattern
		};
		onchange?.({
			...track,
			configuration: JSON.stringify(newConfig)
		});
	}

	function handleBpmChange(value: number) {
		bpm = Math.max(20, Math.min(300, value));
		updateConfig();
	}

	function handleTimeSignatureChange(value: string) {
		timeSignature = value;
		updateConfig();
	}

	function handleAccentPatternChange(value: string) {
		accentPattern = value;
		updateConfig();
	}

	function handleTapTempo() {
		const now = Date.now();
		if (isTapping && lastTapTime > 0 && now - lastTapTime < 3000) {
			const interval = now - lastTapTime;
			const newBpm = Math.round(60000 / interval);
			handleBpmChange(newBpm);
		} else {
			isTapping = true;
		}
		lastTapTime = now;

		// Reset tapping mode after 3 seconds of inactivity
		setTimeout(() => {
			isTapping = false;
			lastTapTime = 0;
		}, 3000);
	}
</script>

<div class="metronome-editor">
	<div class="editor-section">
		<h4>Tempo</h4>

		<div class="form-group">
			<label for="bpm-input">BPM (Beats Per Minute)</label>
			<div class="bpm-group">
				<input
					id="bpm-input"
					type="number"
					min="20"
					max="300"
					value={bpm}
					onchange={(e) => handleBpmChange(parseInt((e.target as HTMLInputElement).value))}
				/>
				<button class="btn btn-tap" class:tapping={isTapping} onclick={handleTapTempo}>
					{isTapping ? 'Tap again...' : 'Tap Tempo'}
				</button>
			</div>
		</div>

		<div class="form-group">
			<label for="time-sig-select">Time Signature</label>
			<select
				id="time-sig-select"
				value={timeSignature}
				onchange={(e) => handleTimeSignatureChange((e.target as HTMLSelectElement).value)}
			>
				<option value="2/4">2/4</option>
				<option value="3/4">3/4</option>
				<option value="4/4">4/4</option>
				<option value="6/8">6/8</option>
				<option value="5/4">5/4</option>
				<option value="7/8">7/8</option>
			</select>
		</div>
	</div>

	<div class="editor-section">
		<h4>Accent Pattern</h4>
		<div class="form-group">
			<label for="accent-input"
				>Pattern <span class="help-text">(1 = accent, 0 = regular, separated by hyphens)</span></label
			>
			<input
				id="accent-input"
				type="text"
				value={accentPattern}
				placeholder="1-0-0-0"
				onchange={(e) => handleAccentPatternChange((e.target as HTMLInputElement).value)}
			/>
		</div>

		<div class="preview-section">
			<h5>Pattern Preview</h5>
			<div class="accent-preview">
				{#each accentPattern.split('-') as beat, idx}
					<div class="beat" class:accent={beat === '1'}>
						{beat === '1' ? '●' : '○'}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="editor-section">
		<h4>Preview</h4>
		<div class="preview-display">
			<p>
				<strong>Current BPM:</strong>
				<code>{bpm}</code>
				bpm
			</p>
			<p>
				<strong>Time Signature:</strong>
				<code>{timeSignature}</code>
			</p>
			<p>
				<strong>Accent Pattern:</strong>
				<code>{accentPattern}</code>
			</p>
		</div>
	</div>
</div>

<style>
	.metronome-editor {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 500px;
	}

	.editor-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.editor-section h4 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: #333;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.editor-section h5 {
		margin: 0;
		font-size: 12px;
		font-weight: 500;
		color: #666;
		text-transform: uppercase;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-group label {
		font-size: 13px;
		font-weight: 500;
		color: #333;
	}

	.help-text {
		display: inline;
		font-size: 12px;
		font-weight: normal;
		color: #999;
		margin-left: 8px;
	}

	.bpm-group {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	#bpm-input {
		width: 100px;
		padding: 8px 12px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
		text-align: center;
	}

	#bpm-input:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
	}

	.btn-tap {
		padding: 8px 16px;
		background-color: #fff;
		color: #333;
		border: 2px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		font-size: 13px;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-tap:hover {
		border-color: #0066cc;
		color: #0066cc;
	}

	.btn-tap.tapping {
		background-color: #0066cc;
		color: white;
		border-color: #0066cc;
		animation: pulse 0.5s;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
		100% {
			transform: scale(1);
		}
	}

	#time-sig-select,
	#accent-input {
		padding: 8px 12px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
		background-color: #fff;
	}

	#time-sig-select:focus,
	#accent-input:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
	}

	.preview-section {
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid #eee;
	}

	.accent-preview {
		display: flex;
		gap: 8px;
		margin-top: 12px;
	}

	.beat {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid #ddd;
		border-radius: 4px;
		font-size: 20px;
		color: #999;
		background-color: #f9f9f9;
		transition: all 0.2s;
	}

	.beat.accent {
		background-color: #ffd700;
		border-color: #ffb700;
		color: #333;
		font-weight: bold;
	}

	.preview-display {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.preview-display p {
		margin: 0;
		font-size: 13px;
	}

	.preview-display code {
		background-color: #f5f5f5;
		padding: 2px 6px;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
		color: #666;
	}
</style>
