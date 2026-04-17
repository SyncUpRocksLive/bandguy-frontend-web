import { useState } from 'react'
import ToggleButton from 'react-bootstrap/ToggleButton';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';

const TrackDefaultTab = () => {
	const [autoConnect, setAutoConnect] = useState (true);
	const [requireSecret, setRequireSecret] = useState (false);

	return <>
		<Table striped bordered hover variant="dark">
			<thead>
				<tr>
					<th></th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Show All Tracks</td>
					<td>
						<ToggleButton
							id="toggle-check1"
							type="checkbox"
							variant="secondary"
							checked={autoConnect}
							value="1"
							onChange={(e) => setAutoConnect(e.currentTarget.checked)}
							>
							{autoConnect ? 'YES' : 'NO'}
						</ToggleButton>
					</td>
				</tr>
				<tr>
					<td>Show Media Tracks</td>
					<td>
						<ToggleButton
							id="toggle-check3"
							type="checkbox"
							variant="secondary"
							checked={requireSecret}
							value="1"
							onChange={(e) => setRequireSecret(e.currentTarget.checked)}
							>
							{requireSecret ? 'YES' : 'NO'}
						</ToggleButton>
					</td>
				</tr>
				<tr>
					<td>Show Lead Vocal Track</td>
					<td>
						<ToggleButton
							id="toggle-check2"
							type="checkbox"
							variant="secondary"
							checked={requireSecret}
							value="1"
							onChange={(e) => setRequireSecret(e.currentTarget.checked)}
							>
							{requireSecret ? 'YES' : 'NO'}
						</ToggleButton>
					</td>
				</tr>
				<tr>
					<td>Show non-lead Vocal Tracks</td>
					<td>
						<ToggleButton
							id="toggle-check3"
							type="checkbox"
							variant="secondary"
							checked={requireSecret}
							value="1"
							onChange={(e) => setRequireSecret(e.currentTarget.checked)}
							>
							{requireSecret ? 'YES' : 'NO'}
						</ToggleButton>
					</td>
				</tr>
				<tr>
					<td>Show Rythym Guitar</td>
					<td>
						<ToggleButton
							id="toggle-check3"
							type="checkbox"
							variant="secondary"
							checked={requireSecret}
							value="1"
							onChange={(e) => setRequireSecret(e.currentTarget.checked)}
							>
							{requireSecret ? 'YES' : 'NO'}
						</ToggleButton>
					</td>
				</tr>
				<tr>
					<td>Show Lead Guitar</td>
					<td>
						<ToggleButton
							id="toggle-check3"
							type="checkbox"
							variant="secondary"
							checked={requireSecret}
							value="1"
							onChange={(e) => setRequireSecret(e.currentTarget.checked)}
							>
							{requireSecret ? 'YES' : 'NO'}
						</ToggleButton>
					</td>
				</tr>
				<tr>
					<td>Show Bass Guitar</td>
					<td>
						<ToggleButton
							id="toggle-check3"
							type="checkbox"
							variant="secondary"
							checked={requireSecret}
							value="1"
							onChange={(e) => setRequireSecret(e.currentTarget.checked)}
							>
							{requireSecret ? 'YES' : 'NO'}
						</ToggleButton>
					</td>
				</tr>
				<tr>
					<td>Show Drum Track</td>
					<td>
						<ToggleButton
							id="toggle-check3"
							type="checkbox"
							variant="secondary"
							checked={requireSecret}
							value="1"
							onChange={(e) => setRequireSecret(e.currentTarget.checked)}
							>
							{requireSecret ? 'YES' : 'NO'}
						</ToggleButton>
					</td>
				</tr>
				<tr>
					<td>Show Click Track (Visual)</td>
					<td>
						<ToggleButton
							id="toggle-check3"
							type="checkbox"
							variant="secondary"
							checked={requireSecret}
							value="1"
							onChange={(e) => setRequireSecret(e.currentTarget.checked)}
							>
							{requireSecret ? 'YES' : 'NO'}
						</ToggleButton>
					</td>
				</tr>
			</tbody>
		</Table>
		<Button variant='secondary'>Apply</Button>
	</>
};

export default TrackDefaultTab;
