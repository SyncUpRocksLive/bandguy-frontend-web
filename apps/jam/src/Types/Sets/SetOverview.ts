export interface SongOverview {
	id: number;	// Globally unique id of song
	name: string;
	setOrder: number;
}

export interface SetOverview {
	musicianId: number;
	id: number;
	name: string;
	createdAtMsUtc: number;
	songs: SongOverview[];
}
