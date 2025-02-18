project(rnapp)
cmake_minimum_required(VERSION 3.5)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../../node_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../oh_modules/@rnoh/react-native-openharmony/src/main/cpp")
set(RNOH_GENERATED_DIR "${CMAKE_CURRENT_SOURCE_DIR}/generated")
set(RNOH_REACT_COMMON_DIR "${NODE_MODULES}/@react-native-oh/react-native-core/ReactCommon")
set(LOG_VERBOSITY_LEVEL 1)
set(CMAKE_ASM_FLAGS "-Wno-error=unused-command-line-argument -Qunused-arguments")
set(WITH_HITRACE_SYSTRACE ON)
set(WITH_HITRACE_REACT_MARKER ON)
set(OH_MODULES_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../oh_modules") # required by 'autolink_libraries'

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

include("${CMAKE_CURRENT_SOURCE_DIR}/autolinking.cmake")

# RNOH_BEGIN: manual_package_linking_1
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/async-storage/src/main/cpp" ./rnoh-async-storage)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/blur/src/main/cpp" ./blur)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/clipboard/src/main/cpp" ./clipboard)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/cookies/src/main/cpp" ./rn_cookies)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/datetimepicker/src/main/cpp" ./datetimepicker)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/flash-list/src/main/cpp" ./flah-list)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/react-native-exception-handler/src/main/cpp" ./exception-handler)
add_subdirectory("${OH_MODULES_DIR}/@react-native-ohos/checkbox/src/main/cpp" ./checkbox)
# RNOH_END: manual_package_linking_1

file(GLOB GENERATED_CPP_FILES "${CMAKE_CURRENT_SOURCE_DIR}/generated/*.cpp") # this line is needed by codegen v1
add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)
target_link_libraries(rnoh_app PUBLIC rnoh)

autolink_libraries(rnoh_app)

# RNOH_BEGIN: manual_package_linking_2
target_link_libraries(rnoh_app PUBLIC rnoh_async_storage)
target_link_libraries(rnoh_app PUBLIC rnoh_blur)
target_link_libraries(rnoh_app PUBLIC rnoh_clipboard)
target_link_libraries(rnoh_app PUBLIC rnoh_cookies)
target_link_libraries(rnoh_app PUBLIC rnoh_datetime_picker)
target_link_libraries(rnoh_app PUBLIC rnoh_flash_list)
target_link_libraries(rnoh_app PUBLIC rnoh_exception_handler)
target_link_libraries(rnoh_app PUBLIC rnoh_checkbox)
# RNOH_END: manual_package_linking_2
