# HexPlore — Architecture Reference

## Overview

HexPlore is an iOS-only Expo app (development build, React Native 0.81, New Architecture enabled). It reads GPS coordinates from camera roll photos, maps them to H3 resolution-4 hexagonal grid cells (~1,700 km² each), and shows the user what percentage of the world's land they have visited.

The coverage percentage is calculated against ~17,000 land cells (Natural Earth 1:50m polygons, pre-generated at build time) — not the 59,400 total H3 cells globally.

---

## SQLite Schema

```sql
-- Core cell storage. One row per visited H3 index.
CREATE TABLE visited_cells (
  h3index          TEXT    PRIMARY KEY,
  first_photo_date INTEGER,             -- unix timestamp (ms)
  last_photo_date  INTEGER,             -- unix timestamp (ms)
  photo_count      INTEGER DEFAULT 0,
  source           TEXT    DEFAULT 'photo', -- 'photo' | 'manual'
  place_name       TEXT,                -- lazy geocoded
  region           TEXT,                -- lazy geocoded
  country          TEXT,                -- lazy geocoded
  country_code     TEXT,                -- ISO 3166-1 alpha-2 (for flag emoji)
  geocoded_at      INTEGER,             -- NULL = not yet geocoded
  created_at       INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_visited_cells_country    ON visited_cells(country_code);
CREATE INDEX idx_visited_cells_first_photo ON visited_cells(first_photo_date);
```

No photos table — `expo-media-library` is the source of truth for actual images. SQLite stores counts only.

### AsyncStorage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `posthog_distinct_id` | string (UUID) | Anonymous analytics ID, set once on first launch |
| `accent_colour` | string (hex) | User-selected accent, default `#FF6B5B` |
| `onboarding_complete` | `'true'` | Set when user reaches main app |
| `last_scan_cursor` | string | Last `expo-media-library` pagination cursor for incremental re-scans |

---

## Folder Structure

```
app/
  _layout.tsx                   # Root layout — providers, theme, PostHog init
  +not-found.tsx
  onboarding/
    index.tsx                   # 4-screen paginated carousel
  (tabs)/
    _layout.tsx                 # Bottom tab bar (Map / Stats / Settings)
    index.tsx                   # → features/map/MapScreen
    stats.tsx                   # → features/stats/StatsScreen
    settings.tsx                # → features/settings/SettingsScreen

features/
  onboarding/
    WelcomeScreen.tsx
    HowItWorksScreen.tsx
    ScanningScreen.tsx
    ResultsScreen.tsx
    OnboardingCarousel.tsx      # FlatList carousel + dots indicator
    DotsIndicator.tsx
  map/
    MapScreen.tsx
    HexLayer.tsx                # MapLibre GeoJSON source + two fill layers
    StatsBar.tsx                # Floating stats pill above tab bar
    TopBar.tsx                  # Overlay: title + Share + Recenter buttons
    ZoomControls.tsx
    CellSheet.tsx               # Bottom sheet — visited hex detail
    EmptyCellSheet.tsx          # Bottom sheet — unvisited hex
    PhotoStrip.tsx              # Horizontal scroll of real camera roll photos
    HexNeighborThumbnail.tsx    # 7-hex cluster SVG (cell + 6 neighbours)
  stats/
    StatsScreen.tsx
    HeroNumber.tsx
    CountryList.tsx             # Sorted by % coverage ascending
    BraggingShelf.tsx           # Horizontal scroll: hexes, countries, continents
    HexesPerYearChart.tsx
    InsightCards.tsx
  settings/
    SettingsScreen.tsx
    AccentColourPicker.tsx      # 6 preset swatches, persists via AsyncStorage
    SettingsRow.tsx
    PrivacyPolicyModal.tsx
  share/
    generateShareCard.ts        # react-native-view-shot + react-native-share
    ShareButton.tsx

lib/
  db/
    schema.ts                   # CREATE TABLE SQL strings
    queries.ts                  # All typed SQL query functions
    migrations.ts               # Version-gated migration runner
    client.ts                   # expo-sqlite openDatabaseAsync singleton
  h3/
    landCells.ts                # Imports + caches assets/land-cells.json
    hexUtils.ts                 # Thin wrappers: latLngToCell, cellToBoundary
    geoUtils.ts                 # H3 cell array → GeoJSON FeatureCollection
  media/
    scanner.ts                  # expo-media-library scan loop, GPS extraction
    geocoder.ts                 # Lazy reverse geocode queue via expo-location
  analytics/
    posthog.ts                  # PostHog init, typed capture() helpers
  theme/
    ThemeContext.tsx             # Accent colour context + useTheme hook
    tokens.ts                   # Design token constants

components/
  HexBloom.tsx                  # Reanimated concentric hex ring animation
  BottomSheet.tsx               # Generic swipe-to-dismiss (Gesture Handler)
  PillButton.tsx                # Rounded CTA pill
  StatChip.tsx                  # Small labelled stat
  FlagEmoji.tsx                 # Country flag from ISO 3166-1 alpha-2 code

scripts/
  generate-land-cells.js        # Node.js: Natural Earth GeoJSON → land-cells.json

assets/
  land-cells.json               # Pre-generated by script (committed, ~17k H3 indices)
  natural-earth-land-50m.json   # Source Natural Earth GeoJSON

constants/
  h3.ts                         # RESOLUTION = 4, LAND_CELL_COUNT ≈ 17000
  colours.ts                    # Accent colour presets array
```

