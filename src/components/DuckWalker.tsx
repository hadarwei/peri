import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  DUCK_H,
  DUCK_W,
  clampToBounds,
  depthScale,
  facingScaleX,
  isOnDuck,
  nextWanderDelayMs,
  randomPoint,
  walkDurationMs,
  walkableBounds,
  type Point,
} from '../core/duckMovement';
import { useReduceMotion } from '../hooks/useReduceMotion';
import type { DuckState } from '../core/duckState';
import { useDuck } from '../duck/DuckProvider';
import { CloudMessage } from './CloudMessage';
import { Duck } from './Duck';

// Set to true to draw the walkable band, the feet dot, the picture box and a movement log.
const DEBUG_DUCK = false;

/**
 * The duck wandering around the meadow; tapping the meadow sends it there, tapping the duck
 * makes it dance. A position is the duck's feet (bottom centre of its box).
 *
 * Returns two layers for <MeadowScene>: `behind` catches taps (under the header buttons) and
 * `front` draws the duck on top of everything without taking touches, so it can walk over the
 * greeting text and the header buttons stay tappable.
 */
export function useDuckWalker(width: number, height: number, state: DuckState = 'normal') {
  const reduceMotion = useReduceMotion();
  const dreaming = state === 'dreaming';
  const { celebrating, celebrate, message } = useDuck();
  const bounds = useMemo(() => walkableBounds(width), [width]);

  const [start] = useState<Point>(() => ({ x: width / 2, y: 240 }));
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
      if (DEBUG_DUCK) {
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
    if (reduceMotion || dreaming) return; // a sleeping duck does not wander
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
  }, [reduceMotion, dreaming, moveTo, bounds]);

  // One animated "anchor" sits exactly on the duck's feet. It has no size, so scaling it scales
  // about the feet. The duck box hangs from it with static offsets. Plain numbers only on the UI
  // thread (no imported functions).
  const { minY, maxY } = bounds;
  const anchorStyle = useAnimatedStyle(() => {
    const t = Math.min(Math.max((y.get() - minY) / (maxY - minY), 0), 1);
    return {
      transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: 0.85 + t * 0.27 }],
    };
  });
  const flipStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: facing.get() }] }));
  const feetDotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }],
  }));

  const behind = (
    <Pressable
      ref={sceneRef}
      style={{ position: 'absolute', top: 0, left: 0, width, height }}
      onPress={(e) => {
        // pageX/pageY are screen coordinates; locationX/Y depend on which child got the touch.
        const { pageX, pageY } = e.nativeEvent;
        sceneRef.current?.measureInWindow((ox, oy) => {
          const tap = { x: pageX - ox, y: pageY - oy };
          if (isOnDuck(tap, pos.current, depthScale(pos.current.y, bounds))) celebrate();
          else moveTo(tap);
        });
      }}
    />
  );

  const front = (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width, height }}>
      {DEBUG_DUCK && (
        <View
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
      )}
      <Animated.View
        style={[{ position: 'absolute', left: 0, top: 0, width: 0, height: 0 }, anchorStyle]}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: -DUCK_W / 2,
              top: -DUCK_H,
              width: DUCK_W,
              height: DUCK_H,
              borderWidth: DEBUG_DUCK ? 1 : 0,
              borderColor: 'limegreen',
            },
            flipStyle,
          ]}
        >
          <Duck
            mode={celebrating ? 'dance' : dreaming ? 'rest' : walking ? 'walk' : 'idle'}
            state={state}
            size={DUCK_H}
          />
        </Animated.View>
      </Animated.View>
      <CloudMessage message={message} x={x} y={y} sceneWidth={width} sceneHeight={height} />
      {DEBUG_DUCK && (
        <>
          <Animated.View
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
        </>
      )}
    </View>
  );

  return { behind, front };
}
