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

const fs = require('fs');
const path = require('path');
const h3 = require('h3-js');

const RESOLUTION = 4;
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

// h3-js v3 polyfill expects coordinates as [[lat,lng],...] unless isGeoJson=true
// With isGeoJson=true it accepts [[lng,lat],...] (GeoJSON order)
function polygonToCells(geoJsonRings) {
  try {
    return h3.polyfill(geoJsonRings, RESOLUTION, true);
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
  // Natural Earth uses ISO_A2 — fall back through alternatives for territories
  return p.ISO_A2 || p.iso_a2 || p.ADM0_A3 || null;
}

console.log('Loading GeoJSON sources…');
const landGeo = loadJSON('natural-earth-land-50m.json');
const countriesGeo = loadJSON('natural-earth-countries-50m.json');

// Step 1 — collect all land cells
console.log('Generating land cells…');
const landCells = new Set();

for (const feature of landGeo.features) {
  for (const polygon of getFeatureCoordinates(feature)) {
    for (const cell of polygonToCells(polygon)) {
      landCells.add(cell);
    }
  }
}
console.log(`  Land cells: ${landCells.size}`);

// Step 2 — build cell → country_code map from country polygons
console.log('Assigning country codes…');
const cellToCountry = new Map();

for (const feature of countriesGeo.features) {
  const code = getCountryCode(feature);
  if (!code || code === '-99') continue;

  for (const polygon of getFeatureCoordinates(feature)) {
    for (const cell of polygonToCells(polygon)) {
      // Only assign if the cell is a known land cell and not already assigned
      if (landCells.has(cell) && !cellToCountry.has(cell)) {
        cellToCountry.set(cell, code);
      }
    }
  }
}

const unassigned = [...landCells].filter(c => !cellToCountry.has(c)).length;
console.log(`  Assigned: ${cellToCountry.size}  Unassigned: ${unassigned}`);

// Step 3 — write output
const output = [...landCells].map(h3index => ({
  h3index,
  country_code: cellToCountry.get(h3index) ?? null,
}));

const outPath = path.join(ASSETS, 'land-cells.json');
fs.writeFileSync(outPath, JSON.stringify(output));
console.log(`\nWrote ${output.length} cells → ${outPath}`);
