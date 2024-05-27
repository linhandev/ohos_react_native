import http from '@ohos.net.http';
import {
  CancelRequestCallback,
  HttpErrorResponse,
  HttpResponse,
  RequestInterceptor,
  RequestOptions,
  ResponseInterceptor
} from './types';
import { webview } from '@kit.ArkWeb';

export interface HttpClient {
  addResponseInterceptor(interceptor: ResponseInterceptor);

  addRequestInterceptor(interceptor: RequestInterceptor)

  sendRequest(url: string, requestOptions: RequestOptions): {
    cancel: CancelRequestCallback,
    promise: Promise<HttpResponse>
  },

  clearCookies(): Promise<boolean>;

}

function mergeObjects<T>(baseObject: Partial<T>, overridingObject: Partial<T>): T {
  const mergedObject: Partial<Record<keyof T, any>> = {};

  const allKeys = new Set([
    ...Object.keys(baseObject),
    ...Object.keys(overridingObject)
  ]);

  allKeys.forEach((value: string) => {
    const key = value as keyof T;
    mergedObject[key] = overridingObject[key] !== null && overridingObject[key] !== undefined
      ? overridingObject[key]
      : baseObject[key];
  });

  return mergedObject as T;
}


export class DefaultHttpClient implements HttpClient {
  protected responseInterceptors: ResponseInterceptor[];
  protected requestInterceptors: RequestInterceptor[];
  protected baseRequestOptions: RequestOptions;

  constructor({ baseRequestOptions, responseInterceptors, requestInterceptors }: {
    baseRequestOptions?: RequestOptions
    responseInterceptors?: ResponseInterceptor[],
    requestInterceptors?: RequestInterceptor[],
  }={}) {
    this.baseRequestOptions = baseRequestOptions ?? {};
    this.responseInterceptors = responseInterceptors ?? [];
    this.requestInterceptors = requestInterceptors ?? [];
  }


  private fetchCookies(url: string,): string {
    const cookies = webview.WebCookieManager.fetchCookieSync(url);
    return cookies;
  }

  private setCookiesFromHeaders(url: string, headers: Object) {
    const cookieHeaders = headers['set-cookie'] as Array<string>;
    if (!cookieHeaders) {
      return;
    }
    //each cookie has to be set separately because of a bug which happens when setting multiple cookies at once
    for (const cookie of cookieHeaders) {
      webview.WebCookieManager.configCookieSync(url, cookie)
    }
    webview.WebCookieManager.saveCookieAsync();
  }

  async clearCookies(): Promise<boolean> {
    const didDeleteAnyCookies = webview.WebCookieManager.existCookie();
    await webview.WebCookieManager.clearAllCookies();
    return didDeleteAnyCookies;
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }


  sendRequest(url: string, requestOptions: RequestOptions): {
    cancel: CancelRequestCallback,
    promise: Promise<HttpResponse>
  } {
    const httpRequest = http.createHttp();
    const cleanup = () => {
      httpRequest.destroy();
    }
    const promise: Promise<HttpResponse> = new Promise((resolve, reject) => {

      let headers: Object | undefined;
      let resultBody: ArrayBuffer;
      let responseCode: number;

      let currentLength = 0;
      let totalLength = null;
      const dataChunks: ArrayBuffer[] = [];

      const maybeResolve = () => {
        if (resultBody != undefined && headers != undefined && responseCode != undefined) {
          let response: HttpResponse = {
            statusCode: responseCode,
            headers: headers,
            body: resultBody
          }
          for (const interceptor of this.responseInterceptors) {
            if (interceptor.shouldIntercept(url, response)) {
              response = interceptor.intercept(url, response)
            }
          }
          resolve(response);
        }
      }

      let finalRequestOptions: RequestOptions = mergeObjects(this.baseRequestOptions, requestOptions);
      for (const interceptor of this.requestInterceptors) {
        if (interceptor.shouldIntercept(url, finalRequestOptions)) {
          ({ url, requestOptions } = interceptor.intercept(url, finalRequestOptions))
          finalRequestOptions = requestOptions;
        }
      }

      if (requestOptions.handleCookies) {
        const cookies = this.fetchCookies(url);
        const cookiesForHeader = cookies.replace(/,/g, ';');
        if (requestOptions.header["cookie"]) {
          requestOptions.header["cookie"] += "; " + cookiesForHeader;
        } else {
          requestOptions.header["cookie"] = cookiesForHeader;
        }
      }

      httpRequest.once('headersReceive', (data) => {
        headers = data;
        totalLength = headers['content-length'] ?? -1;
        this.setCookiesFromHeaders(url, headers);
        maybeResolve();
      })

      httpRequest.on('dataReceive', (chunk) => {
        dataChunks.push(chunk);
        currentLength += chunk.byteLength;
        if (requestOptions.onProgress) {
          requestOptions.onProgress({
            totalLength: totalLength,
            lengthReceived: currentLength,
            bitsReceived: chunk,
          })
        }
      })

      httpRequest.on('dataEnd', () => {
        const totalLength = dataChunks.map(chunk => chunk.byteLength).reduce((acc, length) => acc + length, 0);
        const data = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of dataChunks) {
          const chunkArray = new Uint8Array(chunk);
          data.set(chunkArray, offset);
          offset += chunk.byteLength;
        }
        resultBody = data.buffer;
        maybeResolve();
      })

      try {
        httpRequest.requestInStream(
          url,
          finalRequestOptions,
          (err, data) => {
            responseCode = data;
            if (err) {
              cleanup();
              reject({
                error: err,
                statusCode: responseCode ?? 0
              } as HttpErrorResponse);
            } else {
              maybeResolve();
            }
          }
        );
      } catch (err) {
        cleanup();
        reject({
          error: err,
          statusCode: 0
        } as HttpErrorResponse);
      }

    });

    const cancel = cleanup;

    return { cancel, promise };
  }
}
