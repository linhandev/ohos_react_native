/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Point } from './types';
import { ViewStyle } from './RNTypes';

/**
 * @api
 * 0-1
 * */
export type NormalizedScalar = number;

/**
 * @api
 * RGBA
 * */
export type ColorSegments = [
  NormalizedScalar,
  NormalizedScalar,
  NormalizedScalar,
  NormalizedScalar,
];

/**
 * @api
 */
export type ColorValue = number;

/**
 * @api
 */
export type Tag = number;

/**
 * @api
 * @deprecated: Use Descriptor::layoutMetrics (latestRNOHVersion: 0.72.27)
 */
export interface LayoutProps {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * @api
 */
export enum LayoutDirectionRN {
  Undefined = 0,
  LeftToRight = 1,
  RightToLeft = 2,
}

/**
 * @api
 */
export type LayoutMetrics = {
  frame: {
    origin: {
      x: number;
      y: number;
    };
    size: {
      width: number;
      height: number;
    };
  };
  layoutDirection?: LayoutDirectionRN;
};

/**
 * @api
 * @deprecated Use ViewDescriptorWrapperBase::isClipping instead. Alternatively ViewRawProps::overflow. (latestRNOHVersion: 0.72.27)
 */
export enum OverflowMode {
  VISIBLE = 0,
  HIDDEN = 1,
  SCROLL = 2,
}

/**
 * @api
 * The purpose of this class is to retrieve props from raw props data sent over NAPI.
 * This concept was introduced with codegen support to avoid collisions when generating code.
 */
export class PropsSelectorBase {
}

/**
 * @api
 * (ComponentInstance)DescriptorWrapper. Decouples "what" is received from React Native from "how".
 * @template TType - Type of ComponentInstance's type, string by default
 * @template TProps - Type of ComponentInstance's props
 * @template TState - Type of ComponentInstance's state
 * @template TRawProps - Type of ComponentInstance's rawProps
 * @template TPropsSelector - Type of ComponentInstance's propsSelector
 */
export class DescriptorWrapper<TType = string,
TProps extends PropsBase = PropsBase,
TState extends StateBase = StateBase,
TRawProps extends RawPropsBase = RawPropsBase,
TPropsSelector extends PropsSelectorBase = PropsSelectorBase,> {
  private propsSelector: TPropsSelector

  /**
   * @param descriptor - wrapped descriptor
   */
  constructor(protected descriptor: Descriptor<TType, TProps, TState, TRawProps>) {
    this.propsSelector = this.createPropsSelector()
  }

  /**
   * @returns {TType} ComponentInstance's type
   */
  public get type_(): TType {
    return this.descriptor.type
  }

  /**
   * @returns {Tag} ComponentInstance's tag
   */
  public get tag(): Tag {
    return this.descriptor.tag
  }

  /**
   * ID are flags passed in id/nativeId prop.
   * @returns {NativeId} ACTUAL_ID if id/nativeId is defined like following example.
   * @example
   * ```tsx
   * <View id="__harmony::hint1;hint2;...:ACTUAL_ID" />
   * ```
   * @returns {NativeId | undefined} whole id/nativeId if failed to parse the ACTUAL_ID
   */
  public get id(): NativeId | undefined {
    const rawId = this.rawProps.nativeID
    if (rawId?.startsWith("__harmony::")) {
      const cheatcodeAndId = rawId.replace("__harmony::", "")
      const [_cheatcodes, actualId] = cheatcodeAndId.split(":")
      return actualId
    }
    return this.rawProps.nativeID
  }

  /**
   * Hints are harmony-specific flags passed in id/nativeId prop.
   * @returns {string[]} array of hints if id/nativeId is defined like following example.
   * @example
   * ```tsx
   * <View id="__harmony::hint1;hint2;...:ACTUAL_ID" />
   * ```
   * @returns {string[]} empty array if failed to parse the hints
   */
  public get hints(): string[] {
    const rawId = this.rawProps.nativeID
    if (rawId?.startsWith("__harmony::")) {
      const hintsAndId = rawId.replace("__harmony::", "")
      const [hints, _actualId] = hintsAndId.split(":")
      return hints.split(";")
    }
    return []
  }

  /**
   * @returns {number} A number which changes each time the component corresponding to this descriptor is updated.
   */
  public get renderKey(): number {
    return this.descriptor.renderKey ?? 0
  }

  /**
   * @returns {TRawProps} rawProps
   */
  protected get rawProps(): TRawProps {
    return this.descriptor.rawProps
  }

  /**
   * @returns {TProps | Object} props
   */
  protected get cppProps(): TProps | Object {
    if (this.descriptor.isDynamicBinder) {
      return {}
    }
    return this.descriptor.props as TProps
  }

  /**
   * create PropsSelector
   */
  protected createPropsSelector(): TPropsSelector {
    return new PropsSelectorBase() as TPropsSelector
  }

  /**
   * @returns {TPropsSelector} PropsSelector
   */
  public get props(): TPropsSelector {
    return this.propsSelector
  }

  /**
   * @returns {Tag[]} array of children's tags
   */
  public get childrenTags(): Tag[] {
    return this.descriptor.childrenTags
  }

  /**
   * @returns {Tag} parent's tag
   * @returns {undefined} undefined if parent DNE
   */
  public get parentTag(): Tag | undefined {
    return this.descriptor.parentTag
  }

  /**
   * @returns {number} layout width
   */
  public get width(): number {
    return this.descriptor.layoutMetrics.frame.size.width
  }

  /**
   * @returns {number} layout height
   */
  public get height(): number {
    return this.descriptor.layoutMetrics.frame.size.height
  }

  /**
   * @returns {boolean} layout horizontal direction
   */
  public get isRTL(): boolean {
    return this.descriptor.layoutMetrics.layoutDirection === LayoutDirectionRN.RightToLeft
  }

  /**
   * @returns {Point} relative position between origins of current component and its parent
   */
  public get positionRelativeToParent(): Point {
    return this.descriptor.layoutMetrics.frame.origin
  }
}

/**
 * @api
 * `Value provided as `id` or `nativeId` prop. `nativeId` will be deprecated in the future.
 * https://github.com/react-native-community/discussions-and-proposals/pull/496
 */
export type NativeId = string

/**
 * @api
 */
export interface RawPropsBase {
  nativeID?: NativeId
}

/**
 * @api
 */
export interface PropsBase {}

/**
 * @api
 */
export interface StateBase {}

/**
 * @api
 * @deprecated This interface will be removed together with ComponentBuilderContext::descriptor. (latestRNOHVersion: 0.72.27)
 * */
export interface DescriptorEssence<TType = string> {
  tag: Tag,
  type: TType
}

/**
 * @api
 * (ComponentInstance)Descriptor. Data structure - exposes data and provides no behavior.
 * If you want to expose a behavior use Component(Instance)Manager instead.
 */
export interface Descriptor<TType = string,
TProps extends Object = Object,
TState extends Object = Object,
TRawProps extends Object = Object> extends DescriptorEssence<TType> {
  type: TType;
  tag: Tag;
  parentTag?: Tag;

  /**
   * This property can be used to pass properties explicitly by providing NapiBinders on CPP side.
   * It's not advised to use this property because those properties (unlike rawProps) are passed with every mutation
   * increasing the amount of data that handled by NAPI which is not good for performance.
   */
  props: TProps;
  state: TState;
  rawProps: TRawProps;
  childrenTags: Tag[];
  layoutMetrics: LayoutMetrics;

  /**
   * @deprecated: Use `rawProps` instead.
   * It was deprecated when preparing 0.77 branch for release.
   */
  isDynamicBinder: boolean;

  /**
   * A number which changes each time this component is updated
   */
  renderKey?: number;
}
;

/**
 * @api
 * @deprecated: Use "ViewStyle" instead.
 * It was deprecated when preparing 0.77 branch for release.
 */
export type BorderMetrics = {
  borderWidth?: number;
  borderLeftWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderStartWidth?: number;
  borderEndWidth?: number;
  borderColor?: number;
  borderLeftColor?: number;
  borderTopColor?: number;
  borderRightColor?: number;
  borderBottomColor?: number;
  borderStartColor?: number;
  borderEndColor?: number;
  borderRadius?: number;
  borderTopStartRadius?: number;
  borderTopEndRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  borderBottomStartRadius?: number;
  borderBottomEndRadius?: number;
  borderStyle?: BorderStyle;
}

/**
 * @api
 */
export type BorderStyle = ViewStyle["borderStyle"]