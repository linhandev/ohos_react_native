# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

add_compile_options(
        -fexceptions
        -frtti
        -std=c++20
        -Wall
        -Wpedantic
        -DLOG_TAG=\"Fabric\")

file(GLOB react_render_textlayourmanager_SRC CONFIGURE_DEPENDS
        *.cpp
        platform/harmony/react/renderer/textlayoutmanager/*.cpp) # RNOH patch

add_library(react_render_textlayoutmanager
        OBJECT
        ${REACT_COMMON_DIR}/react/renderer/textlayoutmanager/TextMeasureCache.cpp # RNOH patch
        ${react_render_textlayourmanager_SRC})

target_include_directories(react_render_textlayoutmanager
        PUBLIC
        ${REACT_COMMON_DIR}
        ${REACT_COMMON_DIR}/react/renderer/textlayoutmanager # RNOH patch
        ${CMAKE_CURRENT_SOURCE_DIR}/platform/harmony/ # RNOH patch
)

target_link_libraries(react_render_textlayoutmanager
        glog
        fb
        fbjni
        folly_runtime
        glog_init
        mapbufferjni
        react_debug
        react_render_attributedstring
        react_render_componentregistry
        react_render_core
        react_render_debug
        react_render_graphics
        react_render_mapbuffer
        react_render_mounting
        react_render_telemetry
#        react_render_uimanager # RNOH patch — breaking cyclic dependency
        react_utils
        reactnativejni
        yoga
)
