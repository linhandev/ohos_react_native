/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type resmgr from '@ohos.resourceManager';
import util from '@ohos.util';
import { RNOHError } from "./RNOHError"
import { RNOHLogger } from './RNOHLogger';
import urlUtils from '@ohos.url';
import { fetchDataFromUrl } from './HttpRequestHelper';
import fs from '@ohos.file.fs';
import { preferences } from '@kit.ArkData';
import { RNOHCoreContext } from './RNOHContext';

/**
 * @actor RNOH_APP
 */
export interface HotReloadConfig {
  bundleEntry: string,
  host: string,
  port: number | string,
  scheme?: string,
}

/**
 * @actor RNOH_APP
 */
export interface FileJSBundle {
  filePath: string,
}

/**
 * @actor RNOH_APP
 */
export interface RawFileJSBundle {
  rawFilePath: string,
}


/**
 * @actor RNOH_APP
 */
export type JsBundle = ArrayBuffer | FileJSBundle | RawFileJSBundle;

/**
 * @actor RNOH_APP
 *
 * Provides JSBundle code and related information. Decouples RNOH core logic from how a bundle is loaded, allowing
 * RN_APP_DEVELOPERS to decide which concrete bundle should be used and when.
 */
export abstract class JSBundleProvider {
  abstract getURL(): string

  abstract getBundle(
    onProgress?: (progress: number) => void,
    /**
     * A design mistake. This callback is specific to AnyJSBundleProvider.
     */
    onProviderSwitch?: (currentProvider: JSBundleProvider) => void
  ): Promise<JsBundle>

  /**
   * @returns AppKeys supported by provided JSBundle.
   *
   * Used by RNApp component, when a RN_APP_DEVELOPER takes the responsibility for loading a bundle to show RNSurface after
   * bundle was loaded.
   */
  abstract getAppKeys(): string[]

  /**
   * @returns A configuration needed to setup hot reloading if supported.
   *
   * In practice, implemented only by MetroJSBundleProvider.
   */
  getHotReloadConfig(): HotReloadConfig | null {
    return null
  }

  /**
   * @returns A text to be displayed by `RNDevLoadingView` when loading a bundle.
   */
  getHumanFriendlyURL(): string {
    return this.getURL()
  }
}


export class JSBundleProviderError extends RNOHError {
}

export class MetroJSBundleProviderError extends JSBundleProviderError {
}

export class FileJSBundleProvider extends JSBundleProvider {
  constructor(private path: string, private appKeys: string[] = []) {
    super()
  }

  getURL(): string {
    return this.path
  }

  getAppKeys(): string[] {
    return this.appKeys
  }

  async getBundle(
    onProgress?: (progress: number) => void,
    onProviderSwitch?: (currentProvider: JSBundleProvider) => void
  ): Promise<FileJSBundle> {
    try {
      const status = await fs.access(this.path, fs.OpenMode.READ_ONLY);
      if (status) {
        return {
          filePath: this.path
        }
      } else {
        throw new Error("The file can't be accessed.");
      }
    } catch (err) {
      throw new JSBundleProviderError({
        whatHappened: `Couldn't access JSBundle in ${this.path}`,
        extraData: err,
        howCanItBeFixed: [`Check if a bundle exists at "${this.path}" on your device.`]
      })
    }
  }
}

export class ResourceJSBundleProvider extends JSBundleProvider {
  constructor(private resourceManager: resmgr.ResourceManager, private path: string = "bundle.harmony.js",
    private appKeys: string[] = []) {
    super()
  }

  getURL() {
    return this.path
  }

  getAppKeys() {
    return this.appKeys
  }

  async getBundle(
    onProgress?: (progress: number) => void,
    onProviderSwitch?: (currentProvider: JSBundleProvider) => void
  ) {
    try {
      // We check for the file descriptor here because there isn't a dedicated way to check if a rawfile exists
      // apart from opening it or getting its descriptor
      const fd = this.resourceManager.getRawFdSync(this.path)
      if (fd) {
        return {
          rawFilePath: this.path,
        };
      } else {
        throw new Error("The rawfile descriptor can't be opened.");
      }
    } catch (err) {
      throw new JSBundleProviderError({
        whatHappened: `Couldn't access JSBundle in ${this.path}`,
        extraData: err,
        howCanItBeFixed: [`Check if a bundle exists at "${this.path}" on your device.`]
      })
    }
  }
}


