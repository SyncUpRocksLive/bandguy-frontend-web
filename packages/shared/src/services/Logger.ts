export let LogMode: 'verbose'|'info'|'error' = 'verbose';

const logColors = {
	'verbose': 'green',
	'info': 'green',
	'error': 'red',
}

export const LogVerbose = (message: string) => {
	if (LogMode === 'verbose') {
		console.log(`%cVERBOSE: %c${message}`, `color: ${logColors['verbose']};`, 'color: inherit;');
	}
}

export const LogInfo = (message: string) => {
	if (LogMode === 'verbose' || LogMode === 'info') {
		console.log(`%cINFO: %c${message}`, `color: ${logColors['info']};`, 'color: inherit;');
	}
}

export const LogError = (message: string) => {
	console.log(`%cERROR: %c${message}`, `color: ${logColors['error']};`, 'color: inherit;');
}


export const Log = (mode: 'verbose'|'info'|'error', message: string) => {
	if (LogMode === mode || mode === 'error') {
		console.log(`%c${mode.toUpperCase()}: %c${message}`, `color: ${logColors[mode]};`, 'color: inherit;');
	}
}

export const LogObject = (mode: 'verbose'|'info'|'error', message: string, obj: any) => {
	if (LogMode === mode || mode === 'error') {
		console.log(`%c${mode.toUpperCase()}: %c${message}`, `color: ${logColors[mode]};`, 'color: inherit;');
		console.table(obj);
	}
}
