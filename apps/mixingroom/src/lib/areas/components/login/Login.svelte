<script lang="ts">
	import { auth } from "@/Auth.svelte";

</script>

<section id="center">
	<div class="login-container">
		<h2>Welcome to the Mixing Room</h2>
		<p>Please log in to access your music library, setlists, and more.</p>
		<button class="login-btn" on:click={() => auth.login()}>Log In</button>
	</div>
</section>
