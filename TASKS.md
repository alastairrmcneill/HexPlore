# HexPlore — Build Sessions

Each session is ~1 hour. **Start with Session 0** — it validates the riskiest technical unknown (MapLibre polygon rendering performance) before any other code is written on top of it.

---

## Session 0 — Spike: MapLibre + H3 rendering ✅ DONE

**Goal:** Confirm that rendering ~17,000 H3 hex polygons as a MapLibre GeoJSON layer is performant before building anything that depends on it.

- [x] Install `@maplibre/maplibre-react-native` and `h3-js`
- [x] Configure dev build (`npx expo run:ios`)
- [x] Write spike screen (`app/(tabs)/index.tsx`):
  - Generates GeoJSON boundaries for ~17k cells from a lat/lng grid
  - Mounts them as a MapLibre GeoJSON source with fill + line layers
- [x] Verified smooth rendering at world zoom and city zoom on simulator
- [x] Tap detection confirmed working via lat/lng → H3 index conversion

**Findings:**
- MapLibre v11 uses new named-export API (`Map`, `Camera`, `GeoJSONSource`, `Layer`) — not the old Mapbox-style `MapLibreGL.*`. See `memory/maplibre_v11_api.md`.
- h3-js v4 (WASM) crashes in Hermes with `utf-16le` encoding error. Pinned to **h3-js v3.7.2** (pure asm.js).
- h3-js v3 asm.js has two Hermes incompatibilities fixed by `lib/polyfills/emscripten.ts`: a `document` stub and a `TextDecoder` patch.
- GeoJSON build time for 17k cells: ~1,300ms (acceptable; real app pre-generates from disk).

---

## Session 1 — Foundation ✅ DONE

**Goal:** All dependencies installed, SQLite working, land cells generated, theme system live.

- [x] Install remaining packages: `expo-media-library`, `expo-sqlite`, `posthog-react-native`, `expo-location`, `react-native-share`, `expo-store-review`, `@react-native-async-storage/async-storage`
- [x] Download Natural Earth 1:50m land + country polygons → `assets/natural-earth-land-50m.json`, `assets/natural-earth-countries-50m.json`
- [x] Write `scripts/generate-land-cells.js` — Natural Earth polygons → H3 cells with country codes
- [x] Run script → `assets/land-cells.json` with **74,942 entries** (see note below)
- [x] Implement `lib/db/client.ts` — `expo-sqlite` singleton
- [x] Implement `lib/db/schema.ts` — `CREATE TABLE` SQL
- [x] Implement `lib/db/migrations.ts` — migration runner
- [x] Implement `lib/db/queries.ts` — `upsertCell`, `insertManualCell`, `getAllCells`, `getCellByIndex`, `updateGeocode`, `getCellCountByCountry`, `getCellsGroupedByYear`
- [x] Implement `lib/theme/tokens.ts` — design token constants
- [x] Implement `lib/theme/ThemeContext.tsx` — context + `useTheme()` hook, AsyncStorage persistence
- [x] Wire `ThemeProvider` + `runMigrations()` into `app/_layout.tsx`
- [x] Set up `constants/colours.ts` — 6 accent colour presets
- [x] Set up `constants/h3.ts` — `RESOLUTION = 4`, `LAND_CELL_COUNT = 74942`

**Findings:**
- The spec stated "~17,000 land cells at res 4" — actual figure is **74,942**. H3 res 4 has ~288,000 total cells globally; ~29% are land. The spec's count was wrong by ~4×.
- UI copy on Stats screen ("N hexes of 59,400 on Earth") needs updating to reflect the real count.
- The land outline MapLibre layer will render ~75k polygons, not 17k. Real-device performance check needed in Session 4; if needed, hide outline below zoom 3.
- **Native rebuild required** before Sessions 2–3 can be tested: `npx expo run:ios`

---

## Sessions 2 & 3 — Onboarding + scan pipeline ✅ DONE

**Goal (simplified from original spec):** Single-screen onboarding with three in-place states: welcome → scanning → done. Matches design-reference exactly; no carousel.

- [x] Install `react-native-svg` (needed for hex polygon rendering)
- [x] Register `onboarding` route in `app/_layout.tsx`; `gestureEnabled: false` prevents back-swipe to onboarding from main app
- [x] Onboarding gate in `app/(tabs)/_layout.tsx` — checks `onboarding_complete` on mount; renders `<Redirect href="/onboarding" />` if not set (idiomatic Expo Router pattern; `unstable_settings.anchor` does not control launch URL on native)
- [x] Create `app/onboarding/index.tsx` — state machine (`welcome | scanning | done`):
  - `welcome`: hex bloom animation + headline copy + "Scan my photos →" dark pill CTA; `<Stack.Screen options={{ headerShown: false }} />` declared inline to suppress nav header
  - `scanning`: scan ripple filling radially + live `X% · N of M photos` progress driven by real `scanCameraRoll` callback
  - `done`: fully-filled ripple + hex count + "See results →" button; writes `onboarding_complete: 'true'` then navigates to `/(tabs)`
