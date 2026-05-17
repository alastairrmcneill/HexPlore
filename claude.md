Perfect, I have everything I need. Here's the full Claude Code prompt:

---

## HexPlore — React Native (Expo) MVP Build Prompt

You are building **HexPlore**, an iOS-only React Native app built with Expo (development build, not Expo Go). The app reads geotagged photos from the user's camera roll, maps them onto a global hexagonal grid (~50×50km cells), and shows the user what percentage of the world's land they have actually visited.

---

### Tech Stack

- **Expo** (bare/development build workflow)
- **Expo Router** for navigation
- **MapLibre React Native** (`@maplibre/maplibre-react-native`) for the map
- **H3-js** (`h3-js`) for hex grid logic — use resolution 4 (≈1,700km² per cell)
- **expo-media-library** for camera roll access
- **expo-sqlite** for local persistence of visited hex IDs
- **react-native-svg** for hex polygon animations (onboarding bloom + scan ripple)
- **react-native-reanimated** + **react-native-gesture-handler** for animations and swipe gestures
- **PostHog** (`posthog-react-native`) for anonymous analytics — no consent dialog needed, just initialise it silently and mention it in the Privacy Policy copy
- **Natural Earth** GeoJSON (1:50m resolution) bundled as a local asset for land polygon data
- **react-native-share** for the native iOS share sheet

Do **not** implement Liquid Glass / `expo-glass-effect` yet — that is a future migration.

---

### Core Data Pipeline

1. On first run, scan camera roll via `expo-media-library`, extract GPS EXIF coordinates from each geotagged photo
2. For each coordinate, call `h3.geoToH3(lat, lng, 4)` to get an H3 index (h3-js v3 API — do not use `latLngToCell`, that is h3-js v4)
3. Store visited H3 indices in SQLite with metadata: `{ h3index, first_photo_date, photo_count, place_name }`
4. At build time, pre-generate a JSON file of all H3 resolution-4 cells that intersect land (using Natural Earth polygons) — bundle this as a local asset. There are **74,942** land cells at res 4 (the earlier spec estimate of ~17,000 was wrong by ~4×).
5. Reverse geocode each unique H3 cell centroid using `expo-location`'s `reverseGeocodeAsync` to get place name, region, country, country code (for flag emoji)

---

### Onboarding Flow (single screen, three in-place states)

The onboarding lives in `app/onboarding/index.tsx` and cycles through three states without any carousel or navigation transitions. On every cold launch the app checks `AsyncStorage` for `onboarding_complete`; if set, it redirects straight to `/(tabs)`.

**State 1 — Welcome**
Full screen (`#FAFAF7`). Upper region: `HexBloom` animation (concentric rings of pointy-top hexagons rippling outward, driven by `requestAnimationFrame`). Lower region: eyebrow label _"HexPlore · v0.1"_ in SF Mono, large headline _"See how much of the world you've actually been to."_, body copy _"HexPlore reads the location of photos in your camera roll and fills in a hexagon for every 50 km square you've visited. Nothing leaves your device."_ CTA dark pill: _"Scan my photos →"_. Below the button: _"Photo data stays on this device."_ in muted small type.

Tapping the CTA immediately requests `expo-media-library` permission and begins scanning. If permission is denied the screen stays on the welcome state (no error state needed for MVP).

**State 2 — Scanning**
Same screen. `ScanRipple` SVG (5-ring hex grid filling radially from centre) replaces the bloom. Live progress: eyebrow _"SCANNING CAMERA ROLL"_, large accent-coloured `X%` in SF Mono, sub-label _"Reading EXIF coordinates · N of M photos"_. Progress is driven by real `scanCameraRoll` callbacks — no fake animation.

**State 3 — Done**
Ripple locked at 100% fill. Eyebrow _"ALL DONE"_, headline _"N hexes found"_, sub-label _"Your camera roll has been mapped."_, dark pill CTA _"See results →"_. Tapping writes `onboarding_complete: 'true'` to AsyncStorage and navigates to `/(tabs)`.

---

### Main App Navigation

Bottom tab bar with three tabs: **Map**, **Stats**, **Settings**. Tab bar sits above the home indicator. Active tab uses a filled pill with the accent colour.

---

### Map Screen

Full-bleed MapLibre map. Render two layers on top:

1. **Land outline layer** — all ~74,942 land H3 cells rendered as hollow hexagon polygons (light grey stroke, transparent fill)
2. **Visited layer** — visited H3 cells rendered as filled hexagon polygons in the accent colour

**Zoom behaviour:** At low zoom (world view) hexes are small and dense, forming a dotted-map aesthetic. At high zoom, individual hexes are large enough to tap comfortably. Use MapLibre zoom-dependent styling.

**Top bar** (overlaid, with gradient fade):

- Top-left: small caps label "WORLD COVERAGE" + "HexPlore" in bold
- Top-right: two circular glass buttons — Share (↗) and Recenter (⌖)
- Below title: zoom level indicator in monospace (e.g. "ZOOM 2.70× · REGIONAL")

**Zoom controls:** + / − buttons, right side, mid-screen

