# Anti-Gravity 3D Scroll Animation & Theme Update

This plan covers integrating a 300-frame scroll-based "Anti-Gravity" animation to serve as a fixed background across the entire *Rugs Creation* website. We will also update the global design system and color palette to a new *Light Ivory / Warm Beige / Deep Charcoal* aesthetic, ensuring sections are semi-transparent so the background animation remains visible.

## User Review Required

> [!IMPORTANT]  
> The new background canvas will play continuously down the entire scroll of the page, meaning the previous pinned hero section behavior will be replaced. Please confirm you are okay with removing the pinning from the hero section to allow the animation to scrub down the entire site.

> [!WARNING]  
> Transparent sections mean text readability depends on the contents of the animation frames. If the frames are too bright or have high contrast behind our text, we may need to adjust the semi-transparent overlays on our sections. We will use a baseline `rgba` overlay to ensure text contrast.

## Proposed Changes

### Global Theme (CSS)
We will update our CSS Design Tokens in `css/styles.css` to the new palette:
- Backgrounds: `#FFF8ED` (Light Ivory) & `#EADCCB` (Warm Beige)
- Text/Accents: `#2F2A26` (Deep Charcoal) & `#CBB49D` (Tan)
- We will replace the existing dark mode palette (`#111` / `#1C1C1C`) with the new light, warm theme. 
- Backgrounds on the `section-light`, `section-cream`, `feature-strip`, `about-strip`, etc., will become semi-transparent (e.g., `rgba(255, 248, 237, 0.85)`) to reveal the canvas behind them.
- Text colors will be updated to Deep Charcoal for legibility on light, warm backgrounds.

#### [MODIFY] css/styles.css
- Rewrite `:root` CSS variables.
- Update `body` background and color.
- Remove solid colors from `.section-light`, `.section-cream`,`.feature-strip`, etc., replacing them with `rgba` versions of the new palette, possibly with `backdrop-filter: blur(4px)`.
- Restyle the Fixed Navbar to use the new colors and transparency.
- Update the fixed Canvas container styles (`z-index: -1`, `position: fixed`, `inset: 0`).

### HTML Structure
We must move the `<canvas>` out of the `.hero` section flow so it can be fixed to the background universally. We will also add a full-page preloader overlay.

#### [MODIFY] index.html
- Extract `<div class="hero-canvas-container">` and move it to immediately inside the `<body>` tag.
- Add `<div id="preloader">` with a loading indicator to block the page until all 300 frames are loaded.
- Adjust classes for better layering if necessary.

### GSAP Animation & Preloading (JS)
The `animation.js` file will be entirely rewritten to handle 300 frames, global scrolling, and a robust preloader.

#### [MODIFY] js/animation.js
- **Assets:** Update path to `/assets/animation/frame_001.jpg` – `frame_300.jpg`. Total frames = 300.
- **Preloader Logic:** Create a loading sequence. Hide the `#preloader` and reveal the content only when all 300 images fire the `onload` event.
- **GSAP Setup:** Remove the `.hero` pin. Set the ScrollTrigger `trigger` to `document.body` and `end` to `"bottom bottom"`. This maps the 300 frames to the *entire* page scroll height.
- **Smooth Scrub:** Set `scrub: 1.5`.
- **Aspect Ratio:** Enhance the `render()` function to maintain an `object-fit: cover` crop that fills the window bounds without distortion.

## Verification Plan
### Automated & Manual Verification
- **Preloading:** Verify page stays hidden behind a loading screen until the console confirms 300 frames have loaded.
- **GSAP Scroll:** Manually test scrolling from top to bottom. Confirm the animation plays forward when scrolling down and reverses when scrolling up, ending exactly at frame 300.
- **Visuals:** Confirm the canvas is fixed (`z-index: -1`) and visible through frosted/semi-transparent UI sections. Check text readability.
