// hexmap.jsx — dotted-world hex map with pan/zoom + cell selection
// Pointy-top hex grid in lon/lat space; equirectangular projection to canvas.

// ─── World + grid constants ──────────────────────────────────────────────
const HEX_R_DEG_BASE = 2.4;                 // ~hex "radius" in degrees of lat
const W_DEG = Math.sqrt(3) * HEX_R_DEG_BASE;
const H_DEG = 1.5 * HEX_R_DEG_BASE;
const LON_MIN = -180, LON_MAX = 180;
const LAT_MIN = -62,  LAT_MAX =  82;
const WORLD_W_DEG = LON_MAX - LON_MIN;
const WORLD_H_DEG = LAT_MAX - LAT_MIN;

// ─── Coarse continent mask: union of ellipses in (lon, lat) ──────────────
// Format: [centerLon, centerLat, rxLon, ryLat]
const LAND_ELLIPSES = [
  // North America
  [-100,  56, 32, 14],   // Canada bulk
  [-110,  68, 22,  8],   // northern Canada / arctic
  [ -95,  43, 24, 10],   // US/Canada border
  [ -90,  32, 14,  9],   // SE US
  [-118,  40, 10, 14],   // West coast
  [-150,  64, 14,  8],   // Alaska
  [-100,  22, 12,  7],   // Mexico
  [ -85,  12,  8,  4],   // C. America
  // Greenland
  [ -42,  74, 10, 10],
  [ -50,  68,  4,  3],
  // South America
  [ -65,  -5, 13, 13],
  [ -60, -22, 12, 12],
  [ -68, -38,  8, 12],
  [ -71, -50,  3,  5],
  // Africa
  [  18,   8, 20, 16],
  [  24,  -8, 12, 10],
  [  28, -22, 11, 12],
  [  47, -20,  2,  6],   // Madagascar
  // Europe
  [  15,  50, 18, 10],
  [  -3,  54,  4,  5],   // UK
  [  -8,  53,  2,  3],   // Ireland
  [  20,  62,  8,  6],   // Scandinavia
  [  25,  65,  4,  6],
  [ -19,  65,  3.5, 2.2], // Iceland
  // Russia / Asia
  [  80,  60, 60, 14],
  [ 110,  68, 30,  8],
  [ 100,  35, 22, 12],   // China
  [  78,  24,  9, 11],   // India
  [ 100,  18,  5,  6],   // Indochina
  [ 105,   5,  5,  7],   // Malaysia
  [ 138,  38,  4,  8],   // Japan
  [  45,  30, 10,  8],   // Middle East
  [  55,  25,  8,  6],
  // Indonesia / Oceania
  [ 115,  -5,  9,  4],
  [ 125,  -3,  6,  5],
  [ 140,  -5,  6,  4],   // PNG
  [ 134, -25, 14,  7],   // Australia bulk
  [ 145, -20,  8,  8],
  [ 173, -41,  4,  6],   // NZ
];

function isLand(lon, lat) {
  for (let i = 0; i < LAND_ELLIPSES.length; i++) {
    const [cx, cy, rx, ry] = LAND_ELLIPSES[i];
    const dx = (lon - cx) / rx;
    const dy = (lat - cy) / ry;
    if (dx * dx + dy * dy <= 1) return true;
  }
  return false;
}

// ─── Hex axial helpers ───────────────────────────────────────────────────
function colRowToLonLat(col, row) {
  const offset = (row & 1) ? W_DEG / 2 : 0;
  const lon = LON_MIN + col * W_DEG + offset;
  const lat = LAT_MAX - row * H_DEG;
  return [lon, lat];
}
function lonLatToColRow(lon, lat) {
  const row = Math.round((LAT_MAX - lat) / H_DEG);
  const offset = (row & 1) ? W_DEG / 2 : 0;
  const col = Math.round((lon - LON_MIN - offset) / W_DEG);
  return [col, row];
}

