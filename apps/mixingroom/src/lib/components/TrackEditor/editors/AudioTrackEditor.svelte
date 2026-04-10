<script lang="ts">
	import type { Track } from '@shared/services/syncuprocks/musician/Types';

	interface Props {
		track: Track;
		onchange?: (track: Track) => void;
	}

	const { track, onchange }: Props = $props();

	let localFilesetId = $state(track.fileSetId);
	let localVersionNumber = $state(track.versionNumber);
	let useLatestVersion = $state(track.versionNumber === 0 || !track.versionNumber);

	function updateFilesetId(value: number | null) {
		localFilesetId = value;
		onchange?.({
			...track,
			fileSetId: value ?? 0
		});
	}

	function toggleUseLatest() {
		useLatestVersion = !useLatestVersion;
		localVersionNumber = useLatestVersion ? 0 : 1;
		onchange?.({
			...track,
			versionNumber: localVersionNumber
		});
	}

	function updateVersionNumber(value: number) {
		localVersionNumber = value;
		useLatestVersion = false;
		onchange?.({
			...track,
			versionNumber: value
		});
	}
</script>

<div class="audio-editor">
	<div class="editor-section">
		<h4>Audio File</h4>

		<div class="form-group">
			<label for="fileset-select">Fileset</label>
			<select id="fileset-select" value={localFilesetId || ''} onchange={(e) => {
				const val = (e.target as HTMLSelectElement).value;
				updateFilesetId(val ? parseInt(val) : null);
			}}>
				<option value="">-- Select a fileset --</option>
				<!-- TODO: Populate with actual filesets from API -->
				<option value="1">Sample Audio File (ID: 1)</option>
				<option value="2">Background Track (ID: 2)</option>
			</select>
		</div>

		{#if localFilesetId}
			<div class="form-group">
				<label>Version</label>
				<div class="version-selector">
					<label class="checkbox-label">
						<input type="checkbox" checked={useLatestVersion} onchange={toggleUseLatest} />
						Always use latest version
					</label>

					{#if !useLatestVersion}
						<div class="version-input">
							<label for="version-number">Specific Version</label>
							<select
								id="version-number"
								value={localVersionNumber || 1}
								onchange={(e) => updateVersionNumber(parseInt((e.target as HTMLSelectElement).value))}
							>
								<!-- TODO: Populate with available versions -->
								<option value="1">v1</option>
								<option value="2">v2</option>
								<option value="3">v3</option>
							</select>
						</div>
					{/if}
				</div>
			</div>

			<div class="form-group">
				<label>Preview</label>
				<audio controls class="audio-preview">
					<source src="" type="audio/mpeg" />
					Your browser does not support the audio element.
				</audio>
			</div>
		{/if}
	</div>

	<div class="editor-section">
		<h4>Metadata</h4>
		<div class="metadata-display">
			<p>
				<strong>Format:</strong>
				<code>{track.format}</code>
			</p>
			<p>
				<strong>Created:</strong>
				<code>{track.created_at ? new Date(track.created_at).toLocaleDateString() : 'N/A'}</code>
			</p>
		</div>
	</div>
</div>

<style>
	.audio-editor {
		display: flex;
		flex-direction: column;
		gap: 24px;
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

	.form-group select {
		padding: 8px 12px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
		background-color: #fff;
	}

	.form-group select:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
	}

	.version-selector {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		cursor: pointer;
	}

	.checkbox-label input {
		cursor: pointer;
	}

	.version-input {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-left: 24px;
	}

	.version-input label {
		font-size: 13px;
		font-weight: 500;
	}

	.version-input select {
		padding: 8px 12px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
	}

	.audio-preview {
		width: 100%;
		max-width: 400px;
	}

	.metadata-display {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.metadata-display p {
		margin: 0;
		font-size: 13px;
	}

	.metadata-display code {
		background-color: #f5f5f5;
		padding: 2px 6px;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
		color: #666;
	}
</style>
