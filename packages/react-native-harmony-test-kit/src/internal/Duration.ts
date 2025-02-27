export class Duration {
  constructor(private readonly microseconds: number) {}

  static parse(uptimeStr: string): Duration {
    const [seconds, microseconds] = uptimeStr.split('.');
    const totalMicroseconds =
      parseInt(seconds) * 1000000 + (parseInt(microseconds) || 0);
    return new Duration(totalMicroseconds);
  }

  static fromSeconds(seconds: number): Duration {
    return new Duration(seconds * 1000000);
  }

  toString(): string {
    return this.milliseconds + 'ms';
  }

  get milliseconds(): number {
    return this.microseconds / 1000;
  }

  subtract(other: Duration): Duration {
    const resultMicroseconds = this.microseconds - other.microseconds;

    if (resultMicroseconds < 0) {
      throw new Error('Resulting duration cannot be negative');
    }

    return new Duration(resultMicroseconds);
  }
}
