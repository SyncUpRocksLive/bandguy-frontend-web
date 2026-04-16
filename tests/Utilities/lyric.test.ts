import { expect, test } from 'vitest';
import { lyricsParser, parseTime } from '@shared/parsers/lyrics/LyricsFileParser';
import { LyricFormatVersion } from '@shared/parsers/lyrics/Lyrics';

test('Basic Error Handling', () => {
	expect(() => lyricsParser('')).toThrowError('Empty LRC Data');
	expect(() => lyricsParser('  \t\n\r\n')).toThrowError('Empty LRC Data');
});

test('Mixing Format Types Error Handling', () => {
	// It makes no sense to use repeated verses, and absolute word times
	expect(() => lyricsParser('[00:07.75][00:07.75]{00:09.15,G}( I n t {00:10.51,A#dim}r o ) {00:12.44,C} {00:13.63,G}')).toThrowError(/not supported with extended/);
	expect(() => lyricsParser('[00:07.75][00:07.75]<00:09.15>Hello')).toThrowError(/not supported with extended/);
});

test('Correct Type Detection', () => {
	// basic variants
	expect(lyricsParser('[00:07.75]Hello').type).toBe(LyricFormatVersion.Basic);
	expect(lyricsParser('[00:07.75]{ } Hello').type).toBe(LyricFormatVersion.Basic);
	expect(lyricsParser('[00:07.75] < > { }Hello').type).toBe(LyricFormatVersion.Basic);
	expect(lyricsParser('[00:07.75][00:08.75] < > { }Hello').type).toBe(LyricFormatVersion.Basic);

	// Extended
	expect(lyricsParser('[00:07.75]<00:00.00> { }Hello').type).toBe(LyricFormatVersion.Extended);

	// Chords (even though <  > shows up, chord checked first)
	expect(lyricsParser('[00:07.75]{00:00.00,C} { }Hello').type).toBe(LyricFormatVersion.Chords);
	expect(lyricsParser('[00:07.75]{00:00.00,C} <00:00.00> { }Hello').type).toBe(LyricFormatVersion.Chords);
});

test('Expected Chords/Extended Times', () => {
	let lyric = lyricsParser(`[00:00.00]{00:01.00,G}{00:02.00}`);
	expect(lyric.lines[0].time).toBe(0);
	expect(lyric.lines[0].duration).toBe(5000);
	expect(lyric.lines[0].words![0].time).toBe(1000);
	expect(lyric.lines[0].words![0].duration).toBe(1000);
	expect(lyric.lines[0].words![1].time).toBe(2000);
	expect(lyric.lines[0].words![1].duration).toBe(3000);
	expect(lyric.duration).toBe(5000);

	lyric = lyricsParser(`
	[00:00.00]{00:01.00,G}{00:02.00}
	[00:05.00]{00:06.00,G}{00:10.00}`);
	expect(lyric.lines[0].time).toBe(0);
	expect(lyric.lines[0].duration).toBe(5000);
	expect(lyric.lines[0].words![0].time).toBe(1000);
	expect(lyric.lines[0].words![0].duration).toBe(1000);
	expect(lyric.lines[0].words![1].time).toBe(2000);
	expect(lyric.lines[0].words![1].duration).toBe(3000);
	expect(lyric.lines[1].time).toBe(5000);
	expect(lyric.lines[1].duration).toBe(5000 + 3000);
	expect(lyric.lines[1].words![0].time).toBe(6000);
	expect(lyric.lines[1].words![0].duration).toBe(4000);
	expect(lyric.lines[1].words![1].time).toBe(10000);
	expect(lyric.lines[1].words![1].duration).toBe(3000);
	expect(lyric.duration).toBe(13000);

	lyric = lyricsParser(`
	[00:00.00]{00:01.00,G}{00:02.00}
	[00:05.00]{00:06.00,G}`);
	expect(lyric.lines[0].time).toBe(0);
	expect(lyric.lines[0].duration).toBe(5000);
	expect(lyric.lines[1].time).toBe(5000);
	expect(lyric.lines[1].words![0].time).toBe(6000);
	expect(lyric.lines[1].words![0].duration).toBe(3000);
	expect(lyric.lines[1].duration).toBe(4000);
	expect(lyric.duration).toBe(9000);

	lyric = lyricsParser(`
	[00:00.00]{00:01.00,G}
	[00:05.00]{00:06.00,G}`);
	expect(lyric.lines[0].time).toBe(0);
	expect(lyric.lines[0].duration).toBe(5000);
	expect(lyric.lines[1].time).toBe(5000);
	expect(lyric.lines[1].duration).toBe(4000);
	expect(lyric.duration).toBe(9000);

	lyric = lyricsParser(`
	[00:00.00]<00:00.50><00:01.00>
	[00:05.00]<00:06.00>`);
	expect(lyric.lines[0].time).toBe(0);
	expect(lyric.lines[0].duration).toBe(5000);
	expect(lyric.lines[1].time).toBe(5000);
	expect(lyric.lines[1].duration).toBe(4000);
	expect(lyric.duration).toBe(9000);
});

