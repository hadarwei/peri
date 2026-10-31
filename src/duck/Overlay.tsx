import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import type { DuckFrame } from '../assets/duckFrames';
import type { DuckState } from '../core/duckState';
import { colors } from '../theme';
import { ANCHORS, FRAME_H, FRAME_W, REST_H, REST_HEAD, REST_W } from './anchors';
import { dropPath, heartPath, quadPoint, sparklePath, type Pt } from './geometry';

// Margins around the picture (picture units) so hats, hearts and clouds can stick out of it.
const MARGIN = 70;
const MARGIN_TOP = 110;

const INK = colors.ink;

function Sparkles({ head, pink = false }: { head: Pt; pink?: boolean }) {
  const fill = pink ? '#FFB3D1' : colors.duck;
  const spots: [number, number, number][] = [
    [-42, -4, 8],
    [42, -20, 7],
    [54, 24, 5.5],
    [-32, 34, 4.5],
  ];
  return (
    <>
      {spots.map(([dx, dy, r], i) => (
        <Path
          key={i}
          d={sparklePath(r)}
          fill={fill}
          stroke="#FFFFFF"
          strokeWidth={1}
          transform={`translate(${head.x + dx} ${head.y + dy})`}
        />
      ))}
    </>
  );
}

function Hearts({ head, spots }: { head: Pt; spots: [number, number, number][] }) {
  return (
    <>
      {spots.map(([dx, dy, s], i) => (
        <Path
          key={i}
          d={heartPath(s)}
          fill="#FF7A9C"
          transform={`translate(${head.x + dx} ${head.y + dy})`}
        />
      ))}
    </>
  );
}

function FlowerCrown({ head }: { head: Pt }) {
  const p0 = { x: head.x - 30, y: head.y + 16 };
  const p1 = { x: head.x, y: head.y - 14 };
  const p2 = { x: head.x + 30, y: head.y + 16 };
  const petals = ['#FF8FB1', '#FFFFFF', '#FFD54A', '#C9A6FF'];
  return (
    <>
      <Path
        d={`M${p0.x},${p0.y} Q${p1.x},${p1.y} ${p2.x},${p2.y}`}
        stroke="#3FA34D"
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      {[0.08, 0.36, 0.64, 0.92].map((t, i) => {
        const c = quadPoint(p0, p1, p2, t);
        return (
          <G key={i}>
            {[0, 72, 144, 216, 288].map((deg) => (
              <Circle
                key={deg}
                cx={c.x + 4.6 * Math.cos((deg * Math.PI) / 180)}
                cy={c.y + 4.6 * Math.sin((deg * Math.PI) / 180)}
                r={3.6}
                fill={petals[i]}
                stroke={INK}
                strokeWidth={0.6}
              />
            ))}
            <Circle cx={c.x} cy={c.y} r={2.6} fill="#F2A900" />
          </G>
        );
      })}
    </>
  );
}

function Late({ head }: { head: Pt }) {
  return (
    <>
      <Path
        d={dropPath(6)}
        fill="#7CC4F2"
        stroke="#3B8FC9"
        strokeWidth={1}
        transform={`translate(${head.x - 30} ${head.y + 22})`}
      />
      <Path
        d={dropPath(5)}
        fill="#7CC4F2"
        stroke="#3B8FC9"
        strokeWidth={1}
        transform={`translate(${head.x + 36} ${head.y + 6})`}
      />
      <SvgText
        x={head.x + 2}
        y={head.y - 12}
        fontSize={36}
        fontWeight="bold"
        fill={INK}
        textAnchor="middle"
      >
        ?
      </SvgText>
    </>
  );
}

function StrawHat({ head }: { head: Pt }) {
  const { x, y } = head;
  return (
    <>
      <Path
        d={`M${x - 20},${y + 6} C${x - 20},${y - 22} ${x + 20},${y - 22} ${x + 20},${y + 6}Z`}
        fill="#F1CE7A"
        stroke="#B98A3C"
        strokeWidth={2}
      />
      <Rect x={x - 20} y={y - 2} width={40} height={6} fill="#D9534F" />
      <Ellipse cx={x} cy={y + 8} rx={36} ry={9} fill="#F1CE7A" stroke="#B98A3C" strokeWidth={2} />
      <Rect x={x - 20} y={y - 2} width={40} height={6} fill="#D9534F" />
    </>
  );
}

