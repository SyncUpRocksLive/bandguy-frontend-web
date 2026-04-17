import { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { ConfigurationIcon } from '@/Constants/AppIcons';
import Nav from 'react-bootstrap/Nav';

import GeneralTab from '../Configuration/GeneralTab';
import TrackDefaultTab from '../Configuration/TrackDefaultTab';
import { pickStore } from '@/Support/Stores/PrimaryStore';

function getTabContents(activeTab: string) {
	if (activeTab === 'general') {
		return <GeneralTab />
	} else if (activeTab === 'trackdefaults') {
		return <TrackDefaultTab />
	}

	return <>NO SETTINGS</>
}

const Configuration = () => {
	const profileTarget = useRef(null);
	const [show, setShow] = useState(false);
	const [activeTab, setActiveTab] = useState('general');
	const { currentSetId, currentSongId } = pickStore<'currentSetId'|'currentSongId'>();

	return (
		<>
			<Button ref={profileTarget} onClick={() => setShow(!show)} variant='link' title='Configure'>
				<FontAwesomeIcon icon={ConfigurationIcon} size='2x' />
			</Button>
			<Modal
				show={show}
				size='lg'
				aria-labelledby='contained-modal-title-vcenter'
				onHide={() => {
					setShow(false);
					setActiveTab('general');
				}}
			>
				<Modal.Header closeButton>
					Configuration
				</Modal.Header>
				<Modal.Body>
					<div style={{display: 'flex', flexDirection: 'column', columnGap: '10px', rowGap: '10px'}}>
						<Nav justify variant="tabs" defaultActiveKey={activeTab} onSelect={(tab) => setActiveTab(tab!)}>
							<Nav.Item>
								<Nav.Link eventKey="general">General</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="trackdefaults">Track Defaults</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="set" disabled={!currentSetId}>
								{!currentSetId && `set not selected`}
								{currentSetId && `Set: ${currentSetId}`}
								</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="song" disabled={!currentSongId}>
								{!currentSongId && `song not selected`}
								{currentSongId && `Track: ${currentSongId}`}
								</Nav.Link>
							</Nav.Item>
						</Nav>

						{show && getTabContents(activeTab)}
					</div>
				</Modal.Body>
			</Modal>
		</>
	)
}

export default Configuration;
