/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <boost/assert.hpp>
#include <boost/stacktrace.hpp>
#include "glog/logging.h"

/**
 * @api
 */
#define RNOH_ASSERT(expr) BOOST_ASSERT(expr)

/**
 * @api
 */
#define RNOH_ASSERT_MSG(expr, msg) BOOST_ASSERT_MSG(expr, msg)
