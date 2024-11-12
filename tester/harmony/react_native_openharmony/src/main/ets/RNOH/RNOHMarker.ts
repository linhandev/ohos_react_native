export interface RNOHMarkerEventPayload {
  markerId: string;
  tag: string;
  timestamp: number;
}

export interface RNOHMarkerListener {
  logMarker(markerId: string, tag: string, timestamp: number): void;
}

export class RNOHMarker {
  private static listeners: RNOHMarkerListener[] = [];

  static addListener(listener: RNOHMarkerListener) {
    this.listeners.push(listener);
  }

  static removeListener(listener: RNOHMarkerListener) {
    this.listeners = this.listeners.filter((l) => l != listener);
  }

  static notifyListeners(markerId: string, tag: string, timestamp: number) {
    this.listeners.forEach((listener) => listener.logMarker(markerId, tag, timestamp))
  }
}
