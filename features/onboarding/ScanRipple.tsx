import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

interface Props {
  accent: string;
  progress: number; // 0–100
}

const RINGS = 5;
const SIZE = 9;

interface Cell {
  x: number;
  y: number;
  dist: number;
}

const CELLS: Cell[] = [];
for (let q = -RINGS; q <= RINGS; q++) {
  for (let r = -RINGS; r <= RINGS; r++) {
    const s = -q - r;
    const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
    if (dist > RINGS) continue;
    CELLS.push({
      x: SIZE * Math.sqrt(3) * (q + r / 2),
      y: SIZE * 1.5 * r,
      dist,
    });
  }
}

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

export default function ScanRipple({ accent, progress }: Props) {
  return (
    <Svg width={190} height={190} viewBox="-95 -95 190 190">
      {CELLS.map((c, i) => {
        const filled = (c.dist / RINGS) * 100 < progress;
        return (
          <Polygon
            key={i}
            points={hexPoints(c.x, c.y, 7.6)}
            fill={filled ? accent : 'transparent'}
            stroke={filled ? 'none' : 'rgba(14,14,12,0.12)'}
            strokeWidth={1}
          />
        );
      })}
    </Svg>
  );
}
