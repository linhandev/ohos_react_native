include("${CMAKE_CURRENT_SOURCE_DIR}/FetchDependencies.cmake")

# FOLLY
set(folly_include_dir "${folly_SOURCE_DIR}")
set(folly_src_dir "${folly_SOURCE_DIR}/folly")
add_library(folly)
target_include_directories(folly PUBLIC "${folly_include_dir}")
set(folly_FLAGS
    -DFOLLY_NO_CONFIG=1
    -DFOLLY_MOBILE=1
    -DFOLLY_USE_LIBCPP=1
    -DFOLLY_HAVE_RECVMMSG=1
    -DFOLLY_HAVE_PTHREAD=1
    -Wno-comma
    -Wno-shorten-64-to-32
    -Wno-documentation
    -faligned-new)
target_compile_options(folly PUBLIC ${folly_FLAGS})
target_sources(
  folly
  PRIVATE "${folly_src_dir}/SharedMutex.cpp"
          "${folly_src_dir}/concurrency/CacheLocality.cpp"
          "${folly_src_dir}/detail/Futex.cpp"
          "${folly_src_dir}/portability/Malloc.cpp"
          "${folly_src_dir}/synchronization/ParkingLot.cpp"
          "${folly_src_dir}/system/ThreadId.cpp"
          "${folly_src_dir}/lang/SafeAssert.cpp"
          "${folly_src_dir}/lang/ToAscii.cpp"
          "${folly_src_dir}/dynamic.cpp"
          "${folly_src_dir}/hash/SpookyHashV2.cpp"
          "${folly_src_dir}/json_pointer.cpp"
          "${folly_src_dir}/Conv.cpp"
          "${folly_src_dir}/Format.cpp"
          "${folly_src_dir}/memory/detail/MallocImpl.cpp"
          "${folly_src_dir}/json.cpp"
          "${folly_src_dir}/Unicode.cpp"
          "${folly_src_dir}/ScopeGuard.cpp")
target_link_libraries(folly PUBLIC Boost::context Boost::algorithm
                                   Boost::intrusive fmt glog double-conversion)

# HERMES
add_library(hermes-engine::libhermes SHARED IMPORTED)
target_compile_definitions(hermes-engine::libhermes INTERFACE
 # TODO: check if building in debug mode
                    HERMES_ENABLE_DEBUGGER)
set_property(
  TARGET hermes-engine::libhermes
  PROPERTY IMPORTED_LOCATION
           "${third_party_dir}/prebuilt/${OHOS_ARCH}/libhermes.so")
set(hermes_include_dirs "${hermes_SOURCE_DIR}/API"
                        "${hermes_SOURCE_DIR}/public")

add_subdirectory("rn")
