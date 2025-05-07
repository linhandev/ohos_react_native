file(GLOB_RECURSE RNOH_SRC_FILES "*.cpp")

# code in JSEngine are to be conditionally added based on USE_HERMES
list(FILTER RNOH_SRC_FILES EXCLUDE REGEX "JSEngine/.*$")

add_library(
  rnoh_core SHARED
  ${RNOH_SRC_FILES})
target_include_directories(rnoh_core PUBLIC "${RNOH_CPP_DIR}" "${RNOH_APP_DIR}")

target_link_libraries(
  rnoh_core
  PUBLIC libace_napi.z.so
         libace_ndk.z.so
         libbundle_ndk.z.so
         libdeviceinfo_ndk.z.so
         libhilog_ndk.z.so
         librawfile.z.so
         libnative_vsync.so
         libnative_drawing.so
         libqos.so
         Boost::context
         Boost::stacktrace_addr2line
         Boost::locale
         glog
         uv
         folly
         reactnative
         )

target_compile_options(rnoh_core PUBLIC ${folly_FLAGS})
target_compile_features(rnoh_core PUBLIC cxx_std_20)

if(DEFINED LOG_VERBOSITY_LEVEL)
  message("LOG_VERBOSITY_LEVEL is set to: ${LOG_VERBOSITY_LEVEL}")
  target_compile_definitions(rnoh_core
                             PUBLIC LOG_VERBOSITY_LEVEL=${LOG_VERBOSITY_LEVEL})
endif()

if(USE_HERMES)
  add_subdirectory("${RNOH_CPP_DIR}/RNOH/JSEngine/hermes")
  target_link_libraries(rnoh_core
                        PUBLIC hermestooling)
  target_compile_definitions(rnoh_core
                             PUBLIC USE_HERMES=1)
else()
  add_subdirectory("${RNOH_CPP_DIR}/RNOH/JSEngine/jsvm")
  target_link_libraries(rnoh_core PUBLIC jsvmtooling)
  target_compile_definitions(rnoh_core
                             PUBLIC USE_HERMES=0)
endif()