test('Expected Chords Parsed', () => {
	const lyric = lyricsParser(`
	[00:07.75]{00:09.15,G}( I n t {00:10.51,A#dim}r o ){00:12.44,C}{00:13.63,G}
	[00:28.25]{00:28.80,G}( I n t {00:30.03,A#dim}r o ){00:32.12,C}{00:33.36,G} Hi `);

	expect(lyric.type).toBe(LyricFormatVersion.Chords);
	expect(lyric.lines.length).toBe(2);
	expect(lyric.duration).toBe(parseTime('00:33.36') + 3000);

	expect(lyric.lines[0].text).toBe('( I n t r o )');
	expect(lyric.lines[0].time).toBe(parseTime('00:07.75'));
	expect(lyric.lines[0].duration).toBe(parseTime('00:28.25') - parseTime('00:07.75'));

	expect(lyric.lines[0].words?.length).toBe(4);
	expect(lyric.lines[0].words![0].text).toBe('( I n t ');
	expect(lyric.lines[0].words![0].chord).toBe('G');
	expect(lyric.lines[0].words![0].time).toBe(parseTime('00:09.15'));
	expect(lyric.lines[0].words![1].text).toBe('r o )');
	expect(lyric.lines[0].words![1].chord).toBe('A#dim');
	expect(lyric.lines[0].words![1].time).toBe(parseTime('00:10.51'));
	expect(lyric.lines[0].words![2].text).toBe('');
	expect(lyric.lines[0].words![2].chord).toBe('C');
	expect(lyric.lines[0].words![2].time).toBe(parseTime('00:12.44'));
	expect(lyric.lines[0].words![3].text).toBe('');
	expect(lyric.lines[0].words![3].chord).toBe('G');
	expect(lyric.lines[0].words![3].time).toBe(parseTime('00:13.63'));

	expect(lyric.lines[1].text).toBe('( I n t r o ) Hi');
	expect(lyric.lines[1].time).toBe(parseTime('00:28.25'));
	expect(lyric.lines[1].duration).toBe(parseTime('00:33.36') - parseTime('00:28.25') + 3000);
	expect(lyric.lines[1].words?.length).toBe(4);
	expect(lyric.lines[1].words![0].text).toBe('( I n t ');
	expect(lyric.lines[1].words![0].chord).toBe('G');
	expect(lyric.lines[1].words![0].time).toBe(parseTime('00:28.80'));
	expect(lyric.lines[1].words![1].text).toBe('r o )');
	expect(lyric.lines[1].words![1].chord).toBe('A#dim');
	expect(lyric.lines[1].words![1].time).toBe(parseTime('00:30.03'));
	expect(lyric.lines[1].words![2].text).toBe('');
	expect(lyric.lines[1].words![2].chord).toBe('C');
	expect(lyric.lines[1].words![2].time).toBe(parseTime('00:32.12'));
	expect(lyric.lines[1].words![3].text).toBe(' Hi');
	expect(lyric.lines[1].words![3].chord).toBe('G');
	expect(lyric.lines[1].words![3].time).toBe(parseTime('00:33.36'));
});

test('Expected Extended Parsed', () => {
	// Because there are chords, and <>, the chords trump
	let lyric = lyricsParser(`
	[00:07.75]{00:09.15,G}( I n t <00:10.51,A#dim>r o ) {00:12.44,C} {00:13.63,G}
	[00:28.25]{00:28.80,G}( I n t {00:30.03,A#dim}r o ) {00:32.12,C} {00:33.36,G} Hi `);

	expect(lyric.type).toBe(LyricFormatVersion.Chords);
	expect(lyric.lines.length).toBe(2);
	//expect(lyric.duration).toBe(parseTime('00:33.36'));

	// Because there are chords, in <> format, but, parser set to look for only extended: <> or chord {,} and neither was true
	// falls back to basic
	lyric = lyricsParser(`
	[00:07.75]<00:09.15,G>( I n t <00:10.51,A#dim>r o ) <00:12.44,C> <00:13.63,G>
	[00:28.25]<00:28.80,G>( I n t <00:30.03,A#dim>r o ) <00:32.12,C> <00:33.36,G> Hi `);

	expect(lyric.type).toBe(LyricFormatVersion.Basic);

	// Pure extended (besides chord extraction, extended and chord versions are the same)
	lyric = lyricsParser(`
	[00:07.75]<00:09.15>( I n t <00:10.51>r o ) <00:12.44> <00:13.63>
	[00:28.25]<00:28.80>( I n t <00:30.03>r o ) <00:32.12> <00:33.36> Hi `);

	expect(lyric.type).toBe(LyricFormatVersion.Extended);
});

