import { useState } from 'react'
import ToggleButton from 'react-bootstrap/ToggleButton';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';
import { GetGeneraSettings, SaveGeneralSettings, SettingType } from '@shared/services/Settings';

const GeneralTab = () => {
	const [settings, setSettings] = useState(GetGeneraSettings);

	const createYesNoToggle = (key: string) => {
		const s = settings.find((s) => s.key === key);
		if (s?.type !== SettingType.YesNo) {
			return;
		}

		return (
			<tr>
				<td>{s.description}</td>
				<td>
					<ToggleButton
						id={key}
						type="checkbox"
						variant="secondary"
						checked={s.value}
						value="1"
						onChange={(e) => {
							const newSettings = settings.map((ns) => ns);
							const s = settings.find((s) => s.key === key)!;
							s.value = e.currentTarget.checked;
							setSettings(newSettings)
						}}>
						{s.value ? 'YES' : 'NO'}
					</ToggleButton>
				</td>
			</tr>
		)
	};

	return <>
		<Table striped bordered hover variant="dark">
			<thead>
				<tr>
					<th></th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{createYesNoToggle('aabm')}
				{createYesNoToggle('reqsec')}
				<tr>
					<td>Secret</td>
					<td>NYI</td>
				</tr>
			</tbody>
		</Table>
		<Button variant='secondary' onClick={() => {
			SaveGeneralSettings(settings);
		}}>Apply</Button>
	</>
};

export default GeneralTab;