**Stats bar** (floating, above tab bar):
Three stats: `World covered: X.XX%` (in accent colour), `Hexes: N`, `Countries: N ›` (tapping Countries navigates to Stats tab)

**Tapping a visited hex** → opens CellSheet bottom sheet (see below)

**Tapping an empty (unvisited) land hex** → opens a lightweight bottom sheet showing:

- Hex location name (reverse geocoded) + coordinates
- Country flag + name
- A small "Mark as visited" button — tapping it manually adds that H3 index to SQLite as visited (with source flagged as `manual`, no photo count, today's date). Map updates immediately.

---

### CellSheet (visited hex detail — bottom sheet)

Swipe-down-to-dismiss.

**Header row:**

- Left: small hex thumbnail (62×62pt). Render the tapped hex **plus its immediate ring of 6 neighbours**, colouring each one in the accent colour if it is visited, outline only if not. This gives an accurate local picture of coverage around that cell.
- Right: country flag + country name (small caps), place name (large, bold), region (small, muted)

**Metric strip (3 columns):**

- First photo date
- Photo count
- Lat/Lng coordinates

**Photo thumbnail strip:** horizontal scroll of actual photos from the camera roll that belong to this H3 cell, loaded via `expo-media-library`. Show real images, not placeholder gradients.

---

### Stats Screen

Scrollable. Structure top to bottom:

1. **Hero number** — `X.XX%` of world land in large monospace type, accent colour. Subtitle: "N hexes of 74,942 on Earth — about N km² covered"
2. **Honest breakdown header** — small caps: "HOW MUCH YOU REALLY SAW". Country list sorted by **% of that country's land covered** (descending — highest coverage first). Each row: flag, country name, hex count, % coverage as a thin bar + number.
3. **Bragging shelf** — horizontal scroll of stat cards: Total Hexes, Countries, Continents, Furthest from Home
4. **Hexes per year** — vertical bar chart, one bar per year
5. **Personal insights cards** — algorithmically surfaced: "Your patch" (most visited hex location), "First hex ever" (earliest photo date), "Best explored country" (highest % coverage)

---

### Share

Tapping the Share button (↗) on the map screen generates a snapshot card image containing:

- The world hex map thumbnail (visited cells filled)
- The user's `X.XX%` stat in large type
- HexPlore branding
- Hexes + Countries counts

Then immediately opens the **native iOS share sheet** via `react-native-share` so the user can send it to Messages, Instagram Stories, etc.

---

### Settings Screen

Standard iOS-style grouped list rows. Sections:

**Appearance**

- Accent colour — opens a colour picker with at least 6 preset swatches (coral, teal, burnt orange, indigo, sage, slate). Selection persists via AsyncStorage and updates the whole app immediately.

**Account**

- _(placeholder section, empty for now with a "Coming soon" label)_

**Feedback**

- Rate HexPlore — triggers `StoreReview.requestReview()`
- Contact — opens `mailto:hello@hexplore.app`

**Legal**

- About — version number, brief one-paragraph app description
- Privacy Policy — inline scrollable text explaining: all processing is on-device, anonymous usage analytics (PostHog) are collected to improve the app, no personal data or photos leave the device, analytics can be disabled by contacting us

---

### Analytics (PostHog)

Initialise PostHog silently on app start with anonymous distinct ID (UUID generated once and stored in AsyncStorage). Do **not** show any consent dialog. Track these events:

**Onboarding funnel:**

- `onboarding_started`
- `onboarding_screen_viewed` (with `screen: 1|2|3|4`)
- `camera_permission_requested`
- `camera_permission_granted` / `camera_permission_denied`
- `scan_completed` (with `photo_count`, `hex_count`, `duration_ms`)
- `results_reveal_viewed`
- `app_entered`

**Engagement:**

- `map_viewed`
- `cell_tapped` (with `source: visited|empty`, `country`)
- `cell_marked_manual`
- `stats_viewed`
- `share_initiated` / `share_completed`
- `settings_viewed`
- `accent_colour_changed` (with `colour`)

---

### Visual Style

Match the Claude Design prototype aesthetic throughout:

- Background: `#FAFAF7` (warm off-white)
- Text: `#0E0E0C`
- Accent: user-selected, default `#FF6B5B` (warm coral)
- Font: use SF Pro (system font on iOS) — the prototype used Geist but SF Pro is correct for native
- Monospace labels: SF Mono
- Overlay surfaces (tab bar, stats bar, bottom sheets): white (`rgba(255,255,255,0.86)`)
- Border radius language: generous — 22–28pt for cards, 30pt for pills
- No heavy drop shadows — use subtle `0 12px 40px rgba(14,14,12,0.08)` style

The `design-reference/` folder contains a working HTML/React prototype of the target UI. These are not React Native files and should never be imported or run. They exist purely as a visual and logic reference. When building components, match the design tokens, spacing, and component structure shown in these files exactly.

---

### What NOT to build yet

- Liquid Glass / `expo-glass-effect`
- Google Photos integration
- Shared albums
- Android support
- Any backend, auth, or user accounts
- Trip mode / live tracking

---
