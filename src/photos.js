export function photoUrl(record, preview = false) {
  return record?.image ? `/api/photo?image=${encodeURIComponent(record.image)}${preview ? '&preview=1' : ''}` : null;
}

// Keep decoded images across loops; retry failures rather than caching rejection.
const cache = new Map();
export function loadPhoto(url) {
  if (!url) return Promise.reject(new Error('No photograph'));
  if (cache.has(url)) return cache.get(url);
  const request = new Promise((resolve, reject) => {
    const image = new Image();
    const timeout = setTimeout(() => {image.src = ''; reject(new Error('Photo timed out'));}, 18000);
    image.onload = () => {clearTimeout(timeout); resolve(url);};
    image.onerror = () => {clearTimeout(timeout); reject(new Error('Photo unavailable'));};
    image.src = url;
  });
  cache.set(url, request);
  request.catch(() => cache.delete(url));
  // Bound decoded-image retention on TV browsers with limited memory.
  if (cache.size > 100) cache.delete(cache.keys().next().value);
  return request;
}

export function preloadPhotos(records, start = 0) {
  let cancelled = false, next = 0;
  const ordered = records.map((_, index) => records[(start + index) % records.length]);
  async function worker() {
    while (!cancelled && next < ordered.length) {
      const record = ordered[next++];
      try {await loadPhoto(photoUrl(record));} catch {}
    }
  }
  // Two connections leave room for polling and map traffic on weak Wi-Fi.
  worker(); worker();
  return () => {cancelled = true;};
}
