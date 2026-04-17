import { useRef, useState } from 'react'
import { pickStore, dispatch } from '@/Support/Stores/PrimaryStore';
import { ActionType } from '@/Support/Stores/Types';
import { GuestModeStatusIcon } from '@/Constants/AppIcons';
import { Button } from 'react-bootstrap';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const GuestModeStatus = () => {
	const { user, connectedUsers } = pickStore<'user'|'connectedUsers'>();
	const profileTarget = useRef(null);
	const [show, setShow] = useState(false);

	async function leaveChannel() {
		setShow(false);
		dispatch({type: ActionType.UPDATE, update: { connectedChannelDetail: undefined}});
	}

	return (
		<>
			<Button ref={profileTarget} onClick={() => setShow(!show)} variant='link' title='Join to a channel'>
				<FontAwesomeIcon icon={GuestModeStatusIcon} size='2x' />
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
					<Popover.Header as="h3">Band Member {user!.displayName}</Popover.Header>
					<Popover.Body>
						<div style={{display: 'flex', flexDirection: 'column', columnGap: '10px', rowGap: '10px'}}>
							{connectedUsers.length > 0 && (
								<>
								<b>Band:</b>
								<ul>
									{ connectedUsers.map((u) =>
										(<li key={`${u.username}`}>{`${u.username} (${u.role}) ${u.isBandLeader}`}</li>)
									)}
								</ul>
								<Button type='button' onClick={() => leaveChannel()} variant='danger'>Leave Band</Button>
								</>
							)}
							{connectedUsers.length === 0 && (<>Not Connected</>)}
						</div>
					</Popover.Body>
				</Popover>
			</Overlay>
		</>
	)
}

export default GuestModeStatus
