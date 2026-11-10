# Your Day. His Day. — design system

Approved reference: YourDayHisDay-Brief/BRIEF.md and mocks, November 5, 2026. Replaces the previous Atlas/Cinema previews.

## Tokens

- Background #03060F; ambient blue #2B4A86.
- Accent/gold #E2C27A; guru blue #9EC3FF.
- Foreground #F2F1EC; secondary #B0B4BF.
- Glass #141D34DE, white border at 9%, 20px backdrop blur, radius28px (48px on 4K TV).
- Inter 400/500/600/650/700/750. Display tracking -0.04em; body standard tracking.
- Primary pill: gold/dark ink, minimum62px tall; iPad main CTA70–112px.

## iPad

Portrait target820×1180: 48px side margins; header wordmark28px; hero70px; four-column months; seven-column calendar; four-column year tiles. Landscape date screen puts month and day groups alongside each other so both remain visible. Home and result actions sit at the bottom. Touch targets are44px or larger. Invalid days remain visible and disabled. A three-second title hold opens staff controls.

## TV

16:9 at1920×1080 and3840×2160. Static visitor display, no visitor controls. Brand4.7vw/7.4vh; date6.1vw at13.7vh; map left63% between31–72vh, all verified points fitted, no moving camera during spotlight. Right panel35.5vw with two year columns, at most14 rows per column. Full guru names appear in the key; dots carry guru identity per year. Spotlight43vw×27.8vh in lower left; image contains full photograph; text has source year/place/country/guru/range. QR9vw square, at least about6 inches across on an85-inch16:9 display.

## Motion and states

Spotlight viewing time3500ms after a photograph is ready. Shared room selections interrupt the TV loop; the TV waits for image readiness on slow networks. Manual year jumps restart the cadence at that visit. Progress bar tracks cadence. Active map dot pulses; idle dots drift slowly. Reduced-motion disables animated effects. Network reconnection polls shared state; errors are visitor-readable. Session expiry45000ms after last iPad touch is enforced both client-side and by room reads.

## Implementation

src/main.jsx, src/your-day.css, src/journey.js, src/locations.js. Old style.css/concepts.css are not imported. Original historical dataset preserved. Screen Wake Lock is requested where supported; kiosk OS restrictions remain deployment setup.
