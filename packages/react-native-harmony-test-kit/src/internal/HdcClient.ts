type Direction = 0 | 1 | 2 | 3;

function isCoord(num: number): boolean {
  return Number.isInteger(num) && num > 0;
}

function isVelocity(num: number): boolean {
  return Number.isInteger(num) && num >= 200 && num <= 40000;
}

export class HdcClientError extends Error {}

export class HdcClient {
  private ws: WebSocket;

  protected constructor(ws: WebSocket) {
    this.ws = ws;
  }

  protected static async connect(
    url: string = 'localhost',
    port: number = 8083,
  ): Promise<WebSocket> {
    const ws = new WebSocket(`ws://${url}:${port}`);
    const isConnected = new Promise<void>((resolve, reject) => {
      ws.addEventListener('open', () => {
        console.log('Connected to hdc server');
        resolve();
      });

      ws.addEventListener('error', error => {
        reject(
          new HdcClientError(
            `Cannot connect to WebSocket server: ${error.message}`,
          ),
        );
      });
    });
    await isConnected;
    return ws;
  }

  static async create(
    url: string = 'localhost',
    port: number = 8083,
  ): Promise<HdcClient> {
    return new HdcClient(await this.connect(url, port));
  }

  private async sendCommand(cmd: string): Promise<string> {
    const id = Date.now();
    const msg = {id, cmd};

    return new Promise<string>((resolve, reject) => {
      const onMessage = (event: WebSocketMessageEvent) => {
        const data = JSON.parse(event.data) as {id: number; result: string};
        if (data.id === id) {
          this.ws.removeEventListener('message', onMessage);
          resolve(data.result);
        }
      };

      this.ws.addEventListener('message', onMessage);
      this.ws.send(JSON.stringify(msg));

      setTimeout(() => {
        this.ws.removeEventListener('message', onMessage);
        reject(
          new HdcClientError(
            `Server did not confirm command execution: ${cmd}`,
          ),
        );
      }, 4000);
    });
  }

  uiTest() {
    return {
      uiInput: () => {
        return {
          click: async (x: number, y: number): Promise<void> => {
            if (!isCoord(x) || !isCoord(y)) {
              throw new HdcClientError(
                'Coordinates must be a positive integers',
              );
            }
            await this.sendCommand(`uitest uiInput click ${x} ${y}`);
          },
          doubleClick: async (x: number, y: number): Promise<void> => {
            if (!isCoord(x) || !isCoord(y)) {
              throw new HdcClientError(
                'Coordinates must be a positive integers',
              );
            }
            await this.sendCommand(`uitest uiInput doubleClick ${x} ${y}`);
          },
          longclick: async (x: number, y: number): Promise<void> => {
            if (!isCoord(x) || !isCoord(y)) {
              throw new HdcClientError(
                'Coordinates must be a positive integers',
              );
            }
            await this.sendCommand(`uitest uiInput longClick ${x} ${y}`);
          },
          dircFling: async (
            dir: Direction,
            speed: number = 600,
          ): Promise<void> => {
            if (!isVelocity(speed)) {
              throw new HdcClientError(
                'Velocity must be integer between 200 and 40000',
              );
            }

            await this.sendCommand(`uitest uiInput dircFling ${dir} ${speed}`);
          },
          keyEvent: () => {
            const that = this;
            let keyChain: (string | number)[] = [];

            const keyEventChain: {
              back: () => typeof keyEventChain;
              home: () => typeof keyEventChain;
              power: () => typeof keyEventChain;
              send: () => Promise<void>;
            } = {
              back: (): typeof keyEventChain => {
                if (keyChain.length >= 3) {
                  throw new HdcClientError(
                    'Cannot send more than 3 key events at once.',
                  );
                }
                keyChain.push('Back');
                return keyEventChain;
              },
              home: (): typeof keyEventChain => {
                if (keyChain.length >= 3) {
                  throw new HdcClientError(
                    'Cannot send more than 3 key events at once.',
                  );
                }
                keyChain.push('Home');
                return keyEventChain;
              },
              power: (): typeof keyEventChain => {
                if (keyChain.length >= 3) {
                  throw new HdcClientError(
                    'Cannot send more than 3 key events at once.',
                  );
                }
                keyChain.push('Power');
                return keyEventChain;
              },
              send: async (): Promise<void> => {
                if (keyChain.length === 0) {
                  throw new HdcClientError('At least one key must be sent.');
                }
                const command = `uitest uiInput keyEvent ${keyChain.join(' ')}`;
                keyChain = [];
                await that.sendCommand(command);
              },
            };
            return keyEventChain;
          },
          text: async (text: string) => {
            await this.sendCommand(`uitest uiInput text "${text}"`);
          },
          inputText: async (x: number, y: number, text: string) => {
            await this.sendCommand(
              `uitest uiInput inputText ${x} ${y} "${text}"`,
            );
          },
        };
      },
    };
  }

  hitrace() {
    return {
      begin: async (tag: string): Promise<void> => {
        await this.sendCommand(`hitrace --trace_begin ${tag}`);
      },
      dump: async (): Promise<string> => {
        return this.sendCommand('hitrace --trace_dump');
      },
      finish: async (): Promise<string> => {
        return this.sendCommand('hitrace --trace_finish');
      },
    };
  }
}
