import '@/lib/polyfills/emscripten';
import React, { useMemo } from 'react';
import Svg, { Polygon } from 'react-native-svg';
import * as h3 from 'h3-js';

const _h3 = h3 as any;

interface Props {
  h3index: string;
  visitedSet: Set<string>;
  accent: string;
  size?: number;
}

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6; // pointy-top
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

export default function HexNeighborThumbnail({ h3index, visitedSet, accent, size = 62 }: Props) {
  const { projected, hexR } = useMemo(() => {
    const ring: string[] = _h3.kRing(h3index, 1);
    const centroids = ring.map((idx: string) => {
      const [lat, lng] = _h3.h3ToGeo(idx) as [number, number];
      return { h3index: idx, lat, lng };
    });

    const center = centroids.find((c: { h3index: string }) => c.h3index === h3index)!;
    const cosLat = Math.cos(center.lat * Math.PI / 180);

    // Find max geographic offset from center (longitude-corrected)
    let maxOff = 0.001;
    for (const c of centroids) {
      const dx = Math.abs((c.lng - center.lng) * cosLat);
      const dy = Math.abs(c.lat - center.lat);
      maxOff = Math.max(maxOff, dx, dy);
    }

    const halfSize = size / 2;
    const scale = (halfSize * 0.82) / maxOff;
    const hexRadius = scale * maxOff * 0.55;

    const proj = centroids.map((c: { h3index: string; lat: number; lng: number }) => ({
      h3index: c.h3index,
      x: halfSize + (c.lng - center.lng) * cosLat * scale,
      y: halfSize - (c.lat - center.lat) * scale,
    }));

    return { projected: proj, hexR: hexRadius };
  }, [h3index, size]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {projected.map((cell: { h3index: string; x: number; y: number }) => {
        const isVisited = visitedSet.has(cell.h3index);
        const isCenter = cell.h3index === h3index;
        return (
          <Polygon
            key={cell.h3index}
            points={hexPoints(cell.x, cell.y, hexR)}
            fill={isVisited ? accent : 'transparent'}
            fillOpacity={isVisited ? (isCenter ? 1 : 0.7) : 0}
            stroke={isVisited ? 'none' : 'rgba(14,14,12,0.22)'}
            strokeWidth={1}
          />
        );
      })}
    </Svg>
  );
}
