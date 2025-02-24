# Introduction
This example demonstrates a common scenario in app development: a high-performance waterfall flow page, implemented using the RN framework. It leverages techniques like on-demand rendering and component reuse.

## Running Effect Screenshot
![](./RNHomeFluency/screenshots/home_fluency.gif)

**Operation Flow:**
1. Pull down to refresh the page and pull up to load more data (network load);
2. If a live stream card exists in the current waterfall flow, it automatically plays the live stream;
3. Click on the homepage tab to scroll back to the top.

## Scene Implementation
For a detailed implementation, please refer to [High-Performance Waterfall Flow Page with RN Framework](https://developer.huawei.com/consumer/cn/forum/topic/0202160237461682658).

# Project Directory

```
home-fluency
├── RNHomeFluency   Frontend Project
└── HomeFluency     Native Project
```

# Installation Guide
1. Replace the version of @rnoh/react-native-openharmony in RNHomeFluency/package.json, HomeFluency/oh-package.json5, and HomeFluency/entry/oh-package.json5 (Optional: Upgrade the version).
2. In `RNHomeFluency`, run **npm i --force** to install dependencies, then run **npm run dev** to generate the bundle file, and **npm start** to start the Metro service;
3. Open `HomeFluency` in DevEco Studio, execute **Sync and Refresh Project**, and copy and replace `RNHomeFluency/entry` into `HomeFluency/entry`;
4. Return to DevEco Studio, click the **run** button on the top right to start the project;
5. If the Metro service is running, you will also need to execute `hdc rport tcp:8081 tcp:8081` to forward port 8081, and then reopen the app on the device.