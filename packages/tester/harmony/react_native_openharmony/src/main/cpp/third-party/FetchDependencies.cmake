include(FetchContent)

message("Fetching third-party dependencies, this may take a while...")

# FMT
FetchContent_Declare(
  Fmt
  GIT_REPOSITORY https://gitcode.com/gh_mirrors/fm/fmt.git
  GIT_TAG 0c9fce2ffefecfdce794e1859584e25877b7b592 # 11.0.2
  GIT_SHALLOW TRUE
  OVERRIDE_FIND_PACKAGE)

# DOUBLE CONVERSION
FetchContent_Declare(
  DoubleConversion
  GIT_REPOSITORY https://gitcode.com/gh_mirrors/dou/double-conversion.git
  GIT_TAG 4f7a25d8ced8c7cf6eee6fd09d6788eaa23c9afe # v3.3.0
  GIT_SHALLOW TRUE
  OVERRIDE_FIND_PACKAGE)

# GLOG
FetchContent_Declare(
  Glog
  GIT_REPOSITORY https://gitcode.com/gh_mirrors/glog6/glog.git
  GIT_TAG a6a166db069520dbbd653c97c2e5b12e08a8bb26 # v0.3.5
  GIT_SHALLOW TRUE
  OVERRIDE_FIND_PACKAGE)

# BOOST
set(BOOST_ENABLE_CMAKE On)
FetchContent_Declare(
  Boost
  URL https://github.com/boostorg/boost/releases/download/boost-1.82.0/boost-1.82.0.tar.xz
  OVERRIDE_FIND_PACKAGE)

# HERMES
FetchContent_Declare(
  Hermes
  GIT_REPOSITORY https://gitcode.com/gh_mirrors/hermes/hermes.git
  GIT_TAG
    d4f25d534ab744866448b36ca3bf3d97c08e638c # hermes-2024-11-25-RNv0.77.0-d4f25d534ab744866448b36ca3bf3d97c08e638c
  GIT_SHALLOW TRUE
  SOURCE_SUBDIR "__none__" # ignore Hermes's CMakeLists.txt
)

# FOLLY
FetchContent_Declare(
  Folly
  GIT_REPOSITORY https://gitcode.com/gh_mirrors/fol/folly.git
  GIT_TAG 0660ead5b610047a279cc291129e98e3f2a1fc37 # v2024.11.18.00
  GIT_SHALLOW TRUE
  SOURCE_SUBDIR "__none__" # ignore folly's CMakeLists.txt
)

# FAST_FLOAT
FetchContent_Declare(
  FastFloat
  GIT_REPOSITORY https://gitcode.com/gh_mirrors/fa/fast_float.git
  GIT_TAG 3e57d8dcfb0a04b5a8a26b486b54490a2e9b310f # v6.1.4
  GIT_SHALLOW TRUE
  OVERRIDE_FIND_PACKAGE
  SOURCE_SUBDIR "__none__" # ignore CMakeLists.txt
)



FetchContent_MakeAvailable(
  Fmt
  FastFloat
  DoubleConversion
  Glog
  Boost
  Hermes
  Folly)

message("Fetching third-party dependencies completed.")