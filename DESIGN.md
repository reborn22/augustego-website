# AUGUSTEGO / ECHO

Artist website. Primary action: listen to the music. «Сила» is the debut single, confirmed by the artist. Do not invent releases, shows, press, statistics or merchandise.

## Direction

The user selected a new motion direction after reviewing live references. The current site combines a minimal artist masthead, original typographic echoes and a continuous sequence of full-screen chapters. Public reference code was studied, not copied or installed.

References: research/REFERENCES-2026-10-29.md. A Drift informed typographic trails; The Drive informed continuity; Carpetman informed artist-first structure.

Existing gothic artist lettering is treated as a brand graphic. Manrope is the sole UI typeface. The oversized canvas wordmark and red print chapter are deliberate interpretations of the user's selected references, overriding generic skill defaults for heading width/type scale and dark background palette. Flat black, off-white and red; no gradient backgrounds. A gradient is used only in the hero's letter ink.

## Sequence

Minimal floating navigation → full-viewport artist name and listening action → red typographic manifesto → short artist introduction → debut release and full player → visual chapter with a real excerpt of the supplied clip → optional liner notes → contact and listening action.

The artist rejected the generated city panorama and chrome microphone. Both were removed from dist and from all page/share metadata. The manifesto contains no illustration. The visual chapter uses a 3.5-second silent excerpt from the supplied final clip, not a newly generated image. Original discarded generation records remain in artwork for provenance.

## Motion

motion.js implements original Canvas 2D lettering. Seven outline echoes follow bounded pointer input and scroll; requestAnimationFrame stops once movement settles and while the document is hidden. Canvas pixel ratio is capped at 2; fonts load before replacing the semantic fallback heading. ResizeObserver handles responsive layout. No new runtime dependencies.

The manifesto's print and black shutter move on scroll. Words activate individually. Scroll work is throttled through requestAnimationFrame. Native IntersectionObserver handles reveals and the muted clip excerpt; the excerpt pauses offscreen, with reduced motion, in hidden tabs and during the full clip dialog. Reduced motion also removes the sticky scroll interval, pointer echoes and major transforms.

Player and video never play sound simultaneously. Closing the dialog pauses the full clip and restores focus. Header sound bars reflect actual audio playback. Full-height mobile menu supports Escape and focus wrapping; header links also close an open menu. Current navigation follows the actual section position.

## Assets

- sila-cover.jpg: supplied cover, square intrinsic dimensions.
- sila.mp3: supplied full track, 126.135 seconds.
- sila-film.mp4: supplied final vertical clip.
- sila-excerpt.mp4 / .jpg: extracted using ffmpeg from sila-film.mp4 at 16.7 seconds (3.5-second loop) / 17.5 seconds (poster). No additional image generation in this version.
- og-augustego.jpg: code-rendered brand lettering using the supplied fonts; share image introduces the artist rather than a single release.
- Local font files and their licenses retained.

## Checks

JavaScript syntax for app.js and motion.js; all 43 HTML references; 26 unique IDs and hash targets; no references to discarded images; desktop and mobile overflow; square cover; audio playback and pause; audio/video exclusivity and pause on closing; mobile menu opening/closing; browser error log. The reduced-motion CSS and JS paths were checked in source; an OS reduced-motion setting was not emulated in the browser.

## Publication

GitHub: https://github.com/reborn22/augustego-website
Pages: https://reborn22.github.io/augustego-website/
Existing workflow publishes dist on main pushes and now validates both JS files.
