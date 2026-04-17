import { msToHMS } from '@/Support/Utilities/DisplayHelpers';
import { Lyric } from '@/Types/Lyrics'
import { useEffect, useState } from 'react'

interface IProps {
    lyric?: Lyric,
    currentTick: number
}

function Viewer({ lyric, currentTick }: IProps) {
    if (!lyric) {
        return <div>Loading...</div>
    }

    const [lyricLine, setLyricLine] = useState(-1);

    useEffect(() => {
        if (!lyric) {
            return;
        }

        const tick = currentTick >= 0 ? currentTick : 0;
        const firstLyric = Math.max(0, lyric.lines.findIndex(l => l.time >= tick) - 1);
        if (lyricLine != firstLyric) {
            console.log(`Selected ${firstLyric} : time ${tick} ${lyric.lines[firstLyric].time} ${lyric.lines[firstLyric].text}`);
            setLyricLine(firstLyric);
        }
    }, [currentTick]);

    useEffect(() => {
        if (!lyric || lyricLine < 0 || lyricLine >= lyric.lines.length) {
            return;
        }
        
        const entry = lyric.lines[lyricLine];
        console.log(`Lyric.lines[${lyricLine}] ${msToHMS(entry.time)}): "${entry.text}"`);

        // TODO: use refs?
        const my_element = document.getElementById(`lyc:${lyricLine}`);
        if (my_element) {
            my_element.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest"
            });
        }
    }, [lyric, lyricLine]);

    return (
    <div style={{height: '75px', width: '700px', overflow: 'hidden', maskImage: 'linear-gradient(transparent 0%, black 5%, black 95%, transparent 100%)'}}>
        <div style={{overflowY: 'scroll', height: '100%', width: '100%', lineHeight: '25px', fontSize: '1em'}}>
            <ul>
                {lyric.lines.map((l, i) => 
                    (<li id={`lyc:${i}`} key={l.time}>{l.text}</li>)
                )}
            </ul>
        </div>
    </div>)
}

export default Viewer
