# thing. homepage prototype

Separate route: `/make`. This is a UI prototype for the Naïve × YC Autonomous Companies Hackathon, November 7–8, 2026. Event reference: https://usenaive.ai/hackathon

## Design target

The founder's supplied paper sketch is the layout reference: three product videos, an idea input, a preview, and a print action. Content Factory is the visual source: paper canvas, black borders, offset shadows, Manrope headings paired with Newsreader italic, lime actions, and cobalt accents. All new styles are isolated in `app/make/make.module.css`.

Working name: **thing.** It can be changed without touching Content Factory.

### Reference lock

- Keep the sketch's video → idea → preview sequence on mobile.
- Use a light workbench canvas with real product media and a tangible 3D object.
- Use bold Manrope for headings and plain UI text. Newsreader italic carries the second hero line, matching Content Factory's display typography.
- Use Content Factory's lime for making and printing actions, cobalt for the display accent, and black for outlines and text. Tangerine remains a filament color.
- Videos retain creator attribution. No invented customer counts, testimonials, sales, or printer connection status.
- Video frames overlap slightly with the center in front and the outer frames tilted six degrees. Keep captions clear of the overlap. Media, prompt, preview, and controls have square corners and black borders.

## UI behavior

Three local, silent H.264 video excerpts loop inline. They pause when off screen and respect reduced motion. The preview uses a Three.js model with orbit controls, filament colors, and a local logo upload. Templates select sample geometry and a prompt. The generation button simulates a short preview transition. The print action opens a clearly labeled demo summary.

AI CAD generation, slicing, printer connectivity, ordering, and payments are not connected.

## Media credits

Videos were supplied by the founder, who confirmed rights to use them. Local copies contain no audio and are trimmed/compressed for the homepage.

- `public/make/sandy.mp4`: https://www.tiktok.com/@sandymakes.ca/video/7619079101122383124?lang=en
- `public/make/inventions.mp4`: https://www.tiktok.com/@af_inventions/video/7668982523254410529?lang=en
- `public/make/toylab.mp4`: https://www.tiktok.com/@3dtoylab.official/video/7699322116931357983?lang=en

Poster frames are extracted from the corresponding clips.