export class MetroJSBundleProvider extends JSBundleProvider {
  static fromServerIp(ip: string, port: number = 8081, appKeys: string[] = []): MetroJSBundleProvider {
    return new MetroJSBundleProvider(`http://${ip}:${port}/index.bundle?platform=harmony&dev=true&minify=false`,
      appKeys)
  }

  /**
   *
   * @param bundleUrl The URL for fetching the JS bundle.
   *                  If not provided, the behavior depends on the runtime environment:
   *                  - In Debug mode: Attempts to read the Metro server address from Preferences.
   *                  - If reading fails or in Release mode: Falls back to the local Metro server.
   * @param appKeys
   */
  constructor(
    private bundleUrl: string = '',
    private appKeys: string[] = []) {
    super();
    if (bundleUrl) {
      return;
    }
    const defaultBundleUrl: string = "http://localhost:8081/index.bundle?platform=harmony&dev=true&minify=false";
    const rnohCoreContext: RNOHCoreContext = AppStorage.get('RNOHCoreContext');
    if (rnohCoreContext?.isDebugModeEnabled) {
      const dataPreferences: preferences.Preferences =
        preferences.getPreferencesSync(rnohCoreContext.uiAbilityContext, { name: 'devSettings' });
      const address: preferences.ValueType = dataPreferences.getSync('devHostAndPortAddress', '');
      this.bundleUrl =
        address.toString() ? `http://${address.toString()}/index.bundle?platform=harmony&dev=true&minify=false` :
          defaultBundleUrl;
    } else {
      console.warn('#RNOH_ARK: rnohCoreContext is unavailable or the app is not running in Debug mode; unable to connect to the Metro server specified in Settings.');
      this.bundleUrl = defaultBundleUrl;
    }
  }

  getAppKeys() {
    return this.appKeys
  }

  getURL() {
    return this.bundleUrl
  }

  getHotReloadConfig(): HotReloadConfig | null {
    const urlObj = urlUtils.URL.parseURL(this.getURL());
    const pathParts = urlObj.pathname.split('/');
    const bundleEntry = pathParts[pathParts.length - 1];
    const port = urlObj.port ?? 8081;
    const scheme = urlObj.protocol.slice(0, -1);

    return {
      bundleEntry,
      host: urlObj.hostname,
      port,
      scheme,
    }
  }

  async getBundle(
    onProgress?: (progress: number) => void,
    onProviderSwitch?: (currentProvider: JSBundleProvider) => void
  ): Promise<ArrayBuffer> {
    try {
      const response =
        await fetchDataFromUrl(this.bundleUrl, { headers: { 'Content-Type': 'text/javascript' } }, onProgress);
      /**
       * When the responseCode is 500, instead of building a bundle, Metro will report an error which should be thrown and displayed on the phone.
       */
      if (response.responseCode === 500) {
        this.throwMetroError(response.result)
      }
      return response.result;
    } catch (err) {
      if (err instanceof MetroJSBundleProviderError) {
        throw err
      }
      const suggestions = ["Is Metro server running? Did you run `react-native start`?"]
      const hotReloadConfig = this.getHotReloadConfig()
      if (hotReloadConfig) {
        if (hotReloadConfig.host === "localhost") {
          suggestions.push(`Try forwarding data from a device port to a host port (hdc rport tcp:${hotReloadConfig.port} tcp:${hotReloadConfig.port})`)
          suggestions.push(`Are you testing on a real device? Did you connect it to your computer?`)
        } else {
          suggestions.push(`Are you testing on a real device? Is your phone connected to the same Wi-Fi network as your computer?`)
          suggestions.push(`Are you testing on a real device? Does "${hotReloadConfig.host}" matches your computer IP in your local network? Did you use "react-native create-metro-host-constants-harmony"?`)
        }
      }
      throw new JSBundleProviderError({
        whatHappened: `Couldn't load JSBundle from ${this.bundleUrl}`,
        extraData: err,
        howCanItBeFixed: suggestions
      })
    }
  }

  getHumanFriendlyURL(): string {
    const hotReloadConfig = this.getHotReloadConfig()!
    return `${hotReloadConfig.host}:${hotReloadConfig.port}`
  }

