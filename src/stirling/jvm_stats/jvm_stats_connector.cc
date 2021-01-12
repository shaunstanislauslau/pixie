#ifdef __linux__

#include "src/stirling/jvm_stats/jvm_stats_connector.h"

#include <string>
#include <utility>
#include <vector>

#include "src/common/base/base.h"
#include "src/common/base/byte_utils.h"
#include "src/common/fs/fs_wrapper.h"
#include "src/common/system/proc_parser.h"
#include "src/stirling/jvm_stats/jvm_stats_table.h"
#include "src/stirling/utils/hsperfdata.h"
#include "src/stirling/utils/java.h"
#include "src/stirling/utils/proc_path_tools.h"
#include "src/stirling/utils/proc_tracker.h"

DEFINE_int32(
    stirling_java_process_monitoring_attempts, 3,
    "The number of attempts to monitor a potential Java process for collecting JVM stats.");

namespace pl {
namespace stirling {

using ::pl::fs::Exists;
using ::pl::utils::LEndianBytesToInt;

void JVMStatsConnector::FindJavaUPIDs(const ConnectorContext& ctx) {
  proc_tracker_.Update(ctx.GetUPIDs());

  for (const auto& upid : proc_tracker_.new_upids()) {
    // The host PID 1 is not a Java app. However, when later invoking HsperfdataPath(), it could be
    // confused to conclude that there is a hsperfdata file for PID 1, because of the limitations
    // of ResolveMountPoint().
    //
    // TODO(yzhao): Look for more robust mechanism.
    if (upid.pid() == 1) {
      continue;
    }
    PL_ASSIGN_OR(auto hsperf_data_path, HsperfdataPath(upid.pid()), continue);
    java_procs_[upid].hsperf_data_path = hsperf_data_path;
  }
}

Status JVMStatsConnector::ExportStats(const md::UPID& upid,
                                      const std::filesystem::path& hsperf_data_path,
                                      DataTable* data_table) const {
  PL_ASSIGN_OR_RETURN(std::string hsperf_data_str, ReadFileToString(hsperf_data_path));

  if (hsperf_data_str.empty()) {
    // Assume this is a transient failure.
    return Status::OK();
  }

  Stats stats(std::move(hsperf_data_str));
  if (!stats.Parse().ok()) {
    // Assumes this is a transient failure.
    return Status::OK();
  }

  uint64_t time = AdjustedSteadyClockNowNS();

  DataTable::RecordBuilder<&kJVMStatsTable> r(data_table, time);
  r.Append<kTimeIdx>(time);
  r.Append<kUPIDIdx>(upid.value());
  r.Append<kYoungGCTimeIdx>(stats.YoungGCTimeNanos());
  r.Append<kFullGCTimeIdx>(stats.FullGCTimeNanos());
  r.Append<kUsedHeapSizeIdx>(stats.UsedHeapSizeBytes());
  r.Append<kTotalHeapSizeIdx>(stats.TotalHeapSizeBytes());
  r.Append<kMaxHeapSizeIdx>(stats.MaxHeapSizeBytes());
  return Status::OK();
}

void JVMStatsConnector::TransferDataImpl(ConnectorContext* ctx, uint32_t table_num,
                                         DataTable* data_table) {
  DCHECK_LT(table_num, num_tables())
      << absl::Substitute("Trying to access unexpected table: table_num=$0", table_num);

  FindJavaUPIDs(*ctx);

  for (auto iter = java_procs_.begin(); iter != java_procs_.end();) {
    const md::UPID& upid = iter->first;
    JavaProcInfo& java_proc = iter->second;

    md::UPID upid_with_asid(ctx->GetASID(), upid.pid(), upid.start_ts());
    auto status = ExportStats(upid_with_asid, java_proc.hsperf_data_path, data_table);
    if (!status.ok()) {
      ++java_proc.export_failure_count;
    }
    if (java_proc.export_failure_count >= FLAGS_stirling_java_process_monitoring_attempts) {
      java_procs_.erase(iter++);
    } else {
      ++iter;
    }
  }
}

}  // namespace stirling
}  // namespace pl

#endif