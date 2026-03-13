import '@/App.css'
import { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixijs'

function TrackViewer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [, setPixiApp] = useState<PIXI.Application | undefined>(undefined);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const app = new PIXI.Application(
        {
            view: canvasRef.current,
            resizeTo: document.getElementById("canvasDiv")!
            //resizeTo: document.getElementById("canvasDiv")
        });

        setPixiApp(app);

        // create a new Sprite from an image path
        const bunny = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png');
        
        // center the sprite's anchor point
        bunny.anchor.set(0.5);
        
        // move the sprite to the center of the screen
        bunny.x = app.screen.width / 2;
        bunny.y = app.screen.height / 2;
        
        app.stage.addChild(bunny);
        
        // Listen for animate update
        app.ticker.add((delta) =>
        {
        // just for fun, let's rotate mr rabbit a little
        // delta is 1 if running at 100% performance
        // creates frame-independent transformation
        bunny.rotation += 0.01 * delta;
        bunny.x += 0.5 * delta;
        bunny.y += 0.5 * delta;
        });
    }, []);

  return (
    <>
      <h1>Set List</h1>
      <div id="canvasDiv"  style={{height: '50vh', width: '50vw', background: 'green', overflow: 'hidden'}}>
        <canvas ref={canvasRef}>
        </canvas> 
        </div>
    </>
  )
}

export default TrackViewer;
