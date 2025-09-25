cmake_minimum_required(VERSION 3.5)

if(DEFINED PACKAGE_FIND_FILE)
    include(${PACKAGE_FIND_FILE})
endif()

set(folly_FLAGS
    -DFOLLY_NO_CONFIG=1
    -DFOLLY_MOBILE=1
    -DFOLLY_USE_LIBCPP=1
    -DFOLLY_HAVE_RECVMMSG=1
    -DFOLLY_HAVE_PTHREAD=1
    -std=c++20
    -Wno-comma
    -Wno-shorten-64-to-32
    -Wno-documentation
    -faligned-new)
configure_file(
    ${RNOH_CPP_DIR}/third-party/folly/CMake/folly-config.h.cmake
    ${RNOH_CPP_DIR}/third-party/folly/folly/folly-config.h
)

add_compile_definitions(
    REACT_NATIVE__RENDER__GRAPHICS__FLOAT=double
    NDEBUG
    RAW_PROPS_ENABLED
    UNSET_FORMS_STACKING_CONTEXT)

add_library(rnoh INTERFACE)
target_link_libraries(rnoh INTERFACE
    react-native-openharmony::rnoh_core
    react-native-openharmony::rnoh_core_package)

if(NOT DEFINED USE_HERMES)
    set(USE_HERMES ON)
endif()
message("USE_HERMES is set to: ${USE_HERMES}")
if(USE_HERMES)
    target_link_libraries(rnoh INTERFACE react-native-openharmony::hermes react-native-openharmony::hermestooling)
    target_compile_definitions(rnoh INTERFACE USE_HERMES=1)
else()
    target_link_libraries(rnoh INTERFACE react-native-openharmony::jsvmtooling)
    target_compile_definitions(rnoh INTERFACE USE_HERMES=0)
endif()

target_include_directories(
    rnoh INTERFACE
    ${RNOH_APP_DIR}
    ${RNOH_CPP_DIR}/patches/react_native_core
    ${RNOH_CPP_DIR}/patches/react_native_core/react/renderer/textlayoutmanager/platform/harmony
    ${RNOH_CPP_DIR}/RNOH/JSEngine/jsvm
    ${RNOH_CPP_DIR}/third-party/rn/ReactCommon
    ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/jsi
    ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/jsiexecutor
    ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/callinvoker
    ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/runtimeexecutor
    ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/react/nativemodule/core
    ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/yoga
    ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/react/renderer/components/view/platform/cxx
    ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/react/renderer/graphics/platform/cxx
    ${RNOH_CPP_DIR}/third-party/hermes/API
    ${RNOH_CPP_DIR}/third-party/hermes/public
    ${RNOH_CPP_DIR}/third-party/folly
    ${RNOH_CPP_DIR}/third-party/double-conversion
    ${RNOH_CPP_DIR}/third-party/fmt/include
    ${RNOH_CPP_DIR}/third-party/glog/src
    ${RNOH_CPP_DIR}/third-party/boost/libs/array/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/assert/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/container_hash/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/config/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/core/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/detail/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/intrusive/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/iterator/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/move/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/mpl/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/preprocessor/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/predef/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/stacktrace/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/static_assert/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/throw_exception/include
    ${RNOH_CPP_DIR}/third-party/boost/libs/type_traits/include)

target_compile_options(rnoh INTERFACE ${folly_FLAGS})
