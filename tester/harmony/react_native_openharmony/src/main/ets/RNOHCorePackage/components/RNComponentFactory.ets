import {
  Tag,
  RNOHContext,
  RNComponentContext,
  DescriptorWrapper,
  CustomComponentBuilder,
  ComponentBuilderContext,
  DescriptorEssence,
} from "../../RNOH"
import { Descriptor } from "../../RNOH/DescriptorBase";

/**
 * @internal
 * Used by RNOH to build custom native components implemented in ArkTS
 */
@Builder
export function buildRNComponent(ctx: RNComponentContext, descriptorWrapper: DescriptorWrapper) {
  if (ctx.rnInstance.getComponentNameFromDescriptorType(descriptorWrapper.type_) !== '') {
    ctx.wrappedCustomRNComponentBuilder.builder(new ComponentBuilderContext(
      ctx,
      ctx,
      descriptorWrapper.tag,
      ctx.rnInstance.getComponentNameFromDescriptorType(descriptorWrapper.type_),
      ctx.descriptorRegistry.getDescriptor<Descriptor>(descriptorWrapper.tag) as DescriptorEssence,
    ))
  }
}

/**
 * @deprecated (latestRNOHVersion: 0.72.21)
 */
@Component
export struct RNComponentFactory {
  public ctx!: RNOHContext
  public tag: number = 0
  @BuilderParam public buildCustomComponent!: CustomComponentBuilder
  @State private componentName: string = ''
  @State private childrenTags: Tag[] = []
  private cleanupCallback?: () => void = undefined

  aboutToAppear() {
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<Descriptor>(this.tag)
    if (descriptor) {
      this.setDescriptor(descriptor)
    }
    this.cleanupCallback = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
      this.tag,
      (newDescriptor) => this.setDescriptor(newDescriptor)
    )
  }

  aboutToDisappear() {
    this.cleanupCallback?.()
  }

  setDescriptor(newDescriptor: Descriptor) {
    this.componentName = this.ctx.rnInstance.getComponentNameFromDescriptorType(newDescriptor.type)
    this.childrenTags = newDescriptor.childrenTags
  }

  build() {
    if (this.componentName !== '' && this.ctx instanceof RNComponentContext) {
      this.buildCustomComponent(new ComponentBuilderContext(
        this.ctx,
        this.ctx,
        this.tag,
        this.componentName,
        this.ctx.descriptorRegistry.getDescriptor<Descriptor>(this.tag) as DescriptorEssence,
      ))
    }
  }
}