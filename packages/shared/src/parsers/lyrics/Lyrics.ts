export interface Word {
	time: number;
	duration: number;
	text: string;
	chord?: string;
}

export interface Line {
	time: number;
	duration: number;
	text: string;
	words?: Word[];
}

export enum LyricFormatVersion {
	Basic = 'Basic',       // line time is playback time of current line
	Extended = 'Extended', // line time is ending playback of prior line. Line contains <> timestamps for line start, and word starts
	Chords = 'Chords',     // like extended. However, interword time stamps have {} and contain a music chord at that time 
}

export interface Lyric {
	lines: Line[];
	type: LyricFormatVersion;
	duration: number;
}
