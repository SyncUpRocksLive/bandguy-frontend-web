// Lyric type definitions
export interface LyricLine {
	time: number;
	text: string;
}

export interface Lyric {
	lines: LyricLine[];
	duration: number;
}

export interface LyricGroup {
	groupRow: number;
	groupIndex: number;
	start: number;
	end: number;
	alpha: number;
	duration: number;
	lyricLines: LyricLine[];
}
