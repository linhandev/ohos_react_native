if(NOT DEFINED RNOH_REACT_COMMON_DIR)
 set(RNOH_REACT_COMMON_DIR "${CMAKE_CURRENT_SOURCE_DIR}/ReactCommon")
endif()
set(REACT_COMMON_DIR ${RNOH_REACT_COMMON_DIR} CACHE INTERNAL "")
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

add_compile_definitions(
    REACT_NATIVE__RENDER__GRAPHICS__FLOAT=double
    RAW_PROPS_ENABLED
    UNSET_FORMS_STACKING_CONTEXT)

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
add_react_common_subdir(react/runtime)
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
add_react_common_subdir(react/renderer/consistency)
add_react_common_subdir(react/renderer/uimanager/consistency)
add_react_common_subdir(react/renderer/dom)
add_react_common_subdir(react/renderer/element)
set(REACT_NATIVE_PLATFORM "cxx")
    add_react_common_subdir(react/renderer/graphics)
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
target_compile_definitions(rrc_text PUBLIC UNSET_FORMS_STACKING_CONTEXT)
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
#add_react_common_subdir(react/nativemodule/defaults)
#add_react_common_subdir(react/nativemodule/dom)
#add_react_common_subdir(react/nativemodule/featureflags)
#add_react_common_subdir(react/nativemodule/microtasks)
#add_react_common_subdir(react/nativemodule/idlecallbacks)
add_react_common_subdir(react/timing)
add_react_common_subdir(jserrorhandler)
target_include_directories(react_nativemodule_core
                           PRIVATE "${REACT_COMMON_DIR}/callinvoker")

# add hitrace systrace implementation for debugging
if(WITH_HITRACE_SYSTRACE OR WITH_HITRACE_REACT_MARKER)
  target_link_libraries(react_cxxreact libhitrace_ndk.z.so)
  target_link_libraries(react_nativemodule_core libhitrace_ndk.z.so)
  target_link_libraries(react_render_debug libhitrace_ndk.z.so)
  if(WITH_HITRACE_SYSTRACE)
    set(WITH_CUSTOM_SYSTRACE 1)
    target_compile_definitions(react_cxxreact PUBLIC WITH_CUSTOM_SYSTRACE)
    target_compile_definitions(react_nativemodule_core
                               PUBLIC WITH_CUSTOM_SYSTRACE)
    target_compile_definitions(react_render_debug PUBLIC WITH_CUSTOM_SYSTRACE)
  endif()
  if(WITH_HITRACE_REACT_MARKER)
    target_compile_definitions(react_cxxreact PUBLIC WITH_HITRACE_REACT_MARKER)
    target_compile_definitions(react_nativemodule_core
                               PUBLIC WITH_HITRACE_REACT_MARKER)
    target_compile_definitions(react_render_debug
                               PUBLIC WITH_HITRACE_REACT_MARKER)
  endif()
endif()

