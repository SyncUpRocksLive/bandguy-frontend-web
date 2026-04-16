import { LogError } from "./Logger";

export enum SettingType {
	YesNo = 'YesNo',
	OnOff = 'OnOff',
	Text = 'Text',
}

export type SettingValue =
| {description: string, key: string, type: SettingType.YesNo, value: boolean }
| {description: string, key: string, type: SettingType.OnOff, value: boolean }
| {description: string, key: string, type: SettingType.Text, value: string };

const ReadCurrentSettings = (category: string, settings: SettingValue[]): SettingValue[] => {
	if (!window.localStorage) {
		LogError('No Localstorage - returning default settings');
		return settings;
	}

	const savedValuesString = window.localStorage.getItem(`setting.${category}`);
	if (!savedValuesString) {
		LogError(`Localstorage has no value set for setting.${category} - returning default settings`);
		return settings;
	}
		
	const savedValues = <SettingValue[]>JSON.parse(savedValuesString);

	settings.forEach((s) => {
		const savedValue = savedValues.find((x) => x.key === s.key && x.type === s.type);
		if (savedValue) {
			s.value = savedValue.value;
		}
	});

	return settings;
}

const WriteSettings = (category: string, settings: SettingValue[]) => {
	if (!window.localStorage) {
		LogError('No Localstorage - cannot persist settings');
		return;
	}

	window.localStorage.setItem(`setting.${category}`, JSON.stringify(settings));
}

export const GetGeneraSettings = (): SettingValue[] =>
{
	return ReadCurrentSettings('general', [
		{description: 'Auto Accept Bandmates', key: 'aabm', type: SettingType.YesNo, value: true},
		{description: 'Require Secret', key: 'reqsec', type: SettingType.YesNo, value: false},
		{description: 'Secret', key: 'sec', type: SettingType.Text, value: ''},
	]);
}

export const SaveGeneralSettings = (settings: SettingValue[]) => {
	WriteSettings('general', settings);
}
