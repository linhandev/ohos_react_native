cmake_minimum_required(VERSION 3.13)
cmake_policy(SET CMP0079 NEW) # Allow to link libraries from different
# directories than targets

option(WITH_HITRACE_SYSTRACE "enables HiTrace-based Systrace implementation"
       OFF)
option(WITH_HITRACE_REACT_MARKER
       "enables HiTrace-based React Marker implementation" OFF)

if(NOT DEFINED USE_HERMES)
  set(USE_HERMES ON)
endif()
message("USE_HERMES is set to: ${USE_HERMES}")

add_compile_options("-Wno-error=unused-command-line-argument")

set(NATIVERENDER_ROOT_PATH "${RNOH_CPP_DIR}")
set(third_party_dir "${RNOH_CPP_DIR}/third-party")
set(patches_dir "${RNOH_CPP_DIR}/patches")

include_directories(${NATIVERENDER_ROOT_PATH} ${NATIVERENDER_ROOT_PATH}/include)

add_subdirectory("third-party")
add_subdirectory("RNOH")
add_subdirectory("RNOHCorePackage")

add_library(rnoh INTERFACE)
target_link_libraries(rnoh INTERFACE rnoh_core rnoh_core_package)
