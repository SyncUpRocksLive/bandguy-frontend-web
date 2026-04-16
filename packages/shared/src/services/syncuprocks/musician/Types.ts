
export interface SongOverview {
	id: number;	// Globally unique id of song
	name: string;
	setOrder: number;
    tracks?: number,
	createdAtMsUtc?: number;
	durationMs?: number,
	configuration?: string
}

export interface SetOverview {
	musicianId: number;
	id: number;
	name: string;
	createdAtMsUtc: number;
	songs: SongOverview[];
}

export enum TrackType {
	Guitar = 'Guitar',
	Vocals = 'Vocals',
	RhythmGuitar = 'RhythmGuitar',
}

export enum TrackFormat {
	// Lyric File Format (Contains times, and chords)
	Lyric = 'Lyric',
	// Plain text (Static - no time information)
	Text = 'Text,'
}

export interface Track {
	id: number;
	songId: number;
	fileSetId?: number;
	name: string;
	type: TrackType;
	format: TrackFormat;
	createdAtMsUtc: number;
	versionNumber?: number;
	configuration?: string;
}

export interface Song {
	id: number;
	musicianId: string;
	name: string;
	durationMilliseconds: number;
	createdAtMsUtc: number;
	setOrder: number;
	configuration?: string;
	tracks: Track[];
}

export interface SetComplete {
	musicianId: number;
	id: number;
	name: string;
	createdAtMsUtc: number;
	songs: Song[];
}
