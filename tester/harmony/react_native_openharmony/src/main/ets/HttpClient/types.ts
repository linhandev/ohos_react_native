import http from '@ohos.net.http'

export interface RequestInterceptor {
  shouldIntercept(url: string, requestOptions: RequestOptions): boolean

  intercept(url: string, requestOptions: RequestOptions): {
    url: string,
    requestOptions: RequestOptions
  }
}

export interface ResponseInterceptor {
  shouldIntercept(url: string, response: HttpResponse): boolean

  intercept(url: string, response: HttpResponse): HttpResponse

}

export interface ReceiveProgress {
  totalLength: number,
  lengthReceived: number,
  bitsReceived: ArrayBuffer
}

export interface SendProgress {
  totalLength: number,
  lengthSent: number,
}

export interface HttpResponse {
  statusCode: number,
  headers: object,
  body: string | ArrayBuffer,
}

export interface HttpErrorResponse {
  statusCode: number,
  error: Error
  timeout?: boolean
}

export type RequestOptions = http.HttpRequestOptions & {
  handleCookies?: boolean,
  timeout?: number //in ms, maximal time the whole request can take
  onReceiveProgress?: (receiveProgress: ReceiveProgress) => void,
  onSendProgress?: (sendProgress: SendProgress) => void
}

export type CancelRequestCallback = () => void
