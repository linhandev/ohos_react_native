APP_BUNDLE_ID="com.rnoh.tester" # TODO: detect that automatically
TEST_TIME="190" # TODO: detect that automatically
MAIN_DIR="./scripts/performance_measurement"
REPORTS_DIR="performance_reports"
TIMESTAMP_FILE_PATH=/data/app/el2/100/base/$APP_BUNDLE_ID/temp/test-timestamps.json
HIPROFILER_COMMAND="hdc shell hiprofiler_cmd -c hiprofiler-config.txt -o /data/local/tmp/hiprofiler_data.htrace -t $TEST_TIME -s -k"

show_help() {
    echo "Usage: npm run measure-performance [/path/to/previous_report.html] [options]"
    echo
    echo "Options:"
    echo "  --help          Show this help message and exit"
    echo
    echo "Description:"
    echo "This script performs performance measurements, including setting up directories and building necessary tools."
}

# Parse arguments
while [[ "$1" =~ ^- ]]; do
    case $1 in
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Error: Invalid option: $1"
            show_help
            exit 1
            ;;
    esac
    shift
done

if [ ! -x "$(command -v tmux)" ]; then
  echo "Error: tmux is not installed."
  exit 1
fi

mkdir -p $MAIN_DIR/tmp
mkdir -p $REPORTS_DIR

if [ ! -f $MAIN_DIR/trace_streamer ]; then
    cd $MAIN_DIR
   ./build-trace-streamer.sh
fi 

if [ $? -ne 0 ]; then
    echo "Error building trace streamer"
    exit 1
fi

cd $MAIN_DIR

TMUX_COMMAND="$HIPROFILER_COMMAND; tmux wait -S measure-perf-done"
hdc file send ./hiprofiler-config.txt /data/local/tmp/
tmux new-session -d -s measure-perf "$TMUX_COMMAND"

echo "Waiting for the hiprofiler_cmd to start recording traces..."
sleep 5 # Value selected by trial and error
hdc shell aa start -a EntryAbility -b com.rnoh.tester

tmux wait measure-perf-done

# Stop the app
hdc shell aa force-stop com.rnoh.tester

echo "Retrieving the trace data..."
hdc file recv /data/local/tmp/hiprofiler_data.htrace ./tmp/

echo "Converting the trace data..."
./trace_streamer ./tmp/hiprofiler_data.htrace -e ./tmp/sqlite.db

# Remove unnecessary ts file
rm -f ./tmp/sqlite.db.ohos.ts

# Get the timestamp file
hdc file recv $TIMESTAMP_FILE_PATH ./tmp/

# Generate performance report (when previous report given, a comparison report will be appended)
node ./generate-performance-report.js ../../$REPORTS_DIR ./tmp/sqlite.db ./tmp/test-timestamps.json $APP_BUNDLE_ID $1 