add_library(reactnative
        SHARED
          $<TARGET_OBJECTS:bridgeless>
          $<TARGET_OBJECTS:bridgelessnativeviewconfig>
#          $<TARGET_OBJECTS:callinvokerholder>
#          $<TARGET_OBJECTS:fabricjni>
#          $<TARGET_OBJECTS:glog_init>
#          $<TARGET_OBJECTS:jni_lib_merge_glue>
          $<TARGET_OBJECTS:jserrorhandler>
          $<TARGET_OBJECTS:jsinspector>
          $<TARGET_OBJECTS:jsireact>
          $<TARGET_OBJECTS:logger>
#          $<TARGET_OBJECTS:mapbufferjni>
          $<TARGET_OBJECTS:react_bridging>
          $<TARGET_OBJECTS:react_codegen_rncore>
          $<TARGET_OBJECTS:react_config>
          $<TARGET_OBJECTS:react_cxxreact>
          $<TARGET_OBJECTS:react_debug>
#          $<TARGET_OBJECTS:react_devsupportjni>
          $<TARGET_OBJECTS:react_featureflags>
#          $<TARGET_OBJECTS:react_featureflagsjni>
          $<TARGET_OBJECTS:react_nativemodule_core>
#          $<TARGET_OBJECTS:react_nativemodule_defaults>
#          $<TARGET_OBJECTS:react_nativemodule_dom>
#          $<TARGET_OBJECTS:react_nativemodule_featureflags>
#          $<TARGET_OBJECTS:react_nativemodule_idlecallbacks>
#          $<TARGET_OBJECTS:react_nativemodule_microtasks>
#          $<TARGET_OBJECTS:react_newarchdefaults>
          $<TARGET_OBJECTS:react_performance_timeline>
          $<TARGET_OBJECTS:react_render_animations>
          $<TARGET_OBJECTS:react_render_attributedstring>
          $<TARGET_OBJECTS:react_render_componentregistry>
          $<TARGET_OBJECTS:react_render_consistency>
          $<TARGET_OBJECTS:react_render_core>
          $<TARGET_OBJECTS:react_render_debug>
          $<TARGET_OBJECTS:react_render_dom>
          $<TARGET_OBJECTS:react_render_element>
          $<TARGET_OBJECTS:react_render_graphics>
          $<TARGET_OBJECTS:react_render_imagemanager>
          $<TARGET_OBJECTS:react_render_leakchecker>
          $<TARGET_OBJECTS:react_render_mapbuffer>
          $<TARGET_OBJECTS:react_render_mounting>
          $<TARGET_OBJECTS:react_render_observers_events>
          $<TARGET_OBJECTS:react_render_runtimescheduler>
          $<TARGET_OBJECTS:react_render_scheduler>
          $<TARGET_OBJECTS:react_render_telemetry>
          $<TARGET_OBJECTS:react_render_textlayoutmanager>
          $<TARGET_OBJECTS:react_render_uimanager>
          $<TARGET_OBJECTS:react_render_uimanager_consistency>
          $<TARGET_OBJECTS:react_utils>
#          $<TARGET_OBJECTS:reactnativeblob>
#          $<TARGET_OBJECTS:reactnativejni>
          $<TARGET_OBJECTS:reactperflogger>
#          $<TARGET_OBJECTS:rninstance>
          $<TARGET_OBJECTS:rrc_image>
          $<TARGET_OBJECTS:rrc_legacyviewmanagerinterop>
          $<TARGET_OBJECTS:rrc_modal>
          $<TARGET_OBJECTS:rrc_native>
#          $<TARGET_OBJECTS:rrc_progressbar>
          $<TARGET_OBJECTS:rrc_root>
#          $<TARGET_OBJECTS:rrc_safeareaview>
          $<TARGET_OBJECTS:rrc_scrollview>
#          $<TARGET_OBJECTS:rrc_switch>
          $<TARGET_OBJECTS:rrc_text>
          $<TARGET_OBJECTS:rrc_textinput>
          $<TARGET_OBJECTS:rrc_view>
          $<TARGET_OBJECTS:runtimeexecutor>
#          $<TARGET_OBJECTS:turbomodulejsijni>
#          $<TARGET_OBJECTS:uimanagerjni>
          $<TARGET_OBJECTS:yoga>)

target_include_directories(reactnative
        PUBLIC
        $<TARGET_PROPERTY:bridgeless,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:bridgelessnativeviewconfig,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:callinvokerholder,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:fabricjni,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:glog_init,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:jserrorhandler,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:jsinspector,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:jsireact,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:mapbufferjni,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_bridging,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_codegen_rncore,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_config,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_cxxreact,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_debug,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:react_devsupportjni,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_featureflags,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:react_featureflagsjni,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_nativemodule_core,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:react_nativemodule_defaults,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:react_nativemodule_dom,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:react_nativemodule_featureflags,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:react_nativemodule_idlecallbacks,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:react_nativemodule_microtasks,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:react_newarchdefaults,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_performance_timeline,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_animations,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_attributedstring,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_componentregistry,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_componentregistry,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_consistency,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_core,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_debug,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_dom,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_element,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_graphics,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_imagemanager,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_leakchecker,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_mapbuffer,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_mounting,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_observers_events,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_runtimescheduler,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_scheduler,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_telemetry,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_textlayoutmanager,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_uimanager,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_render_uimanager_consistency,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:react_utils,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:reactnativeblob,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:reactnativejni,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:reactperflogger,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:rninstance,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:rrc_image,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:rrc_legacyviewmanagerinterop,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:rrc_modal,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:rrc_native,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:rrc_progressbar,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:rrc_root,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:rrc_safeareaview,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:rrc_scrollview,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:rrc_switch,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:rrc_text,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:rrc_textinput,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:rrc_view,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:runtimeexecutor,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:turbomodulejsijni,INTERFACE_INCLUDE_DIRECTORIES>
#        $<TARGET_PROPERTY:uimanagerjni,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:yoga,INTERFACE_INCLUDE_DIRECTORIES>
)

set(REACTNATIVE_LIBRARIES glog folly jsi)

# add hitrace systrace implementation
if(WITH_HITRACE_SYSTRACE OR WITH_HITRACE_REACT_MARKER)
    list(APPEND REACTNATIVE_LIBRARIES libhitrace_ndk.z.so)
  if(WITH_HITRACE_SYSTRACE)
    set(WITH_CUSTOM_SYSTRACE 1)
    target_compile_definitions(reactnative PUBLIC WITH_CUSTOM_SYSTRACE)
  endif()
  if(WITH_HITRACE_REACT_MARKER)
    target_compile_definitions(reactnative PUBLIC WITH_HITRACE_REACT_MARKER)
  endif()
endif()

target_link_libraries(reactnative PUBLIC ${REACTNATIVE_LIBRARIES})
target_compile_definitions(reactnative PUBLIC
    RAW_PROPS_ENABLED
    REACT_NATIVE__RENDER__GRAPHICS__FLOAT=double
    UNSET_FORMS_STACKING_CONTEXT
)