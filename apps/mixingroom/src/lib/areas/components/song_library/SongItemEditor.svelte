<script lang="ts">
	import { msToHMS } from '@shared/display/DisplayHelpers';

	interface Props {
		name: string;
		durationMs: number;
		onsave: (data: { name: string; durationMs: number }) => void;
		oncancel?: () => void;
	}

	const { 
		name, 
		durationMs, 
		onsave, 
		oncancel }: Props = $props();

	let editName = $state(name);
	let editDurationStr = $state(msToHMS(durationMs));
	let errors = $state<Record<string, string>>({});

	function msToMs(hms: string): number {
		const parts = hms.split(':');
		if (parts.length !== 2) return 0;

		const m = parseInt(parts[0]) || 0;
		const s = parseInt(parts[1]) || 0;
		return (m * 60 + s) * 1000;
	}

	function validate(): boolean {
		errors = {};
		if (!editName.trim()) {
			errors.name = 'Song name is required';
		}

		const parsed = msToMs(editDurationStr);
		if (parsed === 0 && editDurationStr !== '00:00:00') {
			errors.duration = 'Invalid duration format (use HH:MM:SS)';
		}

		return Object.keys(errors).length === 0;
	}

	function handleSave() {
		if (!validate()) {
			console.log('Validation failed:', errors);
			return;
		}
		
		console.log('Validation passed, saving with name:', editName, 'and duration:', editDurationStr);
		const durationMs = msToMs(editDurationStr);
		onsave({ name: editName.trim(), durationMs });
	}

	function handleCancel() {
		editName = name;
		editDurationStr = msToHMS(durationMs);
		errors = {};
		oncancel?.();
	}

	let textRef: HTMLInputElement | null = null;

	$effect(() => {
		textRef?.focus();
		textRef?.select();
	});
</script>

<div class="modal-overlay">
	<div class="modal-backdrop" onclick={handleCancel}></div>
	<div class="modal-dialog" onclick={(e) => e.stopPropagation()}>
		<div class="modal-content">
			<div class="modal-header">
				<h3>Edit Song</h3>
				<button class="btn-close" onclick={handleCancel} aria-label="Close">✕</button>
			</div>
			<div class="form-group">
				<label for="song-name">Song Name <span class="required">*</span></label>
				<input
					bind:this={textRef}
					id="song-name"
					type="text"
					value={editName}
					onchange={(e) => (editName = (e.target as HTMLInputElement).value)}
					class:error={errors.name}
				/>
				{#if errors.name}
					<span class="error-message">{errors.name}</span>
				{/if}
			</div>

			<div class="form-group">
				<label for="song-duration">Duration (MM:SS) <span class="required">*</span></label>
				<input
					id="song-duration"
					type="text"
					value={editDurationStr}
					placeholder="00:00"
					onchange={(e) => (editDurationStr = (e.target as HTMLInputElement).value)}
					class:error={errors.duration}
				/>
				{#if errors.duration}
					<span class="error-message">{errors.duration}</span>
				{/if}
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={handleCancel}>Cancel</button>
				<button class="btn btn-primary" onclick={handleSave}>Save</button>
			</div>
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
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-backdrop {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
	}

	.modal-dialog {
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		max-width: 500px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		z-index: 1010;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
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
