import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import {
  clampToBounds,
  depthScale,
  facingScaleX,
  nextWanderDelayMs,
  randomPoint,
  walkDurationMs,
  type Bounds,
  type Point,
} from '../core/duckMovement';
import { useDuck } from '../duck/DuckProvider';
import { Duck } from './Duck';

interface Props {
  width: number;
  height: number;
  /** Top of the walkable band: keeps the duck clear of the greeting and chip. */
  topInset: number;
  duckSize?: number;
}

/** The duck wandering around the scene; tapping the meadow sends it there. */
export function DuckWalker({ width, height, topInset, duckSize = 90 }: Props) {
  const reduceMotion = useReducedMotion();
  const { celebrating, celebrate } = useDuck();
  const duckWidth = (duckSize * 260) / 250;
  const bounds = useMemo<Bounds>(
    () => ({ minX: 0, maxX: width - duckWidth, minY: topInset, maxY: height - duckSize - 8 }),
    [width, height, topInset, duckSize, duckWidth],
  );

  const [start] = useState<Point>(() => ({
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  }));
  const x = useSharedValue(start.x);
  const y = useSharedValue(start.y);
  const facing = useSharedValue<1 | -1>(1);
  const [walking, setWalking] = useState(false);

  const pos = useRef<Point>(start); // where the duck is (or is heading), for the JS side
  const face = useRef<1 | -1>(1);
  const celebratingRef = useRef(celebrating);
  useEffect(() => {
    celebratingRef.current = celebrating;
  }, [celebrating]);
  const wanderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopped = useCallback(() => setWalking(false), []);

  const moveTo = useCallback(
    (target: Point) => {
      const to = clampToBounds(target, bounds);
      const from = pos.current;
      face.current = facingScaleX(from, to, face.current);
      facing.set(face.current);
      pos.current = to;
      if (reduceMotion) {
        x.set(to.x);
        y.set(to.y);
        return;
      }
      const duration = walkDurationMs(from, to);
      if (duration < 1) return;
      setWalking(true);
      cancelAnimation(x);
      cancelAnimation(y);
      y.set(withTiming(to.y, { duration, easing: Easing.linear }));
      x.set(
        withTiming(to.x, { duration, easing: Easing.linear }, (finished) => {
          if (finished) scheduleOnRN(stopped);
        }),
      );
    },
    [bounds, reduceMotion, x, y, facing, stopped],
  );

  // Wander to a new random point every 2.5 to 5.5 seconds.
  useEffect(() => {
    if (reduceMotion) return;
    const schedule = () => {
      wanderTimer.current = setTimeout(() => {
        if (!celebratingRef.current) moveTo(randomPoint(bounds));
        schedule();
      }, nextWanderDelayMs());
    };
    schedule();
    return () => {
      if (wanderTimer.current) clearTimeout(wanderTimer.current);
    };
  }, [reduceMotion, moveTo, bounds]);

  const duckStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.get() },
      { translateY: y.get() },
      { scale: depthScale(y.get(), bounds) },
      { scaleX: facing.get() },
    ],
  }));

  return (
    <Pressable
      style={{ position: 'absolute', top: 0, left: 0, width, height }}
      onPress={(e) =>
        moveTo({
          x: e.nativeEvent.locationX - duckWidth / 2,
          y: e.nativeEvent.locationY - duckSize / 2,
        })
      }
    >
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0 }, duckStyle]}>
        <Pressable onPress={celebrate} accessibilityRole="button" hitSlop={8}>
          <Duck mode={celebrating ? 'dance' : walking ? 'walk' : 'idle'} size={duckSize} />
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}
