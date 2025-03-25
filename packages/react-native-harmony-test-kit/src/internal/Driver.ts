import {HdcClient} from './HdcClient';
import {PixelRatio} from 'react-native';
import {Tracing} from './Tracing';

interface Measurable {
  measure: (
    callback: (
      x: number,
      y: number,
      width: number,
      height: number,
      pageX: number,
      pageY: number,
    ) => void,
  ) => void;
}

function isMeasurable(ref: any): ref is Measurable {
  return ref && typeof ref.measure === 'function';
}

enum UIDirectionEnum {
  LEFT = 0,
  RIGHT = 1,
  DOWN = 2,
  UP = 3,
}

interface Offset {
  x: number;
  y: number;
}

export class DriverError extends Error {}

export type UIDirection = 'LEFT' | 'RIGHT' | 'DOWN' | 'UP';

export class Driver {
  private hdcClient: HdcClient;

  static async create(
    url: string = 'localhost',
    port: number = 8083,
  ): Promise<Driver> {
    const hdcClient = await HdcClient.create(url, port);
    return new Driver(hdcClient);
  }

  private constructor(hdcClient: HdcClient) {
    this.hdcClient = hdcClient;
  }

  private dpToPhysical(coord: number): number {
    return PixelRatio.getPixelSizeForLayoutSize(Math.round(coord));
  }

  async fling({
    direction,
    speed = 600,
  }: {
    direction: UIDirection;
    speed?: number;
  }): Promise<void> {
    this.hdcClient
      .uiTest()
      .uiInput()
      .dircFling(UIDirectionEnum[direction], speed);
  }

  async click({
    ref,
    offset = {x: 0, y: 0},
  }: {
    ref: React.RefObject<React.Component<any>>;
    offset?: Offset;
  }): Promise<void> {
    if (!ref.current) {
      throw new DriverError('Ref is undefined');
    }

    if (!isMeasurable(ref.current)) {
      throw new DriverError('Component does not have measure method');
    }

    ref.current.measure(
      async (_, __, width: number, height: number, pageX, pageY) => {
        const pX = this.dpToPhysical(pageX + width / 2 + offset.x);
        const pY = this.dpToPhysical(pageY + height / 2 + offset.y);
        await this.hdcClient.uiTest().uiInput().click(pX, pY);
      },
    );
  }

  async beginTracing() {
    await this.hdcClient.hitrace().begin('app');
    return new Tracing(this.hdcClient);
  }
}