function Backpack({ back }: { back: Pt }) {
  return (
    <>
      <Rect
        x={back.x - 22}
        y={back.y - 26}
        width={36}
        height={48}
        rx={11}
        fill="#4CC3A6"
        stroke={INK}
        strokeWidth={2.5}
      />
      <Rect x={back.x - 18} y={back.y - 8} width={28} height={12} rx={4} fill="#3AA48A" />
      <Rect x={back.x - 10} y={back.y - 5} width={12} height={6} rx={2} fill="#F1CE7A" />
    </>
  );
}

function Stick({ head }: { head: Pt }) {
  return (
    <>
      <Path
        d={`M${head.x + 56},${head.y + 44} L${head.x + 62},248`}
        stroke="#8B5A2B"
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <Circle cx={head.x + 56} cy={head.y + 44} r={4.5} fill="#8B5A2B" />
    </>
  );
}

const CONFETTI: [number, number, string][] = [
  [-70, -20, '#FF7A9C'],
  [-52, 10, '#4CC3A6'],
  [-30, -44, '#FFD54A'],
  [-12, -54, '#1F69BD'],
  [20, -48, '#FF7A9C'],
  [46, -34, '#4CC3A6'],
  [66, -8, '#FFD54A'],
  [74, 26, '#1F69BD'],
  [-62, 54, '#FFD54A'],
  [58, 62, '#FF7A9C'],
  [-40, 84, '#1F69BD'],
  [40, 96, '#4CC3A6'],
];

function Party({ head }: { head: Pt }) {
  const { x, y } = head;
  return (
    <>
      <Path
        d={`M${x - 15},${y + 8} L${x},${y - 38} L${x + 15},${y + 8}Z`}
        fill="#FF7A9C"
        stroke={INK}
        strokeWidth={2}
      />
      <Path d={`M${x - 9},${y - 6} L${x + 9},${y - 6}`} stroke="#FFFFFF" strokeWidth={3} />
      <Path d={`M${x - 5},${y - 20} L${x + 5},${y - 20}`} stroke="#FFFFFF" strokeWidth={3} />
      <Circle cx={x} cy={y - 40} r={5} fill={colors.duck} stroke={INK} strokeWidth={1.2} />
      {CONFETTI.map(([dx, dy, fill], i) => (
        <Rect
          key={i}
          x={x + dx - 3}
          y={y + dy - 3}
          width={6}
          height={9}
          rx={1.5}
          fill={fill}
          transform={`rotate(${(i * 47) % 180} ${x + dx} ${y + dy})`}
        />
      ))}
    </>
  );
}

function Dreaming() {
  const cloud = { x: 150, y: -20 };
  const duckling = (cx: number, cy: number) => (
    <G key={cx}>
      <Circle cx={cx} cy={cy + 4} r={11} fill={colors.duck} stroke={INK} strokeWidth={1.4} />
      <Circle cx={cx + 7} cy={cy - 8} r={7} fill={colors.duck} stroke={INK} strokeWidth={1.4} />
      <Path d={`M${cx + 13},${cy - 8} l7,2 l-7,3Z`} fill="#F59A23" />
      <Circle cx={cx + 9} cy={cy - 10} r={1.3} fill={INK} />
    </G>
  );
  return (
    <>
      {[
        { x: REST_HEAD.x + 16, y: REST_HEAD.y - 14, r: 4 },
        { x: REST_HEAD.x + 24, y: REST_HEAD.y - 36, r: 6 },
        { x: REST_HEAD.x + 32, y: REST_HEAD.y - 62, r: 8 },
        { x: REST_HEAD.x + 36, y: REST_HEAD.y - 92, r: 10 },
      ].map((b, i) => (
        <Circle
          key={i}
          cx={b.x}
          cy={b.y}
          r={b.r}
          fill="#FFFFFF"
          stroke={colors.cardBorder}
          strokeWidth={1.5}
        />
      ))}
      {[
        { cx: cloud.x - 46, cy: cloud.y + 8, rx: 40, ry: 26 },
        { cx: cloud.x + 44, cy: cloud.y + 8, rx: 40, ry: 26 },
        { cx: cloud.x, cy: cloud.y - 8, rx: 52, ry: 34 },
      ].map((e, i) => (
        <Ellipse key={i} {...e} fill="#FFFFFF" stroke={colors.cardBorder} strokeWidth={1.5} />
      ))}
      {[
        { cx: cloud.x - 46, cy: cloud.y + 8, rx: 38, ry: 24 },
        { cx: cloud.x + 44, cy: cloud.y + 8, rx: 38, ry: 24 },
        { cx: cloud.x, cy: cloud.y - 8, rx: 50, ry: 32 },
      ].map((e, i) => (
        <Ellipse key={i} {...e} fill="#FFFFFF" />
      ))}
      {duckling(cloud.x - 28, cloud.y)}
      {duckling(cloud.x + 30, cloud.y + 2)}
      <SvgText x={236} y={76} fontSize={30} fontWeight="bold" fill="#6A7FD6">
        z
      </SvgText>
      <SvgText x={262} y={44} fontSize={42} fontWeight="bold" fill="#6A7FD6">
        Z
      </SvgText>
    </>
  );
}

