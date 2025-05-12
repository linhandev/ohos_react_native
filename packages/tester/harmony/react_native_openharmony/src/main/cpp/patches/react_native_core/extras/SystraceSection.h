/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <sstream>
#include <string>
#include "hitrace/trace.h"

struct CustomSystraceSection {
 public:
  template <typename... ConvertsToStringPiece>
  inline explicit CustomSystraceSection(
      const char* name,
      ConvertsToStringPiece&&... args) {
    std::ostringstream oss;
    (void)(oss << name);
    ([&] { oss << "[" << args << "]"; }(), ...);
    OH_HiTrace_StartTrace(oss.str().c_str());
  }

  inline explicit CustomSystraceSection(const char* name) {
    OH_HiTrace_StartTrace(name);
  }

  ~CustomSystraceSection() {
    OH_HiTrace_FinishTrace();
  }
};
