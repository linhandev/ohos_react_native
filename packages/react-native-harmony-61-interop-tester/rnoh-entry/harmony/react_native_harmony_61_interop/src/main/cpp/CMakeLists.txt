cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)
set(rnoh_interop_61_generated_dir "${CMAKE_CURRENT_SOURCE_DIR}/generated")

file(GLOB_RECURSE rnoh_interop_61_SRC "*.cpp")

add_library(rnoh_interop_61 SHARED ${rnoh_interop_61_SRC})

target_link_libraries(rnoh_interop_61 PUBLIC rnoh)

target_include_directories(rnoh_interop_61 PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${rnoh_interop_61_generated_dir}
)
