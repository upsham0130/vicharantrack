import {useEffect, useState} from 'react';
import {loadPhoto, photoUrl} from './photos.js';
import {CYCLE_MS} from './journey.js';

// Promise.any is unavailable in some Samsung TV browsers.
export function firstPhoto(requests) {
  return new Promise((resolve, reject) => {
    let remaining = requests.length;
    for (const request of requests) request.then(resolve, () => {if (--remaining === 0) reject(new Error('Photo unavailable'));});
  });
}

// The TV's photo clock starts after the photograph is ready. A slow download
// never consumes the next year's viewing time; a manual selection interrupts it.
export function useTvPlayback(records, session) {
  const [frame, setFrame] = useState({record: null, progress: 0});
  useEffect(() => {
    let stopped = false, timer;
    if (!records.length || !session) {setFrame({record: null, progress: 0}); return;}
    let index = Math.max(0, records.findIndex(record => record.source === (session.selectedSource || session.autoSource)));
    async function show() {
      const record = records[index];
      if (record.image) {
        // The small preview can be shown while the full TV-sized image upgrades.
        await firstPhoto([loadPhoto(photoUrl(record)), loadPhoto(photoUrl(record, true))]).catch(() => {});
      }
      if (stopped) return;
      const started = Date.now();
      setFrame({record, progress: 0});
      const next = records[(index + 1) % records.length];
      if (next.image) {loadPhoto(photoUrl(next)).catch(() => {}); loadPhoto(photoUrl(next, true)).catch(() => {});}
      if (session.paused) return;
      timer = setInterval(() => {
        const progress = Math.min(1, (Date.now() - started) / CYCLE_MS);
        setFrame({record, progress});
        if (progress >= 1) {
          clearInterval(timer);
          index = (index + 1) % records.length;
          show();
        }
      }, 100);
    }
    show();
    return () => {stopped = true; clearInterval(timer);};
  }, [records, session?.id, session?.playbackStartedAt, session?.paused, session?.selectedSource, session?.autoSource]);
  return frame;
}
