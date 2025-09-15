/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InternalRNOHCoreContext, RNOHCoreContext } from './RNOHContext'
import { SafeAreaInsets } from "./SafeAreaInsetsProvider"
import { PerfMonitorController } from "./PerfMonitorController"
import { RNInstance } from "./RNInstance"

const METRICS_POLLING_INTERVAL_MS = 500;

@Component
export struct RNPerfMonitorView {
  @Require public ctx: RNOHCoreContext
  @Require public rnInstance: RNInstance
  @State private visible: boolean = false;
  @State private showDetails: boolean = false;
  @State private jsFps: number = 0;
  @State private uiFps: number = 0;
  @State private safeAreaInsets: SafeAreaInsets | undefined = undefined
  private cleanUpCallbacks: (() => void)[] = []
  private metricsPollingInterval: number | null = null
  private perfMonitorController!: PerfMonitorController;


  aboutToAppear() {
    this.perfMonitorController = new PerfMonitorController(this.ctx.logger, this.rnInstance, (this.ctx as InternalRNOHCoreContext).uiFpsMonitor);
    this.setupSafeAreaInsets()
    this.setupPerfMonitorSubscriptions()
  }

  private setupSafeAreaInsets() {
    if (this.ctx!.safeAreaInsetsProvider !== undefined) {
      this.safeAreaInsets = this.ctx!.safeAreaInsetsProvider.safeAreaInsets
      this.cleanUpCallbacks.push(
        this.ctx!.safeAreaInsetsProvider.eventEmitter.subscribe(
          "SAFE_AREA_INSETS_CHANGE",
          (insets) => {
            this.safeAreaInsets = insets
          }))
    } else {
      this.safeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 }
    }
  }

  private setupPerfMonitorSubscriptions() {
    const emitter = this.ctx!.devToolsController.eventEmitter;

    this.cleanUpCallbacks.push(emitter.subscribe('STOP_PERF_MONITOR', () => {
      if (!this.visible) {
        return
      }
      this.stopMetricsPolling()
      this.perfMonitorController.stop();
      this.visible = false
    }))

    this.cleanUpCallbacks.push(emitter.subscribe('TOGGLE_PERF_MONITOR', () => {
      this.handleVisibilityToggle()
    }))
  }

  aboutToDisappear() {
    this.stopMetricsPolling();
    this.perfMonitorController.stop()
    this.cleanUpCallbacks.forEach(cb => cb())
  }

  private startMetricsPolling() {
    if (this.metricsPollingInterval !== null) {
      return; // Already polling, prevent duplicate intervals
    }

    this.metricsPollingInterval = setInterval(() => {
      const metrics = this.perfMonitorController.getFpsMetrics()
      this.uiFps = Math.round(metrics.uiFps)
      this.jsFps = Math.round(metrics.jsFps)
    }, METRICS_POLLING_INTERVAL_MS)
  }

  private stopMetricsPolling(): void {
    if (this.metricsPollingInterval !== null) {
      clearInterval(this.metricsPollingInterval)
      this.metricsPollingInterval = null
    }
  }

  private handleVisibilityToggle(): void {
    this.visible = !this.visible;
    
    if (this.visible) {
      this.perfMonitorController.start()
      this.startMetricsPolling()
    } else {
      this.stopMetricsPolling()
      this.perfMonitorController.stop()
    }
  }

  private formatTime(ms ?: number): string {
    if (!ms) return 'N/A'
    return `${(ms / 1000).toFixed(2)}s`
  }

  build() {
    if (this.safeAreaInsets && this.visible) {
      Column() {
        // Always visible FPS metrics
        Row() {
          Text(`JS: ${this.jsFps}`)
            .fontColor(Color.White)
            .fontSize(16)

          Text(`UI: ${this.uiFps}`)
            .fontColor(Color.White)
            .fontSize(16)
            .margin({ left: 16 })
        }
      }
      .backgroundColor(Color.Black)
        .opacity(0.8)
        .borderRadius(8)
        .borderColor(Color.White)
        .borderWidth(1)
        .padding(8)
        .hitTestBehavior(HitTestMode.Transparent)
        .position({
          right: 8,
          top: (this.safeAreaInsets?.top ?? 0) + 8 
        })
        .zIndex(1000)
        .width(160)
        .onClick(() => {
          this.showDetails = !this.showDetails
        })
    }
  }
}