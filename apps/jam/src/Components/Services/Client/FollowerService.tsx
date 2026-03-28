import { useEffect, useRef, useState } from "react";
import { LogError, LogInfo } from '@/Support/Utilities/Logger';
import { dispatch, pickStore } from '@/Support/Stores/PrimaryStore';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useQuery } from "@tanstack/react-query";
import { JamChannels } from "@/Support/Services/JamChannels";
import { ActionType, PeerOperationMode } from "@/Support/Stores/Types";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GuitarIcon } from "@/Constants/AppIcons";
import { ConnectFlow, IRemoteClientConnectionFlow } from "./ConnectFlow";
import { ConnectState } from "@/Types/Client";

/* Has no mounted UI components - manages application state when in Host/BandLeader mode */
const FollowerService = () => {
	const { user, peerMode, availableRemoteChannels, connectedChannelDetail } = pickStore<'user'|'peerMode'|'availableRemoteChannels'|'connectedChannelDetail'>();
	const [show, setShow] = useState(false);
	const [connectState, setConnectState] = useState(ConnectState.NOT_SET);
	const flow = useRef<IRemoteClientConnectionFlow>(new ConnectFlow(setConnectState));

	// We are watching remote, available channels here
	useQuery({
		queryKey: ['channel.list'],
		queryFn: async () => {
			const allChannels = await JamChannels.getChannelList();

			// Ignore our own channels
			const otherChannels = allChannels
				.filter((k) => k.hostUser !== user!.userId)
				.sort((a, b) => a.timestamp - b.timestamp)

			let changed = false;
			const currentLength = availableRemoteChannels?.length ?? 0;
			if (currentLength !== otherChannels.length) {
				changed = true;
			} else if (availableRemoteChannels && currentLength > 0) {
				changed = !availableRemoteChannels.every((x) => otherChannels.find((y) => y.identifier === x.identifier));
			}

			if (changed) {
				LogInfo('FollowerService: Remote Channels Changed');
				dispatch({type: ActionType.UPDATE, update: {availableRemoteChannels: otherChannels}});
			}
			return otherChannels;
		},
		refetchInterval: 2000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		enabled: user && peerMode === PeerOperationMode.Guest && connectState !== ConnectState.CONNECTED
	});

	useEffect(() => {
		if (!connectedChannelDetail) {
			LogError('FollowerService: Cancel/disconnect and connected remote peer')
			flow.current.Disconnect();
			setShow(false);
			return;
		}

		// TODO: Pass a state callback
		flow.current.Join(connectedChannelDetail);
		setShow(true);
	}, [connectedChannelDetail])

	useEffect(() => {
		// Setup
		LogInfo('Setting up FollowerService');
		return () => {
			// TearDown
			LogInfo('Tearing down FollowerService');
		}
	}, []);

	const handleClose = () => setShow(false);

	const handleCancel = () => {
		// Clearing out channel detail will clean up any current or pending connections
		LogError('User Cancelled Connection');
		dispatch({type: ActionType.UPDATE, update: { connectedChannelDetail: undefined}});
		flow.current.Disconnect();
		setShow(false);
	};

	const getStageText = () => {
		switch (connectState) {
			case ConnectState.CALLING: return 'Calling...';
			case ConnectState.OFFER: return 'Setting up offer sdp...';
			case ConnectState.ANSWER: return 'Awaiting Response...';
			case ConnectState.PEERING: return 'Connect to peer...';
			case ConnectState.SYNCING: return 'Syncing Data...';
			default: return '';
		}
	}

	const getStageCompletion = () => {
		switch (connectState) {
			case ConnectState.CALLING: return 5;
			case ConnectState.OFFER: return 20;
			case ConnectState.ANSWER: return 50;
			case ConnectState.PEERING: return 70;
			case ConnectState.SYNCING: return 90;
			case ConnectState.CONNECTED: return 100;
			default: return 0;
		}
	}

	if ((connectState === ConnectState.DISCONNECTED || connectState === ConnectState.CONNECTED) && show) {
		setShow(false);
	}

	return (
		<>
			<Modal show={show} onHide={handleClose} keyboard={false} backdrop='static'>
				<Modal.Header>
					<Modal.Title><FontAwesomeIcon icon={GuitarIcon} size='2x' /> Connecting to {connectedChannelDetail?.hostUser}</Modal.Title>
				</Modal.Header>
				<Modal.Body>				
					{getStageText()}
					<ProgressBar animated now={getStageCompletion()} />
				</Modal.Body>
				<Modal.Footer>
					<Button variant="warning" onClick={handleCancel}>
						Bail Out!
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	)
}

export default FollowerService;
