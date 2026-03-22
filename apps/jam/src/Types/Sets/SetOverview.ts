export interface SongOverview {
	id: string;	// Globally unique id of song
	version: number; // timestamp of last change - for caching
	title: string;
}

export interface SetOverview {
	id: string;
	name: string;
	songs: SongOverview[];
}
