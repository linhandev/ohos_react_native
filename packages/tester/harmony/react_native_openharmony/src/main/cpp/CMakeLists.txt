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

# @internal
option(ENABLE_COMPILE_OPTIMIZATIONS "Enable or disable compiler
optimizations" ON)
set(PGO_MODE "USE" CACHE STRING "PGO mode: COLLECT( profile data for
optimization) or USE( the collected profile to optimize build)")
set(PROFDATA_FILE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../resources/rawfile/rnoh.profdata")
set(PROFRAW_GENERATING_PATH "/data/storage/el2/base/files/rnohprofraw")

# @actor RNOH_APP, RNOH_LIBRARY
add_library(rnoh_optimization_options INTERFACE)

if(ENABLE_COMPILE_OPTIMIZATIONS)
    # inline threshold's optimization result is code sensitive, thus not
    # included in the interface meant for developers
    add_compile_options(
        "SHELL:-mllvm -inline-threshold=225"
        "SHELL:-mllvm -inline-cold-callsite-threshold=45"
        "SHELL:-mllvm -inlinecold-threshold=45"
    )

    set(compile_optimization_option
        "-flto"
        "-fwhole-program-vtables"
        # 'SHELL:' is necessary for adding options with '-mllvm'
        "SHELL:-mllvm --enable-partial-inlining"
        "SHELL:-mllvm --tail-dup-placement"
    )
    set(link_optimization_option
        "-flto"
        "-Wl,-mllvm,--wholeprogramdevirt-check=fallback"
        "-Wl,-Bsymbolic-functions"
        "-Wl,-mllvm,--enable-partial-inlining"
        "-Wl,-mllvm,--tail-dup-placement"
    )

    include(CheckLinkerFlag)
    check_linker_flag("CXX" "-Wl,--aarch64-inline-plt" USING_BISHENG_COMPILER)
    if(OHOS_ARCH STREQUAL "arm64-v8a")
        # skip pgo related options if it's already configured
        get_directory_property(COMPILE_OPTIONS COMPILE_OPTIONS)
        string(FIND "${COMPILE_OPTIONS}" "-fprofile-generate" PROFILE_GENERATE_FOUND)
        string(FIND "${COMPILE_OPTIONS}" "-fprofile-use" PROFILE_USE_FOUND)
        if(PROFILE_GENERATE_FOUND EQUAL -1 AND PROFILE_USE_FOUND EQUAL -1)
            if(PGO_MODE STREQUAL "USE")
                add_compile_options(
                    "-fprofile-use=${PROFDATA_FILE_PATH}"
                    "-Wno-error=backend-plugin"
                )
            elseif(PGO_MODE STREQUAL "COLLECT")
                add_compile_options(
                    "-fprofile-generate=${PROFRAW_GENERATING_PATH}"
                    "SHELL:-mllvm -pgo-instrument-entry=true"
                )
                add_link_options(
                    "-fprofile-generate=${PROFRAW_GENERATING_PATH}"
                    "-Wl,-mllvm,-pgo-instrument-entry=true"
                )
            endif()
        endif()
        if(USING_BISHENG_COMPILER)
          add_link_options("-Wl,--aarch64-inline-plt")
        endif()
    endif()

    add_compile_options(${compile_optimization_option})
    add_link_options(${link_optimization_option})

    target_compile_options(rnoh_optimization_options INTERFACE ${compile_optimization_option})
    target_link_options(rnoh_optimization_options INTERFACE ${link_optimization_option})
endif()

set(NATIVERENDER_ROOT_PATH "${RNOH_CPP_DIR}")
set(third_party_dir "${RNOH_CPP_DIR}/third-party")
set(patches_dir "${RNOH_CPP_DIR}/patches")

include_directories(${NATIVERENDER_ROOT_PATH} ${NATIVERENDER_ROOT_PATH}/include)

add_subdirectory("third-party")
add_subdirectory("RNOH")
add_subdirectory("RNOHCorePackage")

add_library(rnoh INTERFACE)
target_link_libraries(rnoh INTERFACE rnoh_core rnoh_core_package rnoh_optimization_options)
