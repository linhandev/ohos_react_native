project(rnapp)
cmake_minimum_required(VERSION 3.5)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../oh_modules/@rnoh/react-native-openharmony/src/main/cpp")
set(RNOH_GENERATED_DIR "${CMAKE_CURRENT_SOURCE_DIR}/generated")
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
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/geolocation/src/main/cpp" ./geolocation)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/lottie-react-native/src/main/cpp" ./lottie)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/masked-view/src/main/cpp" ./masked-view)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/netinfo/src/main/cpp" ./netinfo)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/react-native-exception-handler/src/main/cpp" ./exception-handler)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/react-native-image-picker/src/main/cpp" ./image_picker)
add_subdirectory("${OH_MODULES_DIR}/@react-native-ohos/checkbox/src/main/cpp" ./checkbox)
add_subdirectory("${OH_MODULES_DIR}/@react-native-ohos/react-native-linear-gradient/src/main/cpp" ./linear-gradient)
add_subdirectory("${OH_MODULES_DIR}/rnoh-toolbar-android/src/main/cpp" ./toolbar-android)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/react-native-mlkit-ocr/src/main/cpp" ./rn_mlkit_ocr)
add_subdirectory("${OH_MODULES_DIR}/@react-native-ohos-community/auto-fill/src/main/cpp" ./auto-fill)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/react-native-incall-manager/src/main/cpp" ./in_call_manager)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/react-native-blurhash/src/main/cpp" ./blurhash)
add_subdirectory("${OH_MODULES_DIR}/@react-native-oh-tpl/react-native-ui-lib/src/main/cpp" ./ui-lib)
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
target_link_libraries(rnoh_app PUBLIC rnoh_geolocation)
target_link_libraries(rnoh_app PUBLIC rnoh_lottie)
target_link_libraries(rnoh_app PUBLIC rnoh_masked_view)
target_link_libraries(rnoh_app PUBLIC rnoh_netinfo)
target_link_libraries(rnoh_app PUBLIC rnoh_exception_handler)
target_link_libraries(rnoh_app PUBLIC rnoh_image_picker)
target_link_libraries(rnoh_app PUBLIC rnoh_checkbox)
target_link_libraries(rnoh_app PUBLIC rnoh_linear_gradient)
target_link_libraries(rnoh_app PUBLIC rnoh_toolbar_android)
target_link_libraries(rnoh_app PUBLIC rnoh_mlkit_ocr)
target_link_libraries(rnoh_app PUBLIC auto_fill)
target_link_libraries(rnoh_app PUBLIC rnoh_in_call_manager)
target_link_libraries(rnoh_app PUBLIC rnoh_blurhash)
target_link_libraries(rnoh_app PUBLIC rnoh_ui_lib)
# RNOH_END: manual_package_linking_2
