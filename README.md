# Content Factory — Brand Studio for app founders

[Live demo](https://codex-hackathon-production.up.railway.app/) · [Brand Studio](https://codex-hackathon-production.up.railway.app/workspace) · [Albums](https://codex-hackathon-production.up.railway.app/albums)

Building an app is easier than ever. Getting people to notice it is still hard.

Content Factory turns one app website into an opinionated marketing system: brand identity, audience language, hooks worth testing, and campaigns ready to ship. A one-click Kokoro walkthrough is preloaded for judging.

## 60-second judge walkthrough

1. Leave the gray `kokoromind.com` example untouched and click **Discover app**.
2. Watch the site become an editable Brand Studio with real identity and audience signals.
3. Swipe right to keep a hook and left to pass—the shortlist is saved as campaign context.
4. Click **Build carousel** to create a structured seven-slide draft.
5. Open **Albums** to browse the new draft and two finished campaign examples.

## Current milestone

- Editorial, responsive homepage
- Website or founder-description onboarding
- Live public-website discovery with SSRF protection
- Logo-aware Brand Studio for positioning, audience, proof, voice, and palette
- Live hook generation grounded in discovered brand signals
- Tinder-style selection with mouse, touch, buttons, and keyboard controls
- Kept hooks become real seven-slide carousel drafts
- Albums preserve slide order, visuals, captions, and campaign status
- Responsive, judge-friendly Kokoro demo

## Why the hook comes first

People decide whether to keep watching before they fully understand the product. Content Factory makes that high-leverage decision explicit: founders approve the promise first, then the same approved context shapes every output format.

## Stack

Next.js, React, TypeScript, Tailwind CSS, and self-hosted variable fonts.

## Run locally

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run lint
npm run build
```

## Reflex × Runloop feedback loop

We used [Reflex on Runloop](https://reflex.runloop.ai/) as an independent product-review checkpoint around the core build—not as a runtime dependency. The loop was:

1. Build a vertical slice with Codex.
2. Give Reflex the repository and product goal for a second-pass critique.
3. Feed the strongest usability and prioritization recommendations back into the next Codex pass.
4. Rebuild, verify locally, and deploy automatically through GitHub → Railway.

The next iteration deepens that loop: Reflex reviews every milestone for demo clarity, failure states, accessibility, and mobile regressions, while Codex implements and verifies the selected changes. This keeps the reviewer independent from the implementation agent and turns feedback into an auditable build cycle.

## Next milestone

Add authenticated GPT Image rendering for draft slides, performance learnings, and a publishing calendar—then use Reflex to compare the shipped result against the campaign brief.

## Development workflow

Built with Codex, reviewed through Reflex on Runloop, and deployed automatically from GitHub to Railway.
