<script lang="ts">
	import type { Track, TrackType, TrackFormat } from '@shared/services/syncuprocks/musician/Types';

	interface Props {
		songId: number;
		oncreate?: (event: CustomEvent<Omit<Track, 'id' | 'createdAtMsUtc'>>) => void;
		oncancel?: () => void;
	}

	const { songId, oncreate, oncancel }: Props = $props();

	let trackName = $state('');
	let trackType = $state('Guitar');
	let trackFormat = $state('Lyric');
	let errors = $state<Record<string, string>>({});

	const typeOptions = [
		{ value: 'Guitar', label: 'Guitar', icon: '🎸' },
		{ value: 'Vocals', label: 'Vocals', icon: '🎤' },
		{ value: 'RhythmGuitar', label: 'Rhythm Guitar', icon: '🎸' }
	];

	const formatOptions = [
		{ value: 'Lyric', label: 'Lyric File', description: 'Contains timing and chord information' },
		{ value: 'Text', label: 'Plain Text', description: 'Static text without timing' }
	];

	function validate(): boolean {
		errors = {};
		if (!trackName.trim()) {
			errors.name = 'Track name is required';
		}
		return Object.keys(errors).length === 0;
	}

	function handleCreate() {
		if (!validate()) return;

		const newTrack: Omit<Track, 'id' | 'createdAtMsUtc'> = {
			songId,
			fileSetId: 0,
			name: trackName.trim(),
			type: trackType as TrackType,
			format: trackFormat as TrackFormat,
			versionNumber: 0,
			configuration: null
		};

		const event = new CustomEvent('create', { detail: newTrack });
		oncreate?.(event as any);
	}

	function handleCancel() {
		trackName = '';
		trackType = 'Guitar';
		trackFormat = 'Lyric';
		errors = {};
		oncancel?.();
	}
</script>

<div class="modal-overlay" onclick={handleCancel}>
	<div class="modal-dialog" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h3>Add New Track</h3>
			<button class="btn-close" onclick={handleCancel} aria-label="Close">✕</button>
		</div>

		<div class="modal-content">
			<!-- Track Name -->
			<div class="form-group">
				<label for="track-name">Track Name <span class="required">*</span></label>
				<input
					id="track-name"
					type="text"
					value={trackName}
					placeholder="e.g., Lead Vocals, Main Guitar, Click Track"
					onchange={(e) => (trackName = (e.target as HTMLInputElement).value)}
					class:error={errors.name}
				/>
				{#if errors.name}
					<span class="error-message">{errors.name}</span>
				{/if}
			</div>

			<!-- Track Type -->
			<div class="form-group">
				<label>Track Type <span class="required">*</span></label>
				<div class="type-selector">
					{#each typeOptions as option}
						<label class="type-option" class:selected={trackType === option.value}>
							<input
								type="radio"
								name="track-type"
								value={option.value}
								checked={trackType === option.value}
								onchange={() => (trackType = option.value)}
							/>
							<span class="icon">{option.icon}</span>
							<span class="label">{option.label}</span>
						</label>
					{/each}
				</div>
			</div>

			<!-- Track Format -->
			<div class="form-group">
				<label>Format <span class="required">*</span></label>
				<div class="format-selector">
					{#each formatOptions as option}
						<label class="format-option" class:selected={trackFormat === option.value}>
							<input
								type="radio"
								name="track-format"
								value={option.value}
								checked={trackFormat === option.value}
								onchange={() => (trackFormat = option.value)}
							/>
							<div class="option-content">
								<span class="option-label">{option.label}</span>
								<span class="option-description">{option.description}</span>
							</div>
						</label>
					{/each}
				</div>
			</div>

			<!-- Info -->
			<div class="info-box">
				<p>
					<strong>Note:</strong>
					The track format cannot be changed after creation. Choose carefully based on your content type.
				</p>
			</div>
		</div>

		<div class="modal-footer">
			<button class="btn btn-secondary" onclick={handleCancel}>Cancel</button>
			<button class="btn btn-primary" onclick={handleCreate}>Create Track</button>
		</div>
	</div>
</div>

<style>
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
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		max-width: 600px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px;
		border-bottom: 1px solid #eee;
		flex-shrink: 0;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
		transition: color 0.2s;
	}

	.btn-close:hover {
		color: #333;
	}

	.modal-content {
		padding: 20px;
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-group label {
		font-size: 14px;
		font-weight: 600;
		color: #333;
	}

	.required {
		color: #e74c3c;
	}

	input[type='text'] {
		padding: 8px 12px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
	}

	input[type='text']:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
	}

	input[type='text'].error {
		border-color: #e74c3c;
		background-color: #fff5f5;
	}

	.error-message {
		font-size: 12px;
		color: #e74c3c;
	}

	.type-selector {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 8px;
	}

	.type-option {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		border: 2px solid #eee;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.type-option:hover {
		border-color: #0066cc;
		background-color: #f0f7ff;
	}

	.type-option.selected {
		border-color: #0066cc;
		background-color: #e8f4ff;
	}

	.type-option input {
		display: none;
	}

	.type-option .icon {
		font-size: 24px;
	}

	.type-option .label {
		font-size: 12px;
		font-weight: 500;
		text-align: center;
	}

	.format-selector {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.format-option {
		display: flex;
		align-items: flex-start;
		flex-direction: row;
		gap: 12px;
		padding: 12px;
		border: 2px solid #eee;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.format-option:hover {
		border-color: #0066cc;
		background-color: #f0f7ff;
	}

	.format-option.selected {
		border-color: #0066cc;
		background-color: #e8f4ff;
	}

	.format-option input {
		margin-top: 2px;
		cursor: pointer;
	}

	.option-content {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.option-label {
		font-size: 14px;
		font-weight: 500;
	}

	.option-description {
		font-size: 12px;
		color: #666;
	}

	.info-box {
		background-color: #e8f4ff;
		border: 1px solid #b3d9ff;
		border-radius: 4px;
		padding: 12px;
	}

	.info-box p {
		margin: 0;
		font-size: 13px;
		color: #0052a3;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding: 16px 20px;
		border-top: 1px solid #eee;
		flex-shrink: 0;
		background-color: #fafafa;
	}

	.btn {
		padding: 8px 16px;
		border-radius: 4px;
		font-size: 14px;
		cursor: pointer;
		font-weight: 500;
		border: none;
		transition: all 0.2s;
	}

	.btn-primary {
		background-color: #0066cc;
		color: white;
	}

	.btn-primary:hover {
		background-color: #0052a3;
	}

	.btn-secondary {
		background-color: #f0f0f0;
		color: #333;
	}

	.btn-secondary:hover {
		background-color: #e0e0e0;
	}
</style>
