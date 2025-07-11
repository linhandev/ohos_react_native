# Performance analysis using SmartPerf-Host instructions

Performance of ArkUI applications can be analysed using SmartPerf-Host tool, which can be downloaded from https://gitee.com/openharmony/developtools_smartperf_host/releases.

To run trace on an tester application do the following
- download and unpack SmartPerf from the link above
- open the app
- run `pnpm hiprofiler` to start tracing in the tester directory - the trace log will be saved in `hiprofiler_data.htrace` in the tester
- launch `./main_darwin` from the unpacked SmartPerf directory
- open https://localhost:9000/application/ in your web browser to launch SmartPerf tool - ignore warnings about the page being not secure <!-- markdown-link-check-disable-line -->
- open the trace file using the tool
- the trace decomposition should now be visible in the browser

## Adding custom trace sections
1. You can use Systrace TurboModule to trace some actions from ArkTS side:
```ts
Systrace.beginTrace('Some event I want to trace');
// do some expensive calculations
Systrace.endTrace();
```
2. You can add custom `systrace` sections to the cpp files by creating `facebook::react::SystraceSection` in the method that you want to analyze - it's trace will be then visible in the `SmartPerf` tool under the `com.rnoh.tester` tab
```cpp
//systrace example
void Component::onUpdate() {
  facebook::react::SystraceSection s("Component::onUpdate", ...args);
  ...
}
```

## hiprofiler config
To analyze ArkUI builtin functionalities (for example rendering and layouting) you can use the more detailed profiler configuration visible below. To use this config paste it into `scripts/hiprofiler-config.txt` in the tester dir.

```
request_id: 1
session_config {
  buffers {
    pages: 16384
  }
}
plugin_configs {
  plugin_name: "ftrace-plugin"
  sample_interval: 0
  config_data {
    ftrace_events: "sched/sched_switch"
    ftrace_events: "power/suspend_resume"
    ftrace_events: "sched/sched_wakeup"
    ftrace_events: "sched/sched_wakeup_new"
    ftrace_events: "sched/sched_waking"
    ftrace_events: "sched/sched_process_exit"
    ftrace_events: "sched/sched_process_free"
    ftrace_events: "task/task_newtask"
    ftrace_events: "task/task_rename"
    ftrace_events: "power/cpu_frequency"
    ftrace_events: "power/cpu_idle"
    hitrace_categories: "ability"
    hitrace_categories: "ace"
    hitrace_categories: "app"
    hitrace_categories: "ark"
    hitrace_categories: "binder"
    hitrace_categories: "disk"
    hitrace_categories: "freq"
    hitrace_categories: "graphic"
    hitrace_categories: "idle"
    hitrace_categories: "irq"
    hitrace_categories: "memreclaim"
    hitrace_categories: "mmc"
    hitrace_categories: "multimodalinput"
    hitrace_categories: "ohos"
    hitrace_categories: "pagecache"
    hitrace_categories: "rpc"
    hitrace_categories: "sched"
    hitrace_categories: "sync"
    hitrace_categories: "window"
    hitrace_categories: "workq"
    hitrace_categories: "zaudio"
    hitrace_categories: "zcamera"
    hitrace_categories: "zimage"
    hitrace_categories: "zmedia"
    buffer_size_kb: 20480
    flush_interval_ms: 1000
    flush_threshold_kb: 4096
    parse_ksyms: true
    clock: "boot"
    trace_period_ms: 200
    debug_on: false
  }
}
```

## hitrace
To trace some variable changes you may use:
```
Systrace.counterEvent('SOME_VARIABLE', 1000)
```
To later get those changes simply open htrace data in SmartPerf tool (but search tool will not show you correct results, simply use `Ctrl + F (Windows/Linux)` or `Cmd + F (Mac)` in browser to find right row).
However you can also use more primitive tool (which will give you text output):
```sh
hdc shell
hitrace --trace_begin app
# make some interactions in the app which will call counterEvent
hitrace --trace_dump | grep tracing_mark_write
hitrace --trace_finish
```

## ReactMarker
A valuable information for measuring app performance is looking at traces from ReactMarker. They are created from ReactNative core for monitoring some events related to application startup. You can get those markers the same way as Systrace events, and after running hiprofiler you can easily filter traces by "ReactMarker".
ReactMarker also provides StartupLogger which currently is accessible only from C++ code:
```cpp
facebook::react::ReactMarker::StartupLogger& startupLogger =
    facebook::react::ReactMarker::StartupLogger::getInstance();
LOG(INFO) << "StartupLogger " << startupLogger.getAppStartTime();
LOG(INFO) << "StartupLogger " << startupLogger.getRunJSBundleStartTime();
LOG(INFO) << "StartupLogger " << startupLogger.getRunJSBundleEndTime();
```
You should not use ReactMarker for adding your custom traces. For such cases please use regular Systrace.

## Further details
- [Common trace usage instructions](https://docs.openharmony.cn/pages/v5.0/en/application-dev/performance/common-trace-using-instructions.md)
- [Analyzing application performance using SmartPerf-Host](https://docs.openharmony.cn/pages/v5.0/en/application-dev/performance/performance-optimization-using-smartperf-host.md)
- [Development of Performance Tracing (ArkTS)
](https://docs.openharmony.cn/pages/v5.0/en/application-dev/dfx/hitracemeter-guidelines.md)