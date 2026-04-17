// WebRTC Peer Connection Manager
import { messageBus, broadcastMessage } from '../MessageBus';
import type { MessageBusEvent } from '../../Types/MessageBus';

export interface PeerConnectionConfig {
	iceServers: string[];
	signalingCallback?: (event: any) => void;
}

export class PeerConnectionManager {
	private peerConnections: Map<string, RTCPeerConnection> = new Map();
	private dataChannels: Map<string, RTCDataChannel> = new Map();
	private config: PeerConnectionConfig;

	constructor(config?: Partial<PeerConnectionConfig>) {
		this.config = {
			iceServers: config?.iceServers || ['stun:stun.l.google.com:19302'],
			signalingCallback: config?.signalingCallback,
		};
	}

	/**
	 * Create a new peer connection
	 */
	createPeerConnection(peerId: string): RTCPeerConnection {
		if (this.peerConnections.has(peerId)) {
			return this.peerConnections.get(peerId)!;
		}

		const peerConnection = new RTCPeerConnection({
			iceServers: this.config.iceServers.map(url => ({ urls: url }))
		});

		// Handle ICE candidates
		peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				console.log('ICE candidate:', event.candidate);
				// TODO: Send ICE candidate to peer via signaling
				broadcastMessage({
					data: {
						type: 'ICE_CANDIDATE',
						peerId,
						candidate: event.candidate
					}
				} as MessageBusEvent);
			}
		};

		// Handle connection state changes
		peerConnection.onconnectionstatechange = () => {
			console.log(`Connection state with ${peerId}: ${peerConnection.connectionState}`);
			broadcastMessage({
				data: {
					type: 'CONNECTION_STATE_CHANGE',
					peerId,
					state: peerConnection.connectionState
				}
			} as MessageBusEvent);
		};

		// Handle ICE connection state changes
		peerConnection.oniceconnectionstatechange = () => {
			console.log(`ICE connection state with ${peerId}: ${peerConnection.iceConnectionState}`);
		};

		peerConnection.onsignalingstatechange = () => {
			console.log(`Signaling state with ${peerId}: ${peerConnection.signalingState}`);
		};

		this.peerConnections.set(peerId, peerConnection);
		return peerConnection;
	}

	/**
	 * Create a data channel on a peer connection
	 */
	createDataChannel(peerId: string, channelLabel: string): RTCDataChannel {
		const key = `${peerId}:${channelLabel}`;
		if (this.dataChannels.has(key)) {
			return this.dataChannels.get(key)!;
		}

		const peerConnection = this.peerConnections.get(peerId) ||
			this.createPeerConnection(peerId);

		const dataChannel = peerConnection.createDataChannel(channelLabel);
		this.setupDataChannelHandlers(dataChannel, peerId, channelLabel);
		this.dataChannels.set(key, dataChannel);
		return dataChannel;
	}

	/**
	 * Send data through a data channel
	 */
	sendData(peerId: string, channelLabel: string, data: any): boolean {
		const key = `${peerId}:${channelLabel}`;
		const dataChannel = this.dataChannels.get(key);

		if (!dataChannel || dataChannel.readyState !== 'open') {
			console.warn(`Data channel ${key} not ready`);
			return false;
		}

		dataChannel.send(JSON.stringify(data));
		return true;
	}

	/**
	 * Close a peer connection
	 */
	closePeerConnection(peerId: string): void {
		const peerConnection = this.peerConnections.get(peerId);
		if (peerConnection) {
			peerConnection.close();
			this.peerConnections.delete(peerId);

			// Close associated data channels
			for (const [key] of this.dataChannels) {
				if (key.startsWith(`${peerId}:`)) {
					this.dataChannels.delete(key);
				}
			}
		}
	}

	/**
	 * Close all peer connections
	 */
	closeAll(): void {
		for (const [peerId] of this.peerConnections) {
			this.closePeerConnection(peerId);
		}
	}

	/**
	 * Setup data channel event handlers
	 */
	private setupDataChannelHandlers(
		dataChannel: RTCDataChannel,
		peerId: string,
		channelLabel: string
	): void {
		dataChannel.onopen = () => {
			console.log(`Data channel ${channelLabel} opened with ${peerId}`);
			broadcastMessage({
				data: {
					type: 'DATA_CHANNEL_OPEN',
					peerId,
					channelLabel
				}
			} as MessageBusEvent);
		};

		dataChannel.onclose = () => {
			console.log(`Data channel ${channelLabel} closed with ${peerId}`);
		};

		dataChannel.onerror = (error) => {
			console.error(`Data channel ${channelLabel} error:`, error);
		};

		dataChannel.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);
				broadcastMessage({
					data: {
						type: 'DATA_CHANNEL_MESSAGE',
						peerId,
						channelLabel,
						message
					}
				} as MessageBusEvent);
			} catch (e) {
				console.error('Failed to parse message:', e);
			}
		};
	}

	/**
	 * Get peer connection status
	 */
	getPeerStatus(peerId: string): any {
		const pc = this.peerConnections.get(peerId);
		if (!pc) return null;

		return {
			peerId,
			connectionState: pc.connectionState,
			iceConnectionState: pc.iceConnectionState,
			signalingState: pc.signalingState,
			dataChannels: Array.from(this.dataChannels.entries())
				.filter(([key]) => key.startsWith(`${peerId}:`))
				.map(([key, dc]) => ({
					label: key.split(':')[1],
					readyState: dc.readyState
				}))
		};
	}
}

// Export singleton instance
export const peerManager = new PeerConnectionManager();