interface Props {
  state: DuckState;
  /** Party hat and confetti (while the duck dances). */
  party: boolean;
  frame: DuckFrame;
  /** Pixel size of the picture box this overlay sits on. */
  boxW: number;
  boxH: number;
}

/** Accessories for one picture. Drawn inside the picture's own layer so it swaps with the frame. */
export function FrameOverlay({ state, party, frame, boxW, boxH }: Props) {
  const isRest = frame === 'rest';
  const anchors = ANCHORS[frame];
  const picW = isRest ? REST_W : FRAME_W;
  const picH = isRest ? REST_H : FRAME_H;

  let content: React.ReactNode = null;
  if (isRest) {
    content = state === 'dreaming' ? <Dreaming /> : null;
  } else if (anchors) {
    const { head, back } = anchors;
    const showParty = party;
    content = (
      <>
        {state === 'traveling' && !showParty && (
          <>
            <Backpack back={back} />
            <Stick head={head} />
            <StrawHat head={head} />
          </>
        )}
        {state === 'fertile' && (
          <>
            <FlowerCrown head={head} />
            <Hearts
              head={head}
              spots={[
                [44, -6, 6],
                [-40, -22, 5],
                [16, -36, 4.5],
              ]}
            />
          </>
        )}
        {state === 'pre' && <Sparkles head={head} />}
        {state === 'ovulation' && <Sparkles head={head} />}
        {state === 'pregnancy' && (
          <>
            <Sparkles head={head} pink />
            <Hearts head={head} spots={[[34, -30, 7]]} />
          </>
        )}
        {state === 'late' && <Late head={head} />}
        {showParty && <Party head={head} />}
      </>
    );
  }
  if (!content) return null;

  const kx = boxW / picW;
  const ky = boxH / picH;
  return (
    <Svg
      pointerEvents="none"
      width={boxW + MARGIN * 2 * kx}
      height={boxH + (MARGIN + MARGIN_TOP) * ky}
      viewBox={`${-MARGIN} ${-MARGIN_TOP} ${picW + MARGIN * 2} ${picH + MARGIN + MARGIN_TOP}`}
      style={{ position: 'absolute', left: -MARGIN * kx, top: -MARGIN_TOP * ky }}
    >
      {content}
    </Svg>
  );
}

/** Soft coloured glow behind the duck (ovulation: gold, pregnancy: pink). */
export function Glow({ state, boxW, boxH }: { state: DuckState; boxW: number; boxH: number }) {
  if (state !== 'ovulation' && state !== 'pregnancy') return null;
  const color = state === 'ovulation' ? '#FFD54A' : '#FF9EC5';
  const w = boxW * 2;
  const h = boxH * 1.5;
  return (
    <Svg
      pointerEvents="none"
      width={w}
      height={h}
      style={{ position: 'absolute', left: (boxW - w) / 2, top: boxH - h + boxH * 0.1 }}
    >
      <Defs>
        <RadialGradient id="duckGlow" cx="50%" cy="58%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={0.65} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={w} height={h} fill="url(#duckGlow)" />
    </Svg>
  );
}
