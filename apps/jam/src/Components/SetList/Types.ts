import { SongTrack } from "@/Types/Sets/SongDetail";

export interface ApiResponseBase<T> {
    success: boolean;
    data?: T;
    errorMessage?: string;
}

//TODO: Remove
export interface SongDetailResponse {
	length?: string;
	duration: number;
	tracks: SongTrack[];
}
