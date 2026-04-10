export function msToHMS(ms: number) {
	const sc = ms / 1000;
	const seconds = Math.floor((sc) % 60);
	const minutes = Math.floor((sc / 60) % 60);
	return `${minutes.toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	})}:${seconds.toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	})}`;
}

const typeIcons: Record<string, string> = {
	vocals: '🎤',
	leadvocals: '🎤',
	drums: '🥁',
	bass: '🎸',
	guitar: '🎸',
	metronome: '⏱️',
	keyboard: '🎹',
	text: '📝',
	default: '🎵'
};

export function getTextBadge(type: string): string {
	return typeIcons[type.toLowerCase()] || typeIcons.default;
}
