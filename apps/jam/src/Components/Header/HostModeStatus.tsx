import { useRef, useState } from 'react'
import { pickStore } from '@/Support/Stores/PrimaryStore';
import { HostModeStatusIcon } from '@/Constants/AppIcons';
import { Button } from 'react-bootstrap';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ConnectedUser } from '@/Support/Stores/Types';
import { BroadcastMessage } from '@/Support/Stores/MessageBus';
import { MessageBusActionType } from '@/Types/MessageBus';
import { LogInfo } from '@/Support/Utilities/Logger';

const HostModeStatus = () => {
	const { user, connectedUsers } = pickStore<'user'|'connectedUsers'>();

	const profileTarget = useRef(null);
	const [show, setShow] = useState(false);

	const bootFromband = (u: ConnectedUser) => {
		LogInfo(`Kicking User:Instance (${u.username} out of band!)`);
		BroadcastMessage({data: { type: MessageBusActionType.KICKOUT, userId: u.userId, instance: '' }});
		setShow(false);
	};

	return (
		<>
			<Button ref={profileTarget} onClick={() => setShow(!show)} variant='link'>
				<FontAwesomeIcon icon={HostModeStatusIcon} size='2x' />
			</Button>
			<Overlay
				show={show}
				target={profileTarget}
				placement="bottom"
				containerPadding={5}
				rootClose={true}
				onHide={() => setShow(false)}
			>
				<Popover id="popover-contained">
					<Popover.Header as="h3">Band Leader {user!.displayName}</Popover.Header>
					<Popover.Body>
						<div style={{display: 'flex', flexDirection: 'column', columnGap: '10px', rowGap: '10px'}}>
							<div><b>Bandmates: </b>
								<ul>
									{ connectedUsers.map((u) =>
										(<li key={`${u.username}`}>{`${u.username} (${u.role})`} <Button onClick={() => bootFromband(u)} variant='danger'>Kick out of band!</Button></li>)
									)}
								</ul>
							</div>
						</div>
					</Popover.Body>
				</Popover>
			</Overlay>
		</>
	)
}

export default HostModeStatus
