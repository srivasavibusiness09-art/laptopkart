# Plan: Dynamic, Scroll-Driven 3D Website

## Goal
Turn the current site into a smooth, scrollable 3D experience with narrative sections, responsive layout, and high performance.

## Assumptions
- The site is a standard web stack (HTML/CSS/JS or a framework like React).
- 3D assets will be provided or created as part of the work.

## Key Decisions (confirm early)
- 3D engine: **Three.js** (recommended) or **Babylon.js**.
- Framework integration: vanilla JS, or React + **React Three Fiber**.
- Scroll orchestration: **GSAP ScrollTrigger** or custom scroll-to-timeline mapping.
- Asset pipeline: GLTF/GLB + DRACO compression, texture compression (KTX2).

## 3D Media: Video vs Image (what to use, when)
**Recommended default:** Use **images** (static textures) for most sections, and reserve **short videos** for 1–2 hero moments.

**When images are better**
- Best performance and fastest load.
- Perfect for product shots, backgrounds, and environment maps.
- Easier to optimize (WebP/AVIF, smaller sizes).

**When video is better**
- Use for brief, dramatic sequences (3–8 seconds) or looping highlights.
- Good for animated textures or background mood.
- Requires more bandwidth and decoding; avoid for long scroll sequences.

### How to create the media
**Images**
1. Model in Blender (or use existing GLB assets).
2. Light and render at 2K–4K; export as PNG.
3. Convert to WebP/AVIF for the web.

**Videos**
1. Animate in Blender (camera or object moves).
2. Render to image sequence, then encode:
   - MP4 (H.264) for compatibility.
   - WebM (VP9) for better compression.
3. Keep clips short and loopable; target < 8–12 MB each.

**Suitable choice for this project**
- Use **images** for most scroll sections and product emphasis.
- Use **1–2 short videos** only if you need a cinematic moment (e.g., landing hero).

## Phases

### 1) Discovery & Structure
- Audit current pages, sections, and content priorities.
- Define a scroll narrative (sections → 3D states).
- Identify which content stays as HTML and what moves into 3D.

### 2) Foundation Setup
- Add 3D render loop and scene scaffold.
- Add a scroll manager that maps scroll position to an animation timeline.
- Create a layout shell with pinned sections and content overlays.

### 3) 3D Scene Build
- Build/import models, lighting, materials, and environment.
- Establish camera path and key scene states.
- Add interaction hooks (hover, focus, simple parallax).

### 4) Scroll Choreography
- Map each section to timeline segments (camera moves, object transforms).
- Smooth scrolling with inertia (optional) and precise progress syncing.
- Ensure DOM content and 3D states stay in lockstep.

### 5) Performance & Responsiveness
- Optimize draw calls, textures, and model complexity (LOD/instancing).
- Throttle pixel ratio on low-end devices.
- Lazy-load models and sections; use code splitting.
- Add reduced-motion mode for accessibility.

### 6) QA & Launch
- Cross-browser and mobile testing.
- Measure FPS, memory, and input latency.
- Fix regressions and deploy.

## Deliverables
- Scroll-driven 3D scene integrated with existing content.
- Responsive layout with accessible fallbacks.
- Optimized assets and performance tuning.