---

## Key Architectural Decisions

### 1. MapLibre layer strategy

Two GeoJSON sources are mounted on the map:

- **`land-outline`** — all ~17k land cells rendered as hollow hex polygons (grey stroke, transparent fill). Computed once from `assets/land-cells.json` via `lib/h3/geoUtils.ts` on app init and held in memory. Never recomputed on re-renders.
- **`visited`** — only visited cells, queried from SQLite and re-derived when the cell set changes. Rendered as filled hex polygons in the accent colour.

MapLibre is configured with a minimal inline style JSON (no tile URL) that sets the background to `#FAFAF7`. No API key required.

### 2. Incremental scan

On re-scan, `lib/media/scanner.ts` reads `last_scan_cursor` from AsyncStorage and passes it as the `after` parameter to `expo-media-library`'s `getAssetsAsync`. Only assets newer than the cursor are processed. The cursor is updated atomically after each successful batch insert.

### 3. Lazy geocoding queue

`lib/media/geocoder.ts` maintains a FIFO queue of `h3index` values that need geocoding. It processes one at a time with a 1-second delay between calls (iOS rate-limits `reverseGeocodeAsync`). Results are written back to `visited_cells` immediately. A cell is only enqueued when it is first viewed (tapped or loaded in Stats), not during the scan.

### 4. Theme distribution

Accent colour is loaded from AsyncStorage on startup and held in `ThemeContext`. All components access it via `useTheme()`. Changing the colour in Settings writes to AsyncStorage and updates the context synchronously — no restart required.

### 5. No base map tiles

MapLibre is initialised with an inline style that specifies only a background colour (`#FAFAF7`) and no tile sources. This keeps the hex grid as the sole visual element on the map, avoids any API key dependency, and produces the clean dotted-map aesthetic described in the spec.

### 6. New Architecture compatibility

`newArchEnabled: true` and `reactCompiler: true` are set in `app.json`. Before installing each package, check its GitHub releases for explicit RN 0.81 / New Architecture support. Packages with known risk:

| Package | Risk | Mitigation |
|---------|------|-----------|
| `@maplibre/maplibre-react-native` | May require specific version for RN 0.81 | Check release notes; pin version |
| `react-native-share` | Turbo Module support varies | Check `newArchitecture` label on their repo |
| `react-native-view-shot` | Not in original spec; needed for share card | Verify New Arch support before adopting |

### 7. Country coverage computation

`assets/land-cells.json` includes a `country_code` field for each cell (added by `generate-land-cells.js` using a point-in-polygon test against Natural Earth country polygons). This enables the Stats screen to compute per-country totals without a runtime join — just group `visited_cells` by `country_code` and divide by the precomputed per-country land cell count.

---

## Design Tokens

```ts
// lib/theme/tokens.ts
export const colours = {
  background: '#FAFAF7',
  text:       '#0E0E0C',
  accentDefault: '#FF6B5B',
  surface:    'rgba(255,255,255,0.86)',
};

export const radii = {
  card:  24,
  pill:  30,
};

export const shadow = {
  // iOS shadow props
  shadowColor:   '#0E0E0C',
  shadowOffset:  { width: 0, height: 12 },
  shadowOpacity: 0.08,
  shadowRadius:  40,
};
```

Accent colour presets (Settings picker):

| Name | Hex |
|------|-----|
| Coral (default) | `#FF6B5B` |
| Teal | `#2DD4BF` |
| Burnt Orange | `#EA580C` |
| Indigo | `#6366F1` |
| Sage | `#84A98C` |
| Slate | `#64748B` |
