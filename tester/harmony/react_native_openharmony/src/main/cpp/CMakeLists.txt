cmake_minimum_required(VERSION 3.13)
cmake_policy(SET CMP0079 NEW) # Allow to link libraries from different
# directories than targets

add_compile_options("-Wno-error=unused-command-line-argument")

include("${CMAKE_CURRENT_SOURCE_DIR}/FetchDependencies.cmake")

set(NATIVERENDER_ROOT_PATH "${RNOH_CPP_DIR}")
set(third_party_dir "${RNOH_CPP_DIR}/third-party")
set(patches_dir "${RNOH_CPP_DIR}/patches")

include_directories(${NATIVERENDER_ROOT_PATH} ${NATIVERENDER_ROOT_PATH}/include)

# FOLLY
set(folly_include_dir "${third_party_dir}/folly")
set(folly_src_dir "${third_party_dir}/folly/folly")
add_library(folly_target)
target_include_directories(folly_target PUBLIC "${folly_include_dir}")
set(folly_FLAGS
    -DFOLLY_NO_CONFIG=1
    -DFOLLY_MOBILE=1
    -DFOLLY_USE_LIBCPP=1
    -DFOLLY_HAVE_RECVMMSG=1
    -DFOLLY_HAVE_PTHREAD=1
    -Wno-comma
    -Wno-shorten-64-to-32
    -Wno-documentation
    -faligned-new)
target_compile_options(folly_target PUBLIC ${folly_FLAGS})
target_sources(
  folly_target
  PRIVATE "${folly_src_dir}/SharedMutex.cpp"
          "${folly_src_dir}/concurrency/CacheLocality.cpp"
          "${folly_src_dir}/detail/Futex.cpp"
          "${folly_src_dir}/portability/Malloc.cpp"
          "${folly_src_dir}/synchronization/ParkingLot.cpp"
          "${folly_src_dir}/system/ThreadId.cpp"
          "${folly_src_dir}/lang/SafeAssert.cpp"
          "${folly_src_dir}/lang/ToAscii.cpp"
          "${folly_src_dir}/dynamic.cpp"
          "${folly_src_dir}/hash/SpookyHashV2.cpp"
          "${folly_src_dir}/json_pointer.cpp"
          "${folly_src_dir}/Conv.cpp"
          "${folly_src_dir}/Format.cpp"
          "${folly_src_dir}/memory/detail/MallocImpl.cpp"
          "${folly_src_dir}/json.cpp"
          "${folly_src_dir}/Unicode.cpp"
          "${folly_src_dir}/lang/Assume.cpp"
          "${folly_src_dir}/ScopeGuard.cpp")
target_link_libraries(
  folly_target PUBLIC Boost::context Boost::algorithm Boost::intrusive fmt glog
                      double-conversion)

# HERMES
add_library(hermes-engine::libhermes SHARED IMPORTED)
add_compile_options( # TODO: check if building in debug mode
                    -DHERMES_ENABLE_DEBUGGER)
set_property(
  TARGET hermes-engine::libhermes
  PROPERTY IMPORTED_LOCATION
           "${third_party_dir}/prebuilt/${OHOS_ARCH}/libhermes.so")
set(hermes_include_dirs "${hermes_SOURCE_DIR}/API"
                        "${hermes_SOURCE_DIR}/public")

# -------- REACT COMMON --------
set(REACT_COMMON_DIR "${RNOH_CPP_DIR}/third-party/rn/ReactCommon")
set(REACT_COMMON_PATCH_DIR "${patches_dir}/react_native_core")

include_directories(${REACT_COMMON_PATCH_DIR})

# dummy targets added to avoid modyfing CMakeLists located in ReactCommon
add_library(boost INTERFACE)
add_library(folly_runtime ALIAS folly_target)
add_library(log INTERFACE)
add_library(glog_init INTERFACE)
add_library(android INTERFACE)
add_library(fb INTERFACE)
add_library(fbjni INTERFACE)
add_library(reactnativejni INTERFACE)
add_library(mapbufferjni INTERFACE)
add_library(fabricjni INTERFACE)
add_library(react_featureflagsjni INTERFACE)
add_library(turbomodulejsijni INTERFACE)

function(add_react_common_subdir relative_path)
  add_subdirectory(${REACT_COMMON_DIR}/${relative_path})
endfunction()

