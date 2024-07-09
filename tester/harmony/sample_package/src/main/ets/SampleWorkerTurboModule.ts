import { WorkerTurboModule } from '@rnoh/react-native-openharmony/ts';
import { TM } from "@rnoh/react-native-openharmony/generated/ts"

export class SampleWorkerTurboModule extends WorkerTurboModule implements TM.SampleWorkerTurboModule.Spec {
  runComputeIntensiveTask(): void {
    const endTime = Date.now() + 1000;
    let count = 0;
    while (Date.now() < endTime) {
      count++;
    }
  }
}
