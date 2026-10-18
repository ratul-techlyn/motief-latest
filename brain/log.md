# Change Log

Format for each entry: `## [YYYY-MM-DD] <ID> — <title>`
- Files
- What changed
- Verification: build result and visual check
- How to revert

Changes are uncommitted on `main`, so any item can be reverted with `git checkout -- <file>` (or `git restore`). Deleted files come back with `git checkout HEAD -- <path>`.

---

## [2026-10-03] Setup
- Created `brain/` docs: `memory.md`, `rules.md`, `change.md`, `task.md` and `log.md`.
- No project code changed.

## [2026-10-03] P0 — Baseline
- Ran `npm ci` (Next resolved to **15.5.2**) and `npm run build`.
- **The baseline build FAILS.** 13 `"use client"` pages export `metadata`: about, beauty, better-than-shopify, fashion, luxury, not-a-dtc, the 3 pulse-b2b pages, the-motif-process, bc-elite, what-we-do and why-motif. This comes from commit `544c65f`; fixing it is R4 (🟡, not done yet).
- `npx tsc --noEmit` passes with 0 errors.
- **How builds are verified until R4 is done:**
  1. Temporarily rename `export const metadata` to `const metadata` in those 13 files.
  2. Run the full `npm run build`.
  3. Restore the 13 files byte-for-byte from backup.

## [2026-10-03] Batch 1 — low-risk (🟢) items

### R1 — (public) layout cleanup
- File: `src/app/(public)/layout.tsx`.
- Removed the wrong `"use server"` directive, and the server-side `gsap` / `gsap/all` import and `registerPlugin`. AnimationWrapper already registers the plugins on the client.

### R5 — /faqs and /culture are now server components
- `faqs/page.tsx`: removed `"use client"` and the unused `useResponsiveSize()` call; added `metadata = faqsSEO` (the file already existed but was unused).
- `culture/page.tsx`: removed `"use client"` and the `onButtonClick={() => console.log(...)}` prop (the button still links to `/why-motif`); added `metadata = cultureSEO`.
- `components/SvgImagePath.tsx`: added `"use client"`. It uses motion hooks and used to rely on its parent being a client component.
- Side effect: these pages now have their own title, description and canonical. Before, they inherited the home page canonical `https://wemotif.com/`. This changes `<head>` only, not the UI.

### R7 — Unused imports removed
- Removed the unused `import dynamic` from 14 page files (the only usage was in a comment).
- Removed the unused `headers` import from home `page.tsx`.
- Removed the `LocationSlider` import from contact `page.tsx` (its render is commented out).
- Removed the `MasterGraphScript`, `GlobalFAQsScript` and `BotAwareWrapper` imports from the root `layout.tsx` (their usages are commented out).

### S3 — three.js import removed
- File: `~comp/TheCommitment.tsx`. Removed the `ImageShaderEffect` import; its usage was already commented out.
- With that gone, nothing imported `three`, so `three` and `@types/three` were uninstalled (see D1).

### S4 — d3 named imports
- File: `components/SvgImagePath.tsx`. Replaced `import * as d3` with `{ create, scaleLinear, line, curveBasis }`. The logic is identical.

### S5 — Per-plugin GSAP imports instead of `gsap/all`
- Files: about/page, Hero (later deleted), AnimationWrapper, ExplosionContainer, MadeToBreak, Specialized, HeadingAnmation (later deleted).
- `gsap/all` only re-exports, so this changes no behaviour.

### S6 — `optimizePackageImports: ["d3"]`
- File: `next.config.ts`.
- **gsap is deliberately excluded:** its entry file registers CSSPlugin as a side effect, and rewriting its imports could break animations.

### A6 — Context memoisation
- `AnimationContext.tsx`: the GSAP timeline is now created once (lazily) instead of on every render, and the provider value is memoised.
- `CursorContext.tsx`: the value is memoised.

### A7 — Passive scroll listener
- File: `FloatingSealEntrance.tsx`. Added `{ passive: true }`.
- (CaseStudyCarousel was deleted as dead code.)

### A8 (partial) — console.log removed
- Removed the `onSlideChange={() => console.log("slide changed")}` prop from 12 `AppearanceCards.tsx` files.
- Removed 4 logs in `loading-animation.tsx` and 1 in `SEOHead.tsx`.
- The duplicate `registerPlugin` calls were **not** touched; they are harmless.

### I2 — Fonts to woff2 (same font files, smaller format)
- **ClashDisplay:** now uses the existing `.woff2` files instead of `.woff` (about 114 KB → 90 KB).
- **HelveticaNeue:** Light, Medium, Bold and BoldItalic `.ttf` were losslessly repacked to `.woff2` with fontTools (same glyph tables), **435 KB → 141 KB**. The new files are in `src/fonts/helvetica-neue/*.woff2`; the `.ttf` originals are kept.
- File: `src/app/layout.tsx` (paths only; weights and styles unchanged).

