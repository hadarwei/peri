import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  DUCK_H,
  DUCK_W,
  clampToBounds,
  depthScale,
  facingScaleX,
  nextWanderDelayMs,
  randomPoint,
  walkDurationMs,
  walkableBounds,
  type Point,
} from '../core/duckMovement';
import { useDuck } from '../duck/DuckProvider';
import { Duck } from './Duck';

interface Props {
  width: number;
  height: number;
}

/**
 * The duck wandering around the meadow; tapping the meadow sends it there.
 * A position is the duck's feet (bottom centre of its box), matching the design.
 */
export function DuckWalker({ width, height }: Props) {
  const reduceMotion = useReducedMotion();
  const { celebrating, celebrate } = useDuck();
  const bounds = useMemo(() => walkableBounds(width), [width]);

  const [start] = useState<Point>(() => ({ x: width / 2, y: 256 }));
  const x = useSharedValue(start.x);
  const y = useSharedValue(start.y);
  const facing = useSharedValue<1 | -1>(1);
  const [walking, setWalking] = useState(false);
  const sceneRef = useRef<ComponentRef<typeof Pressable>>(null);
  const [debug, setDebug] = useState('');
  const wanders = useRef(0);

  const pos = useRef<Point>(start); // where the duck is (or is heading), for the JS side
  const face = useRef<1 | -1>(1);
  const wanderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebratingRef = useRef(celebrating);
  useEffect(() => {
    celebratingRef.current = celebrating;
  }, [celebrating]);

  const moveTo = useCallback(
    (target: Point) => {
      const to = clampToBounds(target, bounds);
      if (__DEV__) {
        setDebug(
          `tap/target ${Math.round(target.x)},${Math.round(target.y)} -> ${Math.round(to.x)},${Math.round(to.y)} | from ${Math.round(pos.current.x)},${Math.round(pos.current.y)} | wanders ${wanders.current} | reduceMotion ${reduceMotion}`,
        );
      }
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
      x.set(withTiming(to.x, { duration, easing: Easing.linear }));
      y.set(withTiming(to.y, { duration, easing: Easing.linear }));
      // Stop the legs when the walk ends. A plain JS timer, so no code runs on the UI thread.
      if (stopTimer.current) clearTimeout(stopTimer.current);
      stopTimer.current = setTimeout(() => setWalking(false), duration);
    },
    [bounds, reduceMotion, x, y, facing],
  );

  // Wander to a new random point every 2.5 to 5.5 seconds (not while dancing).
  useEffect(() => {
    if (reduceMotion) return;
    const schedule = () => {
      wanderTimer.current = setTimeout(() => {
        wanders.current += 1;
        if (!celebratingRef.current) moveTo(randomPoint(bounds));
        schedule();
      }, nextWanderDelayMs());
    };
    schedule();
    return () => {
      if (wanderTimer.current) clearTimeout(wanderTimer.current);
      if (stopTimer.current) clearTimeout(stopTimer.current);
    };
  }, [reduceMotion, moveTo, bounds]);

  const duckStyle = useAnimatedStyle(() => ({
    transformOrigin: '50% 100%',
    transform: [
      { translateX: x.get() - DUCK_W / 2 },
      { translateY: y.get() - DUCK_H },
      { scale: depthScale(y.get(), bounds) },
      { scaleX: facing.get() },
    ],
  }));

  const feetDotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }],
  }));

  return (
    <Pressable
      style={{ position: 'absolute', top: 0, left: 0, width, height }}
      ref={sceneRef}
      onPress={(e) => {
        // pageX/pageY are screen coordinates; locationX/Y depend on which child got the touch.
        const { pageX, pageY } = e.nativeEvent;
        sceneRef.current?.measureInWindow((ox, oy) => {
          moveTo({ x: pageX - ox, y: pageY - oy });
        });
      }}
    >
      {__DEV__ && (
        <>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: bounds.minX,
              top: bounds.minY,
              width: bounds.maxX - bounds.minX,
              height: bounds.maxY - bounds.minY,
              borderWidth: 1,
              borderColor: 'red',
            }}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: -4,
                left: -4,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'red',
              },
              feetDotStyle,
            ]}
          />
        </>
      )}
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: 0, width: DUCK_W, height: DUCK_H },
          duckStyle,
        ]}
      >
        <Pressable onPress={celebrate} accessibilityRole="button" hitSlop={8}>
          <Duck mode={celebrating ? 'dance' : walking ? 'walk' : 'idle'} size={DUCK_H} />
        </Pressable>
      </Animated.View>
      {__DEV__ && (
        <Text
          style={{
            position: 'absolute',
            bottom: 2,
            left: 4,
            right: 4,
            fontSize: 9,
            color: '#1F3347',
          }}
        >
          {debug}
        </Text>
      )}
    </Pressable>
  );
}
