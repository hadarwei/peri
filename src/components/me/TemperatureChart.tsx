import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { addDays, parseLocalDate, toLocalDateString } from '../../core/dates';
import {
  buildChart,
  CHART_DAYS,
  linePath,
  summarizeChart,
  type ChartModel,
} from '../../core/tempChart';
import { formatTemperature } from '../../core/temperature';
import { getDb } from '../../db';
import { useDataVersion } from '../../db/dataVersion';
import { getTemperaturesInRange } from '../../db/repos';
import { t, tf } from '../../i18n';
import { colors, MIN_TOUCH, spacing, type } from '../../theme';
import { TEMPERATURE_HOWTO } from '../../content/trackingInfo';
import { Card } from '../Card';
import { InfoPanel } from './InfoPanel';

const HEIGHT = 150;
const LEFT_PAD = 34; // room for the degree labels
const RIGHT_PAD = 8; // so the last dot is not cut off at the edge
const UNUSUAL = '#E08A00';

/** The drawing itself (kept separate so it can be previewed without the database). */
export function ChartDrawing({ model, width }: { model: ChartModel; width: number }) {
  return (
    <Svg width={width + LEFT_PAD + RIGHT_PAD} height={HEIGHT + 20}>
      {[model.yMin, Math.round(((model.yMin + model.yMax) / 2) * 20) / 20, model.yMax].map((v) => {
        const y = HEIGHT - ((v - model.yMin) / (model.yMax - model.yMin || 1)) * HEIGHT + 4;
        return (
          <G key={v}>
            <Line
              x1={LEFT_PAD}
              x2={width + LEFT_PAD}
              y1={y}
              y2={y}
              stroke={colors.cardBorder}
              strokeWidth={1}
            />
            <SvgText x={LEFT_PAD - 4} y={y + 3} fontSize={10} fill={colors.muted} textAnchor="end">
              {v.toFixed(2)}
            </SvgText>
          </G>
        );
      })}
      <Path
        d={linePath(model.linePoints.map((p) => ({ x: p.x + LEFT_PAD, y: p.y + 4 })))}
        stroke={colors.primary}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
      />
      {model.points.map((p) =>
        p.unusual ? (
          <Circle
            key={p.date}
            cx={p.x + LEFT_PAD}
            cy={p.y + 4}
            r={4.5}
            fill="#FFFFFF"
            stroke={UNUSUAL}
            strokeWidth={2}
          />
        ) : (
          <Circle key={p.date} cx={p.x + LEFT_PAD} cy={p.y + 4} r={3.5} fill={colors.primary} />
        ),
      )}
    </Svg>
  );
}

/** Last 30 days of body temperature: a line through normal readings, hollow dots for unusual ones. */
export function TemperatureChart() {
  const { width: screenWidth } = useWindowDimensions();
  const width = screenWidth - spacing.lg * 2 - spacing.lg * 2 - LEFT_PAD - RIGHT_PAD; // screen - page - card padding
  const [model, setModel] = useState<ChartModel | null>(null);
  const [howOpen, setHowOpen] = useState(false);
  const dataVersion = useDataVersion();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const today = toLocalDateString(new Date());
        const start = toLocalDateString(addDays(parseLocalDate(today), -(CHART_DAYS - 1)));
        const readings = await getTemperaturesInRange(await getDb(), start, today);
        if (alive) setModel(buildChart(readings, today, width, HEIGHT));
      } catch {
        // No chart if the database cannot be read.
      }
    })();
    return () => {
      alive = false;
    };
  }, [dataVersion, width]);

  const summary = model ? summarizeChart(model) : null;
  const description = summary
    ? summary.count === 1
      ? tf('tempChart.summaryOne', { last: formatTemperature(summary.last.celsius) })
      : tf('tempChart.summary', {
          count: summary.count,
          min: formatTemperature(summary.min),
          max: formatTemperature(summary.max),
          last: formatTemperature(summary.last.celsius),
        })
    : t('tempChart.empty');

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[type.heading, { color: colors.ink, flex: 1 }]}>{t('tempChart.title')}</Text>
        {/* Opens a short guide on how and when to take the temperature. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tempChart.how')}
          accessibilityState={{ expanded: howOpen }}
          onPress={() => setHowOpen((v) => !v)}
          style={{
            width: MIN_TOUCH,
            height: MIN_TOUCH,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={howOpen ? 'information-circle' : 'information-circle-outline'}
            size={26}
            color={colors.primary}
          />
        </Pressable>
      </View>
      {howOpen && <InfoPanel info={TEMPERATURE_HOWTO} />}
      {!model || !model.hasData ? (
        <Text style={[type.body, { color: colors.muted }]}>{t('tempChart.empty')}</Text>
      ) : (
        <>
          {/* The picture is described in words for screen readers, and the same text is shown. */}
          <View accessible accessibilityRole="image" accessibilityLabel={description}>
            <ChartDrawing model={model} width={width} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.lg }}>
            <Text style={[type.caption, { color: colors.muted }]}>● {t('tempChart.normal')}</Text>
            <Text style={[type.caption, { color: UNUSUAL }]}>○ {t('tempChart.unusual')}</Text>
          </View>
          <Text style={[type.caption, { color: colors.muted }]}>{description}</Text>
        </>
      )}
    </Card>
  );
}
