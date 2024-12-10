include(FetchContent)

# FMT
FetchContent_Declare(
  Fmt
  GIT_REPOSITORY https://github.com/fmtlib/fmt.git
  GIT_TAG a33701196adfad74917046096bf5a2aa0ab0bb50 # 9.1.0
  OVERRIDE_FIND_PACKAGE)

# DOUBLE CONVERSION
FetchContent_Declare(
  DoubleConversion
  GIT_REPOSITORY https://github.com/google/double-conversion.git
  GIT_TAG 4f7a25d8ced8c7cf6eee6fd09d6788eaa23c9afe # v3.3.0
  OVERRIDE_FIND_PACKAGE)

# GLOG
FetchContent_Declare(
  Glog
  GIT_REPOSITORY https://github.com/google/glog.git
  GIT_TAG a6a166db069520dbbd653c97c2e5b12e08a8bb26 # v0.3.5
  OVERRIDE_FIND_PACKAGE)

# BOOST
set(BOOST_ENABLE_CMAKE On)
FetchContent_Declare(
  Boost
  GIT_REPOSITORY https://github.com/boostorg/boost.git
  GIT_TAG f313171e2516e8e2a8d0b2478bafb40e3e90f279
  OVERRIDE_FIND_PACKAGE)

# LIBEVENT
set(EVENT__DISABLE_THREAD_SUPPORT
    ON
    CACHE BOOL "" FORCE)
set(EVENT__DISABLE_OPENSSL
    ON
    CACHE BOOL "" FORCE)
FetchContent_Declare(
  LibEvent
  GIT_REPOSITORY https://github.com/libevent/libevent.git
  GIT_TAG 5df3037d10556bfcb675bc73e516978b75fc7bc7 # release-2.1.12-stable
  OVERRIDE_FIND_PACKAGE)

# HERMES
FetchContent_Declare(
  Hermes
  GIT_REPOSITORY https://github.com/facebook/hermes.git
  GIT_TAG
    4b3bf912cc0f705b51b71ce1a5b8bd79b93a451b # hermes-2024-08-15-RNv0.75.1-4b3bf912cc0f705b51b71ce1a5b8bd79b93a451b
  SOURCE_SUBDIR "__none__" # ignore Hermes's CMakeLists.txt
)

# FOLLY
FetchContent_Declare(
  Folly
  GIT_REPOSITORY https://github.com/facebook/folly.git
  GIT_TAG 234d39a36a43106747d10cc19efada72fd810dd3 # v2024.01.01.00
  SOURCE_SUBDIR "__none__" # ignore folly's CMakeLists.txt
)

FetchContent_MakeAvailable(
  Fmt
  DoubleConversion
  Glog
  Boost
  LibEvent
  Hermes
  Folly)
