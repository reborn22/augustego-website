# AUGUSTEGO / editorial redesign

The site introduces the artist. «Сила» is the debut single, as confirmed by the artist. Never invent further releases, dates, concerts, press, testimonials or statistics.

## Diagnosis

The earlier version had labels as small as 6–10px, a mostly empty symmetrical masthead, repeated section composition, no distinct visual chapter and contradictory CSS overrides. The first release cover also inherited a 3000px HTML height, now fixed through explicit intrinsic sizing.

## Current design

Dark editorial music journal. Minimal typographic masthead; original gothic wordmark treated as the artist's existing brand mark; Manrope as the sole UI font. Type sizes use the skill's Tailwind scale, with a 12px minimum. Spacing uses the supplied token scale. Flat black and charcoal surfaces; a single muted red accent. Hero wordmark uses the prescribed text gradient.

Sequence: artist masthead → wide visual world → artist statement → discography → clip → six short questions → social links and final listening CTA.

The wide city artwork is a separate visual chapter beneath the minimal masthead, not a portrait card or hero background. The album cover is square. The vertical clip only appears in a dialog after the visitor asks to watch it.

Primary action: «Слушать музыку» in the masthead and closing section. The discography provides the actual track, full playback without registration and links to the supplied release platforms.

Motion: 32px entrance over 800ms through IntersectionObserver, ordered word activation in the artist statement, subtle bounded photo parallax, a transform-based reading indicator, live audio spectrum, weighted hover states, and a full-height mobile menu with 60ms link staggering. All movement uses the prescribed cubic-bezier; reduced-motion support removes movement and the live spectrum.

Player states: play, pause, ended, loading skeleton waveform, failed playback and failed media load. Audio and video never play simultaneously. Closing the video dialog pauses playback and restores keyboard focus.

## Sources

The release and platform links were read from https://band.link/SISl5.
The artist's bio and social links come from the supplied project materials.
Imagegen artwork and exact prompts: artwork/PROMPTS.md.
Manrope and UnifrakturCook licenses are shipped in dist/assets/.

## Verification

JavaScript syntax; local asset references; unique IDs and anchors; no text below 12px; desktop and mobile horizontal overflow; square cover at both viewport sizes; full-track playback and pause; mobile-menu opening and closing; video-dialog opening, playback and pause on closing.

## Publication

GitHub repository: https://github.com/reborn22/augustego-website
GitHub Pages: https://reborn22.github.io/augustego-website/
Publishing is handled by the existing Pages workflow on each push to main.
