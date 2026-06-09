import '@/lib/polyfills/emscripten';
import { useTheme } from '@/lib/theme/ThemeContext';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
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
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

function compassBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
  const x =
    Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function angDiff(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

function snapEdge(b: number): number {
  return ((Math.round((b - 30) / 60) * 60 + 30) + 360) % 360;
}

function snapVertex(b: number): number {
  return (Math.round(b / 60) * 60 + 360) % 360;
}

type CellPos = { h3index: string; x: number; y: number; ring: number };

export default function HexNeighborThumbnail({ h3index, visitedSet, accent, size = 62 }: Props) {
  const { colours } = useTheme();

  const { positions, hexR } = useMemo(() => {
    const byRing: string[][] = _h3.kRingDistances(h3index, 2);
    const [cLat, cLng] = _h3.h3ToGeo(h3index) as [number, number];

    const halfSize = size / 2;
    const hexRadius = size * 0.13;
    const d1 = hexRadius * Math.sqrt(3);

    const result: CellPos[] = [];
    result.push({ h3index, x: halfSize, y: halfSize, ring: 0 });

    for (const idx of (byRing[1] ?? [])) {
      const [nLat, nLng] = _h3.h3ToGeo(idx) as [number, number];
      const b = compassBearing(cLat, cLng, nLat, nLng);
      const snapped = snapEdge(b);
      const rad = snapped * Math.PI / 180;
      result.push({
        h3index: idx, ring: 1,
        x: halfSize + d1 * Math.sin(rad),
        y: halfSize - d1 * Math.cos(rad),
      });
    }

    for (const idx of (byRing[2] ?? [])) {
      const [nLat, nLng] = _h3.h3ToGeo(idx) as [number, number];
      const b = compassBearing(cLat, cLng, nLat, nLng);
      const se = snapEdge(b);
      const sv = snapVertex(b);
      const isCorner = angDiff(b, se) <= angDiff(b, sv);
      if (isCorner) {
        const rad = se * Math.PI / 180;
        result.push({
          h3index: idx, ring: 2,
          x: halfSize + 2 * d1 * Math.sin(rad),
          y: halfSize - 2 * d1 * Math.cos(rad),
        });
      } else {
        const rad = sv * Math.PI / 180;
        result.push({
          h3index: idx, ring: 2,
          x: halfSize + 3 * hexRadius * Math.sin(rad),
          y: halfSize - 3 * hexRadius * Math.cos(rad),
        });
      }
    }

    return { positions: result, hexR: hexRadius };
  }, [h3index, size]);

  return (
    <View style={[styles.clip, { width: size, height: size, borderRadius: size * 0.22, borderColor: colours.hexOutline }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {positions.map(cell => {
          const isVisited = visitedSet.has(cell.h3index);
          const opacity = cell.ring === 2 ? 0.55 : 1;
          const strokeOpacity = cell.ring === 2 ? 0.13 : 0.22;
          return (
            <Polygon
              key={cell.h3index}
              points={hexPoints(cell.x, cell.y, hexR)}
              fill={isVisited ? accent : 'transparent'}
              fillOpacity={isVisited ? (cell.h3index === h3index ? 1 : 0.75) * opacity : 0}
              stroke={isVisited ? 'none' : colours.hexOutline}
              strokeOpacity={isVisited ? 0 : strokeOpacity / 0.12}
              strokeWidth={1}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    borderWidth: 1,
  },
});
