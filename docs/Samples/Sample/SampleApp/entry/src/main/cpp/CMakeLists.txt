# Copyright (c) 2024 Huawei Technologies Co., Ltd.
#
# This source code is licensed under the MIT license found in the
# LICENSE-MIT file in the root directory of this source tree.

project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(CMAKE_ASM_FLAGS "-Wno-error=unused-command-line-argument -Qunused-arguments")
set(OH_MODULE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")

set(RNOH_CPP_DIR "${OH_MODULE_DIR}/@rnoh/react-native-openharmony/src/main/cpp")
set(WITH_HITRACE_SYSTRACE 1) # for other CMakeLists.txt files to use
add_compile_definitions(WITH_HITRACE_SYSTRACE)

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# RNOH_BEGIN: add_package_subdirectories
add_subdirectory("${OH_MODULE_DIR}/@react-native-oh-tpl/react-native-pager-view/src/main/cpp" ./pager_view)
# RNOH_END: add_package_subdirectories

add_library(rnoh_app SHARED
    "./PackageProvider.cpp"
    "./Fabric/MarqueeViewEventEmitter.cpp"
    "./Fabric/Props.cpp"
    "./TurboModules/SampleTurboModuleSpec.cpp"
    "./TurboModules/SampleTurboModule2Spec.cpp"
    "./SampleTurboModulePackage.cpp"
    "./ButtonView/Props.cpp"
    "./ButtonView/ButtonViewComponentInstance.cpp"
    "./ButtonView/ButtonNode.cpp"
    "./ButtonView/ButtonViewEventEmitter.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)

# RNOH_BEGIN: link_packages
target_link_libraries(rnoh_app PUBLIC rnoh)
target_link_libraries(rnoh_app PUBLIC rnoh_pager_view)
# RNOH_END: link_packages