add_react_common_subdir(yoga)
add_library(yoga ALIAS yogacore)
add_react_common_subdir(runtimeexecutor)
add_react_common_subdir(reactperflogger)
add_react_common_subdir(logger)
add_react_common_subdir(jsiexecutor)
add_react_common_subdir(cxxreact)
# add_react_common_subdir(jsc)
add_react_common_subdir(jsi)
add_react_common_subdir(callinvoker)
add_react_common_subdir(jsinspector-modern)
add_react_common_subdir(hermes/executor)
target_include_directories(hermes_executor_common
                           PRIVATE "${hermes_include_dirs}")
# add_react_common_subdir(hermes/inspector)
add_react_common_subdir(react/runtime)
add_react_common_subdir(react/runtime/hermes)
target_include_directories(bridgelesshermes PRIVATE "${hermes_include_dirs}")
add_react_common_subdir(react/runtime/nativeviewconfig)
add_react_common_subdir(react/featureflags)
add_react_common_subdir(react/performance/timeline)
add_react_common_subdir(react/renderer/runtimescheduler)
add_subdirectory(${REACT_COMMON_PATCH_DIR}/react/debug)
add_react_common_subdir(react/config)
add_react_common_subdir(react/renderer/animations)
add_react_common_subdir(react/renderer/attributedstring)
add_react_common_subdir(react/renderer/components/view)
add_react_common_subdir(react/renderer/componentregistry)
add_react_common_subdir(react/renderer/mounting)
add_react_common_subdir(react/renderer/scheduler)
add_react_common_subdir(react/renderer/telemetry)
add_react_common_subdir(react/renderer/uimanager)
add_react_common_subdir(react/renderer/core)
add_react_common_subdir(react/renderer/consistency)
add_react_common_subdir(react/renderer/uimanager/consistency)
add_react_common_subdir(react/renderer/dom)
add_react_common_subdir(react/renderer/graphics)
add_subdirectory(${REACT_COMMON_PATCH_DIR}/react/renderer/debug)
add_react_common_subdir(react/renderer/imagemanager)
# add_react_common_subdir(react/renderer/components/switch)
add_subdirectory(${REACT_COMMON_PATCH_DIR}/react/renderer/components/textinput)
# add_react_common_subdir(react/renderer/components/progressbar)
add_react_common_subdir(react/renderer/components/root)
add_react_common_subdir(react/renderer/components/image)
add_react_common_subdir(react/renderer/components/legacyviewmanagerinterop)
add_react_common_subdir(react/renderer/componentregistry/native)
add_react_common_subdir(react/renderer/components/text)
# add_react_common_subdir(react/renderer/components/unimplementedview)
add_subdirectory(${REACT_COMMON_PATCH_DIR}/react/renderer/components/rncore)
add_react_common_subdir(react/renderer/components/modal)
add_react_common_subdir(react/renderer/components/scrollview)
add_react_common_subdir(react/renderer/leakchecker)
add_react_common_subdir(react/renderer/observers/events)
add_subdirectory(${REACT_COMMON_PATCH_DIR}/react/renderer/textlayoutmanager)
add_react_common_subdir(react/utils)
add_react_common_subdir(react/bridging)
add_react_common_subdir(react/renderer/mapbuffer)
add_react_common_subdir(react/nativemodule/core)
add_react_common_subdir(jserrorhandler)
target_include_directories(react_nativemodule_core
                           PRIVATE "${REACT_COMMON_DIR}/callinvoker")

# HERMES INSPECTOR
add_subdirectory("${REACT_COMMON_DIR}/hermes/inspector-modern")
target_include_directories(hermes_inspector_modern
                           PRIVATE "${hermes_include_dirs}")
target_compile_options(hermes_inspector_modern PRIVATE ${folly_FLAGS})

# ----------------------------------------------------------------------------------------------------------------------

