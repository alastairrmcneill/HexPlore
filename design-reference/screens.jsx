// screens.jsx — Onboarding, Map, CellSheet, Stats, Share + photo dataset

// ─── Photo locations dataset ─────────────────────────────────────────────
// [name, region, country, flag, lon, lat, dateISO, photoCount, spread]
const PHOTO_LOCATIONS = [
  // UK & Ireland
  { name: 'London',         region: 'England, UK',                country: 'United Kingdom', flag: '🇬🇧', lon:  -0.13, lat: 51.51, date: '2024-06-14', photos: 87,  spread: 1 },
  { name: 'Edinburgh',      region: 'Scotland, UK',               country: 'United Kingdom', flag: '🇬🇧', lon:  -3.19, lat: 55.95, date: '2024-06-19', photos: 42,  spread: 1 },
  { name: 'Isle of Skye',   region: 'Scotland, UK',               country: 'United Kingdom', flag: '🇬🇧', lon:  -6.20, lat: 57.27, date: '2024-06-21', photos: 64,  spread: 1 },
  // France
  { name: 'Paris',          region: 'Île-de-France, France',      country: 'France',         flag: '🇫🇷', lon:   2.35, lat: 48.85, date: '2024-06-25', photos: 124, spread: 1 },
  { name: 'Lyon',           region: 'Auvergne-Rhône-Alpes',       country: 'France',         flag: '🇫🇷', lon:   4.83, lat: 45.76, date: '2024-06-29', photos: 38,  spread: 1 },
  { name: 'Nice',           region: "Provence-Alpes-Côte d'Azur", country: 'France',         flag: '🇫🇷', lon:   7.27, lat: 43.70, date: '2024-07-02', photos: 56,  spread: 1 },
  // Spain & Portugal
  { name: 'Barcelona',      region: 'Catalonia, Spain',           country: 'Spain',          flag: '🇪🇸', lon:   2.17, lat: 41.39, date: '2024-07-05', photos: 156, spread: 1 },
  { name: 'Madrid',         region: 'Spain',                      country: 'Spain',          flag: '🇪🇸', lon:  -3.70, lat: 40.42, date: '2024-07-09', photos: 88,  spread: 1 },
  { name: 'Lisbon',         region: 'Portugal',                   country: 'Portugal',       flag: '🇵🇹', lon:  -9.14, lat: 38.72, date: '2024-07-13', photos: 73,  spread: 1 },
  // Italy
  { name: 'Rome',           region: 'Lazio, Italy',               country: 'Italy',          flag: '🇮🇹', lon:  12.50, lat: 41.90, date: '2023-09-12', photos: 211, spread: 1 },
  { name: 'Florence',       region: 'Tuscany, Italy',             country: 'Italy',          flag: '🇮🇹', lon:  11.26, lat: 43.77, date: '2023-09-17', photos: 89,  spread: 1 },
  { name: 'Venice',         region: 'Veneto, Italy',              country: 'Italy',          flag: '🇮🇹', lon:  12.34, lat: 45.44, date: '2023-09-21', photos: 134, spread: 1 },
  // Germany / Iceland
  { name: 'Berlin',         region: 'Germany',                    country: 'Germany',        flag: '🇩🇪', lon:  13.40, lat: 52.52, date: '2023-04-08', photos: 56,  spread: 1 },
  { name: 'Reykjavík',      region: 'Iceland',                    country: 'Iceland',        flag: '🇮🇸', lon: -21.94, lat: 64.15, date: '2023-02-14', photos: 68,  spread: 1 },
  { name: 'Vík',            region: 'South, Iceland',             country: 'Iceland',        flag: '🇮🇸', lon: -19.01, lat: 63.42, date: '2023-02-16', photos: 41,  spread: 1 },
  // Japan
  { name: 'Tokyo',          region: 'Japan',                      country: 'Japan',          flag: '🇯🇵', lon: 139.69, lat: 35.69, date: '2025-04-07', photos: 312, spread: 1 },
  { name: 'Kyoto',          region: 'Japan',                      country: 'Japan',          flag: '🇯🇵', lon: 135.77, lat: 35.01, date: '2025-04-01', photos: 245, spread: 1 },
  { name: 'Osaka',          region: 'Japan',                      country: 'Japan',          flag: '🇯🇵', lon: 135.50, lat: 34.69, date: '2025-04-04', photos: 78,  spread: 1 },
  // Thailand
  { name: 'Bangkok',        region: 'Thailand',                   country: 'Thailand',       flag: '🇹🇭', lon: 100.50, lat: 13.75, date: '2024-12-22', photos: 102, spread: 1 },
  { name: 'Chiang Mai',     region: 'Thailand',                   country: 'Thailand',       flag: '🇹🇭', lon:  98.99, lat: 18.79, date: '2024-12-28', photos: 64,  spread: 1 },
  // USA
  { name: 'New York',       region: 'New York, USA',              country: 'United States',  flag: '🇺🇸', lon: -74.00, lat: 40.71, date: '2022-11-04', photos: 178, spread: 1 },
  { name: 'San Francisco',  region: 'California, USA',            country: 'United States',  flag: '🇺🇸', lon:-122.42, lat: 37.77, date: '2023-07-19', photos: 223, spread: 1 },
  { name: 'Yosemite',       region: 'California, USA',            country: 'United States',  flag: '🇺🇸', lon:-119.54, lat: 37.86, date: '2023-07-22', photos:  96, spread: 1 },
  { name: 'Denver',         region: 'Colorado, USA',              country: 'United States',  flag: '🇺🇸', lon:-104.99, lat: 39.74, date: '2023-08-02', photos:  41, spread: 1 },
  { name: 'Joshua Tree',    region: 'California, USA',            country: 'United States',  flag: '🇺🇸', lon:-115.90, lat: 33.87, date: '2023-07-26', photos:  52, spread: 1 },
  // Mexico
  { name: 'Mexico City',    region: 'Mexico',                     country: 'Mexico',         flag: '🇲🇽', lon: -99.13, lat: 19.43, date: '2024-02-11', photos:  87, spread: 1 },
  { name: 'Tulum',          region: 'Quintana Roo, Mexico',       country: 'Mexico',         flag: '🇲🇽', lon: -87.47, lat: 20.21, date: '2024-02-17', photos: 142, spread: 1 },
  // Australia
  { name: 'Sydney',         region: 'NSW, Australia',             country: 'Australia',      flag: '🇦🇺', lon: 151.21, lat:-33.87, date: '2025-01-08', photos: 167, spread: 1 },
  { name: 'Margaret River', region: 'Western Australia',          country: 'Australia',      flag: '🇦🇺', lon: 115.07, lat:-33.95, date: '2025-01-19', photos:  78, spread: 1 },
  { name: 'Perth',          region: 'Western Australia',          country: 'Australia',      flag: '🇦🇺', lon: 115.86, lat:-31.95, date: '2025-01-22', photos:  63, spread: 1 },
  // South Africa
  { name: 'Cape Town',      region: 'Western Cape',               country: 'South Africa',   flag: '🇿🇦', lon:  18.42, lat:-33.92, date: '2024-09-03', photos: 145, spread: 1 },
  // Argentina / Chile
  { name: 'Buenos Aires',   region: 'Argentina',                  country: 'Argentina',      flag: '🇦🇷', lon: -58.38, lat:-34.61, date: '2023-11-12', photos:  89, spread: 1 },
  { name: 'El Calafate',    region: 'Patagonia, Argentina',       country: 'Argentina',      flag: '🇦🇷', lon: -72.27, lat:-50.33, date: '2023-11-19', photos:  58, spread: 1 },
  // India / Morocco
  { name: 'Marrakech',      region: 'Morocco',                    country: 'Morocco',        flag: '🇲🇦', lon:  -7.99, lat: 31.63, date: '2022-05-08', photos:  91, spread: 1 },
  { name: 'Jaipur',         region: 'Rajasthan, India',           country: 'India',          flag: '🇮🇳', lon:  75.78, lat: 26.92, date: '2022-02-14', photos:  68, spread: 1 },
];

