# HexPlore — Build Sessions

Each session is ~1 hour. **Start with Session 0** — it validates the riskiest technical unknown (MapLibre polygon rendering performance) before any other code is written on top of it.

---

## Session 0 — Spike: MapLibre + H3 rendering ⚠️ DO FIRST

**Goal:** Confirm that rendering ~17,000 H3 hex polygons as a MapLibre GeoJSON layer is performant before building anything that depends on it.

- [ ] Install `@maplibre/maplibre-react-native` and `h3-js`
- [ ] Configure dev build (`npx expo run:ios` or EAS dev build)
- [ ] Write a throwaway test screen that:
  - Generates GeoJSON boundaries for all ~17k land cells using `h3.cellToBoundary()`
  - Mounts them as a single MapLibre GeoJSON source with a fill layer
- [ ] Measure perceived frame rate at world zoom (zoom ~2) and city zoom (~8)
- [ ] Test hex tap detection via `onPress` on the fill layer

**Done when:** World zoom renders without visible lag, hexes are tappable at city zoom, and performance is acceptable on a physical device. If rendering is too slow, investigate splitting into zoom-dependent layers or pre-clustering before proceeding to Session 1.

---

## Session 1 — Foundation

**Goal:** All dependencies installed, SQLite working, land cells generated, theme system live.

- [ ] Install remaining packages:
  - `expo-media-library`
  - `expo-sqlite`
  - `posthog-react-native`
  - `expo-location`
  - `react-native-share`
  - `expo-store-review`
  - `@react-native-async-storage/async-storage`
- [ ] Download Natural Earth 1:50m land polygons GeoJSON → `assets/natural-earth-land-50m.json`
- [ ] Write `scripts/generate-land-cells.js`:
  - For each Natural Earth land polygon, call `h3.polygonToCells(polygon, 4)`
  - Deduplicate, add `country_code` via point-in-polygon on country polygons
  - Write `assets/land-cells.json` — array of `{ h3index, country_code }`
- [ ] Run the script, verify ~17,000 entries in `land-cells.json`
- [ ] Implement `lib/db/client.ts` — `expo-sqlite` singleton
- [ ] Implement `lib/db/schema.ts` — `CREATE TABLE` SQL
- [ ] Implement `lib/db/migrations.ts` — versioned migration runner
- [ ] Implement `lib/db/queries.ts` — typed query functions: `insertCell`, `upsertCell`, `getAllCells`, `getCellByIndex`, `updateGeocode`
- [ ] Implement `lib/theme/tokens.ts` — design token constants
- [ ] Implement `lib/theme/ThemeContext.tsx` — context + `useTheme()` hook, AsyncStorage persistence
- [ ] Wire `ThemeContext` provider into `app/_layout.tsx`
- [ ] Set up `constants/colours.ts` — 6 accent colour presets
- [ ] Set up `constants/h3.ts` — `RESOLUTION = 4`

**Done when:** `land-cells.json` exists with ~17k entries, SQLite opens and `visited_cells` table is created, `useTheme()` returns the stored accent colour.

---

## Session 2 — Onboarding screens 1 & 2

**Goal:** Animated welcome + how-it-works screens with permission request.

- [ ] Add redirect logic to `app/_layout.tsx`: if `onboarding_complete` is not set in AsyncStorage, redirect to `/onboarding`
- [ ] Create `app/onboarding/index.tsx` — mounts `OnboardingCarousel`
- [ ] Build `features/onboarding/DotsIndicator.tsx`
- [ ] Build `features/onboarding/OnboardingCarousel.tsx` — `FlatList`, `pagingEnabled`, dots indicator, programmatic scroll
- [ ] Build `components/HexBloom.tsx` — Reanimated concentric hex rings animating outward
- [ ] Build `features/onboarding/WelcomeScreen.tsx`:
  - Full screen, `HexBloom` animation
  - Bold headline + subheadline copy
  - `PillButton` "Get Started →"
- [ ] Build `components/PillButton.tsx`
- [ ] Build `features/onboarding/HowItWorksScreen.tsx`:
  - Two illustrated panels
  - Small print privacy notice
  - "Scan My Photos →" CTA triggers `expo-media-library` permission request
  - On denial: gentle message + "Continue anyway →" advances to scanning screen (which shows empty state)
- [ ] Wire PostHog events: `onboarding_started`, `onboarding_screen_viewed` (screen 1, 2), `camera_permission_requested`, `camera_permission_granted` / `camera_permission_denied`

**Done when:** Carousel scrolls with animated dots, bloom animates on screen 1, permission dialog fires on CTA tap, denial lets user proceed.

---

## Session 3 — Scan pipeline & onboarding screens 3 & 4

**Goal:** Real camera roll scan drives the onboarding progress screen; results reveal shows accurate coverage.