### I4 — Image optimiser config
- File: `next.config.ts`. Set `images.formats = ["image/avif","image/webp"]` and `minimumCacheTTL = 2678400` (31 days).
- Same images and sizes; browsers that support AVIF get smaller files.

### T3 — Preconnect hints
- File: root `layout.tsx`. Added preconnect for `https://www.clarity.ms` and `https://www.gstatic.com` (where the reCAPTCHA script loads from).

### M1 — Middleware no longer runs on static files
- **Matcher:** in `src/middleware.ts`, changed to `/((?!_next|favicon.ico|api/|.*\\..*).*)`, so any path with a file extension is skipped.
- **Ignore list:** in `src/lib/prerender-middleware.ts`, added webp, avif, svg, webm, woff, woff2, ttf, otf, eot, json, webmanifest and map as a second line of defence.

### M2 — Bot check order
- File: `src/lib/prerender-middleware.ts`. The bot list is checked first, and `isbot()` runs only when the list doesn't match. Removed the duplicate `baiduspider` entry. The result is the same.

### M4 — Cache headers for /assets
- File: `next.config.ts` `headers()`. `/assets/:path*` now gets `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` and `X-Content-Type-Options: nosniff`.
- This replaces the 1-hour header that middleware used to set on those files (see M1). png/jpg previously got no cache header at all.

### D1 — Unused npm packages uninstalled
- **Packages:**
  - jquery, jquery-ui, @types/jqueryui, @types/jquery
  - lenis, @studio-freight/lenis
  - react-use-gesture, re-resizable, auto-text-size
  - next-view-transitions, next-transition-router, next-auth, next-hubspot, next-navigation
  - prerender-node, react-draggable, react-google-recaptcha, @types/react-google-recaptcha
  - dotenv, @heroicons/react, @types/next
  - three, @types/three
- Each was grep-checked for imports first. next 15.5.2, react 18.2.0 and gsap 3.13.0 are unchanged.
- Files: `package.json`, `package-lock.json`.

### D2 — 59 dead source files deleted
- Every file was checked with an import-resolution scan: 0 live importers.
- **Chart backups and unused chart files:**
  - the-motif-process/~com: `CurveChartAnimation copy`, `CurveChartAnimationBackup`, `XXcurve_chart`, `Curve3dChart`
  - faqs/~com: `XXcurve_chart`, `Curve3dChart`
- **Unused route components:**
  - all 11 `~com/ImageSlider.tsx` copies
  - about/~com/HeroMobileNew
  - contact/~comp: WeAre, WeAreMotif
  - culture/~comp: Apply, JoinOurTeam
  - what-we-do/~com/MotifVideShow
  - why-motif/~comp: WhyBanner, WhyChooseCart
  - (public)/~comp: Approach, CaseStudiesCarousel, Hero
- **Unused shared components (`src/components`):**
  - transitions/Copy, blog-carousel, CaseStudyCarousel
  - cards: DynamicHeadline, SectionPartner, SwiperMarquee
  - cursor/MagneticLink, HighlightStatement, page_templates/BusinessPageTemplate, scroll-effects, StaticPage, BotAwareWrapper
  - shared: ExplosionContainerNew, HomeTitleMixImg, MobileGuidePortal, TitleSideShort, ImageShaderEffect
  - ui/HeadingAnmation, lib_comp/UnicornScene
- **Unused hooks:** scrollbar-test, scrollbar-usage-example, useLenis, usePageTransitionAnimation, useScrollTriggerGate.
- **Unused context:** MobileGuideContext.
- **Unused lib files:** fetch-posts, isAnimating, prerender-config, seo-utils, transition, connection-awareness, page-load-detection.

### D3 — 51 unused public assets deleted (about 39.8 MB; `public/` went from 100 MB to 62 MB)
- Every file was checked by exact filename against `src/`.
- **Correction to the audit:** `footerexplo/img1–img15.jpg` **are used**. The Footer's `ExplosionContainer` builds those paths dynamically, so they were kept. Only the unused extras in that folder were removed.
- **Large images and video:**
  - culture/cultureCareearImage.jpg (14 MB), video/motif.mp4 (7 MB)
  - shopifyplus/luxury-lifestyle-hero.png, luxuryLifestyle/luxuryFashionTitleImage.png, fashion_agency/fashionTitleImage.png, beauty/beautyBannerImage.png
