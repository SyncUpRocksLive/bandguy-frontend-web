import { Log, LogVerbose } from "@shared/services/Logger";
import { ActionType, PeerOperationMode, StoreActions, StoreItems } from "./Types";
import { BroadcastMessage } from "./MessageBus";
import { MessageBusActionType } from "@/Types/MessageBus";

export const PrimaryStoreReducer = (store: StoreItems, action: StoreActions): StoreItems => {
	LogVerbose(`PrimaryStoreReducer: ${action.type}`);

	switch(action.type) {
		case ActionType.UPDATE:
		{
			type storeKeyType = keyof typeof action.update;
			let changed = false;
			Object.entries(action.update).forEach(([key, value]) => {
				
				if (store[key as storeKeyType] != value) {
					Log('verbose', `${key} => NEW: ${value} OLD: ${store[key as storeKeyType]}`);
					changed = true;
				}
			});

			if (!changed) {
				Log('verbose', 'No Changes Detected in store');
				return store;
			}

			const newState = {...store, ...action.update};

			// Only a Host will send state updates to clients
			if (newState.peerMode === PeerOperationMode.Host) {
				BroadcastMessage({data: {type: MessageBusActionType.STATE_UPDATE, state: newState}})
			}

			return newState;
		}
		default:
			break;
	}

	return store;
}