test('Expected Extended Parsed Times', () => {
	const lyric = lyricsParser(`
	[00:07.75]<00:09.15>( I n t <00:10.51>r o )<00:12.44><00:13.63>
	[00:28.25]<00:28.80>( I n t <00:30.03>r o )<00:32.12><00:33.36> Hi`);

	expect(lyric.type).toBe(LyricFormatVersion.Extended);
	expect(lyric.lines.length).toBe(2);
	expect(lyric.duration).toBe(parseTime('00:33.36') + 3000);

	expect(lyric.lines[0].text).toBe('( I n t r o )');
	expect(lyric.lines[0].time).toBe(parseTime('00:07.75'));
	expect(lyric.lines[0].duration).toBe(parseTime('00:28.25') - parseTime('00:07.75'));

	expect(lyric.lines[0].words?.length).toBe(4);
	expect(lyric.lines[0].words![0].text).toBe('( I n t ');
	expect(lyric.lines[0].words![0].chord).toBeFalsy();
	expect(lyric.lines[0].words![0].time).toBe(parseTime('00:09.15'));
	expect(lyric.lines[0].words![1].text).toBe('r o )');
	expect(lyric.lines[0].words![1].chord).toBeFalsy();
	expect(lyric.lines[0].words![1].time).toBe(parseTime('00:10.51'));
	expect(lyric.lines[0].words![2].text).toBe('');
	expect(lyric.lines[0].words![2].chord).toBeFalsy();
	expect(lyric.lines[0].words![2].time).toBe(parseTime('00:12.44'));
	expect(lyric.lines[0].words![3].text).toBe('');
	expect(lyric.lines[0].words![3].chord).toBeFalsy();
	expect(lyric.lines[0].words![3].time).toBe(parseTime('00:13.63'));

	expect(lyric.lines[1].text).toBe('( I n t r o ) Hi');
	expect(lyric.lines[1].time).toBe(parseTime('00:28.25'));
	expect(lyric.lines[1].duration).toBe(parseTime('00:33.36') - parseTime('00:28.25') + 3000);
	expect(lyric.lines[1].words?.length).toBe(4);
	expect(lyric.lines[1].words![0].text).toBe('( I n t ');
	expect(lyric.lines[1].words![0].chord).toBeFalsy();
	expect(lyric.lines[1].words![0].time).toBe(parseTime('00:28.80'));
	expect(lyric.lines[1].words![1].text).toBe('r o )');
	expect(lyric.lines[1].words![1].chord).toBeFalsy();
	expect(lyric.lines[1].words![1].time).toBe(parseTime('00:30.03'));
	expect(lyric.lines[1].words![2].text).toBe('');
	expect(lyric.lines[1].words![2].chord).toBeFalsy();
	expect(lyric.lines[1].words![2].time).toBe(parseTime('00:32.12'));
	expect(lyric.lines[1].words![3].text).toBe(' Hi');
	expect(lyric.lines[1].words![3].chord).toBeFalsy();
	expect(lyric.lines[1].words![3].time).toBe(parseTime('00:33.36'));
});

test('Expected Extended Parsed Times With Initial Text', () => {
	const lyric = lyricsParser(`
	[00:07.75]Hello <00:09.15>( I n t <00:10.51>r o )<00:12.44><00:13.63>
	[00:28.25]<00:28.80>( I n t <00:30.03>r o )<00:32.12><00:33.36> Hi
	[00:40.00]Goodbye`);

	expect(lyric.type).toBe(LyricFormatVersion.Extended);
	expect(lyric.lines.length).toBe(3);
	// //expect(lyric.duration).toBe(parseTime('00:33.36') + 3000);
	expect(lyric.lines[0].text).toBe('Hello ( I n t r o )');
	expect(lyric.lines[0].words?.length).toBe(5);
	expect(lyric.lines[1].text).toBe('( I n t r o ) Hi');
	expect(lyric.lines[1].words?.length).toBe(4);
	expect(lyric.lines[2].text).toBe('Goodbye');
	expect(lyric.lines[2].words?.length).toBe(1);
});

test('Expected Basic Parsed', () => {
	const lyric = lyricsParser(`
	[00:07.75] ( I n t r o )
	[00:28.25] ( I n t r o ) Hi `);

	expect(lyric.type).toBe(LyricFormatVersion.Basic);
	expect(lyric.lines.length).toBe(2);
	expect(lyric.duration).toBe(parseTime('00:28.25') + 10000);

	expect(lyric.lines[0].text).toBe('( I n t r o )');
	expect(lyric.lines[0].time).toBe(parseTime('00:07.75'));
	expect(lyric.lines[0].duration).toBe((parseTime('00:28.25') - parseTime('00:07.75')) * .95);
	expect(lyric.lines[1].text).toBe('( I n t r o ) Hi');
	expect(lyric.lines[1].time).toBe(parseTime('00:28.25'));
});