- **home/brand_profile:** dr-zenovia, drk-lei, tenshoppe, kiwabi, scd.
- **footerexplo extras:** IMG_6719, IMG_6724, IMG_6725, img08, img09, img112, img27, img60, img67, img78, outro.
- **about/slide:** motif_fashion_hero and about_slide_1–5.
- **what_we_do:** Brand-x-1x1-size, lets-talk-bg, Lets-talk, specialize-1/2/3.
- **Other unused images:**
  - shopifyplus/shopufyBannr, process/graph.png
  - 3 instagram jpgs
  - dtc/dtcTitleImage, the DTC 2048x1024 webp, bigcommerce/BigCommerceBanner.webp, pulseB2B/b2b-ecommerce-agency-motif.webp
  - check-logo.jpeg
- **public/js:** unicorn_3d_file.json and DrawSVGPlugin.min.js.
- **Boilerplate:** next, globe, file, window and vercel `.svg`.
- All `.DS_Store` files (outside node_modules) were deleted too.

### D5 (partial) — .gitignore
- Added `.DS_Store`, `**/.DS_Store`, `.env`, `.env.local` and `.env*.local` (keeping `.env.local.example`).
- `.env` and `.env.local` are **still tracked**. Untracking them is part of X1 and is your decision.

### Verification (Batch 1)
- `npx tsc --noEmit`: 0 errors.
- `npm run build` with the temporary metadata rename (see P0): **compiled successfully, types valid, 29/29 pages generated**, exit code 0. All 13 files were restored afterwards.
- All routes still build as **ƒ (dynamic)**, as expected: the `headers()` call that causes it is removed only in R2 (🟡).
- **Not yet done:** a visual check in the browser. Run `npm run dev` and check `/`, `/about`, `/faqs`, `/culture` and `/contact` (loader, page transitions, cursor, marquees, contact form).

### Bundle sizes before → after (First Load JS)
Both builds used the same temporary metadata rename.
- `/culture`: 255 → **245 kB** (page JS 37.1 → 27.7 kB)
- `/faqs`: 163 → **160 kB** (5.86 → 2.72 kB)
- `/about`: page JS 16.3 → **13.0 kB**
- `/what-we-do`: page JS 14.5 → **11.1 kB**
- Other routes are about the same. The bigger JavaScript savings come from the 🟡 items (R2–R4, S1, S2).
- **Non-JS savings:**
  - `public/` 100 → 62 MB
  - fonts about 549 → 231 KB
  - middleware no longer runs on asset requests
  - `/assets` files are now cached

### Skipped from the 🟢 list (with reasons)
- **R6:** depends on R3 (🟡).
- **S7:** moving global CSS imports can change cascade order, and therefore how things look, so it's reclassified 🟡.
- **B2, B3:** they sit in "Visible bug fixes", which needs separate approval.
- **A8 registerPlugin cleanup:** harmless and touches 58 files, so it isn't worth the risk.

## [2026-10-03] R4 — Fix the "use client" + metadata build error (approved by the user via their error report)
- **Approach:** the lowest-risk split. For each of the 13 pages:
  - the original `page.tsx` code moved **unchanged** to a sibling `page-client.tsx`, which keeps `"use client"`
  - only the `metadata` export, its SEO import and the `Metadata` import were taken out of it
  - the new `page.tsx` is a 9-line server component that exports `metadata` and renders `<PageClient />`
- **Pages:**
  - about
  - beauty-brand-marketing-advertising-agency
  - better-than-shopify-platinum-partner
  - fashion-agency
  - luxury-lifestyle-advertising-branding-agency-nyc-la-sf
  - not-a-dtc-agency
  - pulse-b2b-bigcommerce-b2b-agency, pulse-b2b-ecommerce-agency, pulse-b2b-shopify-b2b-agency
  - the-motif-process
  - the-only-bigcommerce-elite-partner-an-incubator
  - what-we-do
  - why-motif
- **Result:** the rendered output is identical. Each page now actually gets its title, description and canonical. Before, the build failed (production) or errored (dev).
- **Verification:**
  - `tsc` passes with 0 errors.
  - **`npm run build` passes for real**, with no temporary rename: compiled, 29/29 pages. This was run in a scratch copy because the user's dev server was using `.next`.
- **Incident:** an earlier build attempt in the project folder overwrote `.next` while `npm run dev` was running, and the dev server started returning 500. **Fix:** stop the dev server, delete `.next`, and run `npm run dev` again.
- **Revert:** `git checkout -- "src/app/(public)/*/page.tsx"`, then delete the `page-client.tsx` files.
- **Note:** R3 (making these pages true server components to cut JavaScript) is still open. This change only fixes the build.