  throwMetroError(result: ArrayBuffer) {
    const processChunk = (text: string | undefined) => {
      let content = text ?? ""
      const matches = text?.match(/^([!\x3c-\x3f]*)([\d;]*)([\x20-\x2c]*[\x40-\x7e])([\s\S]*)/m)
      return !matches ? content : matches[4]
    }
    const ansiToText = (txt: string) => {
      const rawTextChunks = txt.split(/\033\[/);
      const firstChunk = rawTextChunks.shift() ?? "";
      const colorChunks = rawTextChunks.map(processChunk);
      colorChunks.unshift(firstChunk);
      return colorChunks.join("");
    }
    const textDecoder = util.TextDecoder.create();
    const err: { message: string, stack: string } = JSON.parse(textDecoder.decodeWithStream(new Uint8Array(result)));
    throw new MetroJSBundleProviderError({
      whatHappened: ansiToText(err.message),
      customStack: err.stack?.replace(err.message, ""),
      howCanItBeFixed: []
    })
  }

  /**
   * @deprecated: do not use it.
   */
  setUIAbilityContext() {
  }

  /**
   * @deprecated: do not use it.
   */
  setBundleUrl() {
  }
}

export class AnyJSBundleProvider extends JSBundleProvider {
  private pickedJSBundleProvider: JSBundleProvider | undefined = undefined
  private currentProvider?: JSBundleProvider;

  constructor(private jsBundleProviders: JSBundleProvider[]) {
    super()
    if (jsBundleProviders.length === 0) {
      throw new JSBundleProviderError({
        whatHappened: "AnyJSBundleProvider received an empty list of providers",
        howCanItBeFixed: ["Provide at least one JSBundleProvider to AnyJSBundleProvider"]
      })
    }
  }

  getCurrentProviderURL(): string | undefined {
    return this.currentProvider?.getURL();
  }

  getURL() {
    const jsBundleProvider = this.pickedJSBundleProvider ?? this.jsBundleProviders[0]
    return jsBundleProvider?.getURL() ?? "?"
  }

  getHumanFriendlyURL(): string {
    const jsBundleProvider = this.pickedJSBundleProvider ?? this.jsBundleProviders[0]
    return jsBundleProvider?.getHumanFriendlyURL() ?? "?"
  }

  getAppKeys() {
    if (!this.pickedJSBundleProvider) {
      return []
    }
    return this.pickedJSBundleProvider.getAppKeys()
  }

  async getBundle(
    onProgress?: (progress: number) => void,
    onProviderSwitch?: (currentProvider: JSBundleProvider) => void
  ) {
    const errors: JSBundleProviderError[] = []
    for (const jsBundleProvider of this.jsBundleProviders) {
      try {
        this.currentProvider = jsBundleProvider;
        onProviderSwitch?.(jsBundleProvider);
        const bundle = await jsBundleProvider.getBundle(onProgress)
        this.pickedJSBundleProvider = jsBundleProvider;
        return bundle;
      } catch (err) {
        if (err instanceof MetroJSBundleProviderError) {
          throw err
        }
        if (err instanceof JSBundleProviderError) {
          errors.push(err)
        }
      }
    }
    const reducedError = JSBundleProviderError.fromMultipleRNOHErrors(errors)
    throw new JSBundleProviderError({
      whatHappened: "None of the provided JSBundleProviders was able to load a bundle",
      howCanItBeFixed: reducedError.getSuggestions(),
      extraData: reducedError.getDetails()
    })
  }

  getHotReloadConfig(): HotReloadConfig | null {
    if (this.pickedJSBundleProvider) {
      return this.pickedJSBundleProvider.getHotReloadConfig()
    }
    return null

  }
}

export class TraceJSBundleProviderDecorator extends JSBundleProvider {
  private logger: RNOHLogger

  constructor(private jsBundleProvider: JSBundleProvider, logger: RNOHLogger) {
    super()
    this.logger = logger.clone('TraceJSBundleProviderDecorator')
  }

  getURL() {
    return this.jsBundleProvider.getURL()
  }

  async getBundle(
    onProgress?: (progress: number) => void,
    onProviderSwitch?: (currentProvider: JSBundleProvider) => void
  ) {
    const stopTracing = this.logger.clone('getBundle').startTracing()
    const result = await this.jsBundleProvider.getBundle(onProgress, onProviderSwitch)
    stopTracing()
    return result
  }

  getAppKeys() {
    return this.jsBundleProvider.getAppKeys()
  }

  getHotReloadConfig(): HotReloadConfig {
    return this.jsBundleProvider.getHotReloadConfig()
  }

  getHumanFriendlyURL(): string {
    return this.jsBundleProvider.getHumanFriendlyURL()
  }
}