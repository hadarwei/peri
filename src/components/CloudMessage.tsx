import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Rect } from 'react-native-svg';

import type { DuckMessage } from '../duck/DuckProvider';
import { colors, fonts } from '../theme';

export const CLOUD_W = 190;
export const CLOUD_H = 74;

interface Props {
  /** The message to show; null starts the fade-out (the provider clears it after 5 s). */
  message: DuckMessage | null;
  /** The duck's feet, so the cloud follows it. */
  x: SharedValue<number>;
  y: SharedValue<number>;
  sceneWidth: number;
  sceneHeight: number;
}

// Cloud outline: rounded body plus three bumps. Drawn twice (bigger in the border colour first).
const SHAPES = [
  { kind: 'rect', x: 6, y: 20, w: 178, h: 48, r: 24 },
  { kind: 'circle', cx: 48, cy: 28, r: 20 },
  { kind: 'circle', cx: 96, cy: 22, r: 22 },
  { kind: 'circle', cx: 144, cy: 28, r: 19 },
] as const;

function CloudShape() {
  return (
    <Svg width={CLOUD_W} height={CLOUD_H} style={{ position: 'absolute' }}>
      {[
        { pad: 1.5, fill: colors.cardBorder },
        { pad: 0, fill: '#FFFFFF' },
      ].map(({ pad, fill }) =>
        SHAPES.map((s, i) =>
          s.kind === 'rect' ? (
            <Rect
              key={`${fill}-${i}`}
              x={s.x - pad}
              y={s.y - pad}
              width={s.w + 2 * pad}
              height={s.h + 2 * pad}
              rx={s.r + pad}
              fill={fill}
            />
          ) : (
            <Circle key={`${fill}-${i}`} cx={s.cx} cy={s.cy} r={s.r + pad} fill={fill} />
          ),
        ),
      )}
    </Svg>
  );
}

/**
 * A white cloud next to the duck: scales and fades in, bobs gently, follows the duck, and fades
 * out when the message is cleared. With Reduce Motion it only fades (no scaling, no bobbing).
 */
export function CloudMessage({ message, x, y, sceneWidth, sceneHeight }: Props) {
  const reduceMotion = useReducedMotion();
  // Keep showing the last text while the cloud fades out.
  const [shown, setShown] = useState<DuckMessage | null>(null);
  const appear = useSharedValue(0);
  const bob = useSharedValue(0);

  // Remember the newest message during render (React's pattern for state derived from props).
  if (message && message !== shown) setShown(message);

  useEffect(() => {
    if (message) {
      appear.set(0);
      appear.set(
        withTiming(1, { duration: reduceMotion ? 200 : 380, easing: Easing.out(Easing.back(1.6)) }),
      );
    } else {
      appear.set(withTiming(0, { duration: 300 }));
    }
  }, [message, reduceMotion, appear]);

  useEffect(() => {
    if (reduceMotion) return;
    bob.set(
      withRepeat(
        withSequence(
          withTiming(-3, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(3, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(bob);
  }, [reduceMotion, bob]);

  const style = useAnimatedStyle(() => {
    // Plain numbers only on the UI thread. The cloud sits beside the duck's head, on the side
    // with more room, and stays inside the scene.
    const onLeftHalf = x.get() < sceneWidth / 2;
    const rawX = onLeftHalf ? x.get() + 30 : x.get() - 30 - CLOUD_W;
    const left = Math.min(Math.max(rawX, 8), sceneWidth - CLOUD_W - 8);
    const top = Math.min(Math.max(y.get() - 100, 6), sceneHeight - CLOUD_H - 4);
    const scale = reduceMotion ? 1 : 0.6 + 0.4 * appear.get();
    return {
      opacity: appear.get(),
      transform: [{ translateX: left }, { translateY: top + bob.get() }, { scale }],
    };
  });

  if (!shown) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: CLOUD_W,
          height: CLOUD_H,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <CloudShape />
      <Text
        numberOfLines={2}
        style={{
          width: 140,
          textAlign: 'center',
          fontFamily: fonts.medium,
          fontSize: 13,
          lineHeight: 18,
          color: colors.ink,
          marginTop: 12,
        }}
      >
        {shown.text}
      </Text>
    </Animated.View>
  );
}
