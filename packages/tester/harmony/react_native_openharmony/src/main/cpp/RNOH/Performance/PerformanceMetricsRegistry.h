/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#ifndef PERFORMANCEMETRICSREGISTRY_H
#define PERFORMANCEMETRICSREGISTRY_H

#include <glog/logging.h>
#include "RNOHMarker.h"

namespace rnoh {

enum class PerformanceMetric {
  TURBO_MODULE_SETUP,
  BUNDLE_SIZE,
  // TODO: add rest of metrics
};

inline const char* to_cstring(PerformanceMetric metric) {
  switch (metric) {
    case PerformanceMetric::TURBO_MODULE_SETUP:
      return "TURBO_MODULE_SETUP";
    case PerformanceMetric::BUNDLE_SIZE:
      return "BUNDLE_SIZE";
      // TODO: rest
    default:
      return "UNKNOWN_METRIC";
  }
}

class PerformanceMetricsRegistry : public RNOHMarker::RNOHMarkerListener {
 public:
  using RNOHMarkerId = RNOHMarker::RNOHMarkerId;

  static constexpr std::size_t m_numDurationsPerMetric = 2;
  struct RNInstanceMetrics {
    std::unordered_map<
        PerformanceMetric,
        std::array<double, m_numDurationsPerMetric>>
        durationByMetric;
    std::unordered_map<PerformanceMetric, uint64_t> valueByMetric;
  };

  PerformanceMetricsRegistry() : RNOHMarkerListener(false) {}
  PerformanceMetricsRegistry(const PerformanceMetricsRegistry&) = delete;
  PerformanceMetricsRegistry& operator=(const PerformanceMetricsRegistry&) =
      delete;
  PerformanceMetricsRegistry(PerformanceMetricsRegistry&&) = delete;
  PerformanceMetricsRegistry& operator=(PerformanceMetricsRegistry&&) = delete;

  static PerformanceMetricsRegistry& getInstance() {
    static PerformanceMetricsRegistry pl;
    return pl;
  }

  void addNewRNInstanceMetrics(size_t rnInstanceId) {
    if (m_metricsByInstanceId.contains(rnInstanceId)) {
      return;
    }

    m_metricsByInstanceId[rnInstanceId] = {};

    for (const auto& metric : m_durationMetrics) {
      m_metricsByInstanceId[rnInstanceId].durationByMetric[metric] = {0, 0};
    }

    for (const auto& metric : m_valueMetrics) {
      m_metricsByInstanceId[rnInstanceId].valueByMetric[metric] = 0;
    }
  }

  void removeRNInstanceMetrics(size_t rnInstanceId) {
    m_metricsByInstanceId.erase(rnInstanceId);
  }

  void onMarkerReceived(
      RNOHMarkerId markerId,
      size_t rnInstanceId,
      const std::string& tag,
      double timestamp,
      uint64_t value) override {
    if (!m_metricsByInstanceId.contains(rnInstanceId)) {
      return;
    }

    auto& instanceMetrics = m_metricsByInstanceId.at(rnInstanceId);

    switch (markerId) {
      case RNOHMarkerId::INITIALIZE_MODULE_START:
        instanceMetrics
            .durationByMetric[PerformanceMetric::TURBO_MODULE_SETUP][0] =
            timestamp;
        break;
      case RNOHMarkerId::INITIALIZE_MODULE_END:
        instanceMetrics
            .durationByMetric[PerformanceMetric::TURBO_MODULE_SETUP][1] =
            timestamp;
        break;
      case RNOHMarkerId::BUNDLE_SIZE:
        instanceMetrics.valueByMetric[PerformanceMetric::BUNDLE_SIZE] = value;
        break;
      default:
        break;
    }
  }

  std::optional<folly::dynamic> getSnapshot(size_t rnInstanceId) {
    if (!m_metricsByInstanceId.contains(rnInstanceId)) {
      return std::nullopt;
    }

    auto perfMetrics = m_metricsByInstanceId.at(rnInstanceId);

    folly::dynamic obj = folly::dynamic::object();
    for (auto& metric :
         PerformanceMetricsRegistry::getInstance().m_valueMetrics) {
      obj[to_cstring(metric)] = perfMetrics.valueByMetric[metric];
    }

    for (auto& metric :
         PerformanceMetricsRegistry::getInstance().m_durationMetrics) {
      obj[to_cstring(metric)] = perfMetrics.durationByMetric[metric][1] -
          perfMetrics.durationByMetric[metric][0];
    }

    return obj;
  }

 private:
  std::vector<PerformanceMetric> m_durationMetrics = {
      PerformanceMetric::TURBO_MODULE_SETUP,
  }; // TODO: rest of metrics
  std::vector<PerformanceMetric> m_valueMetrics = {
      PerformanceMetric::BUNDLE_SIZE,
  }; //

  std::unordered_map<size_t, RNInstanceMetrics> m_metricsByInstanceId;
};

} // namespace rnoh

#endif