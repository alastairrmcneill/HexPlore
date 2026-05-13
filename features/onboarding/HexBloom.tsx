import React, { useEffect, useRef, useState } from 'react';
import Svg, { Polygon } from 'react-native-svg';

interface Props {
  accent: string;
}

interface Cell {
  x: number;
  y: number;
  dist: number;
}

const RINGS = 6;
const SIZE = 14;
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

export default function HexBloom({ accent }: Props) {
  const [t, setT] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    const tick = (now: number) => {
      setT((now - startRef.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <Svg width={330} height={330} viewBox="-165 -165 330 330">
      {CELLS.map((c, i) => {
        const phase = ((t * 0.6 - c.dist * 0.18) % 2.2 + 2.2) % 2.2;
        const filled = phase > 0 && phase < 1.1;
        const wave = Math.max(0, 1 - Math.abs(phase - 0.5) * 2);
        const isCenter = c.dist === 0;
        const fill = isCenter || filled ? accent : 'transparent';
        const opacity = isCenter ? 1 : filled ? 0.35 + wave * 0.65 : 1;
        const stroke = filled || isCenter ? 'none' : 'rgba(14,14,12,0.16)';

        return (
          <Polygon
            key={i}
            points={hexPoints(c.x, c.y, 11)}
            fill={fill}
            stroke={stroke}
            strokeWidth={1}
            opacity={opacity}
          />
        );
      })}
    </Svg>
  );
}