add_library(
  rnoh SHARED
  "${RNOH_CPP_DIR}/RNOH/RNInstanceInternal.cpp"
  "${RNOH_CPP_DIR}/RNOH/RNInstanceCAPI.cpp"
  "${RNOH_CPP_DIR}/RNOH/SchedulerDelegate.cpp"
  "${RNOH_CPP_DIR}/RNOH/BlobCollector.cpp"
  "${RNOH_CPP_DIR}/RNOH/MessageQueueThread.cpp"
  "${RNOH_CPP_DIR}/RNOH/MutationsToNapiConverter.cpp"
  "${RNOH_CPP_DIR}/RNOH/LogSink.cpp"
  "${RNOH_CPP_DIR}/RNOH/NativeLogger.cpp"
  "${RNOH_CPP_DIR}/RNOH/ArkJS.cpp"
  "${RNOH_CPP_DIR}/RNOH/ArkTSBridge.cpp"
  "${RNOH_CPP_DIR}/RNOH/Inspector.cpp"
  "${RNOH_CPP_DIR}/RNOH/ComponentInstanceProvider.cpp"
  "${RNOH_CPP_DIR}/RNOH/FontRegistry.cpp"
  "${RNOH_CPP_DIR}/RNOH/MountingManagerArkTS.cpp"
  "${RNOH_CPP_DIR}/RNOH/MountingManagerCAPI.cpp"
  "${RNOH_CPP_DIR}/RNOH/ShadowViewRegistry.cpp"
  "${RNOH_CPP_DIR}/RNOH/TurboModuleProvider.cpp"
  "${RNOH_CPP_DIR}/RNOH/TurboModuleFactory.cpp"
  "${RNOH_CPP_DIR}/RNOH/ArkTSTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOH/JsiConversions.cpp"
  "${RNOH_CPP_DIR}/RNOH/Package.cpp"
  "${RNOH_CPP_DIR}/RNOH/ComponentInstancePreallocationRequestQueue.cpp"
  "${RNOH_CPP_DIR}/RNOH/VSyncListener.cpp"
  "${RNOH_CPP_DIR}/RNOH/TouchTarget.cpp"
  "${RNOH_CPP_DIR}/RNOH/TextMeasurer.cpp"
  "${RNOH_CPP_DIR}/RNOH/HarmonyTimerRegistry.cpp"
  "${RNOH_CPP_DIR}/RNOH/StyledStringWrapper.cpp"
  "${RNOH_CPP_DIR}/RNOH/AsynchronousEventBeat.cpp"
  "${RNOH_CPP_DIR}/RNOH/TaskExecutor/TaskExecutor.cpp"
  "${RNOH_CPP_DIR}/RNOH/TaskExecutor/NapiTaskRunner.cpp"
  "${RNOH_CPP_DIR}/RNOH/TaskExecutor/EventLoopTaskRunner.cpp"
  "${RNOH_CPP_DIR}/RNOH/TaskExecutor/ThreadTaskRunner.cpp"
  "${RNOH_CPP_DIR}/RNOH/TaskExecutor/DefaultExceptionHandler.cpp"
  "${RNOH_CPP_DIR}/RNOH/TaskExecutor/uv/Async.cpp"
  "${RNOH_CPP_DIR}/RNOH/TaskExecutor/uv/Timer.cpp"
  "${RNOH_CPP_DIR}/RNOH/TaskExecutor/uv/EventLoop.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/AccessibilityInfoTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/AlertManagerTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/AppearanceTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/AppStateTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/BlobTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/DeviceEventManagerTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/DeviceInfoTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/ExceptionsManagerTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/FileReaderTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/ImageLoaderTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/LogBoxTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/DevLoadingViewTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/LinkingManagerTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/NetworkingTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/PlatformColorTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/PlatformConstantsTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/SourceCodeTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/StatusBarTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/WebSocketTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/SafeAreaTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/DevSettingsTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/DevMenuTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/VibrationTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/ToastAndroidTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/ShareTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/Animated/NativeAnimatedTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/Animated/AnimatedNodesManager.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/Animated/Nodes/AnimatedNode.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/Animated/Nodes/TransformAnimatedNode.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/Animated/Nodes/InterpolationAnimatedNode.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/Animated/Nodes/DiffClampAnimatedNode.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/Animated/Nodes/TrackingAnimatedNode.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/Animated/Drivers/AnimationDriver.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/Animated/Drivers/FrameBasedAnimationDriver.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/Animated/Drivers/SpringAnimationDriver.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/Animated/Drivers/DecayAnimationDriver.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/Animated/Drivers/EventAnimationDriver.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/TurboModules/I18nManagerTurboModule.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/UIInputEventHandler.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/NativeNodeApi.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/NativeDialogApi.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/NodeContentHandle.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/ArkUISurface.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/ArkUINode.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/ColumnNode.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/ImageNode.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/ScrollNode.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/StackNode.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/CustomNode.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/TextNode.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/SpanNode.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/TextAreaNode.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/TextInputNode.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/TextInputNodeBase.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/ArkUIDialogHandler.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/TouchEventDispatcher.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/LoadingProgressNode.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/ToggleNode.cpp"
  "${RNOH_CPP_DIR}/RNOH/arkui/RefreshNode.cpp"
  "${RNOH_CPP_DIR}/RNOH/ComponentInstance.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/ComponentInstances/ImageComponentInstance.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/ComponentInstances/RootViewComponentInstance.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/ComponentInstances/ViewComponentInstance.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/ComponentInstances/TextComponentInstance.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/ComponentInstances/TextConversions.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/ComponentInstances/TextInputComponentInstance.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/ComponentInstances/ScrollViewComponentInstance.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/ComponentInstances/ActivityIndicatorComponentInstance.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/ComponentInstances/ModalHostViewComponentInstance.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/ComponentInstances/SwitchComponentInstance.cpp"
  "${RNOH_CPP_DIR}/RNOHCorePackage/ComponentInstances/PullToRefreshViewComponentInstance.cpp"
  "${RNOH_CPP_DIR}/RNOH/Performance/NativeTracing.cpp"
  "${RNOH_CPP_DIR}/RNOH/Performance/RNOHMarker.cpp"
  "${RNOH_CPP_DIR}/RNOH/Performance/HiTraceRNOHMarkerListener.cpp")