// Build visited set + per-cell metadata
const VISITED = new Set();
const VISITED_INFO = new Map();   // key -> { location, neighborOf? }
for (const loc of PHOTO_LOCATIONS) {
  const [c, r] = lonLatToColRow(loc.lon, loc.lat);
  const center = c + ',' + r;
  if (LAND_CELLS.has(center)) {
    VISITED.add(center);
    VISITED_INFO.set(center, loc);
  }
  // simple ring of 6 neighbors marked too (covers ~150km radius)
  if (loc.spread >= 1) {
    const offs = (r & 1)
      ? [[1,0],[-1,0],[0,-1],[1,-1],[0,1],[1,1]]
      : [[1,0],[-1,0],[-1,-1],[0,-1],[-1,1],[0,1]];
    for (const [dc, dr] of offs) {
      const k = (c + dc) + ',' + (r + dr);
      if (LAND_CELLS.has(k)) {
        VISITED.add(k);
        if (!VISITED_INFO.has(k)) VISITED_INFO.set(k, loc);
      }
    }
  }
}

// Aggregate by country
const COUNTRY_STATS = (() => {
  const map = new Map();
  for (const [key, loc] of VISITED_INFO.entries()) {
    if (!map.has(loc.country)) {
      map.set(loc.country, { country: loc.country, flag: loc.flag, hexes: 0, areaPct: 0, lonRange: [180,-180], latRange: [90,-90] });
    }
    const s = map.get(loc.country);
    s.hexes += 1;
  }
  // approx % coverage of country (illustrative — fixed lookup)
  const COUNTRY_COVERAGE = {
    'United Kingdom': 9.2, 'France': 4.1, 'Spain': 3.6, 'Portugal': 2.8,
    'Italy': 5.3, 'Germany': 1.4, 'Iceland': 6.7, 'Japan': 8.1,
    'Thailand': 3.0, 'United States': 1.8, 'Mexico': 2.4, 'Australia': 1.1,
    'South Africa': 1.6, 'Argentina': 0.9, 'Morocco': 1.3, 'India': 0.4,
  };
  // bounding boxes per country for thumbnails
  const COUNTRY_BBOX = {
    'United Kingdom': [[-9, 2],[49.5, 60.5]],
    'France':         [[-5, 9],[42, 51.5]],
    'Spain':          [[-10, 4.5],[35.5, 44]],
    'Portugal':       [[-10, -5.5],[36.5, 42.5]],
    'Italy':          [[6, 19],[36, 47.5]],
    'Germany':        [[5, 16],[47, 55]],
    'Iceland':        [[-25, -13],[63, 67]],
    'Japan':          [[129, 146],[30, 46]],
    'Thailand':       [[97, 106],[6, 21]],
    'United States':  [[-125, -67],[24, 49.5]],
    'Mexico':         [[-118, -86],[14.5, 33]],
    'Australia':      [[112, 154],[-44, -10.5]],
    'South Africa':   [[16, 33],[-35, -22]],
    'Argentina':      [[-74, -53],[-55, -22]],
    'Morocco':        [[-13, -1],[27.5, 36]],
    'India':          [[68, 89],[8, 35]],
  };
  for (const s of map.values()) {
    s.areaPct = COUNTRY_COVERAGE[s.country] ?? 1.0;
    s.bbox = COUNTRY_BBOX[s.country];
  }
  return [...map.values()].sort((a, b) => b.hexes - a.hexes);
})();

