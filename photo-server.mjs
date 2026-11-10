import sharp from 'sharp';

// Only archive-owned image URLs are accepted, never an arbitrary proxy target.
export function createPhotoHandler(records) {
  const allowed = new Set(records.map(record => record.image).filter(Boolean));
  const pending = new Map();
  return async function photo(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const image = url.searchParams.get('image');
    if (!allowed.has(image)) return res.status(404).end();
    const preview = url.searchParams.get('preview') === '1';
    const key = `${image}:${preview}`;
    try {
      if (!pending.has(key)) {
        const task = (async () => {
          const candidates = preview ? [image] : [...new Set([image.replace('/Thumbnails/', '/WebImages/'), image])];
          for (const source of candidates) {
            try {
              const response = await fetch(source, {signal: AbortSignal.timeout(preview ? 6000 : 8000)});
              if (!response.ok) continue;
              const bytes = Buffer.from(await response.arrayBuffer());
              if (bytes.length > 12 * 1024 * 1024) continue;
              return await sharp(bytes, {limitInputPixels: 40000000}).rotate()
                .resize({width: preview ? 320 : 960, height: preview ? 320 : 960, fit: 'inside', withoutEnlargement: true})
                .jpeg({quality: preview ? 65 : 76, mozjpeg: true}).toBuffer();
            } catch { /* Try the archive thumbnail if the original is unavailable. */ }
          }
          throw new Error('Photo unavailable');
        })();
        pending.set(key, task);
        task.finally(() => pending.delete(key)).catch(() => {});
      }
      const bytes = await pending.get(key);
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400');
      return res.status(200).send(bytes);
    } catch {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).end();
    }
  };
}