- [ ] Implement `lib/media/scanner.ts`:
  - `scanCameraRoll(onProgress: (scanned, total, hexCount) => void): Promise<ScanResult>`
  - Uses `expo-media-library` `getAssetsAsync` with `mediaType: 'photo'`
  - For each asset, calls `getAssetInfoAsync` to get `location`
  - Skips assets with no GPS
  - Calls `h3.latLngToCell(lat, lng, 4)` on each coordinate
  - Upserts into SQLite via `lib/db/queries.ts`
  - Stores final cursor in AsyncStorage `last_scan_cursor`
- [ ] Build `features/onboarding/ScanningScreen.tsx`:
  - `HexBloom` fills in as `hexCount` grows
  - Large % number in accent colour
  - "Reading EXIF coordinates · X of Y photos" sub-label
  - Triggers scan on mount (or when permission was granted)
  - Auto-advances after 400ms delay at 100%
- [ ] Build `features/onboarding/ResultsScreen.tsx`:
  - Coverage percentage in large type
  - World hex map thumbnail (small `MapLibre` preview or static SVG)
  - "Explore your map →" navigates to `/(tabs)/`
  - Calls `StoreReview.requestReview()` on mount
  - Writes `onboarding_complete: 'true'` to AsyncStorage
- [ ] Wire PostHog: `scan_completed` (photo_count, hex_count, duration_ms), `results_reveal_viewed`, `app_entered`

**Done when:** Scan runs on a real device, `visited_cells` is populated, progress % is live, results reveal shows accurate coverage percentage.

---

## Session 4 — Map screen core

**Goal:** Full-bleed map with both hex layers, overlay UI, and zoom controls.

- [ ] Implement `lib/h3/hexUtils.ts` — `latLngToCell`, `cellToBoundary` wrappers
- [ ] Implement `lib/h3/geoUtils.ts`:
  - `cellsToGeoJSON(cells: string[]): GeoJSON.FeatureCollection` — converts H3 indices to polygon features
  - Each feature carries `h3index` in properties for tap identification
- [ ] Implement `lib/h3/landCells.ts` — imports `assets/land-cells.json`, exports `landCellIndices: string[]` and `landCellCount: number`
- [ ] Build `features/map/HexLayer.tsx`:
  - `ShapeSource` + `FillLayer` for land outline (grey stroke, transparent fill)
  - `ShapeSource` + `FillLayer` for visited cells (accent colour fill)
  - Land GeoJSON computed once on mount, cached with `useMemo`
- [ ] Build `features/map/MapScreen.tsx`:
  - Full-bleed `MapLibreGL.MapView` with inline plain-background style
  - Mounts `HexLayer`
  - Handles tap events — identifies tapped H3 index, opens correct sheet
- [ ] Build `features/map/TopBar.tsx`:
  - "WORLD COVERAGE" small caps + "HexPlore" bold
  - Share (↗) and Recenter (⌖) circular buttons
  - Zoom level monospace label
- [ ] Build `features/map/ZoomControls.tsx` — + / − buttons, right mid-screen
- [ ] Build `features/map/StatsBar.tsx`:
  - Floating pill above tab bar: World covered %, Hexes, Countries ›
  - "Countries ›" navigates to Stats tab
- [ ] Wire PostHog: `map_viewed`

**Done when:** Map renders both layers with correct colours, world coverage % shown in stats bar, zoom controls change zoom level.

---

## Session 5 — Cell interaction sheets

**Goal:** Tapping any hex opens the correct bottom sheet; visited hexes show photos.

- [ ] Build `components/BottomSheet.tsx`:
  - Gesture Handler + Reanimated swipe-to-dismiss
  - Backdrop tap to dismiss
  - Configurable snap points
- [ ] Build `features/map/EmptyCellSheet.tsx`:
  - Reverse-geocoded location name + coordinates
  - Country flag + name
  - "Mark as visited" button → inserts `source: 'manual'` row into SQLite, updates map layer
- [ ] Implement `lib/media/geocoder.ts`:
  - `enqueueGeocode(h3index: string): void`
  - FIFO queue, processes with 1-second delay between calls
  - Calls `expo-location`'s `reverseGeocodeAsync` on cell centroid
  - Writes result back via `queries.updateGeocode()`
- [ ] Build `features/map/HexNeighborThumbnail.tsx`:
  - SVG rendering of a 7-hex cluster (target cell + 6 neighbours)
  - Colours each hex accent if visited, outline-only if not
- [ ] Build `features/map/CellSheet.tsx`:
  - Header: `HexNeighborThumbnail` + flag + country + place name + region
  - Metric strip: first photo date, photo count, coordinates
  - `PhotoStrip` below
  - Enqueues geocoding if cell not yet geocoded
