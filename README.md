# Your Day. His Day.

React + Vite, connecting an iPad birthday form to a shared TV display. Both devices poll room state every second; server timestamps drive synchronized playback. Local development uses Node/Express; Vercel uses the API handler and Upstash Redis.

## Run

Requires Node 20.19+ or 22.12+.

```powershell
npm install
npm run dev
```

- TV: http://localhost:5173/?room=SATSANG
- iPad: http://localhost:5173/ipad?room=SATSANG

For separate devices on the local server, connect both to the same Wi-Fi and replace `localhost` with this computer's local IPv4 address on BOTH devices. Keep this server/computer running. Windows may ask to allow Node on your private network. The room codes must match. Local room state is temporary and resets when the server restarts; birthdays are not written to disk.

On the iPad, choose Get started, select a month and day, and submit the birthday. Results group visits into year tiles; tap a year to jump the TV spotlight. Multiple visits within the active year can be selected individually. Playback loops through every source record every 3.5 seconds. Another birthday returns to date entry; Done returns home. After 45 seconds without iPad activity, the session expires and the TV returns to idle.

Hold the brand for three seconds to open staff controls for room connection, playback pause/resume, map fit/zoom, reset and fullscreen. The browser requests Screen Wake Lock where supported. Guided Access, browser chrome, display sleep and kiosk launch must be configured on the devices.

## Production build

```powershell
npm run build
$env:NODE_ENV='production'
node server.mjs
```

The existing Vercel project is `vicharantrack`. Its `vercel.json` builds the static frontend and routes API requests to `api/index.mjs`. Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel (see `.env.example`) so devices share room state. The handler also accepts the corresponding `KV_REST_API_URL` and `KV_REST_API_TOKEN` names. Static hosting alone does not provide shared room state. The local Express server can also serve `dist` with the production command above.

## Archive and provenance

`data/records.json` contains 10,475 birthday matches from BAPS vicharan archives, imported on November 3, 2026. The archive covers 1999–2026 for PSM/MSM as published; some dates/years are absent. Every record preserves its official source URL and linked image. All 366 month/day combinations have at least one record; this does not mean every historical date has a record.

Older entries often cover an explicit date range. These are expanded inclusively to individual birthday matches, preserving `dateRange`. Their photographs illustrate the published range and are not asserted to have been taken on the selected day. This is disclosed on the photo card. A day can have multiple locations and multiple galleries.

Images use the corresponding full-size WebImages variant with the archive thumbnail as fallback. Remote image availability depends on BAPS. Maps use OpenStreetMap tiles and require internet. Coordinates in `src/places.json` and `src/locations.js` are approximate city centers, not exact visit locations. Locations without an assigned coordinate display a photo spotlight and an unverified-location note without an invented pin.

BAPS blocks direct automated HTTP requests from this machine, so records were imported from the actual browser-rendered year/month archive pages. The snapshot does not automatically refresh. The local Express server accepts a JSON array matching the existing schema at `POST /api/import`, only from the server machine. Entries merge by source URL and date. Only import trusted, source-verified records. For range entries, preserve the published range label and use the actual matched day/month/year. This importer is not exposed by the Vercel handler.

Photo and historical content credits: BAPS Swaminarayan Sanstha. Source: https://www.baps.org/vicharan.aspx?yr=2026 and linked PSM archive pages.

## Checks

`npm test` validates calendar handling, every imported record, uniqueness, 366-day coverage, and known source dates. `npm run build` checks the production React build. The two-screen flow was also exercised in the browser using a shared room.

## TV network resilience

The TV preloads upcoming photos with two background workers. `/api/photo` only accepts image URLs in the archive, resizes to a maximum of 960 pixels and compresses JPEGs, with a small preview and thumbnail fallback. Successful images are cached for seven days in the browser and 30 days on Vercel; failed responses are not cached. The TV starts each 3.5-second viewing period after the photograph is ready, and manual year selections interrupt the loop. TV autoplay can therefore lag the iPad’s time-based highlight on a slow connection.

The bundled country basemap is Natural Earth 1:110m (public domain), from https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson. Detailed OpenStreetMap tiles are revealed only after the visible tile set loads without errors, so failed tiles leave a continuous country map rather than missing squares.

## Historical import (November 2026)

Added 31,828 no-photo records from the supplied PSM workbook, MSM PDF and user-provided 2016 residence dates, bringing the archive to 42,303 records. PSM coverage begins May 19, 1950. All 225 dates from January 1 through August 12, 2016 are Sarangpur; August 13 and later have no PSM records. Existing photo-backed records win same-guru/date/place overlaps; other same-day visits are retained. The PDF arrival and departure dates are inclusive. Source file, worksheet row or PDF page, and original location are retained on imported records. Unknown city coordinates remain unverified rather than guessed. The TV shows 28 years per automatic page, following its spotlight; the iPad lists all available years.
