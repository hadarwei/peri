import { useEffect } from 'react';
import { Image, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from '../hooks/useReduceMotion';
import { duckFrames, type DuckFrame } from '../assets/duckFrames';
import { DUCK_SEQUENCES, FRAME_MS, frameForProgress, type DuckMode } from '../core/duckSequence';
import type { DuckState } from '../core/duckState';
import { REST_H, REST_SCALE, REST_W } from '../duck/anchors';
import { FrameOverlay, Glow } from '../duck/Overlay';

// Frames that can be on screen. All are mounted at once and only their opacity changes.
const HAPPY_ONLY: readonly DuckFrame[] = ['happy'];
const LAYERS: DuckFrame[] = [
  'rest',
  'stand',
  'walk1',
  'walk2',
  'walk3',
  'dance1',
  'dance2',
  'dance3',
  'happy',
];

interface Props {
  mode: DuckMode;
  /** How the duck looks (accessories); defaults to a plain duck. */
  state?: DuckState;
  /** Height of the duck in px. */
  size?: number;
}

/**
 * Plays the duck's frame animation.
 *
 * Approach: every frame is a stacked <Image>; a Reanimated shared value loops 0..N on the UI
 * thread and each layer's opacity is computed from it. Swapping `source` instead would need a
 * React re-render every 150 ms on the JS thread, which can stutter when that thread is busy
 * (database work, other screens). Opacity changes never touch the JS thread.
 */
export function Duck({ mode, state = 'normal', size = 96 }: Props) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  // Reduce Motion: no walking cycle; a dance becomes the single "happy" frame.
  const effectiveMode: DuckMode = reduceMotion && mode === 'walk' ? 'idle' : mode;
  const sequence = reduceMotion && mode === 'dance' ? HAPPY_ONLY : DUCK_SEQUENCES[effectiveMode];

  useEffect(() => {
    cancelAnimation(progress);
    progress.value = 0;
    if (sequence.length > 1) {
      progress.value = withRepeat(
        withTiming(sequence.length, {
          duration: sequence.length * FRAME_MS,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    }
    return () => cancelAnimation(progress);
  }, [sequence, progress]);

  const width = (size * 260) / 250; // stand/walk/dance frames are 260x250
  const party = mode === 'dance';
  return (
    <View style={{ width, height: size }} pointerEvents="none">
      <Glow state={state} boxW={width} boxH={size} />
      {LAYERS.map((name) => (
        <FrameLayer
          key={name}
          name={name}
          sequence={sequence}
          progress={progress}
          width={width}
          height={size}
          state={state}
          party={party}
        />
      ))}
    </View>
  );
}

function FrameLayer({
  name,
  sequence,
  progress,
  width,
  height,
  state,
  party,
}: {
  name: DuckFrame;
  sequence: readonly DuckFrame[];
  progress: { value: number };
  width: number;
  height: number;
  state: DuckState;
  party: boolean;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: frameForProgress(sequence, progress.value) === name ? 1 : 0,
  }));
  // The resting picture is wide, so it gets its own size: half the standing duck's height,
  // bottom-aligned and centred in the box.
  const isRest = name === 'rest';
  const w = isRest ? height * REST_SCALE * (REST_W / REST_H) : width;
  const h = isRest ? height * REST_SCALE : height;
  const left = (width - w) / 2;
  const top = height - h;
  return (
    // Explicit pixel sizes on every layer: the picture must fill exactly the box and no more.
    <Animated.View style={[{ position: 'absolute', left, top, width: w, height: h }, style]}>
      <Image source={duckFrames[name]} style={{ width: w, height: h, resizeMode: 'contain' }} />
      <FrameOverlay state={state} party={party} frame={name} boxW={w} boxH={h} />
    </Animated.View>
  );
}
