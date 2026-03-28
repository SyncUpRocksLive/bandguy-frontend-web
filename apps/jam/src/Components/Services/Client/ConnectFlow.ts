import { JamChannelDetail } from "@/Support/Services/JamChannels";
import { Messages } from "@/Support/Services/MessageQueue";
import { IMessageBusHandler, RemoveMessageHandler, SubscribeMessageHandler } from "@/Support/Stores/MessageBus";
import { dispatch, getStore } from "@/Support/Stores/PrimaryStore";
import { LogError, LogInfo } from "@/Support/Utilities/Logger";
import { ConnectState } from "@/Types/Client";
import { MessageDataType } from "@/Types/Message";
import { MessageBusActionType, MessageBusEvent } from "@/Types/MessageBus";
import { createGuestSignallingChannel, deleteGuestSignallingChannel } from "./SignalChannelHandler";
import { ActionType, ConnectedUser } from "@/Support/Stores/Types";
import { createGuestRealtimeChannel, deleteGuestRealtimeChannel } from "./RealtimeHandler";

export interface IRemoteClientConnectionFlow {
	Join:(channel: JamChannelDetail) => void;
	Disconnect:() => void;
	
	readonly state: ConnectState;
}

export class ConnectFlow implements IRemoteClientConnectionFlow, IMessageBusHandler {
	private _hostUser?: ConnectedUser;

	get state(): ConnectState {
		return this._hostUser?.client?.state ?? ConnectState.NOT_SET;
	}

	private set state(value: ConnectState) {
		if (this._hostUser?.client) {
			this._hostUser.client.state = value;
			this._stateCallback(value);
		}
	}

	private _stateCallback: (state: ConnectState) => void;

	private _channel?: JamChannelDetail;

	constructor(stateCallback: (state: ConnectState) => void) {
		this._stateCallback = stateCallback;
	}

	messageBusEvent(event: MessageBusEvent): void {
		//LogInfo(`GUEST: Processing message bus message... ${event.data.type}`);

		// TODO: Check all state - check from matches client
		if (!this._channel || !this._hostUser) { // } || (this.state !== ConnectState.ATTEMPT_TO_PEER && this.state !== ConnectState.AWAITING_ANSWER) {
			return;
		}

		if (event.data.type === MessageBusActionType.PEER_CLOSED) {
			const client = event.data.client;
			if (client === this._hostUser?.client) {
				this.Disconnect();
			}

			return;
		}

		if (event.data.type !== MessageBusActionType.MESSAGE) {
			return;
		}

		event.data.message.forEach((m) => {
			// TODO: Verify state
			const client = this._hostUser?.client;
			if (!client) {
				return;
			}

			if (m.messageData.type === MessageDataType.RTCSessionDescription) {
				LogInfo(`${m.fromUserId} -> ${m.toUserId} RTCSessionDescription Type: ${m.messageData.value.type}`);
				if (this.state === ConnectState.ANSWER) {
					if (m.messageData.value.type === 'answer') {
						client.peerConnection!.setRemoteDescription(m.messageData.value);
						this.state = ConnectState.PEERING;
					}
				} else {
					LogError(`GUEST: Unexpected message. Not waiting for answer - our state is ${this.state}`);
				}
			} else if (m.messageData.type === MessageDataType.RTCIceCandidate) {
				LogInfo(`${m.fromUserId} -> ${m.toUserId} RTCIceCandidate`);
				if (this.state === ConnectState.PEERING) {
					client.peerConnection!.addIceCandidate(m.messageData.value);
				} else {
					LogError(`Unexpected ICE. Not waiting for ICE - our state is ${this.state}`);
				}
			}
		});
	}