## [2026-10-04] BLOG-1 — Blog feature (Strapi), separate from the optimisation pass
- Roadmap: `brain/blog-rm.md`; setup guide: `brain/strapi-setup.md`.
- New files:
  - `src/lib/strapi/` (client, queries, types, media, blocks, seo)
  - `src/components/blog/*`
  - `src/app/(public)/blog/` (page + `rss.xml`), `src/app/(public)/blogs/**` (pages + 5 templates)
  - `src/app/api/revalidate`, `src/app/api/preview` (+ `exit`), `src/app/admin/blog`, `src/app/blog-sitemap.xml`
- Changed files:
  - `src/components/blog-card.tsx`: rewritten for Strapi data (it was unused).
  - `next.config.ts`: `images.remotePatterns` for Strapi uploads.
  - `src/middleware.ts`: `/admin` and draft-mode requests skip prerender and public caching.
  - `public/robots.txt`: `Disallow: /admin/` and the blog sitemap line.
  - `.env`: added `STRAPI_URL`, `STRAPI_API_TOKEN`, `STRAPI_WEBHOOK_SECRET`, `PREVIEW_SECRET` (values not logged).
- Strapi project `D:/MOTIF/strapi/motif-cms`: added `scripts/seed-demo.js` (`--token`, `--webhook`) and `PREVIEW_SECRET` in its `.env`.
- Existing pages untouched; no visual change outside the new routes.
- Verification: `npx tsc --noEmit` 0 errors; `npm run build` passes. Visual check of /blog, /blogs, a blog page and all 5 templates at 1440px and 390px (no horizontal overflow). Revalidate/preview routes reject bad secrets; preview redirect only allows /blog(s) paths.
- Revert: delete the new files/folders above and `git checkout -- src/components/blog-card.tsx next.config.ts src/middleware.ts public/robots.txt`.

## [2026-10-18] ANIM-1 — Animation leak/cleanup pass (🟢 items from `brain/animation-fixes.md`)
- Scope: only fixes that keep the look the same. The banner/hero animations, the page transition, the intro, and the global section layers (G17) were not touched.
- Changes:
  - G11 `cursor/CursorDot.tsx`: the rAF loop is cancelled on unmount; the mousemove listener is passive.
  - G12 `cursor/CursorLabel.tsx`: tweens use `overwrite:"auto"`; glass/text tweens run only when the label state changes; `setLabel` only on change; passive listeners.
  - S1 `lib_comp/GsapImageMarquee.tsx`: the ticker callback and resize listener are removed on unmount; the loop skips work while offscreen.
  - S13 `shared/TitleMixImg.tsx`: removed `markers: true`.
  - P7 `beauty-…/~com/AppearanceCards.tsx`: removed the stray `node:test` import.
  - S16 `AnimatedLines.tsx`, S28 `extrasc/StatHighlight.tsx`: tweens and ScrollTriggers are cleaned up on unmount.
  - S21 `shared/ExplosionContainer.tsx`: the rAF loop and reset timeout are cancelled on unmount.
  - S25 `cards/Brands.tsx`: the logo-cycle timeline is killed on unmount and doesn't reschedule after it.
  - P1 12× `AppearanceCards.tsx` + `~comp/BrandProfile.tsx`: the timeline is wrapped in `gsap.context`, with `ctx.revert()` on cleanup.
  - G25/G28 `Navbar/TopBar.tsx`: the menu's SplitText is reverted and its hover listeners removed on close (the intro is finished, not aborted); removed a no-op scroll tween; passive scroll listener.
  - G6 `loading-animation.tsx`: the infinite cube timelines are scoped in `gsap.context` and reverted on unmount.
  - S7 `marqueeNav/MarqueeNavigation.tsx`, `ui/MarqueeInPage.tsx`: each instance kills its own trigger (no shared id); the loop rebuilds only when text/iconSize/speed/direction change, not on every parent render.
  - S23 `shared/Slider.tsx`: the previous slide's SplitText is reverted before re-splitting.
  - S19 `shared/MadeToBreak.tsx`: the follow tween uses `overwrite:"auto"`.
  - S24 `shared/footer/Footer.tsx`: hover listeners are removed on cleanup; hover tweens use `overwrite:"auto"` (fixes letters sometimes staying orange).
  - Reduced motion (`globals.css`): decorative infinite loops (card blobs, `animate-spin_slow`) stop under `prefers-reduced-motion`.
- Verification:
  - `npx tsc --noEmit` reports 0 errors; `npm run build` passes.
  - Browser check of /, /fashion-agency, /about, /what-we-do, /the-motif-process, /why-motif, /culture, /contact and /beauty-… with scroll and cursor movement: 0 console/page errors.
  - Menu opened and closed twice: the split depth stays 2 while open and returns to 0 when closed (it used to grow).
  - Client-side navigation works, and the home banner is unchanged.
- Revert: `git checkout -- <file>` for any file above.
