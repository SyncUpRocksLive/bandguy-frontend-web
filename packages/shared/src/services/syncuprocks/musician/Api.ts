import { ApiResponseBase } from "@shared/services/syncuprocks/Types";
import { SetComplete, SetOverview, Song, SongOverview, Track } from "@shared/services/syncuprocks/musician/Types";
import { LogError } from "@shared/services/Logger";

export type Result<T, E = Error> = 
  | { ok: true; value: T } 
  | { ok: false; error: E };

const checkHttpResponse = (response: Response, context: string) : Error | null => {
	if (!response.ok) {
		const errorMsg = `HTTP error ${response.status} for ${context}: ${response.statusText}`;
		LogError(errorMsg);
		return new Error(errorMsg);
	}
	
	const contentType = response.headers.get('Content-Type');
	if (!contentType || !contentType.includes('application/json')) {
		const errorMsg = `Expected JSON response for ${context} but got '${contentType}'`;
		LogError(errorMsg);
		return new Error(errorMsg);
	}

	return null
}

const checkErrorResponse = (response: ApiResponseBase<any>, context: string, checkData: boolean) : Error | null => {
	if (!response) {
		const errorMsg = `No response received for ${context}`;
		LogError(errorMsg);
		return new Error(errorMsg);
	} else if (!response.success) {
		const errorMsg = `API error for ${context}: ${response.errorMessage ?? 'Unknown error'}`;
		LogError(errorMsg);
		return new Error(errorMsg);
	} else if (checkData && !response.data) {
		const errorMsg = `No data in response for ${context}`;
		LogError(errorMsg);
		return new Error(errorMsg);
	}

	return null;
}

/**
 * Fetches the complete details for a specific set.
 * @param setId Set Identifier
 * @returns 
 */
export const getSetComplete = async (setId: number) : Promise<Result<SetComplete | null>> => {
	const response = await fetch(`/api/legacy/user/sets/complete/${setId}`, { method: "GET", headers: { "Content-Type": "application/json" }});
	let error = checkHttpResponse(response, `fetching complete set details for setId=${setId}`);
	if (error)
		return { ok: false, error };

	const data: ApiResponseBase<SetComplete> = await response.json();
	error = checkErrorResponse(data, `fetching complete set details for setId=${setId}`, true);
	if (error)
		return { ok: false, error };

	return { ok: true, value: data.data! };
}

/**
 * Fetches the overview list of sets for a specific musician.
 * @param musicianId Musician Identifier
 * @returns 
 */
export const getSetsOverview = async (musicianId: string) : Promise<Result<SetOverview[]>> => {
	const response = await fetch(`/api/legacy/user/sets/overview/${musicianId}`, { method: "GET", headers: { "Content-Type": "application/json" }});
	let error = checkHttpResponse(response, `fetching sets overview for musicianId=${musicianId}`);
	if (error)
		return { ok: false, error };

	const data: ApiResponseBase<SetOverview[]> = await response.json();
	error = checkErrorResponse(data, `fetching sets overview for musicianId=${musicianId}`, false);
	if (error)
		return { ok: false, error };

	return { ok: true, value: data.data ?? [] };
}

export const saveSetsOverview = async (setId: number, setlistSongs: SongOverview[]) : Promise<Result<number>> => {
	if (setlistSongs.length === 0) {
		const errorMsg = `Cannot save empty setlist for setId=${setId}`;
		LogError(errorMsg);
		return { ok: false, error: new Error(errorMsg) };
	}

	const response = await fetch(`/api/legacy/user/sets/overview/save?setlistId=${setId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(setlistSongs) });
	let error = checkHttpResponse(response, `saving sets overview for setId=${setId}`);
	if (error)
		return { ok: false, error };

	const data: ApiResponseBase<SetOverview[]> = await response.json();
	error = checkErrorResponse(data, `saving set overview for setId=${setId}`, false);
	if (error)
		return { ok: false, error };

	return { ok: true, value: setId };
}

/**
 * Fetches the overview list of songs for a specific musician.
 * @param musicianId Musician Identifier
 * @returns 
 */
export const getSongsOverview = async (musicianId: string) : Promise<Result<SongOverview[]>> => {
	const response = await fetch(`/api/legacy/user/songs/overview/${musicianId}`, { method: "GET", headers: { "Content-Type": "application/json" }});
	let error = checkHttpResponse(response, `fetching songs overview for musicianId=${musicianId}`);
	if (error)
		return { ok: false, error };

	const data: ApiResponseBase<SongOverview[]> = await response.json();
	error = checkErrorResponse(data, `fetching songs overview for musicianId=${musicianId}`, false);
	if (error)
		return { ok: false, error };

	return { ok: true, value: data.data ?? [] };
}

export const deleteSet = async (setId: number) : Promise<Result<void>> => {
	const response = await fetch(`/api/legacy/user/sets/delete/${setId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }});
	let error = checkHttpResponse(response, `deleting set with setId=${setId}`);
	if (error)
		return { ok: false, error };

	const data: ApiResponseBase<void> = await response.json();
	error = checkErrorResponse(data, `deleting set with setId=${setId}`, false);
	if (error)
		return { ok: false, error };

	return { ok: true, value: undefined };
}

