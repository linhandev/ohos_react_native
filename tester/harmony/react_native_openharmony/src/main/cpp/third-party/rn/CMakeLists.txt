if(NOT DEFINED RNOH_REACT_COMMON_DIR)
 set(RNOH_REACT_COMMON_DIR "${CMAKE_CURRENT_SOURCE_DIR}/ReactCommon")
endif()
set(REACT_COMMON_DIR ${RNOH_REACT_COMMON_DIR})
set(REACT_COMMON_PATCH_DIR "${patches_dir}/react_native_core")

include_directories(${REACT_COMMON_PATCH_DIR})

# dummy targets added to avoid modyfing CMakeLists located in ReactCommon
add_library(boost INTERFACE)
add_library(folly_runtime ALIAS folly)
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

# -------- REACT COMMON --------
function(add_react_common_subdir relative_path)
  add_subdirectory(${REACT_COMMON_DIR}/${relative_path} ${relative_path})
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
                           PUBLIC "${hermes_include_dirs}")
# add_react_common_subdir(hermes/inspector)
add_react_common_subdir(react/runtime)
add_react_common_subdir(react/runtime/hermes)
target_include_directories(bridgelesshermes PUBLIC "${hermes_include_dirs}")
add_react_common_subdir(react/runtime/nativeviewconfig)
add_react_common_subdir(react/featureflags)
add_react_common_subdir(react/performance/timeline)
add_react_common_subdir(react/renderer/runtimescheduler)
add_subdirectory(${REACT_COMMON_PATCH_DIR}/react/debug "react_debug_harmony")
add_react_common_subdir(react/config)
add_react_common_subdir(react/renderer/animations)
add_react_common_subdir(react/renderer/attributedstring)
set(REACT_NATIVE_PLATFORM "cxx")
    add_react_common_subdir(react/renderer/components/view)
unset(REACT_NATIVE_PLATFORM)
add_react_common_subdir(react/renderer/componentregistry)
add_react_common_subdir(react/renderer/mounting)
add_react_common_subdir(react/renderer/scheduler)
add_react_common_subdir(react/renderer/telemetry)
add_react_common_subdir(react/renderer/uimanager)
add_react_common_subdir(react/renderer/core)
target_compile_definitions(react_render_core PUBLIC RAW_PROPS_ENABLED)
add_react_common_subdir(react/renderer/consistency)
add_react_common_subdir(react/renderer/uimanager/consistency)
add_react_common_subdir(react/renderer/dom)
set(REACT_NATIVE_PLATFORM "cxx")
    add_react_common_subdir(react/renderer/graphics)
    target_compile_definitions(react_render_graphics PUBLIC REACT_NATIVE__RENDER__GRAPHICS__FLOAT=double)
unset(REACT_NATIVE_PLATFORM)
add_subdirectory(${REACT_COMMON_PATCH_DIR}/react/renderer/debug "react_renderer_debug_harmony")
add_react_common_subdir(react/renderer/imagemanager)
# add_react_common_subdir(react/renderer/components/switch)
add_subdirectory(${REACT_COMMON_PATCH_DIR}/react/renderer/components/textinput "react_textinput_harmony")
# add_react_common_subdir(react/renderer/components/progressbar)
add_react_common_subdir(react/renderer/components/root)
add_react_common_subdir(react/renderer/components/image)
add_react_common_subdir(react/renderer/components/legacyviewmanagerinterop)
add_react_common_subdir(react/renderer/componentregistry/native)
add_react_common_subdir(react/renderer/components/text)
target_compile_definitions(rrc_text PUBLIC FORMS_STACKING_CONTEXT)
# add_react_common_subdir(react/renderer/components/unimplementedview)
add_subdirectory(${REACT_COMMON_PATCH_DIR}/react/renderer/components/rncore "react_components_harmony")
add_react_common_subdir(react/renderer/components/modal)
add_react_common_subdir(react/renderer/components/scrollview)
add_react_common_subdir(react/renderer/leakchecker)
add_react_common_subdir(react/renderer/observers/events)
add_subdirectory(${REACT_COMMON_PATCH_DIR}/react/renderer/textlayoutmanager "react_textlayoutmanager_harmony")
add_react_common_subdir(react/utils)
add_react_common_subdir(react/bridging)
add_react_common_subdir(react/renderer/mapbuffer)
add_react_common_subdir(react/nativemodule/core)
add_react_common_subdir(jserrorhandler)
target_include_directories(react_nativemodule_core
                           PRIVATE "${REACT_COMMON_DIR}/callinvoker")

# HERMES INSPECTOR
add_react_common_subdir(hermes/inspector-modern)
target_include_directories(hermes_inspector_modern
                           PRIVATE "${hermes_include_dirs}")
target_compile_options(hermes_inspector_modern PRIVATE ${folly_FLAGS})

# add hitrace systrace implementation for debugging
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

add_library(react_common INTERFACE)

target_link_libraries(react_common INTERFACE 
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
