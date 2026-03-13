import { useEffect, useRef, useState } from 'react'
import reactLogo from '@/assets/react.svg'
import viteLogo from '/vite.svg'
import '@/App.css'
import { lyricsParser } from '@/Support/Utilities/LyricsFileParser';
import Viewer from '@/Components/Lyrics/Viewer/Viewer';
import { Lyric } from '@/Types/Lyrics';
import { msToHMS } from '@/Support/Utilities/DisplayHelpers';
import video from '@/assets/LumineersHoHey.mp4'

const Song = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState("");
  const [tick, setTick] = useState(0);
  const [lyric, setLyric] = useState<Lyric | undefined>(undefined);

  const videoPlayer = useRef<HTMLVideoElement>(null);

  useEffect( () => {
    setLyric(lyricsParser(`[ti:Ho Hey]
    [length:02:39.06]
    [re:www.megalobiz.com/lrc/maker]
    [ve:v1.2.3]
    [00:03.00]Ho
    [00:06.50]Hey
    [00:09.50]Ho
    [00:12.50]Hey
    [00:16.00](Ho) I been trying to do it right
    [00:19.00](Hey) I been living a lonely life
    [00:22.20](Ho) I been sleepin' here instead
    [00:25.00](Hey) I been sleepin' in my bed
    [00:27.63](Ho) I been sleepin' in my bed
    [00:31.10]Hey
    [00:34.30]Ho
    [00:37.50]So show me family
    [00:40.48](Hey) all the blood that I will bleed
    [00:43.38](Ho) I don't know where I belong
    [00:46.63](Hey) I don't know where I went wrong
    [00:49.64](Ho) but I can write a song (hey)
    [00:54.89]I belong with you, you belong with me, you're my sweetheart
    [01:01.00]I belong with you, you belong with me, you're my sweet' (ho)
    [01:08.00]Hey (come on now)
    [01:11.14]Ho
    [01:13.64]Hey
    [01:16.13](Ho) I don't think you're right for him
    [01:19.50](Hey) think of what it might have been if we
    [01:23.00](Ho) took a bus to chinatown
    [01:26.00](Hey) I'd be standin' on canal (ho) and Bowery (hey)
    [01:34.39](Ho) she'd be standin' next to me (hey)
    [01:39.89]I belong with you, you belong with me, you're my sweetheart
    [01:45.50]I belong with you, you belong with me, you're my sweetheart
    [01:52.20]Love~~~~~ we, need it now
    [01:57.38]Let's hope~~~~, for some
    [02:03.39]'Cause oh~~~~, we're bleedin' out
    [02:09.00]I belong with you, you belong with me, you're my sweetheart
    [02:15.25]I belong with you, you belong with me, you're my sweet'(ho)
    [02:22.64]Hey
    [02:25.00]Ho
    [02:28.89]Hey`));
  }, []);

  useEffect(() => {
    //const started = Date.now();

    //let timer:NodeJS.Timer;
    if (isPlaying) {
      videoPlayer.current!.play();
    //   timer = setInterval(function() {
    //     var delta = Date.now() - started; // milliseconds elapsed since start
    //     var newTick = tick + delta;

    //     if (newTick > lyric!.duration) {
    //       setIsPlaying(false);
    //       newTick = lyric!.duration;
    //     }

    //     setTick(newTick);
    // }, 200); 
  } else {
    videoPlayer.current!.currentTime = 0;
    videoPlayer.current!.pause();
  }

  return () => {
    // if (timer) {
    //   console.log("Freeing timeout");
    //   clearInterval(timer);
    // }
  }
  }, [isPlaying])

  useEffect(() => {
    setPlayTime(`${isPlaying ? 'Playing' : 'Paused'} ${msToHMS(tick)}`);
  }, [tick, isPlaying]);

  function videoTimeUpdate() {
    if(!videoPlayer.current) {
      return;
    }

    //console.log(Math.floor(videoPlayer.current!.currentTime * 1000));
    setTick(videoPlayer.current!.currentTime * 1000);
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank"><img src={viteLogo} className="logo" alt="Vite logo" /></a>
        <a href="https://react.dev" target="_blank"><img src={reactLogo} className="logo react" alt="React logo" /></a>
      </div>

      <div className="card">
        <p>{playTime}</p>
        <input type="range" min="0" max={lyric?.duration} value={tick} onChange={(c) => setTick(parseInt(c.target.value))} />
        <button onClick={() => setIsPlaying(true)}>Play</button>
        <button onClick={() => setIsPlaying(false)}>Pause</button>
        <button onClick={() => {
          setIsPlaying(false);
          setTick(0);
        }}>Stop</button>
      </div>
      <video width="750" height="500" controls={true} ref={videoPlayer} onTimeUpdate={() => videoTimeUpdate()} >
        <source src={video} type="video/mp4"/>
      </video>
      <Viewer currentTick={tick} lyric={lyric} />
    </>
  )
}

export default Song
