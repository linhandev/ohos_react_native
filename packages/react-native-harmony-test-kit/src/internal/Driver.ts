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

  private getAbsolutePosition(
    ref: React.RefObject<React.Component<any>>,
    offset: Offset = {x: 0, y: 0},
  ): Promise<{x: number; y: number}> {
    return new Promise((resolve, reject) => {
      if (!ref.current) {
        return reject(new DriverError('Ref is undefined'));
      }
      if (!isMeasurable(ref.current)) {
        return reject(
          new DriverError('Component does not have measure method'),
        );
      }

      ref.current.measure((_, __, width, height, pageX, pageY) => {
        resolve({
          x: this.dpToPhysical(pageX + width / 2 + offset.x),
          y: this.dpToPhysical(pageY + height / 2 + offset.y),
        });
      });
    });
  }

  async click({
    ref,
    offset,
  }: {
    ref: React.RefObject<React.Component<any>>;
    offset?: Offset;
  }): Promise<void> {
    const {x, y} = await this.getAbsolutePosition(ref, offset);
    await this.hdcClient.uiTest().uiInput().click(x, y);
  }

  async longClick({
    ref,
    offset,
  }: {
    ref: React.RefObject<React.Component<any>>;
    offset?: Offset;
  }): Promise<void> {
    const {x, y} = await this.getAbsolutePosition(ref, offset);
    await this.hdcClient.uiTest().uiInput().longclick(x, y);
  }

  keyEvent() {
    const keyEventInstance = this.hdcClient.uiTest().uiInput().keyEvent();

    const keyEventChain = {
      back: () => {
        keyEventInstance.back();
        return keyEventChain;
      },
      home: () => {
        keyEventInstance.home();
        return keyEventChain;
      },
      power: () => {
        keyEventInstance.power();
        return keyEventChain;
      },
      send: async () => {
        await keyEventInstance.send();
      },
    };

    return keyEventChain;
  }

  async inputText(ref: React.RefObject<React.Component<any>>, text: string) {
    const {x, y} = await this.getAbsolutePosition(ref);
    await this.hdcClient.uiTest().uiInput().inputText(x, y, text);
  }

  async beginTracing() {
    await this.hdcClient.hitrace().begin('app');
    return new Tracing(this.hdcClient);
  }
}
