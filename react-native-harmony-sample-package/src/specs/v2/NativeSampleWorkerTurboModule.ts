import { TurboModuleRegistry } from 'react-native';
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';

export interface Spec extends TurboModule {
  runComputeIntensiveTask(): void;
}

export default TurboModuleRegistry.get<Spec>('SampleWorkerTurboModule')!;
