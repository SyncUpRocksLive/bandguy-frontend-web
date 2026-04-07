<script lang="ts">
	import { auth } from "@/Auth.svelte";
	import { msToHMS } from "@shared/display/DisplayHelpers";
	import { getSetComplete, getSongsOverview } from "@shared/services/syncuprocks/musician/Api";
	import type { SetComplete, SongOverview } from "@shared/services/syncuprocks/musician/Types";

	// Component props
	interface Props<T> {
		setId: number;
	}

	let {
		setId = $bindable(),
	}: Props<any> = $props();

	let songs: SongOverview[] = [];
	let loading = false;
	let error: string | null = null;
	let setComplete: SetComplete | null = null;

	// Reactive statement to fetch set details when the selected set changes
	$effect(() => {
		if (setId > 0) {
			loadSet();
		}

		fetchSongs();
	});

	async function loadSet() {
		if (!auth.user?.userId) return;
		
		loading = true;
		error = null;
		try {
			const result = await getSetComplete(setId);
			if (result.ok) {
				setComplete = result.value;
			} else {
				error = result.error.message;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	async function fetchSongs() {
		if (!auth.user?.userId) return;
		
		loading = true;
		error = null;
		try {
			const result = await getSongsOverview(auth.user.userId);
			if (result.ok) {
				songs = result.value.sort((a, b) => a.name.localeCompare(b.name));
			} else {
				error = result.error.message;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}
</script>

<h2>Set {setId}</h2>
