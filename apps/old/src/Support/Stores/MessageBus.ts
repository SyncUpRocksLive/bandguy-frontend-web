import { MessageBusEvent } from "@/Types/MessageBus";
import { Log, LogError } from "@shared/services/Logger";

export interface IMessageBusHandler {
	messageBusEvent:(event: MessageBusEvent) => void;
}

const messageBusSubscribers: IMessageBusHandler[] = [];

export const BroadcastMessage = (event: MessageBusEvent) => {
	const subscribers = messageBusSubscribers.map((x) => x);
	subscribers.forEach((x) => {
		try {
			//LogInfo('BroadcastMessage: Sending Message to listener');
			x.messageBusEvent(event);
		}
		catch(e) {
			if (e instanceof Error) {
				LogError(`Caught Error while invoking MessageBus subscriber: ${e.message}`);
			} else {
				LogError(`Caught Error while invoking MessageBus subscriber: ${e}`);
			}
		}
	});
}

export const SubscribeMessageHandler = (handler: IMessageBusHandler) => {
	messageBusSubscribers.push(handler);
	Log('verbose', 'RemoveMessageHandler: Subscribed listener');
}

export const RemoveMessageHandler = (handler: IMessageBusHandler) => {
	const subscribedHandler = messageBusSubscribers.findIndex((x) => x === handler);
	if (subscribedHandler >= 0) {
		Log('verbose', 'RemoveMessageHandler: Unsubscribed listener');
		messageBusSubscribers.splice(subscribedHandler, 1);
	}
}
