# 规格类FAQ

### React Native 升级到 0.72.5 版本

请参考[RN升级变更整理](../RN升级变更整理.md)，在此文档中，梳理了 React Native 0.59 版本到 0.72.5 版本的主要修改点，您可以根据此文档修改您的代码，并升级 React Native 的版本。
### 开启Fabric以后重要变更

#### UIManager.measure 的实现不正确，获取到的布局数据与 iOS 不一致？

- **A**：`UIManager.measure`在Fabric开启时是不支持的，请使用`onLayout`或者`ref.current.measure`代替。

### 主题字体未生效/fontFamily未生效

- 主题字体优先于fontFamily生效。
- 主题字体的变更需要重启应用后才能生效。