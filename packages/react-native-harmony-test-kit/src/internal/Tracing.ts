import {Duration} from './Duration';
import {HdcClient} from './HdcClient';

export class Tracing {
  constructor(private hdcClient: HdcClient) {}

  async dump() {
    const result = await this.hdcClient.hitrace().dump();
    return new TracingResult(result);
  }

  async finish() {
    const result = await this.hdcClient.hitrace().finish();
    return new TracingResult(result);
  }
}

class TracingResult {
  constructor(private _raw: string) {}

  toString() {
    return this._raw;
  }

  private static EVENT_TRACE_BY_NAME = {
    TOUCH_END: 'EventEmitter::dispatchEvent[type][touchEnd]',
    RENDERING_START: 'H:GraphicsLoad',
  } as const;

  getLatestTimestamp(
    eventName: keyof typeof TracingResult.EVENT_TRACE_BY_NAME,
  ) {
    const timestamps = this.getTraceTimestampsByPattern(
      TracingResult.EVENT_TRACE_BY_NAME[eventName],
    );
    if (timestamps.length === 0) {
      return null;
    }
    return timestamps[timestamps.length - 1];
  }

  getTimestamps(eventName: keyof typeof TracingResult.EVENT_TRACE_BY_NAME) {
    return this.getTraceTimestampsByPattern(
      TracingResult.EVENT_TRACE_BY_NAME[eventName],
    );
  }

  private getTraceTimestampsByPattern(tracePattern: string): Duration[] {
    const escapedPattern = tracePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const timestampRegex = new RegExp(`(\\d+\\.\\d+):.*${escapedPattern}`);

    return this._raw
      .split('\n')
      .filter(line => line.includes(tracePattern))
      .map(line => {
        const match = line.match(timestampRegex);
        return match ? match[1] : null;
      })
      .filter((timestamp): timestamp is string => timestamp !== null)
      .map(Duration.parse);
  }
}
