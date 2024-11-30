# release包FAQ

### 滚动条滚动缓慢、闪烁问题

- 现象
 
  左右滑动tab时滚动条滑动缓慢，切换时会闪烁，并且禁止滑动的页面也会滑动。

- 原因

  debug包性能有一定的瓶颈。

- 解决

  用release版本的RN包编译release版本的包，效果会好很多

### 两个scrollView联动滚动的时候会有卡顿、延迟

- 现象
 
  左右两个scrollView，左侧的scrollView根据右侧的scrollView的滚动量发生滚动，但是会有卡顿，延迟。

- 原因

  debug包性能有一定的瓶颈。

- 解决

  用release版本的RN包编译release版本的包，效果会好很多

### 如何提高编译效率

- 现象
    
  用 release 包的时候，由于没有 x86_64 架构，就编译不到 Windows 的模拟器上；用 Windows 或者 intel 芯片的 mac的同事，都需要用源码的版本编译到模拟器上，如果有c++的改动，一次编译都得在30分钟左右。

- 原因

  主要是c++编译较慢

- 解决

一、创建rnoh静态模块
  1. ⽤DevEco打开鸿蒙⼯程，右键->New->Module->Static Library,填写模块名。
  2. 解压华为公司提供的react_native_openharmony-x.x.x.xxx.har。
  3. 将解压后的src/main/cpp⽂件夹、ets.ets⽂件、ts.ts⽂件复制粘贴到新模块。
  4. ⽤解压后的src/main/ets⽂件夹替换掉新模块的src/main/ets⽂件夹。
  5. ⽤解压后的index.ets⽂件替换掉新模块的index.ets⽂件。
  6. 新模块的build-profile.json5如下：
    ```javascript
    {
        "apiType": "stageMode",
        "targets": [
            {
                "name": "default",
                "runtimeOS": "HarmonyOS",
            }
        ]
    }
    ```
  7. 新模块的oh-package.json5如下：
    ```javascript
    {
        license: 'ISC',
        types: '',
        devDependencies: {},
        name: '@rnoh/react-native-openharmony',
        description: 'React Native for OpenHarmony',
        ohos: {
            org: '',
        },
        type: 'module',
        version: '0.72.28', # 版本号到解压后的oh-package.json5⽂件中查看
        dependencies: {},
        main: 'index.ets',
    }
    ```
  8. 新模块的src/main/module.json5内容如下：
    ```javascript
    {
        "module": {
            "name": "react_native_openharmony",
            "type": "har",
            "deviceTypes": [
                "default"
            ],
            "requestPermissions": [
                {"name": "ohos.permission.INTERNET"},
                {"name": "ohos.permission.VIBRATE"}
            ]
        }
    }
    ```
  9. 删除新模块的混淆配置⽂件consumer-rules.txt和obfuscation-rules.txt。

二、编译rnoh release

  1. 解压华为公司提供的react_native_openharmony_release-x.x.x.xxx.har。
  2. 将解压后的src/main/include⽂件夹复制粘贴到新模块。
  3. 修改新模块的src/main/cpp/CMakeLists.txt。
  ```javascript
    cmake_minimum_required(VERSION 3.4.1)
    + project(rnoh-semi)
    cmake_policy(SET CMP0079 NEW)
    + set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
    set(NATIVERENDER_ROOT_PATH "${RNOH_CPP_DIR}")
    set(third_party_dir "${RNOH_CPP_DIR}/third-party")
    set(patches_dir "${RNOH_CPP_DIR}/patches")
    + set(CMAKE_CXX_FLAGS "-fstack-protector-strong")
    + set(WITH_HITRACE_SYSTRACE 1) # for other CMakeLists.txt files to use
    + add_compile_definitions(WITH_HITRACE_SYSTRACE)
    ...
    - add_library(rnoh SHARED
    + add_library(rnoh_semi SHARED
    ...
    - target_include_directories(rnoh PUBLIC
    + target_include_directories(rnoh_semi PUBLIC
    ...
    - target_link_libraries(rnoh PUBLIC
    + target_link_libraries(rnoh_semi PUBLIC
    ...
    - target_compile_options(rnoh PUBLIC
    + target_compile_options(rnoh_semi PUBLIC
    ...
    - target_link_libraries(rnoh PUBLIC libqos.so)
    - target_compile_definitions(rnoh PUBLIC C_API_ARCH)
    + target_link_libraries(rnoh_semi PUBLIC libqos.so)
    + target_compile_definitions(rnoh_semi PUBLIC C_API_ARCH)
    ...
    - target_compile_definitions(rnoh PUBLIC
    LOG_VERBOSITY_LEVEL=${LOG_VERBOSITY_LEVEL})
    + target_compile_definitions(rnoh_semi PUBLIC
    LOG_VERBOSITY_LEVEL=${LOG_VERBOSITY_LEVEL})
    endif()
  ```
  4. 修改新模块的build-profile.json5。
  
  ```javascript
    {
        "apiType": "stageMode",
      + "buildOption": {
        + "externalNativeOptions": {
        + "path": "./src/main/cpp/CMakeLists.txt",
        + "arguments": "",
        + "cppFlags": ""
        + }
      + },
        "targets": [
            {
                "name": "default",
                "runtimeOS": "HarmonyOS",
            }
        ]
    }
  ```
  5. 切换成release模式构建 entry旁边左边有个按钮，product，build Mode选择release。
  6. 编译，选中新建的模块（rnoh）-> Build -> Make Module xxx，等待编译完成，编译好后的⽂件位于build/default/outputs/default, ⼤⼩约35M。

三、使⽤release包

使用⽤release版本的har包需要使⽤release版本的CMakeLists.txt⽂件，该文件位于：ReactNative for OpenHarmony开发使⽤指导/Zips/MyApplicationReplace/entry/src/main/cpp/CMakeLists - release.txt将该⽂件内容复制粘贴到⾃⼰鸿蒙⼯程的CMakeLists.txt中，并做对应的调整。

### 如何提高编译效率

- 现象
    
  RN中动画很卡

- 原因

  debug包性能有一定的瓶颈。

- 解决

  打release包动画不会卡顿。