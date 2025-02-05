file(GLOB_RECURSE RNOH_CORE_PACKAGE_SRC_FILES "*.cpp")

add_library(
  rnoh_core_package SHARED
  ${RNOH_CORE_PACKAGE_SRC_FILES})

target_link_libraries(rnoh_core_package PRIVATE rnoh_core)
