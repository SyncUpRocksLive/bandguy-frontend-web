<script lang="ts">
	import { appState } from "../../State.svelte";
	import Upload from "./components/setlist/Upload.svelte";

</script>

<section>
	<div class="song-library">
		<h3>Setlist</h3>

		<div class="song-list">
			<p>Upload setlist</p>
		</div>

		<div class="upload-section">
			<Upload />
		</div>
	</div>
</section>
