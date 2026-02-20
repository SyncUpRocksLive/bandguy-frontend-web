import { Lyric, Line, Word, LyricFormatVersion } from '../../Types/Lyrics';
import { LogError } from './Logger';

function parseLegacy(lyric: Lyric, lyricLine: string, timePositions:number[]) {
	lyricLine = lyricLine.trim();

	// Add time entry for each duplicated lyric phrase
	timePositions.forEach(ts => {
		lyric.lines.push({
			time: ts,
			text: lyricLine,
			duration: 0
		});
	});

	if (lyric.lines.length <= 0) {
		LogError('Lyric File has no lines');
		return;
	}
}

function parseExtended(lyric: Lyric, lyricLine: string, lineTime:number) {
	const words: Word[] = [];

	// If extended, seperator would be <> otherwise, would be {,} and we have chords
	// other than that, same process - support either.
	const regex = new RegExp('[<{]\\d{2}:\\d{2}.\\d{2,}?(,[A-Za-z 0-9#/]+)?[}>]', 'g');
	let match: RegExpExecArray | null;

	let groupNumber = -1;
	let lastIndex = -1;

	while ((match = regex.exec(lyricLine)) != null) {
		// There is a slice of text between line time and first sub word time - capture it
		if (lastIndex < 0 && match.index > 0) {
			const firstWord = lyricLine.slice(0, match.index);
			if (firstWord.trim().length > 0) {
				words.push({
					time: lineTime,
					duration: 0,
					text: firstWord
				});
				++groupNumber;
			}
		}

		// Strip off any captured text (not part of timestamp)
		let currentMatchText = match[0];
		if(match[1]?.length > 0) {
			currentMatchText = currentMatchText.slice(0, -(match[1].length + 1))
		}

		const newGroup: Word = {
			time: extractTime(currentMatchText),
			duration: 0,
			text: ''
		};
		words.push(newGroup);

		// We only are caring about capture group 1 if we are collecting chords
		if (lyric.type === LyricFormatVersion.Chords && match[1]) {
			const chordText = match[1].slice(1).trim();
			if (chordText.length > 0) {
				newGroup.chord = chordText;
			}
		}

		// We capture a lyric when we encounter the next {}/<>, so, track the last groupIndex
		if (lastIndex >= 0) {
			const wordText = lyricLine.slice(lastIndex, match.index);
			if (wordText.length > 0) {
				words[groupNumber].text = wordText;
			}
		}

		++groupNumber;
		lastIndex = match.index + match[0].length;
	}

	if (lastIndex <= 0 || groupNumber < 0) {
		// When there was no timed subwords - treat whole line as a word.
		words.push({
			text: lyricLine,
			time: lineTime,
			duration: 0
		});
	}
	else if (lastIndex < lyricLine.length) {
		// Handle remaining text
		const wordText = lyricLine.slice(lastIndex, lyricLine.length);
		if (wordText.length > 0) {
			words[groupNumber].text = wordText;
		}
	}

	// TODO: We should verify words times are in order. Not less then line time

	lyric.lines.push({
		text: words.filter(x => x.text.length > 0).map(x => x.text).join(''),
		words: words,
		time: lineTime,
		duration: 0
	});
}

function readLine(lyric: Lyric, lineNumber: number, line:string) {
	// '[00:00.00]'
	const timestamps = line.match(/\[\d{2}:\d{2}(.\d{2,})?\]/g);

	if (!timestamps || timestamps.length === 0) {
		return;
	}

	// If there are multiple LINE_TIMEs, that means repeated verses/lyric blocks, e.g.:
	// [00:00:00][01:00:00] Hello!
	// 'Hello!' would be played at time 0 and time 1min
	let lyricLine = line;
	// Parse found line times into milliseconds. Also, remove from string.
	const timePositions = timestamps.map(x => {
		lyricLine = line.replace(x, '');
		return extractTime(x);
	});

	lyricLine = lyricLine.trim();
	if (lyricLine.length === 0) {
		return;
	}

	if(lyric.type === LyricFormatVersion.Basic) {
		parseLegacy(lyric, lyricLine, timePositions);
		return;
	}

	if (timePositions.length > 1) {
		const msg = `Lyric Line #${lineNumber} Contained multiple (repeat line) LINETIMEs - not supported with extended/chord based lyric file`;
		LogError(msg);
		throw Error(msg);
	}
	
	parseExtended(lyric, lyricLine, timePositions[0]);
}

