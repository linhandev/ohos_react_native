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

option(ENABLE_COMPILER_OPTS "Enable or disable compiler optimizations" ON)

if(ENABLE_COMPILER_OPTS)
    add_compile_options(
        "SHELL:-mllvm -inline-threshold=225"
        "SHELL:-mllvm -inline-cold-callsite-threshold=45"
        "SHELL:-mllvm -inlinecold-threshold=45"
    )

    set(Bisheng_compile_option
        "-flto"
        "-fwhole-program-vtables"
        "SHELL:-mllvm --enable-partial-inlining" # 'SHELL:' is necessary for addition of options with '-mllvm'
        "SHELL:-mllvm --tail-dup-placement"
    )
    set(Bisheng_link_option
        "-flto"
        "-Wl,-mllvm,--wholeprogramdevirt-check=fallback"
        "-Wl,-Bsymbolic-functions"
        "-Wl,-mllvm,--enable-partial-inlining"
        "-Wl,-mllvm,--tail-dup-placement"
    )

    include(CheckLinkerFlag)
    check_linker_flag("CXX" "-Wl,--aarch64-inline-plt" USING_BISHENG_COMPILER)
    if(OHOS_ARCH STREQUAL "arm64-v8a")
        set(PROFDATA_FILE "${CMAKE_CURRENT_SOURCE_DIR}/../resources/rawfile/rnoh.profdata")
        add_compile_options(
            "-fprofile-use=${PROFDATA_FILE}"
            "-Wno-error=backend-plugin"
        )
        if(USING_BISHENG_COMPILER)
          add_link_options("-Wl,--aarch64-inline-plt")
        endif()
    endif()
    add_compile_options(${Bisheng_compile_option})
    add_link_options(${Bisheng_link_option})

    add_library(RNProjectOptions INTERFACE)
    target_compile_options(RNProjectOptions INTERFACE ${Bisheng_compile_option})
    target_link_options(RNProjectOptions INTERFACE ${Bisheng_link_option})
endif()

set(NATIVERENDER_ROOT_PATH "${RNOH_CPP_DIR}")
set(third_party_dir "${RNOH_CPP_DIR}/third-party")
set(patches_dir "${RNOH_CPP_DIR}/patches")

include_directories(${NATIVERENDER_ROOT_PATH} ${NATIVERENDER_ROOT_PATH}/include)

add_subdirectory("third-party")
add_subdirectory("RNOH")
add_subdirectory("RNOHCorePackage")

add_library(rnoh INTERFACE)
target_link_libraries(rnoh INTERFACE rnoh_core rnoh_core_package)
if(ENABLE_COMPILER_OPTS)
    target_link_libraries(rnoh INTERFACE RNProjectOptions)
endif()