export const saveSet = async (setId: number | null, setlistName: string) : Promise<Result<SetOverview>> => {
	if (!setlistName || setlistName.trim() === '') {
		const errorMsg = `Setlist name cannot be empty`;
		LogError(errorMsg);
		return { ok: false, error: new Error(errorMsg) };
	}

	const url = setId ? `/api/legacy/user/sets/save?setlistId=${setId}&setlistName=${encodeURIComponent(setlistName)}` : `/api/legacy/user/sets/save?setlistName=${encodeURIComponent(setlistName)}`;
	console.log(`Saving set with URL: ${url}`);
	const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" } });
	let error = checkHttpResponse(response, `saving set with setId=${setId ?? 'new'}`);
	if (error)
		return { ok: false, error };

	const data: ApiResponseBase<SetOverview> = await response.json();
	error = checkErrorResponse(data, `saving set with setId=${setId ?? 'new'}`, false);
	if (error)
		return { ok: false, error };

	return { ok: true, value: data.data! };
}

export const deleteSong = async (songId: number) : Promise<Result<void>> => {
	const response = await fetch(`/api/legacy/user/songs/delete/${songId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }});
	let error = checkHttpResponse(response, `deleting song with songId=${songId}`);
	if (error)
		return { ok: false, error };

	const data: ApiResponseBase<void> = await response.json();
	error = checkErrorResponse(data, `deleting song with songId=${songId}`, false);
	if (error)
		return { ok: false, error };

	return { ok: true, value: undefined };
}

/**
 * Saves an existing track.
 * @param songId Song Identifier
 * @param track Track to save
 * @returns 
 */
export const saveTrack = async (songId: number, track: Track) : Promise<Result<Track>> => {
	const response = await fetch(`/api/legacy/user/songs/${songId}/tracks/${track.id}`, { 
		method: "PUT", 
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(track)
	});
	let error = checkHttpResponse(response, `saving track with trackId=${track.id}`);
	if (error)
		return { ok: false, error };

	const data: ApiResponseBase<Track> = await response.json();
	error = checkErrorResponse(data, `saving track with trackId=${track.id}`, true);
	if (error)
		return { ok: false, error };

	return { ok: true, value: data.data! };
}

/**
 * Deletes an existing track.
 * @param songId Song Identifier
 * @param trackId Track ID to delete
 * @returns 
 */
export const deleteTrack = async (songId: number, trackId: number) : Promise<Result<void>> => {
	const response = await fetch(`/api/legacy/user/songs/${songId}/tracks/${trackId}`, { 
		method: "DELETE", 
		headers: { "Content-Type": "application/json" }
	});
	let error = checkHttpResponse(response, `deleting track with trackId=${trackId}`);
	if (error)
		return { ok: false, error };

	const data: ApiResponseBase<void> = await response.json();
	error = checkErrorResponse(data, `deleting track with trackId=${trackId}`, false);
	if (error)
		return { ok: false, error };

	return { ok: true, value: undefined };
}

/**
 * Creates a new track in a song.
 * @param songId Song Identifier
 * @param track Track to create (without id and createdAtMsUtc)
 * @returns 
 */
export const createTrack = async (songId: number, track: Omit<Track, 'id' | 'createdAtMsUtc'>) : Promise<Result<Track>> => {
	const response = await fetch(`/api/legacy/user/songs/${songId}/tracks`, { 
		method: "POST", 
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(track)
	});
	let error = checkHttpResponse(response, `creating track for songId=${songId}`);
	if (error)
		return { ok: false, error };

	const data: ApiResponseBase<Track> = await response.json();
	error = checkErrorResponse(data, `creating track for songId=${songId}`, true);
	if (error)
		return { ok: false, error };

	return { ok: true, value: data.data! };
}

export const getSongComplete = async (songId: number) : Promise<Result<Song | null>> => {
	const response = await fetch(`/api/legacy/user/songs/complete/${songId}`, { method: "GET", headers: { "Content-Type": "application/json" }});
	let error = checkHttpResponse(response, `fetching complete song details for songId=${songId}`);
	if (error)
		return { ok: false, error };

	const data: ApiResponseBase<Song> = await response.json();
	error = checkErrorResponse(data, `fetching complete song details for songId=${songId}`, true);
	if (error)
		return { ok: false, error };

	return { ok: true, value: data.data! };
}

export interface SongSaveRequest {
	id?: number;
	name: string;
	durationMilliseconds: number;
	configuration?: string;
}

export const songSave = async (song: SongSaveRequest) : Promise<Result<SongSaveRequest>> => {
	const response = await fetch(`/api/legacy/user/songs/save`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(song) });
	let error = checkHttpResponse(response, `updating song for songId=${song.name}`);
	if (error)
		return { ok: false, error };

	const data: ApiResponseBase<Song> = await response.json();
	error = checkErrorResponse(data, `updating song for songId=${song.name}`, true);
	if (error)
		return { ok: false, error };

	return { ok: true, value: data.data! };
}
