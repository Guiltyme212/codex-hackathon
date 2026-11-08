# thing. homepage prototype

Separate route: `/make`. This is a UI prototype for the Naïve × YC Autonomous Companies Hackathon, November 7–8, 2026. Event reference: https://usenaive.ai/hackathon

## Design target

The founder's supplied paper sketch is the primary layout reference: three product videos, an idea input, a preview, and a print action. The existing project's Manrope typography and strong hierarchy carry over. All new styles are isolated in `app/make/make.module.css`.

Working name: **thing.** It can be changed without touching Content Factory.

### Reference lock

- Keep the sketch's video → idea → preview sequence on mobile.
- Use a light workbench canvas with real product media and a tangible 3D object.
- Use bold Manrope for headings and plain UI text. Reserve Newsreader for the small product annotation.
- Tangerine is for making actions and the default filament. Dark green-black is for type and the print action. Filament swatches are product colors, not extra UI accents.
- Videos retain creator attribution. No invented customer counts, testimonials, sales, or printer connection status.
- Rounded surfaces are reserved for media, the editable prompt, and the product preview.

## UI behavior

Three local, silent H.264 video excerpts loop inline. They pause when off screen and respect reduced motion. The preview uses a Three.js model with orbit controls, filament colors, and a local logo upload. Templates select sample geometry and a prompt. The generation button simulates a short preview transition. The print action opens a clearly labeled demo summary.

AI CAD generation, slicing, printer connectivity, ordering, and payments are not connected.

## Media credits

Videos were supplied by the founder, who confirmed rights to use them. Local copies contain no audio and are trimmed/compressed for the homepage.

- `public/make/sandy.mp4`: https://www.tiktok.com/@sandymakes.ca/video/7619079101122383124?lang=en
- `public/make/inventions.mp4`: https://www.tiktok.com/@af_inventions/video/7668982523254410529?lang=en
- `public/make/toylab.mp4`: https://www.tiktok.com/@3dtoylab.official/video/7699322116931357983?lang=en

Poster frames are extracted from the corresponding clips.
