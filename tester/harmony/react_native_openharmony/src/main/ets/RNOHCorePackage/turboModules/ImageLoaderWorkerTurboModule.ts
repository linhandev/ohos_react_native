import { AnyThreadTurboModule } from '../../RNOH/TurboModule';
import type { RNOHLogger } from "../../RNOH/ts"
import {
  RemoteImageDiskCache,
  RemoteImageLoader, RemoteImageMemoryCache
} from '../../RemoteImageLoader';
import { AnyThreadTurboModuleContext } from '../../RNOH/RNOHContext';

export class ImageLoaderWorkerTurboModule extends AnyThreadTurboModule {
  static NAME = "ImageLoader" as const

  private imageLoader: RemoteImageLoader
  private logger: RNOHLogger

  constructor(protected ctx: AnyThreadTurboModuleContext) {
    super(ctx)
    this.logger = ctx.logger.clone(ImageLoaderWorkerTurboModule.NAME)
    this.logger.debug("constructor")
    this.imageLoader = new RemoteImageLoader(
      new RemoteImageMemoryCache(128), new RemoteImageDiskCache(128, ctx.uiAbilityContext.cacheDir),
      ctx.uiAbilityContext, ({ remoteUri, fileUri }) => {
      ctx.rnInstance.postMessageToCpp('UPDATE_IMAGE_SOURCE_MAP', {
        remoteUri,
        fileUri,
      });
    })
  }

  /**
   * called from cpp
   */
  protected getPrefetchResult(uri: string): string | undefined {
    return this.imageLoader.getPrefetchResult(uri);
  }

  getConstants() {
    return {}
  }

  async getSize(uri: string): Promise<number[]> {
    this.logger.debug("getSize")
    if (uri && uri.length > 0) {
      const imageSource = await this.imageLoader.getImageSource(uri)
      const imageInfo = await imageSource.getImageSource().getImageInfo()
      return [imageInfo.size.width, imageInfo.size.height]
    } else {
      throw 'Cannot get the size of an image for an empty URI'
    }
  }

  async getSizeWithHeaders(uri: string, headers: Object): Promise<{
    width: number,
    height: number
  } & Record<string, any>> {
    let srcHeaders = headers as Record<string, any>
    let destHeaders: Record<string, any> = {}

    if (srcHeaders['crossOrigin'] === 'use-credentials') {
      destHeaders['Access-Control-Allow-Credentials'] = 'true'
    }

    if (srcHeaders['referrerPolicy'] !== undefined) {
      destHeaders['Referrer-Policy'] = srcHeaders['referrerPolicy']
    }

    const imageSource = await this.imageLoader.getImageSource(uri, destHeaders)
    const imageInfo = await imageSource.getImageSource().getImageInfo()
    return Promise.resolve({ width: imageInfo.size.width, height: imageInfo.size.height })
  }

  async prefetchImage(uri: string): Promise<boolean> {
    this.logger.debug(`prefetchImage("${uri}")`)
    return this.imageLoader.prefetch(uri);
  }

  prefetchImageWithMetadata(uri: string, queryRootName: string, rootTag: number): Promise<boolean> {
    this.ctx.logger.warn("ImageLoader::prefetchImageWithMetadata is not supported")
    return Promise.resolve(false)
  }

  queryCache(uris: Array<string>): Promise<Object> {
    const cachedUriEntries = uris.map(uri =>
    [uri, this.imageLoader.queryCache(uri)]
    ).filter(([_uri, value]) => value !== undefined);
    const cachedUriMap = Object.fromEntries(cachedUriEntries)
    return Promise.resolve(cachedUriMap)
  }
}