<script lang="ts">
	import { router } from "@/Router.svelte";
	import { appState } from "@/State.svelte";
	
</script>

<section id="center">
	<div class="studio-controls">

		<div class="control-grid">
			<div class="control-item">
				<div class="icon">📋</div>
				<h4>Setlists</h4>
				<p>
					View and edit your setlists. Add or remove songs from your
					performance lineup.
				</p>
				<button class="control-btn" onclick={() => router.navigate('Setlists')}>Manage Setlists</button>
			</div>

			<div class="control-item">
				<div class="icon">🎵</div>
				<h4>Song Library</h4>
				<p>
					Browse and edit your complete song library. Songs can be added
					to any setlist.
				</p>
				<button class="control-btn" onclick={() => router.navigate('SongLibrary')}>Browse Songs</button>
			</div>

			<div class="control-item">
				<div class="icon">🎛️</div>
				<h4>Mixing Console</h4>
				<p>Coming soon: Advanced mixing and audio processing tools.</p>
				<button class="control-btn" disabled>Coming Soon?</button>
			</div>

			<div class="control-item">
				<div class="icon">📋</div>
				<h4>Notebook</h4>
				<p>
					Record and manage scratch notes... favorite songs, setlist ideas,
					or just jot down thoughts for your next practice session.
				</p>
				<button class="control-btn" onclick={() => router.navigate('Notes')}>Open Notes</button>
			</div>

			<div class="control-item">
				<div class="icon">📰</div>
				<h4>News!</h4>
				<p>Stay updated with the latest news and announcements.</p>
				<button class="control-btn" disabled>Coming Soon</button>
			</div>
		</div>
	</div>
</section>

<style>
	section {
		grid-area: center;
	}

	.studio-controls {
		text-align: center;
		max-width: 1200px;
		margin: 0 auto;
	}

	.studio-controls h3 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: #ffffff;
	}

	.control-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		max-width: 1000px;
		margin: 0 auto;
	}

	.control-item {
		background: rgba(33, 53, 71, 0.8);
		border: 1px solid rgba(100, 150, 200, 0.3);
		border-radius: 12px;
		padding: 2rem;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.control-item:hover {
		border-color: #6b9ec4;
		background: rgba(33, 53, 71, 0.95);
		transform: translateY(-2px);
	}

	.icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.9;
	}

	.control-item h4 {
		font-size: 1.4rem;
		margin-bottom: 0.5rem;
		color: #e0e0e0;
	}

	.control-item p {
		font-size: 0.9rem;
		color: #a0a0a0;
		margin-bottom: 1.5rem;
		line-height: 1.4;
		flex-grow: 1;
	}

	.control-btn {
		background: #239fc4;
		color: #ffffff;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.control-btn:hover:not(:disabled) {
		background: #1a7a9a;
		transform: translateY(-1px);
	}

	.control-btn:disabled {
		background: #555555;
		cursor: not-allowed;
		opacity: 0.6;
	}

	@media (max-width: 768px) {
		.control-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.studio-controls h3 {
			font-size: 2rem;
		}

		.control-item {
			padding: 1.5rem;
		}
	}
</style>
