<script lang="ts">
	import { auth } from "../Auth.svelte";
</script>

<div class="Auth-form-container d-flex align-items-center justify-content-center"
	style="min-height: 100vh; background: rgba(0, 0, 0, 0.4);">
	<div class="Auth-form p-5 shadow-lg rounded text-light"
		style="max-width: 420px; background: rgba(33, 37, 41, 0.85); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1);">

		<div class="Auth-form-content text-center">
			<h2 class="mb-4 fw-bold tracking-tight" style="letter-spacing: 1px;">
				SYNC ROCK LIVE ! <span class="text-primary">BETA</span>
			</h2>

			<div class="p-3 mb-4 rounded border-0" style="background-color: rgba(255, 255, 255, 0.1);">
				<p class="small mb-0 opacity-75">
					🎸 <strong>Welcome to the stage!</strong><br />
					Access is currently restricted to registered beta users.
				</p>
			</div>

			<div class="d-grid gap-3 mt-4">
				<button
					class="btn btn-primary btn-lg py-3 fw-bold border-0"
					style="background-color: #0d6efd; box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);"
					onclick={() => auth.login()}
				>
					Sign In
				</button>
			</div>

			<div class="mt-5 pt-3 border-top border-secondary opacity-50">
				<p class="x-small mb-0">
					Lets Rock! 🤘
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	/* Add Bootstrap classes if not using full Bootstrap */
	.btn {
		display: inline-block;
		font-weight: 400;
		line-height: 1.5;
		color: #212529;
		text-align: center;
		text-decoration: none;
		vertical-align: middle;
		cursor: pointer;
		-webkit-user-select: none;
		-moz-user-select: none;
		user-select: none;
		background-color: transparent;
		border: 1px solid transparent;
		padding: 0.375rem 0.75rem;
		font-size: 1rem;
		border-radius: 0.25rem;
		transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	}

	.btn-primary {
		color: #fff;
		background-color: #0d6efd;
		border-color: #0d6efd;
	}

	.btn-lg {
		padding: 0.5rem 1rem;
		font-size: 1.25rem;
		border-radius: 0.3rem;
	}

	.text-primary {
		color: #0d6efd !important;
	}

	.text-light {
		color: #f8f9fa !important;
	}

	.shadow-lg {
		box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
	}

	.rounded {
		border-radius: 0.25rem !important;
	}

	.d-flex {
		display: flex !important;
	}

	.align-items-center {
		align-items: center !important;
	}

	.justify-content-center {
		justify-content: center !important;
	}

	.text-center {
		text-align: center !important;
	}

	.mb-4 {
		margin-bottom: 1.5rem !important;
	}

	.mb-0 {
		margin-bottom: 0 !important;
	}

	.mt-4 {
		margin-top: 1.5rem !important;
	}

	.mt-5 {
		margin-top: 3rem !important;
	}

	.pt-3 {
		padding-top: 1rem !important;
	}

	.p-5 {
		padding: 3rem !important;
	}

	.p-3 {
		padding: 1rem !important;
	}

	.fw-bold {
		font-weight: 700 !important;
	}

	.small {
		font-size: 0.875em;
	}

	.x-small {
		font-size: 0.75em;
	}

	.opacity-75 {
		opacity: 0.75 !important;
	}

	.opacity-50 {
		opacity: 0.5 !important;
	}

	.border-top {
		border-top: 1px solid #dee2e6 !important;
	}

	.border-secondary {
		border-color: #6c757d !important;
	}

	.border-0 {
		border: 0 !important;
	}

	.d-grid {
		display: grid !important;
	}

	.gap-3 {
		gap: 1rem !important;
	}

	.py-3 {
		padding-top: 1rem !important;
		padding-bottom: 1rem !important;
	}

	.tracking-tight {
		letter-spacing: -0.025em;
	}
</style>
