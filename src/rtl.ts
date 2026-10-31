import { I18nManager } from 'react-native';

// Hebrew app: force right-to-left layout.
// On iOS the change applies on the next app launch, not instantly.
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}