// World totals
// NB: our coarse hex grid has ~hundreds of land cells for performance, but the
// app's real model is 50x50km hexagons (~59,400 over Earth's land). Display
// numbers reflect that real-grid scale; visual hex coverage is illustrative.
const TOTAL_VISITED = VISITED.size;
const TOTAL_LAND = LAND_CELLS.size;
const REAL_TOTAL_LAND = 59400;                 // 50km hex count, Earth's land
const REAL_VISITED = Math.round(TOTAL_VISITED * (REAL_TOTAL_LAND / TOTAL_LAND) * 0.014);
const PCT_WORLD = (REAL_VISITED / REAL_TOTAL_LAND) * 100;
const COUNTRY_COUNT = COUNTRY_STATS.length;

// Yearly coverage (counts of distinct cells per year)
const YEAR_COVERAGE = (() => {
  const m = new Map();
  for (const [key, loc] of VISITED_INFO.entries()) {
    const y = loc.date.slice(0, 4);
    m.set(y, (m.get(y) || 0) + 1);
  }
  return [...m.entries()].map(([y, n]) => ({ year: y, hexes: n })).sort((a,b) => a.year.localeCompare(b.year));
})();

// ─── Onboarding screen ──────────────────────────────────────────────────
function OnboardingScreen({ accent, onScan }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#FAFAF7',
      display: 'flex', flexDirection: 'column',
      paddingTop: 56, paddingBottom: 34,
    }}>
      {/* hero hex bloom */}
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', position: 'relative' }}>
        <OnboardingHexBloom accent={accent} />
      </div>
      {/* copy */}
      <div style={{ padding: '0 28px 8px' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase' }}>
          HexPlore · v0.1
        </div>
        <h1 style={{
          fontSize: 38, lineHeight: 1.02, fontWeight: 600, margin: '14px 0 12px',
          letterSpacing: '-0.025em', textWrap: 'balance',
        }}>
          See how much of the world you've actually been to.
        </h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.45, color: 'rgba(14,14,12,0.62)', margin: 0, maxWidth: 320 }}>
          HexPlore reads the location of photos in your camera roll and fills in a hexagon for every 50&nbsp;km square you've visited. Nothing leaves your device.
        </p>
      </div>
      {/* CTA */}
      <div style={{ padding: '24px 20px 16px' }}>
        <button onClick={onScan} style={{
          width: '100%', padding: '17px 18px', borderRadius: 18,
          background: '#0E0E0C', color: '#FAFAF7', border: 'none',
          fontFamily: 'inherit', fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer',
        }}>
          <span>Scan my photos</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="mono" style={{ fontSize: 12, opacity: 0.55 }}>14,238 photos</span>
            <span style={{ fontSize: 18 }}>→</span>
          </span>
        </button>
        <div style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(14,14,12,0.42)', marginTop: 12 }}>
          Photo data stays on this device.
        </div>
      </div>
    </div>
  );
}