function extractTime(timestamp:string) {
	const time = timestamp.replace(/\[|\]|<|>|{|}/g, '');
	return parseTime(time);
}

export function parseTime(time:string) {
	const [m, s] = time.split(':');
	if (!m || !s) {
		LogError(`Invalid Time: ${time}`);
		return 0;
	}

	// eslint-disable-next-line prefer-const
	let [ws, ts] = s.split('.');
	if (!ws || !ts) {
		LogError(`Invalid Time: ${time}`);
		return 0;
	}
	ts = ts.trim();

	const minutes = parseInt(m) * 60 * 1000;
	const seconds = parseInt(ws) * 1000;
	const fractional = Math.pow(10, ts.length);
	const ms = (1000 * parseInt(ts)) / fractional;

	return minutes + seconds + ms;
}

function sortLines(lines:Line[]) {
	return lines.sort((a, b) => a.time - b.time);
}

function getType(text:string) {
	if (new RegExp('{\\d{2}:\\d{2}(.\\d{2,})?,[A-Za-z 0-9#/]+}', 'g').test(text)) {
		return LyricFormatVersion.Chords;
	}

	// '<00:00.00> somethingelse'
	const ENHANCED_REGEX = /<\d{2}:\d{2}(.\d{2,})?>\s*[^\s|<]*/g;
	return ENHANCED_REGEX.test(text) ? LyricFormatVersion.Extended : LyricFormatVersion.Basic;
}

export function lyricsParser(lrc:string) {
	if (lrc == '' || lrc.trim().length === 0) {
		throw Error('Empty LRC Data');
	}

	const result: Lyric = {
		lines: [],
		type: getType(lrc),
		duration: 0 // TODO
	};

	lrc.split(/\r?\n/).forEach((l, i) => {
		readLine(result, i, l.trim());
	});

	// Ensure all lines are in order
	result.lines = sortLines(result.lines);

	if (result.type === LyricFormatVersion.Basic) {	
		// Go through and adjust line durations. duration for legacy format is 95% of start
		// of our line, and start of next lines lyric
		for(let i = 0; i < result.lines.length; ++i) {
			const l = result.lines[i];
			if (i + 1 < result.lines.length) {
				l.duration = (result.lines[i + 1].time - l.time) * .95;
			} else {
				l.duration = 10000;
			}
		}
	} else {
		// Extended+ follows this:
		for(let i = 0; i < result.lines.length; ++i) {
			const line = result.lines[i];

			let lineEndTime: number;
			if (i + 1 < result.lines.length) {
				lineEndTime = result.lines[i + 1].time;
			} else {
				// There are no more next lines - take ending word time
				lineEndTime = (line.words!.length > 1) ? line.words![line.words!.length - 1].time : line.words![0].time;
				// TODO: We should be using total duration of song (if known)
				lineEndTime += 3000;
			}

			line.duration = (lineEndTime - line.time);

			// Go through the words and update their durations
			line.words!.forEach((word, wIndex) => {
				// Word duration is next_line_time - word_start.time
				if (wIndex + 1 < line.words!.length) {
					word.duration = line.words![wIndex + 1].time - word.time;
				} else {
					// No more words - so, use line's duration
					word.duration = lineEndTime - word.time;
				}
			});
		}
	}

	// Determine total duration
	// TODO: Support tag length for total duration - and only adjust if < expected duration
	const lastLine = result.lines[result.lines.length - 1];
	result.duration = lastLine.time + lastLine.duration;

	return result;
}
