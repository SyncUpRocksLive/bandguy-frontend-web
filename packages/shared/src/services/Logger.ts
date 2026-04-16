export let LogMode: 'verbose'|'info'|'error' = 'verbose';

const logLevels = {
	'verbose': 0,
	'info': 1,
	'error': 2,
}

const logColors = {
	'verbose': 'green',
	'info': 'green',
	'error': 'red',
}

export const LogVerbose = (message: string) => {
	Log('verbose', message);
}

export const LogInfo = (message: string) => {
	Log('info', message);
}

export const LogError = (message: string) => {
	Log('error', message);
}

export const Log = (mode: 'verbose'|'info'|'error', message: string) => {
	if (logLevels[mode] >= logLevels[LogMode]) {
		console.log(`%c${mode.toUpperCase()}: %c${message}`, `color: ${logColors[mode]};`, 'color: inherit;');
	}
}

export const LogObject = (mode: 'verbose'|'info'|'error', message: string, obj: any) => {
	if (logLevels[mode] >= logLevels[LogMode]) {
		console.log(`%c${mode.toUpperCase()}: %c${message}`, `color: ${logColors[mode]};`, 'color: inherit;');
		console.table(obj);
	}
}
