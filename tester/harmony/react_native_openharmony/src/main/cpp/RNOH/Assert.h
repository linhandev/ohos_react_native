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
