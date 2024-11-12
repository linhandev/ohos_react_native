#include "RNOHMarker.h"

namespace rnoh {
class HiTraceRNOHMarkerListener : public RNOHMarker::RNOHMarkerListener {
 public:
  using RNOHMarkerId = RNOHMarker::RNOHMarkerId;

  HiTraceRNOHMarkerListener() : RNOHMarkerListener(false) {}

  static HiTraceRNOHMarkerListener& getInstance();
  void logMarker(
      RNOHMarkerId markerId,
      const std::string& tag,
      double timestamp) override;

 private:
  void logMarker(const std::string& marker, const std::string& tag);
  void logMarkerStart(const std::string& marker, const std::string& tag);
  void logMarkerFinish(const std::string& marker, const std::string& tag);
  int32_t getMessageId(const std::string& message);
  std::string makeMessage(const std::string& marker, const std::string& tag);
};

} // namespace rnoh
