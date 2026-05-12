// app.jsx — root composition: device frame, screen state machine, tweaks.

const ACCENT_OPTIONS = [
  '#FF6B5B', // warm coral (default)
  '#0E8A8A', // deep teal
  '#D9620C', // burnt orange
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#FF6B5B",
  "density": "fine",
  "showHints": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [scene, setScene] = React.useState('onboarding'); // onboarding | app
  const [tab, setTab] = React.useState('map');
  const [cellSheet, setCellSheet] = React.useState(null);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState(0);
  const mapRef = React.useRef(null);

  function startScan() {
    setScanning(true);
    setScanProgress(0);
    let p = 0;
    const id = setInterval(() => {
      p += 4 + Math.random() * 7;
      setScanProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => { setScanning(false); setScene('app'); }, 380);
      }
    }, 90);
  }

  // ─── Device contents ────────────────────────────────────────────────
  const W = 402, H = 874;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <IOSDevice width={W} height={H}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>

          {/* Onboarding */}
          {scene === 'onboarding' && !scanning && (
            <OnboardingScreen accent={t.accent} onScan={startScan} />
          )}

          {/* Scanning state */}
          {scanning && <ScanningScreen progress={scanProgress} accent={t.accent} />}

          {/* App */}
          {scene === 'app' && (
            <>
              {tab === 'map' && (
                <MapScreen
                  accent={t.accent} density={t.density}
                  onOpenStats={() => setTab('stats')}
                  onOpenShare={() => setShareOpen(true)}
                  onOpenCell={(c) => setCellSheet(c)}
                  mapRef={mapRef}
                />
              )}
              {tab === 'stats' && <StatsScreen accent={t.accent} density={t.density} />}
              {tab === 'settings' && <SettingsScreen accent={t.accent} />}

              <BottomNav active={tab} onChange={setTab} accent={t.accent} />

              <CellSheet
                open={!!cellSheet}
                cell={cellSheet?.cell} location={cellSheet?.location}
                accent={t.accent}
                onClose={() => setCellSheet(null)}
              />

              <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} accent={t.accent} />
            </>
          )}

          {/* iOS status bar overrides on dark backgrounds → keep dark */}
        </div>
      </IOSDevice>

      {/* Caption row */}
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'rgba(14,14,12,0.45)', textTransform: 'uppercase' }}>
        HexPlore — {scene === 'onboarding' ? 'Onboarding' : `Tab · ${tab}${cellSheet ? ' · cell' : ''}${shareOpen ? ' · share' : ''}`}
      </div>

      {/* Restart pill (handy during review) */}
      {scene === 'app' && (
        <button onClick={() => { setScene('onboarding'); setTab('map'); setCellSheet(null); setShareOpen(false); }}
          style={{
            padding: '6px 12px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
            fontFamily: "'Geist Mono', monospace", color: 'rgba(14,14,12,0.55)',
            border: '1px solid rgba(14,14,12,0.15)', background: 'transparent',
            borderRadius: 999, cursor: 'pointer',
          }}>
          ↻ Restart from onboarding
        </button>
      )}

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Visual" />
        <TweakColor
          label="Accent" value={t.accent}
          options={ACCENT_OPTIONS}
          onChange={(v) => setTweak('accent', v)}
        />
        <TweakRadio
          label="Hex density" value={t.density}
          options={['fine', 'chunky']}
          onChange={(v) => setTweak('density', v)}
        />
      </TweaksPanel>
    </div>
  );
}

// ─── Scanning interstitial ────────────────────────────────────────────
function ScanningScreen({ progress, accent }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#FAFAF7',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      gap: 20, padding: 40,
    }}>
      <ScanRipple accent={accent} progress={progress} />
      <div style={{ textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase' }}>
          Scanning camera roll
        </div>
        <div className="mono" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 8, fontVariantNumeric: 'tabular-nums', color: accent }}>
          {Math.floor(progress)}<span style={{ fontSize: 18, color: accent }}>%</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(14,14,12,0.55)', marginTop: 10, maxWidth: 260, lineHeight: 1.4 }}>
          Reading EXIF coordinates · {Math.floor(14238 * (progress / 100)).toLocaleString()} of 14,238 photos
        </div>
      </div>
    </div>
  );
}
function ScanRipple({ accent, progress }) {
  const cells = [];
  const rings = 5;
  for (let q = -rings; q <= rings; q++) {
    for (let r = -rings; r <= rings; r++) {
      const s = -q - r;
      const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
      if (dist > rings) continue;
      const size = 9;
      const x = size * Math.sqrt(3) * (q + r / 2);
      const y = size * 1.5 * r;
      const filled = (dist / rings) * 100 < progress;
      cells.push({ x, y, dist, filled });
    }
  }
  return (
    <svg width="190" height="190" viewBox="-95 -95 190 190">
      {cells.map((c, i) => (
        <polygon key={i}
          points={Array.from({ length: 6 }).map((_, j) => {
            const a = (Math.PI / 3) * j + Math.PI / 6;
            return ((c.x + 7.6 * Math.cos(a)).toFixed(2)) + ',' + ((c.y + 7.6 * Math.sin(a)).toFixed(2));
          }).join(' ')}
          fill={c.filled ? accent : 'transparent'}
          stroke={c.filled ? 'none' : 'rgba(14,14,12,0.12)'}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