function OnboardingHexBloom({ accent }) {
  // animated dot bloom — concentric rings filling in
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, start = performance.now();
    const tick = (now) => { setT((now - start) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const cells = [];
  const rings = 6;
  for (let q = -rings; q <= rings; q++) {
    for (let r = -rings; r <= rings; r++) {
      const s = -q - r;
      const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
      if (dist > rings) continue;
      // hex coords → pixel
      const size = 14;
      const x = size * Math.sqrt(3) * (q + r / 2);
      const y = size * 1.5 * r;
      const phase = (t * 0.6 - dist * 0.18) % 2.2;
      const filled = phase > 0 && phase < 1.1;
      const wave = Math.max(0, 1 - Math.abs(phase - 0.5) * 2);
      cells.push({ x, y, dist, filled, wave });
    }
  }
  return (
    <svg width="280" height="280" viewBox="-140 -140 280 280" style={{ overflow: 'visible' }}>
      {cells.map((c, i) => {
        const fill = c.dist === 0 ? accent : (c.filled ? accent : 'transparent');
        const opacity = c.dist === 0 ? 1 : (c.filled ? 0.35 + c.wave * 0.65 : 1);
        return (
          <g key={i} opacity={opacity}>
            <Hex cx={c.x} cy={c.y} r={11} fill={fill}
                 stroke={c.filled ? 'none' : 'rgba(14,14,12,0.16)'} strokeWidth={1} />
          </g>
        );
      })}
    </svg>
  );
}
function Hex({ cx, cy, r, fill, stroke, strokeWidth }) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push((cx + r * Math.cos(a)).toFixed(2) + ',' + (cy + r * Math.sin(a)).toFixed(2));
  }
  return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
}

