#!/bin/bash

if [ -z "$DEVECO_SDK_HOME" ]; then
  echo "Environment variable DEVECO_SDK_HOME is not defined"
  exit 1
fi

HERMES_REPO_URL="https://github.com/facebook/hermes.git"

# NOTE: these variables should be kept in sync with the React Native version RNOH is based off of
REACT_NATIVE_VERSION="0.77.0"
HERMES_TAG="hermes-2024-11-25-RNv0.77.0-d4f25d534ab744866448b36ca3bf3d97c08e638c"

SCRIPT_PATH=$(realpath "$0")
SCRIPT_DIR=$(dirname "$SCRIPT_PATH")
THIRD_PARTY_DIR="$SCRIPT_DIR/../../tester/harmony/react_native_openharmony/src/main/cpp/third-party"
OUTPUT_DIR="$SCRIPT_DIR/out"
HERMES_SRC_DIR="$OUTPUT_DIR/hermes"

if [ ! -d "$HERMES_SRC_DIR" ]; then
  # clone hermes repository
  echo "Cloning hermes"
  git clone -b "$HERMES_TAG" --depth 1 "$HERMES_REPO_URL" "$HERMES_SRC_DIR"
  if [[ $? -ne 0 ]]; then
    exit 1
  fi

  # apply patch
  echo
  echo "Applying CMakeLists.txt patch to hermes"
  (cd "$HERMES_SRC_DIR" && git apply "$SCRIPT_DIR/hermes_cmakelists.patch")
  if [[ $? -ne 0 ]]; then
    echo "FAILED to apply patch."
    echo "Fix the CMakeLists.txt file yourself and generate a new patch for this version of hermes before running the build script again."
    echo "See the 'git apply' output for details"
    exit 1
  fi
  echo
fi

ARCHITECTURES=("arm64-v8a" "armeabi-v7a" "x86_64")
OHOS_SDK_NATIVE_DIR=$DEVECO_SDK_HOME/default/openharmony/native
BUILD_HERMESC_DIR=$OUTPUT_DIR/hermesc
JSI_DIR=$(realpath "$THIRD_PARTY_DIR/rn/ReactCommon/jsi")

# hermes compiler
$OHOS_SDK_NATIVE_DIR/build-tools/cmake/bin/cmake \
  -S$HERMES_SRC_DIR \
  -B$BUILD_HERMESC_DIR \
  -DJSI_DIR=$JSI_DIR

$OHOS_SDK_NATIVE_DIR/build-tools/cmake/bin/cmake \
  --build $BUILD_HERMESC_DIR \
  --target hermesc -j 4

for ARCHITECTURE in "${ARCHITECTURES[@]}"; do
  echo "Building Hermes@$ARCHITECTURE"

  BUILD_TARGET_DIRECTORY="$OUTPUT_DIR/${ARCHITECTURE}-output"
  BUILD_LIBRARY_DIRECTORY="$OUTPUT_DIR/${ARCHITECTURE}-lib"

  # hermes engine
  $OHOS_SDK_NATIVE_DIR/build-tools/cmake/bin/cmake \
    -H$HERMES_SRC_DIR \
    -B$BUILD_TARGET_DIRECTORY \
    -GNinja \
    -DCMAKE_SYSTEM_NAME=OHOS \
    -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
    -DCMAKE_SYSTEM_VERSION=1 \
    -DOHOS_ARCH=$ARCHITECTURE \
    -DOHOS_STL=c++_shared \
    -DCMAKE_TOOLCHAIN_FILE=$OHOS_SDK_NATIVE_DIR/build/cmake/ohos.toolchain.cmake \
    -DCMAKE_MAKE_PROGRAM=$OHOS_SDK_NATIVE_DIR/build-tools/cmake/bin/ninja \
    -DCMAKE_LIBRARY_OUTPUT_DIRECTORY=$BUILD_LIBRARY_DIRECTORY \
    -DIMPORT_HERMESC=$BUILD_HERMESC_DIR/ImportHermesc.cmake \
    -DJSI_DIR=$JSI_DIR \
    -DHERMES_IS_ANDROID=True \
    -DHERMES_SLOW_DEBUG=False \
    -DHERMES_BUILD_SHARED_JSI=True \
    -DHERMES_RELEASE_VERSION="for RN $REACT_NATIVE_VERSION" \
    -DHERMES_ENABLE_INTL=False \
    -DHERMES_ENABLE_DEBUGGER=True \
    -DCMAKE_BUILD_WITH_INSTALL_RPATH=On \
    -DHERMES_ENABLE_TEST_SUITE=False \
    -DHERMES_UNICODE_LITE=True \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_C_FLAGS_RELEASE="-O3 -DNDEBUG" \
    -DCMAKE_CXX_FLAGS_RELEASE="-O3 -DNDEBUG" \
    -DCMAKE_SHARED_LINKER_FLAGS_RELEASE="-Wl,--strip-debug"

  $OHOS_SDK_NATIVE_DIR/build-tools/cmake/bin/ninja \
    -C \
    $BUILD_TARGET_DIRECTORY \
    libhermes
done

for ARCHITECTURE in "${ARCHITECTURES[@]}"; do
  echo "Copying $OUTPUT_DIR/${ARCHITECTURE}-lib/libhermes.so to $THIRD_PARTY_DIR/prebuilt/$ARCHITECTURE/libhermes.so"
  cp -f "$OUTPUT_DIR/${ARCHITECTURE}-lib/libhermes.so" "$THIRD_PARTY_DIR/prebuilt/$ARCHITECTURE/libhermes.so"
done
