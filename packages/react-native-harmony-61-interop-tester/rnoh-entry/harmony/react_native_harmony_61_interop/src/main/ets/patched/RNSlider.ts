/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { Color } from '@rnoh/react-native-openharmony/ts';
import { RNSlider as GENERATED } from "../generated/components/RNSlider";


export namespace RNSlider {
    export const NAME = GENERATED.NAME

    export interface DirectRawProps extends GENERATED.DirectRawProps { }

    export interface Props extends GENERATED.Props { }

    export interface State extends GENERATED.State { }

    export interface RawProps extends GENERATED.RawProps { }

    export class PropsSelector extends GENERATED.PropsSelector {
        get maximumTrackTintColor() {
            if (this.rawProps.maximumTrackTintColor) {
                return Color.fromColorValue(this.rawProps.maximumTrackTintColor)
            } else {
                return undefined;
            }
        }

        get minimumTrackTintColor() {
            if (this.rawProps.minimumTrackTintColor) {
                return Color.fromColorValue(this.rawProps.minimumTrackTintColor)
            } else {
                return undefined;
            }
        }

        get thumbTintColor() {
            if (this.rawProps.thumbTintColor) {
                return Color.fromColorValue(this.rawProps.thumbTintColor)
            } else {
                return undefined;
            }
        }
    }

    export type Descriptor = GENERATED.Descriptor

    export class DescriptorWrapper extends GENERATED.DescriptorWrapper {
        protected createPropsSelector() {
            return new PropsSelector(this.descriptor.props, this.descriptor.rawProps)
        }
    }

    export interface EventPayloadByName extends GENERATED.EventPayloadByName { }

    export class EventEmitter extends GENERATED.EventEmitter { }

    export interface CommandArgvByName extends GENERATED.CommandArgvByName { }

    export class CommandReceiver extends GENERATED.CommandReceiver { }

}
