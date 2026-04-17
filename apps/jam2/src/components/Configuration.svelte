<script lang="ts">
	import { GetGeneraSettings, SaveGeneralSettings, SettingType } from '@shared/services/Settings';

	let show = $state(false);
	let activeTab = $state('general');
	let generalSettings = $state(GetGeneraSettings());
	let trackDefaults = $state({
		showAllTracks: true,
		showMediaTracks: false,
		showLeadVocal: false,
		showNonLeadVocal: false,
		showRhythmGuitar: false,
		showLeadGuitar: false,
		showBass: false,
		showDrums: false,
		showKeys: false,
		showOther: false
	});

	function saveGeneralSettings() {
		SaveGeneralSettings(generalSettings);
		show = false;
	}

	function saveTrackDefaults() {
		// TODO: Save track defaults
		show = false;
	}
</script>

<button onclick={() => show = !show} title="Configure" class="config-button">
	⚙️
</button>

{#if show}
	<div class="modal-overlay" onclick={() => { show = false; activeTab = 'general'; }} onkeydown={(e) => { if (e.key === 'Escape') { show = false; activeTab = 'general'; } }} role="dialog" aria-modal="true" aria-labelledby="config-title" tabindex="-1">
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h5 id="config-title">Configuration</h5>
				<button onclick={() => { show = false; activeTab = 'general'; }} aria-label="Close configuration">&times;</button>
			</div>
			<div class="modal-body">
				<div class="tabs">
					<button
						class:active={activeTab === 'general'}
						onclick={() => activeTab = 'general'}
					>
						General
					</button>
					<button
						class:active={activeTab === 'trackdefaults'}
						onclick={() => activeTab = 'trackdefaults'}
					>
						Track Defaults
					</button>
				</div>
				<div class="tab-content">
					{#if activeTab === 'general'}
						<table class="settings-table">
							<thead>
								<tr>
									<th>Setting</th>
									<th>Value</th>
								</tr>
							</thead>
							<tbody>
								{#each generalSettings as setting}
									{#if setting.type === SettingType.YesNo}
										<tr>
											<td>{setting.description}</td>
											<td>
												<label class="toggle">
													<input
														type="checkbox"
														bind:checked={setting.value}
													/>
													<span class="toggle-slider"></span>
													<span class="toggle-text">{setting.value ? 'YES' : 'NO'}</span>
												</label>
											</td>
										</tr>
									{/if}
								{/each}
							</tbody>
						</table>
						<div class="button-group">
							<button class="btn btn-secondary" onclick={saveGeneralSettings}>Apply</button>
							<button class="btn btn-outline-secondary" onclick={() => show = false}>Cancel</button>
						</div>
					{:else if activeTab === 'trackdefaults'}
						<table class="settings-table">
							<thead>
								<tr>
									<th>Track Type</th>
									<th>Show by Default</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>All Tracks</td>
									<td>
										<label class="toggle">
											<input type="checkbox" bind:checked={trackDefaults.showAllTracks} />
											<span class="toggle-slider"></span>
											<span class="toggle-text">{trackDefaults.showAllTracks ? 'YES' : 'NO'}</span>
										</label>
									</td>
								</tr>
								<tr>
									<td>Media Tracks</td>
									<td>
										<label class="toggle">
											<input type="checkbox" bind:checked={trackDefaults.showMediaTracks} />
											<span class="toggle-slider"></span>
											<span class="toggle-text">{trackDefaults.showMediaTracks ? 'YES' : 'NO'}</span>
										</label>
									</td>
								</tr>
								<tr>
									<td>Lead Vocal</td>
									<td>
										<label class="toggle">
											<input type="checkbox" bind:checked={trackDefaults.showLeadVocal} />
											<span class="toggle-slider"></span>
											<span class="toggle-text">{trackDefaults.showLeadVocal ? 'YES' : 'NO'}</span>
										</label>
									</td>
								</tr>
								<tr>
									<td>Non-Lead Vocals</td>
									<td>
										<label class="toggle">
											<input type="checkbox" bind:checked={trackDefaults.showNonLeadVocal} />
											<span class="toggle-slider"></span>
											<span class="toggle-text">{trackDefaults.showNonLeadVocal ? 'YES' : 'NO'}</span>
										</label>
									</td>
								</tr>
								<tr>
									<td>Rhythm Guitar</td>
									<td>
										<label class="toggle">
											<input type="checkbox" bind:checked={trackDefaults.showRhythmGuitar} />
											<span class="toggle-slider"></span>
											<span class="toggle-text">{trackDefaults.showRhythmGuitar ? 'YES' : 'NO'}</span>
										</label>
									</td>
								</tr>
								<tr>
									<td>Lead Guitar</td>
									<td>
										<label class="toggle">
											<input type="checkbox" bind:checked={trackDefaults.showLeadGuitar} />
											<span class="toggle-slider"></span>
											<span class="toggle-text">{trackDefaults.showLeadGuitar ? 'YES' : 'NO'}</span>
										</label>
									</td>
								</tr>
								<tr>
									<td>Bass</td>
									<td>
										<label class="toggle">
											<input type="checkbox" bind:checked={trackDefaults.showBass} />
											<span class="toggle-slider"></span>
											<span class="toggle-text">{trackDefaults.showBass ? 'YES' : 'NO'}</span>
										</label>
									</td>
								</tr>
								<tr>
									<td>Drums</td>
									<td>
										<label class="toggle">
											<input type="checkbox" bind:checked={trackDefaults.showDrums} />
											<span class="toggle-slider"></span>
											<span class="toggle-text">{trackDefaults.showDrums ? 'YES' : 'NO'}</span>
										</label>
									</td>
								</tr>
								<tr>
									<td>Keys</td>
									<td>
										<label class="toggle">
											<input type="checkbox" bind:checked={trackDefaults.showKeys} />
											<span class="toggle-slider"></span>
											<span class="toggle-text">{trackDefaults.showKeys ? 'YES' : 'NO'}</span>
										</label>
									</td>
								</tr>
								<tr>
									<td>Other</td>
									<td>
										<label class="toggle">
											<input type="checkbox" bind:checked={trackDefaults.showOther} />
											<span class="toggle-slider"></span>
											<span class="toggle-text">{trackDefaults.showOther ? 'YES' : 'NO'}</span>
										</label>
									</td>
								</tr>
							</tbody>
						</table>
						<div class="button-group">
							<button class="btn btn-secondary" onclick={saveTrackDefaults}>Apply</button>
							<button class="btn btn-outline-secondary" onclick={() => show = false}>Cancel</button>
						</div>
					{:else}
						<p>No settings</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.config-button {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		font-size: 1.5rem;
		padding: 0.5rem;
	}

	.config-button:hover {
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 0.25rem;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 0.5rem;
		max-width: 600px;
		width: 90%;
		max-height: 80vh;
		overflow: hidden;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #dee2e6;
	}

	.modal-header h5 {
		margin: 0;
	}

	.modal-header button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
	}

	.modal-body {
		padding: 1rem;
	}

	.tabs {
		display: flex;
		border-bottom: 1px solid #dee2e6;
		margin-bottom: 1rem;
	}

	.tabs button {
		background: none;
		border: none;
		padding: 0.5rem 1rem;
		cursor: pointer;
		border-bottom: 2px solid transparent;
	}

	.tabs button.active {
		border-bottom-color: #007bff;
		color: #007bff;
	}

	.tabs button:hover {
		background-color: #f8f9fa;
	}

	.tab-content {
		min-height: 200px;
	}

	.settings-table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}

	.settings-table th,
	.settings-table td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #dee2e6;
	}

	.settings-table th {
		background-color: #f8f9fa;
		font-weight: 600;
	}

	.toggle {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
		cursor: pointer;
	}

	.toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		transition: 0.4s;
		border-radius: 34px;
	}

	.toggle-slider:before {
		position: absolute;
		content: "";
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		transition: 0.4s;
		border-radius: 50%;
	}

	.toggle input:checked + .toggle-slider {
		background-color: #007bff;
	}

	.toggle input:checked + .toggle-slider:before {
		transform: translateX(26px);
	}

	.toggle-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 0.75rem;
		font-weight: bold;
		color: white;
		pointer-events: none;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}
</style>
