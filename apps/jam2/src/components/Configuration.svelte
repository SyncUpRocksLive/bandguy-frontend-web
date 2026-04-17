<script lang="ts">
	let show = $state(false);
	let activeTab = $state('general');
</script>

<button onclick={() => show = !show} title="Configure" class="config-button">
	⚙️
</button>

{#if show}
	<div class="modal-overlay" onclick={() => { show = false; activeTab = 'general'; }}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h5>Configuration</h5>
				<button onclick={() => { show = false; activeTab = 'general'; }}>&times;</button>
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
						<p>General settings placeholder</p>
					{:else if activeTab === 'trackdefaults'}
						<p>Track defaults placeholder</p>
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
</style>
