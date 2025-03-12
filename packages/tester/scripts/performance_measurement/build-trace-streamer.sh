SMARTPERF_HOST_REPO="https://gitee.com/openharmony/developtools_smartperf_host.git"
VERSION="v0.0.4"

cd tmp

if [ ! -d "developtools_smartperf_host" ]; then
    git clone --branch $VERSION --depth 1 $SMARTPERF_HOST_REPO
fi

cd developtools_smartperf_host/trace_streamer
./build.sh

if [ $? -ne 0 ]; then
    exit 1
fi

cd out/*
mv trace_streamer ../../../../../trace_streamer
cd ../../../../
rm -rf developtools_smartperf_host
