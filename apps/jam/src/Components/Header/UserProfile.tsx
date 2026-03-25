import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import { pickStore } from '@/Support/Stores/PrimaryStore';
import { UserProfileIcon } from '@/Constants/AppIcons';

const UserProfile = () => {
	const profileTarget = useRef(null);
	const [show, setShow] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const { user } = pickStore<'user'>();

	// Watch for fullscreenchange
	useEffect(() => {
		function onFullscreenChange() {
			setIsFullscreen(Boolean(document.fullscreenElement));
			setShow(false);
		}

		if (document.fullscreenElement)
			setIsFullscreen(true);

		document.addEventListener('fullscreenchange', onFullscreenChange);
  
		return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
	}, []);

	return (
		<>
			<Button ref={profileTarget} onClick={() => setShow(!show)} variant='link' title={user!.displayName}>
				<FontAwesomeIcon icon={UserProfileIcon} size='2x' />
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
					<Popover.Header as="h3">Welcome {user!.displayName}</Popover.Header>
					<Popover.Body>
						<div style={{display: 'flex', flexDirection: 'column', columnGap: '10px', rowGap: '10px'}}>
							<span>{user!.displayName}</span>
							<Button className='sm' variant='dark' onClick={() => {
								if (!isFullscreen) {
									document.body.requestFullscreen();
								} else {
									document.exitFullscreen();
								}
							}}>
								{!isFullscreen ? 'FullScreen' : 'Leave FullScreen'}
							</Button>
							<Button className='sm' variant='dark' onClick={() => {
								setShow(false);
								window.location.assign('/api/auth/logout');
							}}>
								Logout
							</Button>
						</div>
					</Popover.Body>
				</Popover>
			</Overlay>
		</>
	)
}

export default UserProfile;
