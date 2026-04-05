import { TrackFormat } from "@shared/services/syncuprocks/musician/Types";
import { Log, LogError, LogInfo } from "../Utilities/Logger";

export interface SongBlob {
	songId: number;
	trackId: number;
	format: TrackFormat;
	timestamp: number;
	data: Blob;
}

export interface ISongStore {
	// Does not need to be called explicitly.
	initialize:() => Promise<undefined>;
	exists:(songId: number, trackId: number) => Promise<boolean>;
	get:(songId: number, trackId: number) => Promise<SongBlob | undefined>;
	put:(song: SongBlob) => Promise<undefined>;
}

interface SongStoreDatabase {
	database?: IDBDatabase;
}

const _songStoreCache: SongStoreDatabase = {};

export function getSongStore():ISongStore {
	const initialize = (): Promise<undefined> => {
		return new Promise<undefined>((resolve, reject) => {
			// Already open?
			if (_songStoreCache.database) {
				resolve(undefined);
				return;
			}

			const indexDb = window.indexedDB;
			if (!indexDb) {
				LogError('indexedDB not supported');
				reject('indexedDB not supported');
				return;
			}

			Log('verbose', 'Opening songstore db...');
			const request = indexDb.open('songstore', 1);
			request.onsuccess = () => {
				Log('verbose', 'songstore Opened');
				_songStoreCache.database = request.result;

				_songStoreCache.database.onerror = () => {
					LogError(`songstore error: ${request.error}`);
				}

				resolve(undefined);
			};

			request.onerror = () => {
				LogError(`songstore open error: ${request.error}`);
				reject(request.error);
			};

			request.onupgradeneeded = (e) => {
				LogInfo(`songstore upgrade Needed ${e.oldVersion} -> ${e.newVersion}`);
				// Save the IDBDatabase interface
				const db = request.result;

				// Create an objectStore for this database
				if (e.newVersion === 1) {
					//const objectStore = 
					db.createObjectStore('trackData', { keyPath: ['songId', 'trackId'] });
					//objectStore.createIndex('blob', 'blob', { unique: false });
				}
			};
		});
	};

	const exists = (songId: number, trackId: number): Promise<boolean> => {
		console.log('Checking exists..');
		return new Promise<boolean>((resolve, reject) => {
			initialize().then(() => {
				try {
					const transaction = _songStoreCache.database!.transaction('trackData', 'readonly');
					const count = transaction.objectStore('trackData').count([songId, trackId]);
					count.onsuccess = () => { resolve(count.result > 0); }
					count.onerror = () => { reject('Error: ' + count.error); }
				} catch (error) {
					console.log(error);
					Log('error', `Error checking exists: ${error}`);
					resolve(false);
				}
			});
		});
	};

	const get = async (songId: number, trackId: number): Promise<SongBlob | undefined> => {
		return new Promise<SongBlob | undefined>((resolve, reject) => {
			initialize().then(() => {
				const transaction = _songStoreCache.database!.transaction('trackData', 'readwrite');
				const get = transaction.objectStore('trackData').get([songId, trackId]);
				get.onsuccess = () => { resolve(get.result); }
				get.onerror = () => { reject('Error: ' + get.error); }
			});
		});
	};

	const put = async (song: SongBlob): Promise<undefined> => {
		return new Promise<undefined>((resolve, reject) => {
			initialize().then(() => {
				const transaction = _songStoreCache.database!.transaction('trackData', 'readwrite');
				const put = transaction.objectStore('trackData').put(song);
				put.onsuccess = () => { resolve(undefined); }
				put.onerror = () => { reject('Error: ' + put.error); }
			});
		});
	};

	return { initialize, exists, get, put };
}
