# React Native 鸿蒙化版本信息
当前React Native鸿蒙版本基于社区RN 0.72.5进行适配，发布版本信息如下：
| 名称                          | 版本号                            |
| ----------------------------- | -------------------------------|
| react-native-harmony.tgz        | 0.72.42 |
| react-native-harmony-cli.tgz    | 0.0.27 |
| react_native_openharmony-5.0.0.804.har                          | 0.72.42 |
| react_native_openharmony_release-5.0.0.804.har                  | 5.0.0.804 |

配套IDE、SDK版本和手机ROM：
| 名称                          | 版本号                            |
| ----------------------------- | -------------------------------|
| DevEco Studio     | DevEco Studio 5.0.5.222 |
| HarmonyOS SDK     | HarmonyOS SDK 5.0.1.110 |
| 手机ROM           | ALN-AL00 205.0.0.110(C00E110R4P20) <br> ALN-AL80 205.0.0.110(C00E110R4P20) <br> BRA-AL00 205.0.0.110(C00E110R4P20) |


## 特性变更

### 支持Metro局域网内远程调试
RNOH 5.0.0.803及以上版本，支持Metro局域网内远程调试。
该功能需要允许应用读取加速度传感器的数据，可以在module.json5内配置该权限。
```json5
"requestPermissions": [
    {
        "name": "ohos.permission.ACCELEROMETER"
    },
]
```
想详细了解如何开启远程调试，可以参考[调试调测](../调试调测.md)。