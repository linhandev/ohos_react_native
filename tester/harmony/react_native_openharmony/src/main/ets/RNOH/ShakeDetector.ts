import sensor from '@ohos.sensor';

export type ShakeListener = () => void;

export class ShakeDetector {
  static readonly MIN_TIME_BETWEEN_SAMPLES_NS = 20000000;
  static readonly SHAKING_WINDOW_MS = 3000;
  static readonly GRAVITY_EARTH = 9.80665;
  static readonly MIN_NUM_SHAKES: number = 2 * 8;
  // Required force to constitute a rage shake. Need to multiply Earth's gravity by 1.33 because a rage
  // shake in one direction should have more force than just the magnitude of free fall.
  static readonly REQUIRED_FORCE = ShakeDetector.GRAVITY_EARTH * 1.33;

  private mAccelerationX: number = 0;
  private mAccelerationY: number = 0;
  private mAccelerationZ: number = 0;
  private mNumShakes: number = 0;
  private mLastShakeTimestamp: number = 0;

  private shakeListener: ShakeListener;

  constructor(shakeListener: ShakeListener) {
    this.shakeListener = shakeListener;
    sensor.on(sensor.SensorId.ACCELEROMETER, this.onSensorChanged.bind(this), {
      interval: ShakeDetector.MIN_TIME_BETWEEN_SAMPLES_NS,
    });
  }

  resetDetector() {
    this.reset();
  }

  private reset() {
    this.mAccelerationX = 0;
    this.mAccelerationY = 0;
    this.mAccelerationZ = 0;
    this.mNumShakes = 0;
  }

  private atLeastRequiredForce(a: number): boolean {
    return Math.abs(a) > ShakeDetector.REQUIRED_FORCE;
  }

  private recordShake(timestamp: number): void {
    this.mLastShakeTimestamp = timestamp;
    this.mNumShakes++;
  }

  private onSensorChanged(data: sensor.AccelerometerResponse) {
    const timestamp = Date.now();
    const {x, y} = data;
    const z = data.z - ShakeDetector.GRAVITY_EARTH;

    if (this.atLeastRequiredForce(x) && x * this.mAccelerationX <= 0) {
      this.recordShake(timestamp);
      this.mAccelerationX = x;
    } else if (this.atLeastRequiredForce(y) && y * this.mAccelerationY <= 0) {
      this.recordShake(timestamp);
      this.mAccelerationY = y;
    } else if (this.atLeastRequiredForce(z) && z * this.mAccelerationZ <= 0) {
      this.recordShake(timestamp);
      this.mAccelerationZ = z;
    }

    this.maybeDispatchShake(timestamp);
  }

  private maybeDispatchShake(timestamp: number) {
    if (this.mNumShakes >= ShakeDetector.MIN_NUM_SHAKES) {
      this.reset();
      this.shakeListener();
    }

    if (
      timestamp - this.mLastShakeTimestamp >
      ShakeDetector.SHAKING_WINDOW_MS
    ) {
      this.reset();
    }
  }
}
