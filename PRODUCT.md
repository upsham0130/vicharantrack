# Your Day. His Day.

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users and Purpose

Visitors enter their birthday on an iPad. A shared TV shows BAPS vicharan records for that month/day across all available years, without requiring visitors to step through each year.

## Confirmed Redesign

The user approved BRIEF.md and all five supplied mockups from YourDayHisDay-Brief on November 5, 2026, including replacement of the earlier vicharanTrack visual system and flow. Publish to the existing Vercel project vicharantrack.

## Brand Commitments

Name everywhere: Your Day. His Day. Text-only title; logo icon removed at the user’s request. Deep navy, blue ambient glow, soft gold, frosted cards, Inter typography, pill buttons. Guru names are written in full. Gold marks Pramukh Swami Maharaj; pale blue marks Mahant Swami Maharaj.

## Flow

- iPad home → Get started → month and day grids on one screen → result tiles, four across in portrait.
- Another birthday returns to date entry; Done returns home. After 45 seconds without iPad touch, the room and TV return to idle.
- TV idle shows headline, iPad prompt, supplied BAPS QR, and ambient lights.
- TV result fits all verified map coordinates; every available year/place is displayed in two columns without scrolling. A photo spotlight loops through all source records, showing each for 3.5 seconds after its photograph is ready. Year taps jump the spotlight and continue auto-play.
- Staff connection, pause, fit and zoom controls are behind a three-second title hold.

## Evidence and Data

The original 10,475 source-linked BAPS records remain unchanged. Mocks contain sample data; the app computes counts from real records. Some dates have multiple visits in one year. Preserve those locations in the grouped year text and allow choosing each visit. Range-gallery photographs retain their published range note. Missing coordinates are never invented.

## Operating Context

React/Vite, local Express, Vercel API, Upstash shared room storage. Room query parameters pair iPad and TV. QR asset: public/QR-baps-vicharan.svg from the supplied brief. The browser requests Screen Wake Lock where supported. OS Guided Access, browser chrome, display sleep settings and kiosk launch remain device setup steps.
