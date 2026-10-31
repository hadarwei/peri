import { Text } from 'react-native';

import type { Fact } from '../../content/facts';
import { t } from '../../i18n';
import { colors, type } from '../../theme';
import { Card } from '../Card';

export function DidYouKnowCard({ fact }: { fact: Fact }) {
  return (
    <Card style={{ backgroundColor: colors.tint.luteal }}>
      <Text style={[type.label, { color: colors.ink }]}>{t('didYouKnow.title')}</Text>
      <Text style={[type.body, { color: colors.ink }]}>{fact.text}</Text>
    </Card>
  );
}
