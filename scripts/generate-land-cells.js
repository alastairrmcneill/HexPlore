#!/usr/bin/env node
// Generates assets/land-cells.json — array of { h3index, country_code }
// for all H3 resolution-4 cells that intersect land.
//
// Inputs:
//   assets/natural-earth-land-50m.json     — Natural Earth 1:50m land polygons
//   assets/natural-earth-countries-50m.json — Natural Earth 1:50m country polygons
//
// Outputs:
//   assets/land-cells.json
//
// Algorithm:
//   Polyfill at resolution 5, then convert to res-4 parents. This means any
//   H3 res-5 cell whose centroid falls within a polygon contributes its parent
//   to the output — catching coastal cells and small island nations that the
//   direct res-4 polyfill misses entirely (e.g. Mauritius, Malta, Singapore).
//   Countries that still have 0 cells after polyfill get their centroid cell
//   force-added as a fallback.

const fs = require('fs');
const path = require('path');
const h3 = require('h3-js');
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
const { point } = require('@turf/helpers');

const RESOLUTION = 4;
const INNER_RES = 5; // polyfill at finer resolution, then parent to RESOLUTION
const ASSETS = path.join(__dirname, '..', 'assets');

function loadJSON(filename) {
  const p = path.join(ASSETS, filename);
  if (!fs.existsSync(p)) {
    console.error(`Missing: ${p}`);
    console.error('Run: npm run download-geo-data');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// Polyfill at INNER_RES, convert to RESOLUTION parents.
// Falls back to direct RESOLUTION polyfill if inner produces nothing.
function polygonToCells(geoJsonRings) {
  try {
    const fine = h3.polyfill(geoJsonRings, INNER_RES, true);
    if (fine.length > 0) {
      return [...new Set(fine.map(c => h3.h3ToParent(c, RESOLUTION)))];
    }
    // Polygon too small even at inner res — fall back to coarse polyfill
    const coarse = h3.polyfill(geoJsonRings, RESOLUTION, true);
    return coarse;
  } catch {
    return [];
  }
}

function getFeatureCoordinates(feature) {
  const { type, coordinates } = feature.geometry;
  if (type === 'Polygon') return [coordinates];
  if (type === 'MultiPolygon') return coordinates;
  return [];
}

function getCountryCode(feature) {
  const p = feature.properties;
  const candidates = [p.ISO_A2, p.iso_a2, p.ISO_A2_EH, p.WB_A2, p.ADM0_A3];
  for (const code of candidates) {
    if (code && code !== '-99') return code;
  }
  return null;
}

// Compute a representative point (centroid) for a polygon ring.
// Uses simple arithmetic mean of vertices — good enough for a fallback lat/lng.
function ringCentroid(ring) {
  let sumLat = 0, sumLng = 0;
  for (const [lng, lat] of ring) { sumLat += lat; sumLng += lng; }
  return [sumLat / ring.length, sumLng / ring.length];
}

function featureCentroid(feature) {
  const polys = getFeatureCoordinates(feature);
  if (polys.length === 0) return null;
  // Use the largest polygon's outer ring
  const outer = polys[0][0];
  return outer ? ringCentroid(outer) : null;
}

console.log('Loading GeoJSON sources…');
const landGeo = loadJSON('natural-earth-land-50m.json');
const countriesGeo = loadJSON('natural-earth-countries-50m.json');

// Step 1 — collect all land cells using res-5 polyfill → res-4 parents
console.log('Generating land cells (res-5 → res-4)…');
const landCells = new Set();

for (const feature of landGeo.features) {
  for (const polygon of getFeatureCoordinates(feature)) {
    for (const cell of polygonToCells(polygon)) {
      landCells.add(cell);
    }
  }
}

// Also add cells from country polygons (catches cells missed by merged land polyfill)
for (const feature of countriesGeo.features) {
  for (const polygon of getFeatureCoordinates(feature)) {
    for (const cell of polygonToCells(polygon)) {
      landCells.add(cell);
    }
  }
}
console.log(`  Land cells: ${landCells.size}`);

// Step 2 — assign country codes by centroid point-in-polygon test.
// This is more accurate than "first polyfill wins" for border cells because
// the H3 cell centroid sits unambiguously in one country, regardless of which
// country's polygon happens to be processed first.
console.log('Assigning country codes via centroid point-in-polygon…');

// Pre-compute per-feature bounding boxes to skip most polygon tests cheaply.
const countryEntries = countriesGeo.features
  .map(feature => {
    const code = getCountryCode(feature);
    if (!code || code === '-99') return null;
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const poly of getFeatureCoordinates(feature)) {
      for (const ring of poly) {
        for (const [lng, lat] of ring) {
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
      }
    }
    return { feature, code, minLng, maxLng, minLat, maxLat };
  })
  .filter(Boolean);

const cellToCountry = new Map();
const countryCellCount = new Map();

let processed = 0;
for (const cell of landCells) {
  // h3.h3ToGeo returns [lat, lng]
  const [lat, lng] = h3.h3ToGeo(cell);
  const pt = point([lng, lat]);

  for (const entry of countryEntries) {
    // Cheap bbox pre-filter
    if (lat < entry.minLat || lat > entry.maxLat || lng < entry.minLng || lng > entry.maxLng) continue;
    if (booleanPointInPolygon(pt, entry.feature)) {
      cellToCountry.set(cell, entry.code);
      countryCellCount.set(entry.code, (countryCellCount.get(entry.code) ?? 0) + 1);
      break;
    }
  }

  processed++;
  if (processed % 10000 === 0) console.log(`  Processed ${processed} / ${landCells.size}…`);
}

// Step 3 — centroid fallback for any country with 0 assigned cells
// This catches sovereign states that are too small for any H3 centroid to land
// inside their polygon at res 5 (e.g. very tiny atolls, city-states).
let fallbackCount = 0;
for (const feature of countriesGeo.features) {
  const code = getCountryCode(feature);
  if (!code || code === '-99') continue;
  if ((countryCellCount.get(code) ?? 0) > 0) continue; // already has cells

  const centroid = featureCentroid(feature);
  if (!centroid) continue;
  const [lat, lng] = centroid;
  try {
    const cell = h3.geoToH3(lat, lng, RESOLUTION);
    landCells.add(cell);
    // Force-assign even if the cell was already claimed by a neighbour.
    // For countries too small to have any H3 centroid land inside their polygon,
    // this guarantees one cell in the output. Overriding a neighbouring country's
    // cell for a single hex is acceptable.
    cellToCountry.set(cell, code);
    countryCellCount.set(code, 1);
    fallbackCount++;
    console.log(`  Centroid fallback: ${code} → ${cell} (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
  } catch {}
}
console.log(`  Centroid fallbacks applied: ${fallbackCount}`);

const unassigned = [...landCells].filter(c => !cellToCountry.has(c)).length;
console.log(`  Assigned: ${cellToCountry.size}  Unassigned: ${unassigned}`);

// Step 4 — write output
const output = [...landCells].map(h3index => ({
  h3index,
  country_code: cellToCountry.get(h3index) ?? null,
}));

const outPath = path.join(ASSETS, 'land-cells.json');
fs.writeFileSync(outPath, JSON.stringify(output));
console.log(`\nWrote ${output.length} cells → ${outPath}`);

// Sanity check: list countries with 0 cells
const finalCounts = {};
for (const { country_code } of output) {
  if (country_code) finalCounts[country_code] = (finalCounts[country_code] ?? 0) + 1;
}
const zero = ['MU', 'MV', 'SC', 'MT', 'SG', 'BB', 'LC', 'VC', 'GD', 'KN'];
console.log('\nSmall-island sanity check:');
for (const code of zero) {
  console.log(`  ${code}: ${finalCounts[code] ?? 0} cells`);
}