- [ ] Build `features/map/PhotoStrip.tsx`:
  - Queries `expo-media-library` for assets in the cell's H3 bounding area
  - Horizontal `FlatList` of `Image` thumbnails
- [ ] Wire PostHog: `cell_tapped` (source, country), `cell_marked_manual`

**Done when:** Both sheets open on tap, photo strip shows real images, manual mark updates the visited layer on the map immediately.

---

## Session 6 — Stats screen

**Goal:** Full Stats screen with real data from SQLite and land-cells.json.

- [ ] Derive per-country land cell counts from `assets/land-cells.json` (group by `country_code`) — export from `lib/h3/landCells.ts` as `landCellsByCountry: Record<string, number>`
- [ ] Build `features/stats/HeroNumber.tsx` — large monospace `X.XX%`, subtitle with hex count and km² estimate
- [ ] Build `features/stats/CountryList.tsx`:
  - Queries `visited_cells` grouped by `country_code`
  - Joins against `landCellsByCountry` to compute % coverage
  - Sorted ascending by % (most honest first)
  - Each row: flag, country name, hex count, thin coverage bar
- [ ] Build `features/stats/BraggingShelf.tsx` — horizontal scroll: Total Hexes, Countries, Continents, Furthest from Home
- [ ] Build `features/stats/HexesPerYearChart.tsx` — vertical bar chart from `first_photo_date` grouped by year
- [ ] Build `features/stats/InsightCards.tsx` — "Your patch" (most visited), "First hex ever", "Best explored country"
- [ ] Build `features/stats/StatsScreen.tsx` — composes all sub-components in a `ScrollView`

**Done when:** All sections render with real data; country list is sorted correctly; hero % matches map screen %.

---

## Session 7 — Settings & sharing

**Goal:** Settings screen fully functional; share card generates and opens native sheet.

- [ ] Build `components/StatChip.tsx` and `components/FlagEmoji.tsx`
- [ ] Build `features/settings/SettingsRow.tsx` — iOS-style list row
- [ ] Build `features/settings/AccentColourPicker.tsx`:
  - 6 preset swatches from `constants/colours.ts`
  - Tapping a swatch writes to AsyncStorage + updates `ThemeContext`
  - Active swatch shows checkmark
- [ ] Build `features/settings/PrivacyPolicyModal.tsx` — inline scrollable text
- [ ] Build `features/settings/SettingsScreen.tsx` — all four sections
- [ ] Add `react-native-view-shot` for share card snapshot
- [ ] Implement `features/share/generateShareCard.ts`:
  - Renders an off-screen view with map thumbnail, `X.XX%`, HexPlore branding, counts
  - Captures with `react-native-view-shot`
  - Opens `react-native-share` native sheet
- [ ] Build `features/share/ShareButton.tsx` — wires into `TopBar`
- [ ] Wire PostHog: `settings_viewed`, `accent_colour_changed` (colour), `share_initiated`, `share_completed`

**Done when:** Colour picker changes accent throughout the app immediately; share sheet opens with a generated image card; all Settings rows are tappable and functional.

---

## Session 8 — Polish & QA

**Goal:** Full flow works end-to-end on a physical device, matches design reference visually.

- [ ] Test full onboarding flow on device: permission grant path and permission denial path
- [ ] Test incremental re-scan: add new photos, re-open scan, verify only new assets processed
- [ ] Verify New Architecture compatibility for all packages — check for bridge warnings in Metro logs
- [ ] Visual QA against `design-reference/screens.jsx`:
  - Background colour, text colour, accent colour
  - Border radii, font sizes, spacing
  - Tab bar pill highlight
  - Bottom sheet backdrop and snap behaviour
- [ ] Implement empty states:
  - No geotagged photos found during scan
  - Map with zero visited cells (first launch)
- [ ] Audit all PostHog events — confirm they fire at the right moments
- [ ] Remove Session 0 throwaway test screen
- [ ] Final device run: no crashes through the full flow

**Done when:** App works end-to-end on device, all screens match the design reference, no console errors or New Architecture warnings.

---

## Riskiest Technical Unknowns

Spike these before committing to an approach:

| # | Risk | Why it matters | When to spike |
|---|------|----------------|---------------|
| 1 | **MapLibre + 17k GeoJSON polygons** | May cause frame drops at world zoom; entire map architecture depends on this | Session 0 |
| 2 | **`expo-media-library` GPS access** | `getAssetInfoAsync()` may be slow at scale; iOS 17+ privacy manifest may be required | Session 3, real device |
| 3 | **New Architecture compatibility** | `maplibre-react-native` and `react-native-share` Turbo Module support unclear | Before Session 0 installs |
| 4 | **`react-native-view-shot`** | Not in original spec; needed for share card; New Arch support needs verification | Session 7 |
| 5 | **Land cell count accuracy** | Script must produce the right ~17k cells; validate against known H3 datasets | Session 1 script |