- [x] Build `features/onboarding/HexBloom.tsx`:
  - 6-ring cube-coordinate grid (~127 hexes), pointy-top, radius 11
  - `requestAnimationFrame` loop drives time `t`; per-cell phase `(t*0.6 - dist*0.18) % 2.2`
  - Filled window: phase ∈ [0, 1.1]; opacity `0.35 + wave*0.65`; center hex always filled
- [x] Build `features/onboarding/ScanRipple.tsx`:
  - 5-ring grid, radius 7.6; `filled = (dist/rings)*100 < progress` — radial fill from centre
- [x] Implement `lib/media/scanner.ts`:
  - `scanCameraRoll(onProgress)` — pages `getAssetsAsync` 50 at a time
  - Calls `getAssetInfoAsync(id, { shouldDownloadFromNetwork: false })` per asset
  - GPS present → `h3.geoToH3(lat, lng, 4)` → `upsertCell()` into SQLite
  - Returns `{ hexCount }` of unique H3 indices inserted
  - Throws `PermissionDeniedError` if permission refused (welcome screen shown again)

**Findings:**
- No photo count shown on the welcome CTA — `expo-media-library` requires permission before `totalCount` is available.
- `getAssetInfoAsync` is one call per asset; slow for large libraries but acceptable for MVP. Incremental re-scan via `last_scan_cursor` is a Session 8 follow-up.
- `react-native-svg` added to dependencies; **native rebuild required**: `npx expo run:ios`
- `unstable_settings.anchor` in `_layout.tsx` affects back-navigation history only — it does not set the launch URL on native. Onboarding gate must live in the tabs layout (or an equivalent guarded route), not the root layout.
- `react-native-svg` does not honour `overflow: visible` like web SVG. HexBloom viewBox expanded to `±165` (from `±140`) to contain all hex vertices without clipping.

---

## Session 4 — Map screen core

**Goal:** Full-bleed map with both hex layers, overlay UI, and zoom controls.

- [ ] Implement `lib/h3/hexUtils.ts` — v4-style wrappers (`latLngToCell`, `cellToBoundary`) over h3-js v3 API
- [ ] Implement `lib/h3/geoUtils.ts`:
  - `cellsToGeoJSON(cells: string[]): GeoJSON.FeatureCollection` — converts H3 indices to polygon features
  - Each feature carries `h3index` in properties for tap identification
- [ ] Implement `lib/h3/landCells.ts` — imports `assets/land-cells.json`, exports `landCellIndices: string[]`, `landCellCount: number`, `landCellsByCountry: Record<string, number>`
- [ ] Build `features/map/HexLayer.tsx`:
  - `GeoJSONSource` + `Layer` (fill) for land outline (grey stroke, transparent fill)
  - `GeoJSONSource` + `Layer` (fill) for visited cells (accent colour fill)
  - Land GeoJSON computed once on mount, cached with `useMemo`
  - **Performance check**: if 75k land-outline polygons causes frame drops at world zoom, add `minzoom: 2` or `maxzoom` filter to hide at extreme zoom-out
- [ ] Build `features/map/MapScreen.tsx`:
  - Full-bleed `Map` with inline plain-background style
  - Mounts `HexLayer`
  - Handles tap events — identifies tapped H3 index, opens correct sheet
- [ ] Build `features/map/TopBar.tsx`
- [ ] Build `features/map/ZoomControls.tsx`
- [ ] Build `features/map/StatsBar.tsx`
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
- [ ] Remove Session 0 throwaway spike screen (`app/(tabs)/index.tsx`)
- [ ] Update Stats screen copy: "N hexes of 74,942 land cells" (not 59,400)
- [ ] Final device run: no crashes through the full flow

**Done when:** App works end-to-end on device, all screens match the design reference, no console errors or New Architecture warnings.

---

## Riskiest Technical Unknowns

| # | Risk | Status |
|---|------|--------|
| 1 | **MapLibre + 17k GeoJSON polygons** | ✅ Resolved — smooth at 17k; 75k untested (Session 4) |
| 2 | **h3-js Hermes compatibility** | ✅ Resolved — pinned to v3.7.2 + `lib/polyfills/emscripten.ts` |
| 3 | **`expo-media-library` GPS access** | ⚠️ Implemented — real device test still needed (`getAssetInfoAsync` GPS path) |
| 4 | **New Architecture compatibility** | ⚠️ Partially verified — all packages installed, runtime check pending rebuild |
| 5 | **`react-native-view-shot`** | ⚠️ Not yet installed — verify New Arch support before Session 7 |
| 6 | **Land cell count accuracy** | ✅ Resolved — 74,942 cells confirmed from Natural Earth data |