// ─── Land cells (memoized) ───────────────────────────────────────────────
const LAND_CELLS = (() => {
  const out = new Map();
  const cols = Math.ceil(WORLD_W_DEG / W_DEG) + 1;
  const rows = Math.ceil(WORLD_H_DEG / H_DEG) + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const [lon, lat] = colRowToLonLat(c, r);
      if (lon < LON_MIN - 1 || lon > LON_MAX + 1) continue;
      if (lat < LAT_MIN - 1 || lat > LAT_MAX + 1) continue;
      if (isLand(lon, lat)) out.set(c + ',' + r, { col: c, row: r, lon, lat });
    }
  }
  return out;
})();

// ─── HexMap component ────────────────────────────────────────────────────
// Props:
//   width, height          → canvas size in CSS px
//   visited                → Set of "col,row" keys
//   accent                 → string (visited fill)
//   density                → 'fine' | 'chunky'
//   initialView            → { centerLon, centerLat, zoom }
//   onCellTap              → (cell) => void   (only fires on visited cells)
//   onZoomChange           → (z) => void
//   interactive            → bool
//   selectedKey            → "col,row" of currently-highlighted cell
//   muted                  → render at low contrast (for share card preview)
const HexMap = React.forwardRef(function HexMap({
  width, height, visited, accent = '#FF6B5B',
  density = 'fine', initialView, onCellTap, onZoomChange,
  interactive = true, selectedKey = null, muted = false, showGraticule = true,
}, ref) {
  const canvasRef = React.useRef(null);
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

  // View state — equirectangular world fits canvas at zoom 1.
  const baseScale = width / WORLD_W_DEG;
  const [view, setView] = React.useState(() => ({
    centerLon: initialView?.centerLon ?? 0,
    centerLat: initialView?.centerLat ?? 18,
    zoom: initialView?.zoom ?? 1,
  }));
  React.useEffect(() => {
    if (initialView) setView(v => ({ ...v, ...initialView }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialView?.centerLon, initialView?.centerLat, initialView?.zoom]);

  React.useImperativeHandle(ref, () => ({
    setView: (v) => setView(s => ({ ...s, ...v })),
    getView: () => view,
  }), [view]);

  React.useEffect(() => { onZoomChange && onZoomChange(view.zoom); }, [view.zoom]);

  // Convert (lon, lat) → canvas px
  const scale = baseScale * view.zoom;
  function project(lon, lat) {
    const x = (lon - view.centerLon) * scale + width / 2;
    const y = (view.centerLat - lat) * scale + height / 2;
    return [x, y];
  }
  function unproject(x, y) {
    const lon = (x - width / 2) / scale + view.centerLon;
    const lat = -(y - height / 2) / scale + view.centerLat;
    return [lon, lat];
  }

  // ─── Draw ───────────────────────────────────────────────────────────────
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // background hairline equator/meridian — very subtle
    if (showGraticule && view.zoom >= 1.4) {
      ctx.strokeStyle = 'rgba(14, 14, 12, 0.05)';
      ctx.lineWidth = 0.5;
      // graticule every 10°
      const stepLon = view.zoom >= 3 ? 5 : 10;
      const stepLat = stepLon;
      for (let lon = -180; lon <= 180; lon += stepLon) {
        const [x] = project(lon, 0);
        if (x < -2 || x > width + 2) continue;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let lat = -60; lat <= 80; lat += stepLat) {
        const [, y] = project(0, lat);
        if (y < -2 || y > height + 2) continue;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
    }

    // Hex radius in px
    const hexRpx = HEX_R_DEG_BASE * scale;
    // Visual style threshold: under 6px → dots, otherwise hexagons
    const dotMode = hexRpx < 5.5;

    // Compute viewport bounds in lon/lat (with a small margin) to cull cells
    const [lonL, latT] = unproject(-2, -2);
    const [lonR, latB] = unproject(width + 2, height + 2);
    const lonMin = Math.min(lonL, lonR);
    const lonMax = Math.max(lonL, lonR);
    const latMin = Math.min(latT, latB);
    const latMax = Math.max(latT, latB);

    const unvisitedColor = muted ? 'rgba(14,14,12,0.06)' : 'rgba(14,14,12,0.13)';
    const unvisitedOutline = 'rgba(14,14,12,0.18)';
    const accentColor = accent;
    const accentSoft  = accent + '33'; // 20% alpha-ish ring

    // Cell sizing per density (only matters in dot mode)
    const dotSizeMul = density === 'chunky' ? 1.4 : 1.0;
    const dotR = Math.max(0.7, hexRpx * 0.55 * dotSizeMul);

    // 1st pass: unvisited (background lattice). 2nd pass: visited (foreground).
    const visitedDraws = [];

    for (const cell of LAND_CELLS.values()) {
      if (cell.lon < lonMin || cell.lon > lonMax) continue;
      if (cell.lat < latMin || cell.lat > latMax) continue;
      const [x, y] = project(cell.lon, cell.lat);
      const key = cell.col + ',' + cell.row;
      const isVis = visited.has(key);
      if (isVis) { visitedDraws.push({ cell, x, y, key }); continue; }

      if (dotMode) {
        ctx.fillStyle = unvisitedColor;
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // outlined hex
        drawHex(ctx, x, y, hexRpx);
        ctx.strokeStyle = unvisitedOutline;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // visited
    for (const v of visitedDraws) {
      const { x, y, key } = v;
      if (dotMode) {
        // soft halo
        if (view.zoom >= 1.6) {
          ctx.fillStyle = accentSoft;
          ctx.beginPath();
          ctx.arc(x, y, dotR * 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(x, y, dotR * 1.15, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawHex(ctx, x, y, hexRpx);
        ctx.fillStyle = accentColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        if (key === selectedKey) {
          drawHex(ctx, x, y, hexRpx * 1.15);
          ctx.strokeStyle = '#0E0E0C';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
  }, [width, height, view, visited, accent, density, dpr, selectedKey, muted, showGraticule]);

  // ─── Interactivity ──────────────────────────────────────────────────────
  const dragState = React.useRef(null);
  const pinchState = React.useRef(null);
  const lastTapRef = React.useRef({ t: 0, x: 0, y: 0 });

  function clampView(v) {
    return {
      centerLon: Math.max(-180, Math.min(180, v.centerLon)),
      centerLat: Math.max(-60, Math.min(82, v.centerLat)),
      zoom: Math.max(0.85, Math.min(7, v.zoom)),
    };
  }

  function onPointerDown(e) {
    if (!interactive) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      pointerId: e.pointerId, sx: x, sy: y, lx: x, ly: y,
      startView: view, moved: false,
    };
  }
  function onPointerMove(e) {
    const ds = dragState.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const dx = x - ds.sx, dy = y - ds.sy;
    if (!ds.moved && Math.hypot(dx, dy) > 4) ds.moved = true;
    if (ds.moved) {
      const dLon = -dx / scale;
      const dLat = dy / scale;
      setView(v => clampView({
        ...ds.startView,
        centerLon: ds.startView.centerLon + dLon,
        centerLat: ds.startView.centerLat + dLat,
      }));
    }
  }
  function onPointerUp(e) {
    const ds = dragState.current;
    if (!ds) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    if (!ds.moved) {
      // tap — find nearest visited cell within reach
      handleTap(x, y);
    }
    dragState.current = null;
  }

  function handleTap(x, y) {
    const [lon, lat] = unproject(x, y);
    // search visited cells within a search radius (in degrees)
    const searchDeg = HEX_R_DEG_BASE * 2 / view.zoom;
    let best = null;
    let bestD = Infinity;
    for (const key of visited) {
      const cell = LAND_CELLS.get(key);
      if (!cell) continue;
      const d = Math.hypot(cell.lon - lon, cell.lat - lat);
      if (d < bestD && d < searchDeg) { bestD = d; best = cell; }
    }
    if (best && onCellTap) onCellTap({ ...best, key: best.col + ',' + best.row });
    // double-tap to zoom
    const now = Date.now();
    const last = lastTapRef.current;
    if (now - last.t < 280 && Math.hypot(last.x - x, last.y - y) < 18) {
      const [lon2, lat2] = unproject(x, y);
      setView(v => clampView({ centerLon: lon2, centerLat: lat2, zoom: v.zoom * 1.7 }));
      lastTapRef.current = { t: 0, x: 0, y: 0 };
    } else {
      lastTapRef.current = { t: now, x, y };
    }
  }

  function onWheel(e) {
    if (!interactive) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const [lon, lat] = unproject(x, y);
    const factor = Math.exp(-e.deltaY * 0.0015);
    setView(v => {
      const z = Math.max(0.85, Math.min(7, v.zoom * factor));
      // re-anchor so the cursor stays over the same lon/lat
      const newScale = baseScale * z;
      const lonAtCursor = (x - width / 2) / newScale + v.centerLon;
      const latAtCursor = -(y - height / 2) / newScale + v.centerLat;
      const dLon = lonAtCursor - lon;
      const dLat = latAtCursor - lat;
      return clampView({
        centerLon: v.centerLon - dLon,
        centerLat: v.centerLat - dLat,
        zoom: z,
      });
    });
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      style={{
        display: 'block',
        touchAction: 'none',
        cursor: interactive ? 'grab' : 'default',
      }}
    />
  );
});

function drawHex(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;     // pointy-top
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// ─── Static SVG renderer for inline thumbnails (timeline cards, share) ───
// Renders just visited cells of a country/region — small, decorative.
function HexThumb({ visited, focusLonRange, focusLatRange, accent='#FF6B5B', size = 80, includeOutline = false }) {
  const [lonMin, lonMax] = focusLonRange;
  const [latMin, latMax] = focusLatRange;
  const wDeg = lonMax - lonMin, hDeg = latMax - latMin;
  const aspect = wDeg / hDeg;
  const w = aspect >= 1 ? size : size * aspect;
  const h = aspect >= 1 ? size / aspect : size;
  const sx = w / wDeg, sy = h / hDeg;
  const r = HEX_R_DEG_BASE * Math.min(sx, sy) * 0.85;

  const dots = [];
  if (includeOutline) {
    for (const c of LAND_CELLS.values()) {
      if (c.lon < lonMin - 0.5 || c.lon > lonMax + 0.5) continue;
      if (c.lat < latMin - 0.5 || c.lat > latMax + 0.5) continue;
      const k = c.col + ',' + c.row;
      if (visited.has(k)) continue;
      const x = (c.lon - lonMin) * sx;
      const y = (latMax - c.lat) * sy;
      dots.push(<circle key={'o'+k} cx={x} cy={y} r={r * 0.55} fill="rgba(14,14,12,0.10)" />);
    }
  }
  for (const k of visited) {
    const c = LAND_CELLS.get(k);
    if (!c) continue;
    if (c.lon < lonMin - 0.5 || c.lon > lonMax + 0.5) continue;
    if (c.lat < latMin - 0.5 || c.lat > latMax + 0.5) continue;
    const x = (c.lon - lonMin) * sx;
    const y = (latMax - c.lat) * sy;
    dots.push(<circle key={k} cx={x} cy={y} r={r * 0.7} fill={accent} />);
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {dots}
    </svg>
  );
}

// ─── Exports ─────────────────────────────────────────────────────────────
Object.assign(window, {
  HexMap, HexThumb, LAND_CELLS, lonLatToColRow, colRowToLonLat,
  HEX_R_DEG_BASE, isLand,
});