// ─── Map screen ─────────────────────────────────────────────────────────
function MapScreen({ accent, density, onOpenStats, onOpenShare, onOpenCell, mapRef }) {
  const [zoom, setZoom] = React.useState(1);
  const W = 402, H = 874;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAFAF7', overflow: 'hidden' }}>
      {/* map canvas full-bleed */}
      <HexMap
        ref={mapRef}
        width={W} height={H}
        visited={VISITED}
        accent={accent}
        density={density}
        initialView={{ centerLon: 20, centerLat: 30, zoom: 2.7 }}
        onCellTap={(cell) => {
          const info = VISITED_INFO.get(cell.key);
          if (info) onOpenCell({ cell, location: info });
        }}
        onZoomChange={setZoom}
      />

      {/* top gradient mask + status-bar safe area */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 110, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(250,250,247,0.95) 30%, rgba(250,250,247,0))',
      }} />

      {/* top app bar */}
      <div style={{
        position: 'absolute', top: 56, left: 16, right: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', color: 'rgba(14,14,12,0.45)', textTransform: 'uppercase' }}>
            World coverage
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 2 }}>
            HexPlore
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <GlassBtn onClick={onOpenShare} label="↗" title="Share" />
          <GlassBtn onClick={() => mapRef.current?.setView({ centerLon: 20, centerLat: 30, zoom: 2.7 })} label="⌖" title="Recenter" />
        </div>
      </div>

      {/* zoom indicator */}
      <div className="mono" style={{
        position: 'absolute', top: 138, left: 20, fontSize: 10.5,
        color: 'rgba(14,14,12,0.5)', letterSpacing: '0.08em',
      }}>
        ZOOM {zoom.toFixed(2).replace(/^0+/,'')}× · {zoom < 1.5 ? 'WORLD' : zoom < 3 ? 'REGIONAL' : 'LOCAL'}
      </div>

      {/* zoom controls */}
      <div style={{
        position: 'absolute', right: 14, top: '38%', display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <ZoomBtn onClick={() => mapRef.current?.setView({ zoom: Math.min(7, zoom * 1.5) })}>+</ZoomBtn>
        <ZoomBtn onClick={() => mapRef.current?.setView({ zoom: Math.max(0.85, zoom / 1.5) })}>−</ZoomBtn>
      </div>

      {/* stats bar */}
      <div style={{
        position: 'absolute', left: 14, right: 14, bottom: 108,
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(14,14,12,0.06)',
        borderRadius: 22, padding: '14px 16px',
        display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12,
        boxShadow: '0 12px 40px rgba(14,14,12,0.08)',
      }}>
        <StatCell label="World covered" value={PCT_WORLD.toFixed(2) + '%'} mono accent={accent} />
        <StatCell label="Hexes" value={REAL_VISITED.toLocaleString()} mono />
        <StatCell label="Countries" value={COUNTRY_COUNT} mono onClick={onOpenStats} chevron />
      </div>

      {/* bottom nav handled by app */}
    </div>
  );
}

function GlassBtn({ onClick, label, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 38, height: 38, borderRadius: 19, border: '1px solid rgba(14,14,12,0.08)',
      background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      fontSize: 18, color: '#0E0E0C', cursor: 'pointer', fontFamily: 'inherit',
      display: 'grid', placeItems: 'center',
      boxShadow: '0 4px 12px rgba(14,14,12,0.06)',
    }}>{label}</button>
  );
}
function ZoomBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 12, border: '1px solid rgba(14,14,12,0.08)',
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)', cursor: 'pointer',
      fontSize: 19, fontWeight: 400, color: '#0E0E0C', fontFamily: 'inherit',
      display: 'grid', placeItems: 'center',
      boxShadow: '0 2px 8px rgba(14,14,12,0.05)',
    }}>{children}</button>
  );
}

function StatCell({ label, value, mono, accent, onClick, chevron }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', gap: 2, cursor: onClick ? 'pointer' : 'default',
    }}>
      <div className="mono" style={{
        fontSize: 9.5, letterSpacing: '0.14em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase',
      }}>{label}{chevron && ' ›'}</div>
      <div className={mono ? 'mono' : ''} style={{
        fontSize: 19, fontWeight: 500, color: accent || '#0E0E0C',
        letterSpacing: '-0.015em', fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
    </div>
  );
}

