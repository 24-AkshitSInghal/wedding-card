# The Royal Wedding — an illustrated, scroll-driven invitation

A single-page wedding invitation that unfolds like a living Indian miniature painting.
Guests scroll through one continuous palace: the gateway doors swing open, the couple is
revealed beneath a carved arch, and each ceremony appears inside its own arch of the
colonnade — Mehendi, Haldi, Garba, Baraat, Varmala, Hasta Melap — before a closing blessing.

There is no header, menu or footer: just the invitation.

## Make it yours

Everything personal lives in **`src/config/wedding.ts`**: names, families, parents,
the invitation wording, and the list of events.

- Leave anything you don't know yet as `""`. While `showPlaceholders` is `true`, a dimmed
  `[Venue]`-style placeholder shows what is missing. Set it to `false` before sharing and
  empty lines simply disappear.
- Events can be renamed, reordered, added or removed. Each event's `scene` chooses its
  illustrated setting: `mehendi`, `haldi`, `garba`, `sangeet`, `baraat`, `varmala`,
  `hasta-melap`. Any event can use any scene.
- Dates are `"YYYY-MM-DD"` and times are 24-hour `"HH:MM"`. They are formatted for you
  ("26th January, 2027", "7:00 PM onwards").
- **View venue** appears only when an event has a real `mapUrl`.
- **Add to calendar** appears only when an event has a date, a time and a venue.
- **RSVP** appears in the closing only when `rsvp.url` is set (a form link, a `wa.me/…`
  WhatsApp link or a `mailto:` link).
- **Music** appears only when `audio.src` points at a file you have the rights to use
  (put it in `public/audio/`). It starts muted and never autoplays.
- **Link preview.** The page title and the WhatsApp preview text are filled in from the
  names when you build. Set `siteUrl` to the address you host the invitation at, so
  WhatsApp can show the preview picture (`public/og-image.jpg`).

The look of each scene (palette, illustrated layers, depth, how it enters) lives in
`src/config/scenes.ts`.

## Run, build, share

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`dist/` is a static site: upload it to any static host (Netlify, Vercel, Cloudflare Pages,
GitHub Pages) and share the link on WhatsApp.

To preview the reduced-motion version without changing system settings, open the page
with `?reduce-motion` on the end of the address.

## How it works

- **One timeline.** `src/engine/` builds a single GSAP timeline measured in viewport heights
  of scrolling and scrubs it with ScrollTrigger, so every movement follows the guest's
  scroll and reverses when they scroll back.
- **Depth.** The portrait frame is 100 "units" wide and keeps the reference's 9:16 shape.
  Every illustrated layer has a depth from far (−1) to near (1) that sets its stacking order
  and how fast it moves, giving the painting real parallax. Wider screens see the palace
  continue beyond the frame: a colonnade of arches, terraces and gardens.
- **Eight transitions.** Doors swing open and the camera pushes through the gateway; the
  camera cranes down to the terraces; trucks along the colonnade; colour blooms outward;
  the elephant walks the Baraat colour in; garlands drop before the mandap; golden light
  dissolves into Hasta Melap; the last scene lifts away like a page.
- **Living details.** Swaying garlands and lanterns, peacocks turning their heads, the
  elephant's ear and gait, drifting petals and gold dust. All of it pauses off-screen,
  is reduced on low-power devices, and is switched off for reduced motion.
- **Loading.** Only the gateway loads with the page; the other scenes stream in a little
  ahead of the guest.

## Accessibility

The painted scenes are decorative; the full invitation is also present as ordered,
semantic text for screen readers, independent of scroll position. Its links (View venue,
Add to calendar, RSVP) are reachable with the keyboard and appear as a small chip when
focused.

## Artwork

The illustrations in `public/art/` were generated for this invitation with Magnific
(Google Nano Banana 2.1), guided by the reference video's palette, architecture and
miniature-painting style (the video stays in `reference/` and is never published), then
chroma-keyed into transparent layers. They contain no text, watermark or studio branding. Full-resolution masters are kept in
`assets-src/art/`. To regenerate the served sizes after replacing a master, run
`python3 scripts/size-art.py` (needs Pillow).

Fonts: Cinzel, Cormorant Garamond and Pinyon Script (SIL Open Font License), bundled via
Fontsource.
