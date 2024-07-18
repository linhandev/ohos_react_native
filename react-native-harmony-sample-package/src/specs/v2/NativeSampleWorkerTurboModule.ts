import { TurboModuleRegistry } from 'react-native';
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';

export interface Spec extends TurboModule {
  runComputeIntensiveTask(): void;
  runAsyncTask(): Promise<number>;
  getRNVersionFromUIContext(prefix: string): Promise<string>;
  showAlert(): void;
}

export default TurboModuleRegistry.get<Spec>('SampleWorkerTurboModule')!;
