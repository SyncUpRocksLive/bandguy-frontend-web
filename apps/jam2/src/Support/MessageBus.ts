import { MessageBusEvent, MessageBusEventType } from '../Types/MessageBus';

// Simple event emitter for MessageBus
class MessageBus {
	private listeners: ((event: MessageBusEvent) => void)[] = [];

	subscribe(listener: (event: MessageBusEvent) => void) {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter(l => l !== listener);
		};
	}

	broadcast(event: MessageBusEvent) {
		this.listeners.forEach(listener => listener(event));
	}
}

export const messageBus = new MessageBus();

// Helper function to broadcast messages
export function broadcastMessage(event: MessageBusEvent) {
	messageBus.broadcast(event);
}
