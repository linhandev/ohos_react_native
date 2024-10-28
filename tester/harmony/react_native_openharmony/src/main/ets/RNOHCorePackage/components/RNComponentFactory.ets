import {
  RNOHContext,
  RNComponentContext,
  DescriptorWrapper,
  CustomComponentBuilder,
  ComponentBuilderContext,
} from "../../RNOH"

/**
 * @internal
 * Used by RNOH to build custom native components implemented in ArkTS
 */
@Builder
export function buildRNComponent(ctx: RNComponentContext, descriptorWrapper: DescriptorWrapper) {
  if (ctx.rnInstance.getComponentNameFromDescriptorType(descriptorWrapper.type_) !== '') {
    ctx.wrappedCustomRNComponentBuilder.builder(new ComponentBuilderContext(
      ctx,
      descriptorWrapper.tag,
      ctx.rnInstance.getComponentNameFromDescriptorType(descriptorWrapper.type_),
    ))
  }
}

/**
 * @deprecated (latestRNOHVersion: 0.72.40).
 *
 * NOTE: It was actually deprecated in 0.72.22, but this component was heavily utilized.
 * Removing it may still break some libraries. Instead of removing it completely, it is changed to be NOOP, and removal is postponed.
 */
@Component
export struct RNComponentFactory {
  public ctx!: RNOHContext
  public tag: number = 0
  @BuilderParam public buildCustomComponent!: CustomComponentBuilder

  build() {
  }
}