import { TurboModuleRegistry } from 'react-native';
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';

export interface Spec extends TurboModule {
  isScreenReaderEnabled: () => Promise<boolean>;
  isAccessibilityServiceEnabled: () => Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('AccessibilityInfo');
