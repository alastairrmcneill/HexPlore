import '@/lib/polyfills/emscripten';
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

// Pointy-top hex vertices in screen coords (y-down SVG)
function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

// Compass bearing 0=N clockwise, in degrees
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

// Snap to the edge-midpoint grid: 30°, 90°, 150°, 210°, 270°, 330°
function snapEdge(b: number): number {
  return ((Math.round((b - 30) / 60) * 60 + 30) + 360) % 360;
}

// Snap to the vertex grid: 0°, 60°, 120°, 180°, 240°, 300°
function snapVertex(b: number): number {
  return (Math.round(b / 60) * 60 + 360) % 360;
}

type CellPos = { h3index: string; x: number; y: number; ring: number };

export default function HexNeighborThumbnail({ h3index, visitedSet, accent, size = 62 }: Props) {
  const { positions, hexR } = useMemo(() => {
    // kRingDistances returns [ring0, ring1, ring2] where each is an array of h3indices
    const byRing: string[][] = _h3.kRingDistances(h3index, 2);
    const [cLat, cLng] = _h3.h3ToGeo(h3index) as [number, number];

    const halfSize = size / 2;
    // hexR chosen so ring-2 edge cells sit near the edge of the clip rect
    // and ring-2 corner cells peek slightly beyond it (clipped by the border).
    const hexRadius = size * 0.13;
    const d1 = hexRadius * Math.sqrt(3); // ring-1 centre-to-centre distance

    const result: CellPos[] = [];

    // Ring-0: centre
    result.push({ h3index, x: halfSize, y: halfSize, ring: 0 });

    // Ring-1: snap to edge-midpoint directions (30°, 90°, …), distance d1
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

    // Ring-2: two subtypes
    //  • corner cells – in the same direction as a ring-1 neighbour, at 2×d1
    //  • edge cells   – between two ring-1 neighbours, at 3×hexRadius
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
    <View style={[styles.clip, { width: size, height: size, borderRadius: size * 0.22 }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {positions.map(cell => {
          const isVisited = visitedSet.has(cell.h3index);
          const isCenter = cell.h3index === h3index;
          const opacity = cell.ring === 2 ? 0.55 : 1;
          return (
            <Polygon
              key={cell.h3index}
              points={hexPoints(cell.x, cell.y, hexR)}
              fill={isVisited ? accent : 'transparent'}
              fillOpacity={isVisited ? (isCenter ? 1 : 0.75) * opacity : 0}
              stroke={isVisited ? 'none' : `rgba(14,14,12,${cell.ring === 2 ? 0.13 : 0.22})`}
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
    borderColor: 'rgba(14,14,12,0.12)',
  },
});
