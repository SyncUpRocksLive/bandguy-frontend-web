<script lang="ts">
	import type { Track } from '@shared/services/syncuprocks/musician/Types';
	import { getFilesetDataByVersion, uploadFilesetData } from '@shared/services/syncuprocks/musician/Api';
	import { untrack } from 'svelte';

	interface Props {
		track: Track;
		onchange?: (track: Track, fields: [string]) => void;
	}

	let { 
		track=$bindable(), 
		onchange 
	}: Props = $props();

	let config = $derived(track.configuration ? JSON.parse(track.configuration) : {});
	let textContent = $state('');
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	export function isStateValid(): [isValid: boolean, errorMessage: string] {
		// TODO: Implement real validation logic based on track configuration and content
		const data = textContent.trim();
		if (data === '') {
			return [false, 'Content cannot be empty'];
		}

		if (data.length > 10000) {
			return [false, 'Content is too long (max 10,000 characters)'];
		}

		const lines = data.split('\n');
		if (lines.length > 200) {
			return [false, 'Content has too many lines (max 200)'];
		}

		// TODO: Add format-specific validation (e.g. for lyrics, check for [Verse], [Chorus] sections; for tablature, check for valid string indicators)
		if(lines.some(line => !line.startsWith("["))) {
			return [false, 'One or more lines do not start with a bracket'];
		}

		return [true, 'Valid'];
	}

	export async function save() {
		console.log('TextTrackEditor: Save invoked, current track state:', track);

		isLoading = true;
		error = null;

		try {
			const result = await uploadFilesetData(track, new Blob([textContent], { type: 'text/plain' }));

			if (result.ok) {
				// TODO: we need to adjust this
				track.fileSetId = result.value.filesetId;
				track.versionNumber = result.value.versionNumber;
				console.log('TextTrackEditor: File data uploaded successfully, updated fileset:', track.fileSetId, 'version:', track.versionNumber);
				return true;
			} else {
				error = `Failed to upload file: ${result.error.message}`;
			}
		} catch (err) {
			error = `Error uploading file data: ${err instanceof Error ? err.message : 'Unknown error'}`;
			return false;
		} finally {
			isLoading = false;
		}
	}

	// Load file data if fileSetId is available
	async function loadFileData(track: Track) {
		if (!track.fileSetId) {
			// If no fileSetId, just work with configuration
			return;
		}

		isLoading = true;
		error = null;

		try {
			const result = await getFilesetDataByVersion(track.fileSetId, track.versionNumber);

			if (result.ok) {
				// Convert blob to text and update content
				const fileText = await result.value.text();
				textContent = fileText;
				// updateConfig();
			} else {
				error = `Failed to load file: ${result.error.message}`;
			}
		} catch (err) {
			error = `Error loading file data: ${err instanceof Error ? err.message : 'Unknown error'}`;
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		console.log('TrackEditor:Track configuration changed, updating local state');
		// Narrow the dependency: Only track the things that REQUIRE a refetch.
		// We don't care if the track name or order changed.
		const fileId = track.fileSetId;
		const version = track.versionNumber;
		
		// ...but wrap the function call in untrack so 
		// internal state changes (like 'loading = true') don't re-trigger it.
		untrack(() => {
			if (fileId) {
            	console.log('Loading file data for:', fileId, version);
            	loadFileData(track);
        	} else {
				console.warn('No fileSetId for track, skipping file load');
				textContent = '';
			}		
		});
	});

	function handleInput(e: Event & { currentTarget: HTMLTextAreaElement }) {
		const val = e.currentTarget.value;
		console.log('Text content changed: ', val.length);
		textContent = val;
		onchange?.(track, ['text']);
	}

	function updateConfig() {
		// const newConfig = {
		// 	content: textContent,
		// 	followPlayhead
		// };
		// onchange?.({
		// 	...track,
		// 	configuration: JSON.stringify(newConfig)
		// });
	}

	function handleRetry() {
	}

</script>

<div class="text-editor">
	{#if isLoading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading track file data...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<p class="error-message">⚠️ {error}</p>
			<button class="retry-btn" onclick={handleRetry}>Retry</button>
		</div>
	{:else}
		<div class="editor-section">
			<h4>{track.format === 'lyric' ? 'Lyrics' : 'Tablature'}</h4> <!-- TODO: Add RealTime Validation display-->

			<div class="form-group">
				<label for="text-area">Content</label>
				<textarea
					id="text-area"
					class="text-input"
					value={textContent}
					oninput={handleInput}
					placeholder={track.format === 'lyric'
						? 'Enter lyrics here...\n\n[Verse 1]\nLine 1\nLine 2\n\n[Chorus]\nChorus line'
						: 'Enter tablature here...\n\ne|--0--2--3--|\nB|--3--1--0--|\nG|--0--0--0--|\n...'}
				/>
			</div>

			<div class="editor-options">
				<!-- Future options like "Follow Playhead" can go here -->
			</div>
		</div>

		<div class="editor-section">
			<h4>Metadata</h4>
			<div class="metadata-display">
				<table>
					<thead>
						<tr>
							<th>Property</th>
							<th>Value</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Track ID</td>
							<td>{track.id}</td>
						</tr>
						<tr>
							<td>Fileset ID</td>
							<td>{track.fileSetId}</td>
						</tr>
						<tr>
							<td>Version Number</td>
							<td>{track.versionNumber ?? 'latest'}</td>
						</tr>
						<tr>
							<td>Created At Id</td>
							<td>{new Date(track.createdAtMsUtc).toLocaleString()}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<style>
	.text-editor {
		display: flex;
		flex-direction: column;
		gap: 24px;
		height: 100%;
	}

	.editor-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.editor-section:first-child {
		flex: 1;
		min-height: 0;
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
		flex: 1;
		min-height: 0;
	}

	.form-group label {
		font-size: 13px;
		font-weight: 500;
		color: #333;
	}

	.text-input {
		flex: 1;
		min-height: 300px;
		padding: 12px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-family: 'Courier New', 'Monaco', monospace;
		font-size: 13px;
		line-height: 1.5;
		background-color: #fafafa;
		color: #333;
		resize: vertical;
	}

	.text-input:focus {
		outline: none;
		border-color: #0066cc;
		background-color: #fff;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
	}

	.editor-options {
		display: flex;
		flex-direction: column;
		gap: 8px;
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

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 40px 20px;
		color: #666;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #e0e0e0;
		border-top-color: #0066cc;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-state {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 20px;
		background-color: #fff3cd;
		border: 1px solid #ffc107;
		border-radius: 4px;
	}

	.error-message {
		margin: 0;
		color: #856404;
		font-size: 14px;
	}

	.retry-btn {
		align-self: flex-start;
		padding: 8px 16px;
		background-color: #ffc107;
		color: #333;
		border: 1px solid #ffb300;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.retry-btn:hover {
		background-color: #ffb300;
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
