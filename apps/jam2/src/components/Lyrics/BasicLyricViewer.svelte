<script lang="ts">
	import type { Lyric, LyricGroup, LyricLine } from './types';

	interface Props {
		lyrics: Lyric;
		tick: number;
	}

	let { lyrics, tick }: Props = $props();

	const LinesPerGroup = 2;
	const VisibleGroups = 2;

	let groupData: LyricGroup[] = $state([]);
	let visibleGroups: LyricGroup[] = $state([]);

	// Initialize lyric groups whenever lyrics change
	$effect(() => {
		if (!lyrics || lyrics.lines.length === 0) {
			groupData = [];
			visibleGroups = [];
			return;
		}

		// Build group data
		const newGroupData: LyricGroup[] = [
			{
				groupRow: 0,
				groupIndex: 0,
				start: 0,
				end: 0,
				alpha: 100,
				duration: 0,
				lyricLines: []
			}
		];

		for (let i = 0; i < lyrics.lines.length; ++i) {
			const lyric = lyrics.lines[i];
			const groupNumber = Math.floor(i / LinesPerGroup);
			const groupExists = groupNumber < newGroupData.length;

			let group: LyricGroup;
			if (groupExists) {
				group = newGroupData[groupNumber];
			} else {
				group = {
					groupRow: groupNumber % VisibleGroups,
					groupIndex: groupNumber,
					start: lyric.time,
					end: lyric.time,
					duration: 0,
					alpha: 100,
					lyricLines: []
				};
				newGroupData.push(group);
			}

			group.lyricLines.push(lyric);

			// Update group.end (next element's start)
			if (i + 1 >= lyrics.lines.length) {
				group.end = lyrics.duration;
			} else {
				group.end = lyrics.lines[i + 1].time;
			}
		}

		// Calculate durations
		newGroupData.forEach(g => {
			g.duration = g.end - g.start;
		});

		groupData = newGroupData;
	});

	// Update visible groups based on tick
	$effect(() => {
		if (!groupData || groupData.length === 0) {
			visibleGroups = [];
			return;
		}

		groupData.forEach(g => {
			g.alpha = 100;
		});

		let firstGroup = groupData.findIndex(g => tick < g.start) - 1;

		if (firstGroup >= 0) {
			let g = groupData[firstGroup];
			const midpoint = g.duration / 2;
			const showPriorGroup = firstGroup > 0 && tick <= g.start + midpoint;

			if (showPriorGroup) {
				const fadeOut = 1.0 - (tick - g.start) / midpoint;
				firstGroup = firstGroup - 1;
				g = groupData[firstGroup];
				g.alpha = fadeOut * 100;
			}

			const rows = groupData
				.slice(firstGroup, firstGroup + VisibleGroups)
				.sort((a, b) => a.groupRow - b.groupRow);

			visibleGroups = rows;
		}
	});
</script>

<div class="lyric-viewer">
	<div class="lyric-groups">
		{#each visibleGroups as group (group.groupIndex)}
			<div
				class="lyric-group"
				style="opacity: {group.alpha / 100}; transition: opacity 0.1s ease-out"
			>
				{#each group.lyricLines as line (line.time)}
					<div class="lyric-line">
						{line.text}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.lyric-viewer {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		text-align: center;
		padding: 2rem;
	}

	.lyric-groups {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 100%;
	}

	.lyric-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		animation: fadeIn 0.3s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.lyric-line {
		font-size: 1.5rem;
		font-weight: 500;
		line-height: 1.4;
		letter-spacing: 0.05em;
	}

	@media (max-width: 768px) {
		.lyric-viewer {
			padding: 1rem;
		}

		.lyric-line {
			font-size: 1.2rem;
		}
	}
</style>