// ─── Cell detail bottom sheet ───────────────────────────────────────────
function CellSheet({ open, cell, location, accent, onClose }) {
  const [drag, setDrag] = React.useState(0);
  const dragRef = React.useRef(null);

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { sy: e.clientY, pid: e.pointerId };
  }
  function onPointerMove(e) {
    const d = dragRef.current; if (!d || d.pid !== e.pointerId) return;
    setDrag(Math.max(0, e.clientY - d.sy));
  }
  function onPointerUp() {
    const d = dragRef.current;
    if (drag > 110) { onClose(); }
    setDrag(0);
    dragRef.current = null;
  }

  if (!open || !location) return null;
  const date = new Date(location.date);
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(14,14,12,0.18)',
        opacity: open ? 1 : 0, transition: 'opacity 0.2s',
      }} />
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: '#FAFAF7', borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: '10px 22px 30px',
          transform: `translateY(${drag}px)`,
          transition: drag === 0 ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
          boxShadow: '0 -10px 40px rgba(14,14,12,0.18)',
          touchAction: 'none',
        }}
      >
        <div style={{
          width: 38, height: 4, borderRadius: 2, background: 'rgba(14,14,12,0.18)',
          margin: '6px auto 18px',
        }} />

        {/* identity row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{
            flexShrink: 0, marginTop: 4,
          }}>
            <HexThumb visited={new Set([cell.col + ',' + cell.row])}
                      focusLonRange={[location.lon - 6, location.lon + 6]}
                      focusLatRange={[location.lat - 5, location.lat + 5]}
                      accent={accent} size={62} includeOutline />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase' }}>
              {location.flag} &nbsp;{location.country}
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 4 }}>
              {location.name}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(14,14,12,0.55)', marginTop: 2 }}>
              {location.region}
            </div>
          </div>
        </div>

        {/* metric strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          padding: '14px 0', borderTop: '1px solid rgba(14,14,12,0.07)',
          borderBottom: '1px solid rgba(14,14,12,0.07)', marginBottom: 16,
        }}>
          <Metric label="First photo" value={dateStr.split(' ').slice(0,2).join(' ')} sub={dateStr.split(' ')[2]} />
          <Metric label="Photos here" value={location.photos} mono />
          <Metric label="Coords" value={`${location.lat.toFixed(2)}°`} sub={`${location.lon.toFixed(2)}°`} mono />
        </div>

        {/* photo strip */}
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>
          Recent photos
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="noscroll">
          {Array.from({ length: 6 }).map((_, i) => (
            <PhotoSlot key={i} location={location} idx={i} />
          ))}
        </div>
      </div>
    </>
  );
}