target_include_directories(
  rnoh
  PUBLIC "${RNOH_CPP_DIR}" "${REACT_COMMON_DIR}"
         "${REACT_COMMON_DIR}/jsiexecutor" "${hermes_include_dirs}"
         "${RNOH_APP_DIR}")

# add hitrace systrace implementation for debugging
option(WITH_HITRACE_SYSTRACE "enables HiTrace-based Systrace implementation"
       OFF)
option(WITH_HITRACE_REACT_MARKER
       "enables HiTrace-based React Marker implementation" OFF)
if(WITH_HITRACE_SYSTRACE OR WITH_HITRACE_REACT_MARKER)
  target_link_libraries(react_cxxreact libhitrace_ndk.z.so)
  target_link_libraries(react_nativemodule_core libhitrace_ndk.z.so)
  target_link_libraries(react_render_debug libhitrace_ndk.z.so)
  if(WITH_HITRACE_SYSTRACE)
    target_compile_definitions(react_cxxreact PUBLIC WITH_HITRACE_SYSTRACE)
    target_compile_definitions(react_nativemodule_core
                               PUBLIC WITH_HITRACE_SYSTRACE)
    target_compile_definitions(react_render_debug PUBLIC WITH_HITRACE_SYSTRACE)
  endif()
  if(WITH_HITRACE_REACT_MARKER)
    target_compile_definitions(react_cxxreact PUBLIC WITH_HITRACE_REACT_MARKER)
    target_compile_definitions(react_nativemodule_core
                               PUBLIC WITH_HITRACE_REACT_MARKER)
    target_compile_definitions(react_render_debug
                               PUBLIC WITH_HITRACE_REACT_MARKER)
  endif()
endif()

target_link_libraries(
  rnoh
  PUBLIC libace_napi.z.so
         libace_ndk.z.so
         libhilog_ndk.z.so
         librawfile.z.so
         libnative_vsync.so
         libnative_drawing.so
         glog
         uv
         Boost::context
         Boost::stacktrace_addr2line
         Boost::locale
         folly_target
         bridgeless
         bridgelesshermes
         bridgelessnativeviewconfig
         react_cxxreact
         react_render_scheduler
         hermes_executor_common
         rrc_native
         rrc_image
         rrc_text
         rrc_textinput
         rrc_scrollview
         rrc_modal
         react_codegen_rncore
         react_nativemodule_core
         react_bridging
         react_render_animations)

target_compile_options(rnoh PUBLIC ${folly_FLAGS})
target_compile_features(rnoh PUBLIC cxx_std_20)

target_link_libraries(rnoh PUBLIC libqos.so)

if(DEFINED LOG_VERBOSITY_LEVEL)
  message("LOG_VERBOSITY_LEVEL is set to: ${LOG_VERBOSITY_LEVEL}")
  target_compile_definitions(rnoh
                             PUBLIC LOG_VERBOSITY_LEVEL=${LOG_VERBOSITY_LEVEL})
endif()