	Join(channel: JamChannelDetail): void {
		// We only support connecting to one channel at a time. Cancel any other connection, and connect with new
		if (this._channel && channel.identifier !== this._channel.identifier) {
			LogInfo('GUEST: Was connect|ing to other channel. Disconnecting and Reconnecting to new channel');
			this.Disconnect();
		}

		// If we are already connecting to the given channel, just return
		if (this.state !== ConnectState.NOT_SET) {
			return;
		}

		this._channel = channel;
		this._hostUser = {
			displayName: channel.hostUser,
			isBandLeader: true,
			role: 'unset',
			username: channel.hostUser,
			userId: channel.hostUser,
			client: {
				userId: channel.hostUser,
				username: channel.hostUser,
				state: ConnectState.NOT_SET,
			}
		};

		dispatch({type: ActionType.UPDATE, update: {connectedUsers: [this._hostUser]}});

		const client = this._hostUser.client;

		// Start listening for messages
		SubscribeMessageHandler(this);

		// Begin connection
		this.state = ConnectState.CALLING;

		client.peerConnection = new RTCPeerConnection({'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]});
		client.peerConnection.oniceconnectionstatechange = () => { LogInfo(`oniceconnectionstatechange ${client.peerConnection?.iceConnectionState}`); }
		client.peerConnection.ontrack = (e) => { LogInfo(`ontrack ${JSON.stringify(e)}`); }
		client.peerConnection.ondatachannel = (e) => { LogInfo(`ondatachannel channelId: ${e.channel.label}:${e.channel.id} ${e.channel.binaryType}} ${e.channel.negotiated}`); }
		client.peerConnection.onicecandidateerror = (e) => { LogInfo(`onicecandidateerror ${JSON.stringify(e)}`); }
		client.peerConnection.onicegatheringstatechange = () => { LogInfo(`onicegatheringstatechange ${client.peerConnection?.iceGatheringState}`); }
		client.peerConnection.onnegotiationneeded = async () => { 
			// TODO: Check all state
			if (!client.peerConnection || this._channel !== channel) {
				LogInfo(`GUEST: onnegotiationneeded: state invalid`);
				return;
			}

			this.state = ConnectState.OFFER;
			LogInfo(`GUEST: onnegotiationneeded - creating offer`);
			const offer = await client.peerConnection.createOffer({
				offerToReceiveAudio: false,
				offerToReceiveVideo: false
			});

			// TODO: Check all state again (after every await)
			if (!client.peerConnection || this._channel !== channel) {
				LogInfo(`GUEST: onnegotiationneeded: state invalid`);
				return;
			}

			LogInfo('Attempting to join channel...');
			await client.peerConnection.setLocalDescription(offer);
			// TODO: Check all state again (after every await)
			if (!client.peerConnection || this._channel !== channel) {
				LogInfo(`GUEST: onnegotiationneeded: state invalid`);
				return;
			}
	
			// TODO: Do we need this... probably no
			const _store = getStore();
			if (!_store.user) {
				LogInfo('GUEST: onnegotiationneeded: No user. ignoring messages');
				return;
			}

			this.state = ConnectState.OFFER;

			LogInfo(`GUEST: Forwarding offer ${_store.user.username} -> ${this._channel.hostUser}`);
			Messages.sendMessage(channel.hostUser, {
				type: MessageDataType.RTCSessionDescription,
				value: {
					sdp: offer.sdp!,
					type: offer.type,
					toJSON: function () { return {sdp: this.sdp, type: this.type } }
				}
			})
			.then(() => {
				this.state = ConnectState.ANSWER;
			})
			.catch((e) => {
				// TODO: Error handling...
				LogError(JSON.stringify(e));
			});
		}

		client.peerConnection.onicecandidate = (e) => {
			// TODO: Verify state and instance...
			if (!this._channel) {
				LogInfo(`GUEST: onicecandidate: No channel...`);
				return;
			}

			if (e.candidate) {
				LogInfo(`GUEST: onicecandidate: ${JSON.stringify(e.candidate)}`);
				// TODO: Do we need this... probably no
				const _store = getStore();
				if (!_store.user) {
					LogInfo('GUEST: onicecandidate: No user. ignoring messages');
					return;
				}

				LogInfo(`GUEST Forwarding onicecandidate ${_store.user!.username} -> ${this._channel.hostUser}`);
				Messages.sendMessage(this._channel.hostUser, {
					type: MessageDataType.RTCIceCandidate,
					value: e.candidate!
				});
				// TODO // 	.catch((e) => LogError(JSON.stringify(e)));
			}
		};
		client.peerConnection.onsignalingstatechange = () => { LogInfo(`GUEST: onsignalingstatechange ${client.peerConnection!.signalingState}`); }

		createGuestRealtimeChannel(client);
		createGuestSignallingChannel(client, this._stateCallback);
	}
	
	Disconnect(): void {
		if (!this._channel) {
			LogInfo(`GUEST.Disconnect: Not connected to channel`);
			return;
		}

		LogInfo(`GUEST.Disconnect: Cleaning up...`);
	
		RemoveMessageHandler(this);

		// TODO: Unwire all event handles
		this._channel = undefined;
		
		if (this._hostUser?.client?.peerConnection) {
			LogInfo('GUEST: Shutting down peer connection');
			const peerConnection = this._hostUser.client.peerConnection;
			peerConnection.close();

			peerConnection.oniceconnectionstatechange = null;
			peerConnection.ontrack = null;
			peerConnection.ondatachannel = null;
			peerConnection.onicecandidateerror = null;
			peerConnection.onicegatheringstatechange = null;
			peerConnection.onnegotiationneeded = null;
			peerConnection.onicecandidate = null;
			peerConnection.onsignalingstatechange = null;

			deleteGuestRealtimeChannel(this._hostUser.client);
			deleteGuestSignallingChannel(this._hostUser.client);

			this._hostUser.client.peerConnection = undefined;
			this._hostUser = undefined;
		}

		dispatch({type: ActionType.UPDATE, update: {connectedUsers: [], connectedChannelDetail: undefined}});
	}
}
