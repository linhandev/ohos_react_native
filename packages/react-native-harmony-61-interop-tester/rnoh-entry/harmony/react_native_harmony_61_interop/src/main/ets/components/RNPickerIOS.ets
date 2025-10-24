/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RNComponentContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { RNPickerIOS as GENERATED } from '../generated/components/RNPickerIOS';

function stringToFontStyle(style: string | undefined): FontStyle | undefined {
  if (style === undefined) {
    return undefined;
  } else if (style === "italic") {
    return FontStyle.Italic
  } else {
    return FontStyle.Normal;
  }
}

@Component
export struct RNPickerIOS {
  public static NAME: string = GENERATED.NAME
  // ----------------------------------------
  public ctx!: RNComponentContext
  public tag: number = 0
  timer: number = 0
  changing: boolean = false
  selectIndex: number = 0
  selectValue: string = ''
  @State range: string[] = []
  @State selected: number = 0
  @State value: string | undefined = ''
  // ----------------------------------------
  @State private descriptor: GENERATED.DescriptorWrapper =
    {} as GENERATED.DescriptorWrapper
  private eventEmitter: GENERATED.EventEmitter | undefined = undefined
  private cleanUpCallbacks: (() => void)[] = []
  private valueByName: Map<string, string> = new Map()

  aboutToAppear() {
    this.eventEmitter = new GENERATED.EventEmitter(this.ctx.rnInstance, this.tag)
    this.onDescriptorWrapperChange(this.ctx.descriptorRegistry.findDescriptorWrapperByTag<GENERATED.DescriptorWrapper>(this.tag)!)
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (_descriptor, newDescriptorWrapper) => {
        if (newDescriptorWrapper instanceof GENERATED.DescriptorWrapper) {
          this.onDescriptorWrapperChange(newDescriptorWrapper)
        }
      }
    ))
  }

  aboutToDisappear() {
    this.cleanUpCallbacks.forEach(cb => cb())
  }

  getRange(): string[] {
    const items = this.descriptor.props.items ?? []
    const range: string[] = [];
    const itemsNum: number = items.length ? items.length : 0
    for (let i = 0; i < itemsNum; i++) {
      range.push(items[i].label ?? '')
    }
    return range
  }

  getValueByName(): Map<string, string> {
    let items = this.descriptor.props.items ?? [];
    let valueByName: Map<string, string> = new Map()
    let itemsNum: number = items.length ? items.length : 0
    for (let i = 0; i < itemsNum; i++) {
      valueByName.set(items[i].label ?? '', items[i].value ?? '')
    }
    return valueByName
  }

  getTextStyle(): PickerTextStyle {
    return {
      color: this.descriptor.props.color.toRGBAString(),
      font: {
        size: this.descriptor.props.fontSize || 16,
        weight: this.descriptor.props.fontWeight || FontWeight.Normal,
        style: stringToFontStyle(this.descriptor.props.fontStyle) || FontStyle.Normal,
        family: this.descriptor.props.fontFamily
      },
    };
  }

  getSelectionStyle(): PickerTextStyle {
    return {
      color: this.descriptor.props.selectionColor.toRGBAString(),
      font: {
        size: this.descriptor.props.fontSize || 16,
        weight: this.descriptor.props.fontWeight || FontWeight.Normal,
        style: stringToFontStyle(this.descriptor.props.fontStyle) || FontStyle.Normal,
        family: this.descriptor.props.fontFamily
      },
    };
  }

  _onChange(value: string | string[], index: number | number[]): void {
    const newValue: string =
      (typeof value === 'string' ? this.valueByName.get(value) : this.valueByName.get(value[0])) || '';
    const newIndex: number = typeof index === 'number' ? index : index[0];
    this.selectIndex = newIndex
    this.selectValue = newValue
    this.backData()
  }

  backData() {
    if (!this.changing) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.eventEmitter!.emit("change", {
          newValue: this.selectValue,
          newIndex: this.selectIndex
        })
      }, 500)
    }
  }

  _onTouch(event: TouchEvent) {
    if (event.type === TouchType.Down) {
      this.changing = true;
    }
    if (event.type === TouchType.Up) {
      this.changing = false;
      this.backData()
    }
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      TextPicker({
        range: this.range
      })
        .disappearTextStyle(this.getTextStyle())
        .textStyle(this.getTextStyle())
        .selectedTextStyle(this.getSelectionStyle())
        .selectedIndex(this.selected)
        .canLoop(false)
        .onChange((value: string | string[], index: number | number[]) => this._onChange(value, index))
        .onTouch((event: TouchEvent) => this._onTouch(event))
        .width("100%")
        .height("100%")
    }
  }

  private onDescriptorWrapperChange(descriptor: GENERATED.DescriptorWrapper) {
    this.descriptor = descriptor
    this.range = this.getRange()
    this.valueByName = this.getValueByName()
    if (this.selected !== this.descriptor.props.selectedIndex) {
      this.selected = this.descriptor.props.selectedIndex
    }
  }
}