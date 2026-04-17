import { Line, Lyric, LyricFormatVersion } from "@shared/parsers/lyrics/Lyrics";
import { useEffect, useRef, useState } from "react";

interface IProps {
	lyrics: Lyric,
	tick: number
}

const LinesPerGroup = 2;
const VisibleGroups = 2;

interface LyricGroup {
	groupRow: number;
	groupIndex: number;
	start: number;
	end: number;
	alpha: number;
	duration: number;
	lyricLines: Line[];
}

const BasicLyricViewer = ({lyrics, tick}: IProps) => {
	const groupData = useRef<LyricGroup[]>([]);
	const [visibleGroups, setVisibleGroups] = useState<LyricGroup[]>([]);

	const updateLyricLines = () => {
		groupData.current.forEach((g) => g.alpha = 100);

		let firstGroup = groupData.current.findIndex((g) => tick < g.start) - 1;
		//LogInfo(`t=${tick} g=> ${firstGroup}`);
		if (firstGroup >= 0) {
			let g = groupData.current[firstGroup];
			// TODO: Are we in midpoint left, then go one prior. (prior is fading out)
			// if we are midway/right - stay on current
			const midpoint = (g.duration / 2);
			const showPriorGroup = firstGroup > 0 && tick <= g.start + midpoint;
			if (showPriorGroup) {
				// Calculate fade out of prior block
				const fadeOut = (1.0 - ((tick - g.start) / midpoint));//.toPrecision(2);
				//LogInfo(`g=${firstGroup - 1} t=${tick} st=${g.start} ${midpoint} ${fadeOut}`);
				firstGroup = firstGroup - 1;
				g = groupData.current[firstGroup];
				g.alpha = fadeOut * 100;
			}

			const rows = groupData.current.slice(firstGroup, firstGroup + VisibleGroups).sort((a,b) => a.groupRow - b.groupRow);
			//console.log(rows);
			setVisibleGroups(rows);
		}
	};

	useEffect(() => {
		//console.log(lyrics);

		groupData.current = [];
		groupData.current.push({
			groupRow: 0,
			groupIndex: 0,
			start: 0,
			end: 0,
			alpha: 100,
			duration: 0,
			lyricLines: []
		});

		for(let i = 0; i < lyrics.lines.length; ++i) {
			const lyric = lyrics.lines[i];

			const groupNumber = Math.floor(i / LinesPerGroup);
			const groupExists = groupNumber < groupData.current.length;
			let group: LyricGroup;
			if (groupExists) {
				group = groupData.current[groupNumber];
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
				groupData.current.push(group);
			}

			group.lyricLines.push(lyric);

			//  Update group.end (next element's start)
			if ((i + 1) >= lyrics.lines.length) {
				group.end = lyrics.duration;
			} else {
				group.end = lyrics.lines[i + 1].time;
			}
		}

		//LogInfo(`LINES per group: ${LinesPerGroup} LyricLines: ${lyrics.lines.length} TotalGroups: ${totalGroups}: Created ${groupData.current.length} groups`);
		groupData.current.forEach((g) => {
			//LogInfo(`G Index #${g.groupIndex} Row: ${g.groupRow}. Start: ${g.start} - ${g.end}`);
			g.duration = g.end - g.start;
			if (g.duration <= 0) {
				g.duration = 0.001;
			}
		});

		updateLyricLines();
	}, [lyrics]);

	useEffect(() => {
		if (!groupData.current)
			return;

		updateLyricLines();	
	}, [groupData, tick]);

	const getDisplayRow = (g: LyricGroup) => {
		const activeGroup = tick >= g.start && tick < g.end;
		let activeRow: Line;
		if (activeGroup) {
			for(let i = 0; i < g.lyricLines.length; ++i) {
				const currentLyricLine = g.lyricLines[i];
				if (tick >= currentLyricLine.time) {
					activeRow = currentLyricLine;
				}
			}
		}

		return (
		<div key={g.groupIndex} style={{margin: '0 0 10px 4px'}}>
			{g.lyricLines.map((l, i) => {
				return (
				<div key={`${g.groupIndex}.${i}`} style={{opacity: `${g.alpha.toPrecision(2)}%`}}>
					<span style={{color: (activeGroup && activeRow == l ? 'yellow' : 'white')}}>~~~~~</span><span>{l.text}</span>
				</div>)
			})}
		</div>)
	};

	const getDisplayRowExtended = (g: LyricGroup) => {
		const activeGroup = tick >= g.start && tick < g.end;
		let activeRow: Line;
		let activeWordIndex: number | undefined = undefined;

		if (activeGroup) {
			for(let i = 0; i < g.lyricLines.length; ++i) {
				const currentLyricLine = g.lyricLines[i];
				if (tick >= currentLyricLine.time && tick < currentLyricLine.time + currentLyricLine.duration) {
					activeRow = currentLyricLine;
					activeWordIndex = activeRow.words!.findIndex((x) => tick >= x.time && tick < x.time + x.duration);
				}
			}
		}

		return (
		<div key={g.groupIndex} style={{margin: '0 0 10px 4px'}}>
			{g.lyricLines.map((l, i) => {
				return (
				<table key={`t:${i}`}>
					<tbody>
						<tr>
							<td></td>
							{l.words!.map((w, wi) => {
								return <td key={`t:${i}:c${wi}`} style={{margin: '0', padding: '0', color: activeRow === l && wi === activeWordIndex ? 'red' : 'green'}}>{w.chord ?? ''}&nbsp;</td>
							})}
						</tr>
						<tr>
							<td style={{width: '50px'}}></td>
							{l.words!.map((w, wi) => {
								return <td key={`t:${i}:w${wi}`} style={{margin: '0', padding: '0', color: activeRow === l && wi === activeWordIndex ? 'yellow' : 'inherit'}}>{w.text}&nbsp;</td>
							})}
						</tr>
						{/* <div key={`${g.groupIndex}.${i}`} style={{opacity: `${g.alpha.toPrecision(2)}%`}}>
							<span style={{color: (activeGroup && activeRow == l ? 'yellow' : 'white')}}>~~~~~</span><span>{l.text} - {g.start} g:{g.groupIndex}</span>
						</div> */}
					</tbody>
				</table>)
			})}
		</div>)
	};

	return (
		<div style={{color: 'white', fontSize: '1.2em'}}>
			Type: {lyrics.type}
			{lyrics.type === LyricFormatVersion.Basic && visibleGroups.map((g) => {
				return getDisplayRow(g)
			})}
			{lyrics.type !== LyricFormatVersion.Basic && visibleGroups.map((g) => {
				return getDisplayRowExtended(g)
			})}
		</div>
	)
}

export default BasicLyricViewer;