function Metric({ label, value, sub, mono }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase' }}>{label}</div>
      <div className={mono ? 'mono' : ''} style={{ fontSize: 16, fontWeight: 500, marginTop: 4, letterSpacing: '-0.01em' }}>{value}</div>
      {sub && <div className="mono" style={{ fontSize: 11.5, color: 'rgba(14,14,12,0.5)', marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function PhotoSlot({ location, idx }) {
  // procedural placeholder: hash → hue → striped bg
  const seed = (location.name.charCodeAt(0) * 31 + idx * 7) % 360;
  const hueA = (seed + 30) % 360, hueB = (seed + 80) % 360;
  return (
    <div style={{
      width: 92, height: 110, borderRadius: 12, flexShrink: 0,
      background: `repeating-linear-gradient(135deg,
        oklch(0.78 0.04 ${hueA}) 0 12px,
        oklch(0.85 0.03 ${hueB}) 12px 24px)`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="mono" style={{
        position: 'absolute', left: 8, bottom: 8, fontSize: 9, color: 'rgba(255,255,255,0.85)',
        letterSpacing: '0.1em',
      }}>IMG_{(8421 + idx).toString().padStart(4, '0')}</div>
    </div>
  );
}

// ─── Stats screen ───────────────────────────────────────────────────────
function StatsScreen({ accent, density }) {
  const maxYear = Math.max(...YEAR_COVERAGE.map(y => y.hexes), 1);
  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#FAFAF7',
      paddingTop: 56, paddingBottom: 110, overflow: 'auto',
    }} className="noscroll">

      {/* hero number */}
      <div style={{ padding: '20px 22px 8px' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase' }}>
          World covered
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
          <div className="mono" style={{
            fontSize: 86, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 0.92, color: accent,
            fontVariantNumeric: 'tabular-nums',
          }}>{PCT_WORLD.toFixed(2)}</div>
          <div className="mono" style={{ fontSize: 28, color: accent, fontWeight: 500 }}>%</div>
        </div>
        <div style={{ fontSize: 14, color: 'rgba(14,14,12,0.55)', marginTop: 6, lineHeight: 1.4 }}>
          {REAL_VISITED.toLocaleString()} hexes of {REAL_TOTAL_LAND.toLocaleString()} on Earth — about{' '}
          <span className="mono" style={{ color: '#0E0E0C' }}>{(REAL_VISITED * 50 * 50).toLocaleString()} km²</span> covered.
        </div>
      </div>

      {/* yearly bars */}
      <div style={{ padding: '24px 22px 8px' }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase', marginBottom: 14 }}>
          Hexes per year
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 92 }}>
          {YEAR_COVERAGE.map(y => (
            <div key={y.year} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div className="mono" style={{ fontSize: 11, color: 'rgba(14,14,12,0.55)' }}>{y.hexes}</div>
              <div style={{
                width: '100%', height: (y.hexes / maxYear) * 70,
                background: accent, borderRadius: 3,
              }} />
              <div className="mono" style={{ fontSize: 10.5, color: 'rgba(14,14,12,0.55)' }}>{y.year.slice(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* country list */}
      <div style={{ padding: '24px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase' }}>
            Countries · {COUNTRY_COUNT}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'rgba(14,14,12,0.4)', letterSpacing: '0.1em' }}>
            HEXES · % COVERED
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {COUNTRY_STATS.map((c, i) => (
            <CountryRow key={c.country} stat={c} accent={accent} isLast={i === COUNTRY_STATS.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CountryRow({ stat, accent, isLast }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 0', borderBottom: isLast ? 'none' : '1px solid rgba(14,14,12,0.07)',
    }}>
      <div style={{ width: 56, height: 44, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        {stat.bbox ? (
          <HexThumb visited={visitedKeysInBbox(stat.bbox)}
                    focusLonRange={stat.bbox[0]} focusLatRange={stat.bbox[1]}
                    accent={accent} size={44} />
        ) : <div style={{ width: 44, height: 44, background: 'rgba(0,0,0,0.05)', borderRadius: 8 }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 17 }}>{stat.flag}</span>
          <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>{stat.country}</span>
        </div>
        <div style={{ marginTop: 4, height: 3, background: 'rgba(14,14,12,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: Math.min(100, stat.areaPct * 8) + '%', background: accent }} />
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="mono" style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>{stat.hexes}</div>
        <div className="mono" style={{ fontSize: 11, color: 'rgba(14,14,12,0.5)' }}>{stat.areaPct.toFixed(1)}%</div>
      </div>
    </div>
  );
}

function visitedKeysInBbox(bbox) {
  const [lonR, latR] = bbox;
  const out = new Set();
  for (const k of VISITED) {
    const c = LAND_CELLS.get(k);
    if (!c) continue;
    if (c.lon >= lonR[0] && c.lon <= lonR[1] && c.lat >= latR[0] && c.lat <= latR[1]) out.add(k);
  }
  return out;
}

// ─── Share sheet ────────────────────────────────────────────────────────
function ShareSheet({ open, onClose, accent }) {
  const [drag, setDrag] = React.useState(0);
  const dragRef = React.useRef(null);
  function onPointerDown(e) { e.currentTarget.setPointerCapture(e.pointerId); dragRef.current = { sy: e.clientY, pid: e.pointerId }; }
  function onPointerMove(e) { const d = dragRef.current; if (!d || d.pid !== e.pointerId) return; setDrag(Math.max(0, e.clientY - d.sy)); }
  function onPointerUp() { if (drag > 130) { onClose(); } setDrag(0); dragRef.current = null; }

  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(14,14,12,0.55)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      }} />
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, top: 60,
          background: '#FAFAF7', borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: '12px 20px 30px',
          transform: `translateY(${drag}px)`, transition: drag === 0 ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
          touchAction: 'none', display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: 'rgba(14,14,12,0.18)', margin: '4px auto 14px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase' }}>
              Share
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Your map, 2026</div>
          </div>
          <button onClick={onClose} style={{
            border: 'none', background: 'rgba(14,14,12,0.06)', width: 36, height: 36, borderRadius: 18,
            cursor: 'pointer', fontSize: 16,
          }}>✕</button>
        </div>

        {/* Share card */}
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', position: 'relative' }}>
          <ShareCard accent={accent} />
        </div>

        {/* destinations */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 16 }}>
          {[
            { l: 'Story',     icon: '◧' },
            { l: 'Messages',  icon: '◐' },
            { l: 'Save image',icon: '↓' },
            { l: 'Copy link', icon: '⌬' },
          ].map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 18, background: '#0E0E0C', color: '#FAFAF7',
                display: 'grid', placeItems: 'center', fontSize: 22,
              }}>{d.icon}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(14,14,12,0.7)' }}>{d.l}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ShareCard({ accent }) {
  return (
    <div style={{
      width: 322, aspectRatio: '9 / 16', borderRadius: 22, overflow: 'hidden',
      background: '#FAFAF7', position: 'relative',
      boxShadow: '0 18px 60px rgba(14,14,12,0.18), 0 0 0 1px rgba(14,14,12,0.04)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* header */}
      <div style={{ padding: '20px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(14,14,12,0.55)', textTransform: 'uppercase' }}>
          HexPlore · 2026
        </div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(14,14,12,0.4)', textTransform: 'uppercase' }}>
          Lat {(35).toFixed(0)}° · Lon {(10).toFixed(0)}°
        </div>
      </div>

      {/* map block */}
      <div style={{ padding: '4px 16px 6px' }}>
        <div style={{
          background: '#fff', border: '1px solid rgba(14,14,12,0.06)', borderRadius: 14, padding: 6,
        }}>
          <HexThumb visited={VISITED} focusLonRange={[-170, 175]} focusLatRange={[-50, 75]}
                    accent={accent} size={278} includeOutline />
        </div>
      </div>

      {/* big number */}
      <div style={{ padding: '10px 22px 4px' }}>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.18em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase' }}>
          I've been to
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
          <span className="mono" style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 0.95, color: accent }}>
            {PCT_WORLD.toFixed(2)}
          </span>
          <span className="mono" style={{ fontSize: 22, fontWeight: 500, color: accent }}>%</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(14,14,12,0.6)', marginTop: 2, letterSpacing: '-0.005em' }}>
          of the world's land
        </div>
      </div>

      {/* metric row */}
      <div style={{ padding: '14px 22px 22px', marginTop: 'auto', display: 'flex', gap: 18, borderTop: '1px solid rgba(14,14,12,0.07)' }}>
        <ShareMetric label="Hexes"     value={REAL_VISITED}     accent={accent} />
        <ShareMetric label="Countries" value={COUNTRY_COUNT}     accent={accent} />
        <ShareMetric label="Trips"     value={PHOTO_LOCATIONS.length} accent={accent} />
      </div>
    </div>
  );
}
function ShareMetric({ label, value, accent }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase' }}>{label}</div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 2 }}>{value}</div>
    </div>
  );
}

// ─── Bottom nav ─────────────────────────────────────────────────────────
function BottomNav({ active, onChange, accent }) {
  const tabs = [
    { id: 'map',      label: 'Map',      glyph: '◇' },
    { id: 'stats',    label: 'Stats',    glyph: '▤' },
    { id: 'settings', label: 'Settings', glyph: '⚙' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 14, right: 14, bottom: 22,
      background: 'rgba(255,255,255,0.86)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(14,14,12,0.06)',
      borderRadius: 30, padding: 6,
      display: 'flex', gap: 4,
      boxShadow: '0 12px 40px rgba(14,14,12,0.10)',
      zIndex: 30,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flex: 1, padding: '10px 6px', borderRadius: 24, border: 'none', cursor: 'pointer',
            background: isActive ? '#0E0E0C' : 'transparent',
            color: isActive ? '#FAFAF7' : 'rgba(14,14,12,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.01em',
            transition: 'background 0.2s, color 0.2s',
          }}>
            <span style={{
              fontSize: 14, color: isActive ? accent : 'rgba(14,14,12,0.45)',
            }}>{t.glyph}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Settings stub (not designed per brief, just placeholder) ────────────
function SettingsScreen({ accent }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAFAF7', padding: '64px 24px 110px' }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>
        Settings
      </div>
      <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.025em', marginBottom: 32 }}>
        Preferences
      </div>
      {['Photo library access', 'Hex size · 50 km', 'Privacy', 'About HexPlore'].map((row, i, arr) => (
        <div key={row} style={{
          padding: '17px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: i === arr.length - 1 ? 'none' : '1px solid rgba(14,14,12,0.07)',
          fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em',
        }}>
          <span>{row}</span>
          <span style={{ color: 'rgba(14,14,12,0.4)' }}>›</span>
        </div>
      ))}
      <div className="mono" style={{ fontSize: 10, color: 'rgba(14,14,12,0.35)', marginTop: 32, letterSpacing: '0.1em', textAlign: 'center' }}>
        v0.1 · {REAL_VISITED.toLocaleString()} HEXES INDEXED
      </div>
    </div>
  );
}

Object.assign(window, {
  OnboardingScreen, MapScreen, CellSheet, StatsScreen, ShareSheet,
  BottomNav, SettingsScreen,
  PHOTO_LOCATIONS, VISITED, VISITED_INFO, COUNTRY_STATS,
  TOTAL_VISITED, TOTAL_LAND, REAL_VISITED, REAL_TOTAL_LAND, PCT_WORLD, COUNTRY_COUNT,
});
