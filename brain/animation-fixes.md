# Animation Fixes — MOTIF (wemotif.com)

Created 2026-10-18. Status: **ANIM-1 done (2026-10-18):** leak/cleanup fixes G6, G11, G12, G25, G28, S1, S7, S13, S16, S19, S21, S23, S24, S25, S28, P1, P7, plus reduced motion for the decorative loops (see `log.md`). Everything else is still open; 🟡/🔴 items need approval, and the banner/hero animations stay as they are.

The yardstick is the Emil Kowalski design-engineering rules (`.claude/skills/emil-design-eng`):
- Animate only `transform` and `opacity`.
- Use ease-out for things entering and leaving, and keep UI interactions under 300 ms.
- Never leave loops running that nothing can see.
- Respect reduced motion.
- Every animation needs a reason to exist.

I wrote this from four audits: the global system, shared components, page sections, and CSS. I re-read the most important claims in the code myself (marked ✔).

---

## 0. How to read this

**Change type.** This decides how much approval an item needs, because `rules.md` says "zero visible change" for the optimisation pass.

| Type | Meaning | Approval |
|---|---|---|
| 🟢 **Invisible** | Leaks, cleanup, cheaper ways to draw the same motion. It looks the same and runs smoother. | Approve by ID |
| 🟡 **Feel** | Same animation, but different timing or easing, or it plays once instead of replaying. You can see the difference. | Approve by ID, then review side-by-side |
| 🔴 **Behaviour** | Changes what happens: intro length or skip, page-transition flow, removing an effect. | Needs your explicit decision (§3) |

**Severity:** **H** = visible jank, a leak or a layout jump. **M** = the feel is off. **L** = polish.

---

## 1. The biggest problems (fix these first)

| # | Problem | Where | Effect on the user |
|---|---|---|---|
| 1 | Every navigation waits for a ~3 s logo draw before `router.push` ✔ | `transitions/PageTransition.tsx:169-217` | Clicking a link feels broken or slow |
| 2 | The first-visit intro takes ~16 s and can't be skipped ✔ | `loading-animation.tsx:133-173` | First-time visitors are stuck behind it; the bounce risk is high |
| 3 | Every `<section>` is permanently GPU-promoted (`will-change` + `translateZ(0)`) | `globals.css:306-309`, `AnimationWrapper.tsx:72-77` | Scrolling is heavier, memory use climbs on mobile, and it breaks `position:fixed` pins, which is why pages need the `pinReparent` hacks |
| 4 | Loops that never stop: cursor rAF ✔, image-marquee ticker ✔, explosion rAF, loader timelines, brand-logo cycle | see §2 | Frame budget gets eaten more and more after each route change |
| 5 | Layout properties are animated: `width`, `height`, `top`, `left`, `border-radius` on scrub or infinite loops | FullMediaWidthAnim, XCards ✔, CurveChart bars, hero capsules, CSS blobs | The page reflows every frame, so scroll stutters |
| 6 | Tailwind classes that never compile, so the intended motion or style silently never happens | TopBar, AppearanceCards easing, Accordion, TitleImgBanner widths, `animate-fadeInUp` | The scrolled navbar style is missing; the cards use the wrong easing |
| 7 | No `prefers-reduced-motion` anywhere (only in the blog) | whole site | Accessibility gap; motion-sensitive users get the full show |

---

## 2. Findings by area

### 2.1 Global motion system

