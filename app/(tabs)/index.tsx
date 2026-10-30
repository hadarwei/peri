import { Text, View } from 'react-native';

import { t } from '../../src/i18n';
import { colors, type } from '../../src/theme';

export default function Screen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.ground,
      }}
    >
      <Text style={[type.title, { color: colors.ink }]}>{t('tabs.today')}</Text>
    </View>
  );
}
