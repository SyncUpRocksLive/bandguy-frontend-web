<script lang="ts">
	import type { Track } from '@shared/services/syncuprocks/musician/Types';

	interface Props {
		track: Track;
		onchange?: (track: Track) => void;
	}

	const { track, onchange }: Props = $props();

	let config = $state(track.configuration ? JSON.parse(track.configuration) : {});
	let textContent = $state(config.content || '');
	let followPlayhead = $state(config.followPlayhead || false);

	function handleTextChange(value: string) {
		textContent = value;
		updateConfig();
	}

	function handleFollowPlayheadChange() {
		followPlayhead = !followPlayhead;
		updateConfig();
	}

	function updateConfig() {
		const newConfig = {
			content: textContent,
			followPlayhead
		};
		onchange?.({
			...track,
			configuration: JSON.stringify(newConfig)
		});
	}
</script>

<div class="text-editor">
	<div class="editor-section">
		<h4>{track.format === 'lyric' ? 'Lyrics' : 'Tablature'}</h4>

		<div class="form-group">
			<label for="text-area">Content</label>
			<textarea
				id="text-area"
				class="text-input"
				value={textContent}
				onchange={(e) => handleTextChange((e.target as HTMLTextAreaElement).value)}
				placeholder={track.format === 'lyric'
					? 'Enter lyrics here...\n\n[Verse 1]\nLine 1\nLine 2\n\n[Chorus]\nChorus line'
					: 'Enter tablature here...\n\ne|--0--2--3--|\nB|--3--1--0--|\nG|--0--0--0--|\n...'}
			/>
		</div>

		<div class="editor-options">
			<label class="checkbox-label">
				<input type="checkbox" checked={followPlayhead} onchange={handleFollowPlayheadChange} />
				Follow playhead during playback
			</label>
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
						<td>{track.versionNumber}</td>
					</tr>
					<tr>
						<td>Created At Id</td>
						<td>{new Date(track.createdAtMsUtc).toLocaleString()}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
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