| ID | Sev | Type | Where | Before | After | Why |
|---|---|---|---|---|---|---|
| G1 | H | 🔴 | `PageTransition.tsx:169-217` ✔ | Block wipe 0.78 s, then logo stroke 2 s, then fill 1 s, then fade; `router.push` only fires in `onComplete` (~3 s) | `router.prefetch` on click; push as soon as the blocks cover (~0.45 s); the logo draws only while the route is loading; total ≤ 1 s | The user is waiting on decoration. Navigation should feel instant |
| G2 | H | 🟢 | `PageTransition.tsx:117-162` | Effect deps include `onAnchorClick`, which changes when loading finishes, so blocks are rebuilt and the reveal wipe replays | Block setup on mount only; reveal only while `isTransitioning`; the loading flag kept in a ref | Removes a full-screen colour flash right after the intro |
| G3 | M | 🟢 | `PageTransition.tsx:149-152` | Click handlers attached only to links present at mount | One delegated `document` click listener with `closest('a[href^="/"]')` | Links rendered later (menu, CMS) currently skip the transition |
| G4 | M | 🟢 | `PageTransition.tsx:165` vs `globals.css:723,747` | Inline `pointer-events:auto` loses to CSS `!important none` | Toggle a class without `!important` | Clicks pass through mid-transition and start a second navigation |
| G5 | H | 🔴 | `loading-animation.tsx:133-173` ✔ | 4 texts × 3.8 s + 1 s ≈ 16 s, scroll locked, no skip | ~6–8 s total, a **Skip** button plus click/Esc/scroll to skip, skipped under reduced motion | Rare animations can delight, but never at the cost of the visitor's time |
| G6 | H | 🟢 | `loading-animation.tsx:196-241` | `repeat:-1` tween inside a timeline, so later tweens never play; timelines never killed | Infinite spin as its own tween; everything in `gsap.context` and reverted on unmount | A leak, plus a broken sequence |
| G7 | H | 🟢 | `loading-animation.tsx:210-223` | Tweens `top`/`left` in % | `xPercent`/`yPercent` | Layout to transform |
| G8 | M | 🟡 | `loading-animation.tsx:163` | Exit `power4.in`, `rotateX:"+=2160"` in 0.4 s | `power3.out`, ≈180–360° | ease-in feels sluggish; 2160° strobes |
| G9 | M | 🟢 | `loading-animation.tsx:304-316` | framer-motion `blur(10px)` on large text per line | opacity + `y`, blur ≤ 4 px | Large blur repaints heavily |
| G10 | L | 🟢 | `loading-animation.tsx:118-123, 62, 176, 277-287` | Unbounded 16 s timer, unstable callbacks in deps, 6 × N cube images with `priority` | Clear timers, memoise callbacks, no `priority` on cube images | The cube images compete with the real page's LCP |
| G11 | H | 🟢 | `cursor/CursorDot.tsx:23-32` ✔ | Recursive `requestAnimationFrame`, never cancelled | `gsap.quickTo(dot,"x"/"y",{duration:0.15})` or `gsap.ticker.add/remove` | Leaks and stacks on every remount; the lerp also depends on frame rate (2× speed at 120 Hz) |
| G12 | H | 🟢 | `cursor/CursorLabel.tsx:35-59` | 3 new `gsap.to` per mousemove, no overwrite | `quickTo` for x/y; glass and text tweens only when the label changes | Hundreds of tweens per second |
| G13 | H | 🟢 | `CursorLabel.module.css:23,35` | `transition: all 0.2s` on elements GSAP also tweens | Remove the CSS transitions | CSS and GSAP fight, causing lag |
| G14 | M | 🟢 | `CursorLabel.tsx:30, 63-71` | `setLabel` on every move; scroll handler passes a fake event, so the label clears on scroll | Update only on change; on scroll use `elementFromPoint` (rAF-throttled, passive) | Re-renders, and the label flickers off while scrolling |
| G15 | M | 🟡 | `CursorLabel.tsx:51,58` | Exit ease `power2.in` | `power2.out`, exit ≈ 0.15 s | Never ease-in for UI |
| G16 | L | 🟢 | `AnimationWrapper.tsx:213`, `use-mobile.ts` | Cursor gated by width (<768) | Gate on `(hover:hover) and (pointer:fine)` | Touch tablets currently run the cursor loop |
| G17 | H | 🟢 | `globals.css:306-309` + `AnimationWrapper.tsx:72-77` | `section{will-change:transform,opacity;transform:translateZ(0)}` on every section | Remove both; `will-change` only during a tween | Permanent layers; breaks fixed pins (root cause of `pinReparent` jitter) |
| G18 | M | 🟡 | `AnimationWrapper.tsx:70-97` | Scrubbed fade/translate on every `section` (nested ones too), built once, not per route, reverses on scroll-up | Opt-in `[data-reveal]`, `once:true`, no scrub, rebuilt per route | Sections half-fade while reading; new pages get no reveal; stale triggers |
| G19 | M | 🟡 | `AnimationWrapper.tsx:58-64` | `smooth:1.2, smoothTouch:0.05, effects:true` | `smooth:0.8–1`, `smoothTouch:false`, `effects` only if `data-speed` is used, `smooth:0` under reduced motion | 1.2 feels floaty; native touch scroll is smoother |
| G20 | M | 🟢 | `AnimationWrapper.tsx:140-153` | `ScrollTrigger.refresh()` 10 ms after route change, repeated across flags | One refresh after the reveal, plus `document.fonts.ready` / image load (debounced) | Trigger positions are stale; refreshes are duplicated |
| G21 | H | 🔴 | `AnimationWrapper.tsx:194`, `PageTransition.tsx:226` | `return null` until mounted, so no server HTML | Always render children; gate only the overlays and cursor | Content flashes in. (Also the open blog/SEO item; it touches every page) |
| G22 | L | 🟢 | `globals.css:82,139` | `scroll-behavior:smooth` alongside ScrollSmoother | Remove it | Double smoothing; jumps on programmatic scroll |
| G23 | L | 🟢 | `globals.css:622-624` | `html,body{height:100%}`, `#smooth-wrapper{overflow:hidden}`, dead `#smooth-content` rule | Remove; let ScrollSmoother manage them | Possible double scrollbar or clipped height before init |
| G24 | M | 🟡 | `lib/gsap.tsx:8-11` | Global `gsap.defaults({duration:0.8})`, applied only where the module is imported (order-dependent) | `duration:0.5`, imported once at the root; register ScrollTrigger/SplitText/Smoother there | UI tweens default too slow; behaviour depends on import order |
| G25 | H | 🟢 | `Navbar/TopBar.tsx:108-144` | Every menu open runs `new SplitText` (never reverted) and adds hover listeners (never removed) | `gsap.context` per open, `ctx.revert()` on close, named listeners removed | DOM nests deeper and hover tweens multiply on each open |
| G26 | H | 🟡 | `TopBar.tsx:234` | Full-screen menu `transition-all duration-1000 ease-in-out` + `backdrop-blur-[25px]` | `transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]`, blur ≤ 12px or a solid 0.9-alpha background | A 1 s blur slide janks; menus should open in ~300 ms |
| G27 | M | 🟡 | `TopBar.tsx:76-125` | Menu stagger: delay 0.5, items at "1", duration 1, so the last item lands at ~2.3 s | Start ~0.15 s, duration 0.5, stagger 0.04, `power3.out` | Menus are seen often; keep them fast |
| G28 | M | 🟢 | `TopBar.tsx:32-57` | Non-passive scroll listener; an empty tween and `setState` on every scroll event | `ScrollTrigger.create({start:1,onToggle})` | Main-thread work per scroll event |
| G29 | M | 🟢 | `TopBar.tsx:168` | Brand mark animates `width 0↔60px` over 700 ms; `opacity-[${x}]` never compiles | Fixed width, animate `clip-path`/`scaleX` + opacity over 250 ms | Layout animation in the navbar |
| G30 | M | 🟢 | `TopBar.tsx:158-160, 235` | `bg-[rgba(46, 39, 39, 0.45]` etc. (spaces, missing `)`) never compile | `bg-[rgba(46,39,39,0.45)] shadow-[0_4px_30px_rgba(0,0,0,0.1)]`, `transition-[background-color,backdrop-filter]` | The intended scrolled-navbar style never appears. ⚠ Fixing this **changes how the navbar looks** (it's what was designed): treat as 🟡 |
| G31 | L | 🟢 | `FloatingSealEntrance.tsx:15,36-37` ✔ | `testOverride = true` left in; `transition-all duration-700`; clickable while hidden | Remove the override; `transition-[opacity,transform] duration-300`; `pointer-events-none` when hidden | A dev flag shipped to production |

### 2.2 Shared components

| ID | Sev | Type | Where | Before | After | Why |
|---|---|---|---|---|---|---|
| S1 | H | 🟢 | `lib_comp/GsapImageMarquee.tsx:41,111-126` ✔ | `gsap.ticker.add(anon)` never removed; anonymous resize listener; `offsetX -= speed` per frame | Named ticker fn removed in cleanup; `deltaRatio()`; `quickSetter`; pause offscreen via `onToggle` | Runs forever after leaving the page; 2× speed at 120 Hz |
| S2 | H | 🟢 | `GsapImageMarquee.tsx:46-75` | Draggable writes `x` while the ticker overwrites it; shadowed velocity locals; `inertia` without the plugin | Pause the ticker while dragging and feed the drag delta into the offset | Dragging fights the loop |
| S3 | H | 🟢 | `lib_comp/FullMediaWidthAnim.tsx:43-47` (used by all 9 landing pages + about Vimeo) | Scrubbed `width: startWidth→100%` | `clipPath: inset(0 7.5% round 16px) → inset(0 0%)` (or `scale` 0.85→1) | Reflows a full-bleed image or iframe every scroll frame, and page height drifts under `lg` |
| S4 | H | 🟢 | `lib_comp/FlyingText.tsx:111-129` + `Quote.tsx:51-66` | Both animate `.anm-quote-author` | Animate it in one place | Two scrubbed tweens fight, causing jitter |
| S5 | M | 🟢 | `FlyingText.tsx:39,48-86` | One ScrollTrigger per word, `scale:5`, `will-change` per span; tween with its own trigger added to a timeline | One timeline + stagger + one trigger; scale ≈ 1.5–2; no per-span `will-change` | Dozens of triggers and layers |
| S6 | M | 🟢 | `Recommandations/Quote.tsx:31,38,75` | Scrubbed `filter: drop-shadow`; `transition-all will-change-[filter]` on the block | Glow on a pseudo-element with an opacity tween; remove the classes | Filter repaint every frame |
| S7 | H | 🟢 | `marqueeNav/MarqueeNavigation.tsx:43-97`, `ui/MarqueeInPage.tsx:45-129` (duplicates) | `items` re-created each render, so the loop is rebuilt; shared `id:"marquee-fade"` kills other instances | `useMemo` items / `useGSAP`; no ids; context-scoped | The marquee jumps back to start on any re-render |
| S8 | M | 🟡 | `MarqueeInPage.tsx:105-119` | Leaving hides instantly; re-entering fades back in over 1.2 s | `once:true`, ~0.6 s | Repeating entrance |
| S9 | H | 🟢 | `marqueeNav/horizontalLoop.ts:15-59` | Widths measured before `font-clash` loads; never re-measured | Build after `document.fonts.ready`; use GSAP's `horizontalLoop` with `responsive`; rebuild on resize | Gap or jump at the loop seam, worse after resize |
| S10 | M | 🟢 | `SvgImagePath.tsx:129-153,215-236` | `useAnimationFrame` forever; 3 string `useTransform`s per item; `zIndex` changes every frame | Gate with `useInView`; numeric progress; step zIndex only on order change | Offscreen work and stacking repaint |
| S11 | H | 🟢 | `shared/TitleImgBanner.tsx:69-100`, `TitleImgBannerJB.tsx:74-105` ✔, `faqs/~com/TitleImgBanner.tsx` | `images.forEach(()=>tl.fromTo(images,…))` adds the tween N times; `width:0→Xvw` | One `fromTo(images,{clipPath…},{stagger:0.1})` | Capsules grow N times and reflow the headline |
| S12 | M | 🟢 | `TitleImgBanner*.tsx:117-120 / 152-155`, `BannerJB.tsx:52` | Intro re-runs when the load or transition flags flip | Run once when `loaded && transitionDone` | Double-play or flash |
| S13 | H | 🟢 | `shared/TitleMixImg.tsx:51` ✔ | `markers: true` | Remove | Debug markers on `/what-we-do` |
| S14 | M | 🟡 | `TitleMixImg.tsx:90-102` | `from(width:0)`, durations 1.5 / 1 s, stagger 0.7, `restart` | clip-path reveal, 0.8 s, stagger 0.12, `once:true` | Slow hero, layout tween |
| S15 | M | 🟡 | `BannerJB.tsx:34-47` | All words together after a 1 s delay | `stagger:0.03`, delay ≈ 0.3 | Words arrive as a block; a slow start |
| S16 | H | 🟢 | `AnimatedLines.tsx:26-50` | `useEffect`, no cleanup; `duration:4.5` | `useGSAP`; ~1–1.2 s | Leak + a divider that takes forever |
| S17 | M | 🟢 | `AnimatedText.tsx:36-66` | Async `setTimeout` loop not cleared; `gsap.from` in `useEffect` (flash) | Abort flag + clear timers; `useGSAP` | setState after unmount; flash before hide |
| S18 | M | 🟢 | `shared/MobileHero*.tsx` + ~12 `HeroMobile.tsx` copies | `new SplitType` never reverted; 1–1.2 s durations, stagger 0.2, `reset` on scroll back | GSAP `SplitText` (context-aware) or `revert()` in cleanup; ~0.7 s, `once:true` | Double-wrapped words; slow headline |
| S19 | H | 🟢 | `shared/MadeToBreak.tsx:52-61,125-167` | `querySelector` + new 1 s tween per mousemove; `setState` per scroll frame; return tween without overwrite | `gsap.quickTo(video,"x")`; setState only on threshold cross; `overwrite:"auto"` | Per-event tween churn and re-renders |
| S20 | L | 🟢 | `MadeToBreak.tsx:49,70,110` | `pinReparent:true`; scrubbed `borderRadius` | Drop `pinReparent` (after G17); clip-path `inset(… round …)` | One-frame flash; paint per frame |
| S21 | H | 🟢 | `shared/ExplosionContainer.tsx:59-131` | rAF + `setTimeout` never cancelled; fixed step per frame; 15 images created at explosion time | Cancel in cleanup; `dt` scaling; preload with `img.decode()` on mount | Leak; first frames stutter |
| S22 | M | 🟢 | `shared/Accordion.tsx:63-122` | CSS `height` transition from a stale `scrollHeight`; `duration-[${x}ms]` never compiles; scrubbed entrance leaves items half-transparent | `grid-template-rows:0fr→1fr` transition (≤250 ms ease-out); entrance `once:true` ~0.6 s; `<button>` with `:active` | Layout animation; unreadable mid-scroll |
| S23 | H | 🟢 | `shared/Slider.tsx:76-80,113` | `new SplitText` on every slide change, never reverted; `cssMode` + loop | Split each slide once; context cleanup; `cssMode:false` | DOM nests deeper each slide; seam jump |
| S24 | M | 🟢 | `footer/Footer.tsx:111-131` | Hover listeners never removed; per-char colour tweens without overwrite; can stick on touch | CSS `transition: color` with per-char delay inside `@media(hover:hover)` | Stacking tweens; stuck colour on mobile |
| S25 | H | 🟢 | `cards/Brands.tsx:64-146` | Cycle loop and scrub trigger animate the same `.brand_box`; `masterTl` never killed; runs offscreen | Cycle on an inner wrapper; keep the timeline in a ref, kill it on unmount, pause offscreen | Logos flicker on scroll back; leak |
| S26 | H | 🟢 | `cards/AccordianSection.tsx:29-57` | GSAP `pin` on an element that is already CSS `sticky` | Delete the GSAP pin, keep sticky | Double offset / jump |
| S27 | H | 🟢 | `ui/textAnimation.tsx:103-116` (used by many sections) | `restart none none reset` + `splitText.revert()` on complete | `once:true` + revert, `power3.out`, `start:"top 85%"`, split after `document.fonts.ready` | Second entry snaps or doesn't animate; wrong line breaks |
| S28 | H | 🟢 | `extrasc/StatHighlight.tsx:29-63` | No cleanup | `useGSAP` | Trigger leak across routes |
| S29 | M | 🟢 | `extrasc/SectionInnerHero.tsx:34-42`, `ServiceGid.tsx:35-36` | Initial state set in `useEffect` (after paint) | `useGSAP` (layout effect) / CSS initial state | Visible flash before the animation |
| S30 | L | 🟡 | `ui/button.tsx`, `Slider.tsx:145-166`, `SectionInnerHero.tsx:111-118` | No `:active` feedback | `active:scale-[0.97] transition-transform duration-150` | Buttons must feel pressed |

### 2.3 Page sections

| ID | Sev | Type | Where | Before | After | Why |
|---|---|---|---|---|---|---|
| P1 | H | 🟢 | `AppearanceCards.tsx` × 12 copies (Group A) + `~comp/BrandProfile.tsx:66-128` | Timeline in `useEffect`, no cleanup | `useGSAP({scope, dependencies:[isWindow]})` | Trigger leak on every route change |
| P2 | H | 🔴 | AppearanceCards `isWindow` placeholder (e.g. fashion 181-183), BrandProfile 152-154 | Server renders a 435 px placeholder, swapped for an `h-screen` section after hydration | Render the real section on the server; `ScrollTrigger.refresh()` after mount | Layout jump; every trigger below is stale |
| P3 | M | 🟡 | AppearanceCards ~117-123, BrandProfile 89-95 | Cards `x:"100vw"`, 3 s (2 s on why/home), `power2.inOut`, stagger 0.01, `restart` | `x:"30vw"`, 1 s, `power3.out`, stagger 0.08, `once:true` | A 3 s ease-in entrance feels sluggish; no real stagger |
| P4 | L | 🟢 | AppearanceCards ~124-155, BrandProfile 96-103 | `.from()` on commented-out markup | Delete | ~2 s of empty timeline + GSAP warnings |
| P5 | M | 🟢 | AppearanceCards ×12, BrandProfile 191 | `ease-[cubic-bezier(0.165, 0.84, 0.44, 1)]` (spaces, never compiles); `hover:rounded transition-all` | `ease-[cubic-bezier(0.165,0.84,0.44,1)]`; `transition-[border-radius] duration-300`, hover-gated | The designed easing never applied. ⚠ the hover feel changes slightly: 🟡 |
| P6 | M | 🟢 | `globals.css:400-499` (`.card_background` blobs on AppearanceCards) | Infinite 20 s / 30 s `border-radius` keyframes on 50 px-blurred layers | Animate `transform` only on a fixed blob; pause offscreen | Repaints a big blurred layer every frame, forever |
| P7 | H | 🟢 | `beauty-…/~com/AppearanceCards.tsx:6` ✔ | `import { describe } from "node:test"` | Delete | A Node builtin in a client bundle |
| P8 | M | 🟡 | Landing `HeroMobile.tsx` × 9 (Group B) | Paragraph split into words, stagger 0.05, delay 0.2, duration 1, so the last word lands at ~3 s; not gated on load | Split by lines, stagger 0.08 (~0.8 s); gate on `loaded && transitionDone`; revert SplitType; only create on `max-width:639px` | Readable sooner; no hidden replay |
| P9 | M | 🟢 | 9 landing `page-client.tsx` (Group C) | SplitText effect on `refTextbox`, which is never attached; whole page `"use client"` | Delete the dead effect and imports | Dead code; the timeline would end dimmed anyway |
| P10 | H | 🟢 | `~comp/HeroMobile2.tsx:42-49` ✔ | `tl.from(words,{y:60, opacity:1})` with no mask | `opacity:0` (or `overflow-hidden` + `yPercent:100`) | Words are visible, snap down, then slide up |
| P11 | M | 🟢 | `HeroMobile2.tsx:126-181` | Capsule `width:0`; an infinite loop tweens the circle **width** every 1.8 s; width measured once | clip-path / `scaleX`; pause offscreen; re-measure on resize | Continuous layout on the hero |
| P12 | M | 🟢 | `HeroMobile2.tsx:188` | Deps on two flags, so the intro replays; SplitType revert in `onComplete` may never run | Single `ready` boolean; revert in cleanup | Double play, double-wrapped words |
| P13 | H | 🟢 | `~comp/AsSeenOn.tsx:62` ✔ | `setDirection()` in ScrollTrigger `onUpdate` re-renders `react-fast-marquee`, so the CSS animation restarts | GSAP `xPercent` loop; tween `timeScale` to ±1 on direction change | Logos jump on every scroll-direction change |
| P14 | H | 🟢 | `~comp/WorkMerger.tsx:70-93` ✔, `about/page-client.tsx:216-227` ✔, `CurveChartAnimation.tsx` | `pinType:"fixed", pinReparent:true` inside ScrollSmoother | Remove both (after G17); ScrollSmoother's transform pins | Jitter or jump at pin start/end |
| P15 | M | 🟢 | `WorkMerger.tsx:57-130`, `about/page-client.tsx:210` | SplitText `chars,words,lines` before fonts load; never re-split | `SplitText.create(…,{autoSplit:true,onSplit})` or after `document.fonts.ready` | Wrong line breaks after font swap or rotation |
| P16 | M | 🟡 | `WorkMerger.tsx:86-98` | Card pin with no `end`, so three cards flick by in ~300 px | `end:"+=150%"` | Too fast to read |
| P17 | M | 🟡 | `~comp/Driving.tsx:59-84` | Scrubbed entrance over `+=1200`, so cards sit half-transparent and tilted | Toggle tween `start:"top 75%"`, `once:true`, stagger 0.12, 0.8 s | Content shouldn't depend on scroll position |
| P18 | M | 🟢 | `about/page-client.tsx:231-261` | `.from(op 0.2)` and `.to(op 1)` at the same position, then `.to(0.2)`, so the heading ends at 20% | One `fromTo(chars,{opacity:0.2},{opacity:1,stagger:0.05,ease:"none"})` | A bug: the text ends up dim |
| P19 | H | 🟢 | `what-we-do/~com/XCards.tsx:123-139` ✔ | Scrubbed `top` per card; raw `transform` string with non-uniform `scaleX` | `y`; `xPercent:-50, scale` (uniform) | Layout per frame; squashed text |
| P20 | H | 🟢 | `XCards.tsx:247-251` | `backdrop-blur-[60px]` + `willChange: top, filter` on stacked animated cards | Blur ≤ 12 px (or pre-blurred background); `will-change` transform/opacity only during the tween | A 60 px backdrop blur recomputed every frame |
| P21 | M | 🟢 | `XCards.tsx:104-118` | `totalHeight` measured once before images load | `end:()=>…` + `invalidateOnRefresh:true` | Wrong pin length |
| P22 | M | 🟡 | `what-we-do/~com/Perspective.tsx:102,141-156` | `delay:1, duration:1.5`, `restart` (blank for 1 s on every re-entry); image `width` tween | `delay:0`, 0.9 s, `once:true`; clip-path | Slow and repetitive; layout |
| P23 | L | 🟢 | `what-we-do/~com/Banner.tsx:39-68` | `useGSAP` on a never-attached ref | Delete | Dead code |
| P24 | H | 🟢 | `the-motif-process/~com/CurveChartAnimation.tsx:80-127` | New `drawSVG` tween every scroll tick; scrubbed bar `height` | Tween only on index change, `overwrite:"auto"`; `scaleY` with origin bottom | Stuttering highlight; layout per frame |
| P25 | M | 🟢 | `CurveChartAnimation.tsx:71-76,295,304` | `start:"bottom bottom"` cuts the top 20vh off; mask points to a commented-out def; a literal `"false"` class | `start:"top top"`; remove the mask attribute; fix the class | Heading cut off; highlight invisible in Firefox/Safari |
| P26 | H | 🔴 | `culture/~comp/DraggableImageGallery.tsx:12-16,47,68,89` | Images placed up to 70vw + 400px (outside the bounds) so the first press snaps; `touchAction:none` on large images blocks page scroll on phones | Positions as % of free space; `clamp()` sizes; on `pointer:coarse`, disable drag or allow native vertical scroll | Jump on first drag; mobile users can't scroll past the gallery |
| P27 | M | 🟢 | `DraggableImageGallery.tsx:48,51` | `zIndex:9999` on press (all end at 9999); untuned inertia | Rely on `zIndexBoost`; `inertia:{resistance:300}` | Broken stacking; floaty throws |
| P28 | L | 🟢 | `~comp/TheCommitment.tsx:84`, `TheApproach.tsx:71`, `FloatingContactBadge.tsx:14` | `animate-spin_slow` forever | `motion-reduce:animate-none` | Reduced motion |

### 2.4 CSS and Tailwind

| ID | Sev | Type | Where | Before | After | Why |
|---|---|---|---|---|---|---|
| C1 | M | 🟢 | `fluid_style.css:141-213` | Infinite `stretchO` / `stretchOFContainer` keyframes animating `width` (classes unused in TSX) | Delete (dead) | Layout keyframes; dead code |
| C2 | M | 🟢 | `fluid_style.css:24-67` | `hero_text_img_ANI` animates `background-image` across 4 webp files; `hero_img_index_ani` references a missing keyframe | 4 stacked layers cross-faded by opacity, images preloaded; delete the dead class | Image swap repaints and flashes on late decode |
| C3 | M | 🟡 | `tailwind.config.ts:44-62` | `slide*` keyframes `translateX(-100%)` on non-duplicated content; never paused offscreen | Duplicate the track, animate to -50%; `motion-reduce:animate-none`; pause offscreen | Seam gap/jump (`Slide_Branding` is unused; fix the keyframes or delete) |
| C4 | M | 🟢 | `styles/_curve_chart.scss:67,82,92,103,208`, `globals.css:589` | `transition: all 350ms` / `all 0.3s` | List properties: `opacity, transform, visibility` | Accidentally animates layout properties |
| C5 | L | 🟢 | `globals.css:194-203` | `#image-container img { transition: transform .3s, width .3s }` | Drop `width` | Layout transition |
| C6 | L | 🟢 | `globals.css:777-781`, `FlyingText.tsx:39` | `.char { will-change: transform }` on every split character | Set during the tween, then clear | Hundreds of layers |
| C7 | M | 🟢 | `ContactForm.tsx:464`, `~comp/TheCommitment.tsx:48` | `animate-fadeInUp` / `animate-fade-in`, which are not defined | `animate-in fade-in slide-in-from-bottom-2` (tailwindcss-animate) or add keyframes | Intended animations never run |
| C8 | L | 🟢 | `TitleImgBanner.tsx:124`, `TitleImgBannerJB.tsx:159` | `md:w-[${width}]` (never compiles) | Inline style or a static class map | Silent no-op |
| C9 | L | 🟢 | `globals.css:592,678,699`, `ContactForm.tsx:512`, `blog-card.tsx` | Hover transforms not gated | Tailwind `future.hoverOnlyWhenSupported:true` + CSS `@media (hover:hover) and (pointer:fine)` | Stuck hover states on touch |
| C10 | L | 🟢 | `src/styles/specialized.css` | Not imported anywhere | Delete | Dead file |

---

## 3. Decisions I need from you (🔴 items)

1. **Page transition (G1).** Keep the block wipe + logo, but navigate after ~0.45 s and show the logo only if the next page is still loading? *Recommended.* Or keep the full 3 s show?
2. **First-visit intro (G5).** Shorten it to ~6–8 s and add a Skip button (plus click/Esc/scroll to skip)? *Recommended.* Or keep 16 s and only add Skip?
3. **Server-rendered content (G21, P2).** Render page content on the server and gate only the overlays and cursor. Fixes the content flash, layout jumps and blog SEO, but it touches every page. Do it as its own step with a full visual check?
4. **Draggable gallery on phones (P26).** Disable dragging on touch screens (images become a static collage you can scroll past), or keep drag but limit it to horizontal?
5. **Reduced motion (Phase 1).** For motion-sensitive users: no intro, no page-wipe animation, native scroll, marquees paused, fades only. OK?

---

## 4. Improvement plan

All of this works within `rules.md`: one concern per change, `npm run build` after each, a before/after check on desktop and mobile, and an entry in `log.md` with revert steps. Every phase is reversible on its own.

### Phase 0 — Shared foundation (🟢, no visual change)
- **`src/lib/motion.ts`:** one place for easing tokens (`ease-out: cubic-bezier(0.23,1,0.32,1)`, `ease-in-out: cubic-bezier(0.77,0,0.175,1)`), durations (UI 0.15–0.3 s, reveals 0.6–0.9 s), and the GSAP plugin registration (ScrollTrigger, ScrollSmoother, SplitText, Draggable, Inertia).
- **A `useReveal` hook** and a **`useLoop` hook** (pauses offscreen, uses `deltaRatio`, cleans up) so the ~25 copy-pasted components share one correct implementation.
- **`@property`/CSS variables** for the same easings in `globals.css`.

### Phase 1 — Stop the bleeding: leaks, layers, reduced motion (🟢)
- G17 + G22 + G23: remove the global section layers, `scroll-behavior:smooth`, and the html/body overrides.
- Leaks: G6, G11, G12, G13, G25, S1, S7, S16, S17, S19, S21, S23, S25, S28, P1, P13.
- Reduced motion: a global CSS block + `gsap.matchMedia()` in AnimationWrapper; G16 (cursor only on fine pointers).
- Quick wins: S13 (`markers`), G31 (`testOverride`), P7 (`node:test`), C7, C8, C10, P4, P9, P23.
- **Check:** Chrome Performance panel. Record the same scroll on `/`, `/about` and `/what-we-do` before and after; compare long tasks and layer count (Layers panel). The visual result should be identical.

### Phase 2 — Layout to transform (🟢, same look, smoother)
- S3 (FullMediaWidthAnim → clip-path), P19 + P20 (XCards), P24 (curve-chart bars → `scaleY`), S11 / P11 / S14 (capsules → clip-path), G7, G29, S22 (accordion grid trick), C1, C2, C4, C5, C6, P6.
- P14 + S20: remove `pinType:"fixed"` / `pinReparent` (only after Phase 1 removes the section transforms).
- **Check:** for each component, a side-by-side frame capture at 0.25× speed (DevTools Animations panel). The start and end frames must match.

### Phase 3 — Timing and easing (🟡, visible: review with you)
- A single feel pass using the Phase 0 tokens: G8, G15, G19, G24, G26, G27, S8, S14, S15, S18, P3, P8, P16, P17, P22, S27, G18.
- Rule of thumb: entrances use `ease-out`, with UI interactions ≤ 300 ms. Hero reveals finish within ~1.2 s, with stagger at 30–80 ms. Reveals play once, not on every scroll-by.
- **Check:** I'll do it page by page and send you short before/after screen recordings to approve.

### Phase 4 — Behaviour changes (🔴, after your §3 decisions)
- G1 (page transition), G5 (intro + skip), G21 / P2 (server rendering), P26 (gallery on touch), G2–G4 (transition robustness).

### Phase 5 — Polish (🟡 / 🟢)
- `:active` press feedback (S30), hover gating (C9, P5), seamless marquees (S9, C3), Footer hover (S24), cursor feel (G14).
- Final pass on a real phone (iOS Safari + Android Chrome) and a 120 Hz display.

### What "smooth" will mean (acceptance)
- No long tasks over 50 ms while scrolling the home page on a mid-range phone (Chrome DevTools, 4× CPU throttle).
- Navigation starts within 0.5 s of a click.
- No animation loop running for content that's offscreen or on a page you've left: the ticker and rAF count returns to baseline after navigating away.
- No layout-property tweens on scroll.
- Reduced-motion users get static content with fades only.
