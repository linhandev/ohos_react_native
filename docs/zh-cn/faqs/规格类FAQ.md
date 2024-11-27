# 规格类FAQ

### React Native 升级到 0.72.5 版本

请参考[RN升级变更整理](../RN升级变更整理.md)，在此文档中，梳理了 React Native 0.59 版本到 0.72.5 版本的主要修改点，您可以根据此文档修改您的代码，并升级 React Native 的版本。
### 开启Fabric以后重要变更

#### UIManager.measure 的实现不正确，获取到的布局数据与 iOS 不一致？

- **A**：`UIManager.measure`在Fabric开启时是不支持的，请使用`onLayout`或者`ref.current.measure`代替。

### 主题字体未生效/fontFamily未生效

- 主题字体优先于fontFamily生效。
- 主题字体的变更需要重启应用后才能生效。

### RN Date.parse()时间转换问题
RN本身并不直接规定日期字符串的格式，而是依赖于JavaScript的Date对象。JS支持以下三种日期格式：
- console.log("1111111",Date.parse("2022/2/12 00:00:00"));//ISO 8601 格式
- console.log("date2:", Date.parse(1678857930000));//时间戳
- console.log("date3:", Date.parse('Mon, 15 Mar 2023 13:45:30 GMT'));//RFC 2822 / IETF 标准  

'2024/10/24 11:30'是非标准的日期格式，所以不支持，可以考虑依赖其他三方库进行处理。比如：  
- const date = moment('2024/10/24', 'YYYY/MM/DD').format('YYYY-MM-DD');
- console.log(date); // 输出: 2024-10-24