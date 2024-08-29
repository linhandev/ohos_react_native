# C-API组件混合方案的使用

> 需要注意的是，在C-API中可以使用的ArkTS组件，当前仅支持叶子节点，如`Image`，不支持容器节点，如`Stack`。

## C-API中渲染ArkTS组件

1. 实现自定义组件，并在业务代码中使用。

2. 创建一个自定义的构建函数，使用`@Builder`进行装饰。在构建函数中设计工厂方法，用于根据`ComponentName`构建对应的组件。参数是`ComponentBuilderContext`，记录了组件构建时需要用到的信息，如`ComponentName`、`Tag`等。需要注意的是，工厂方法需要被一个`Stack`组件包裹，该`Stack`组件需要设置`position`属性为`(0,0)`，用于保证组件显示的位置正确。

    ```TypeScript
    @Builder
    export function buildCustomComponent(ctx: ComponentBuilderContext) {
    Stack() {
      if (ctx.componentName === MarqueeView.NAME) {
        MarqueeView({
            ctx: ctx.rnComponentContext,
            tag: ctx.tag
        })
      }
    }
    .position({ x: 0, y: 0 })
    }
    ```

3. 封装构建函数为`wrapBuilder`，并作为参数传递给`RNApp`或是`RNComponentContext`，`RNComponentContext`是构造`CustomRNComponentFrameNodeFactory`和`RNSurface`必要的参数。

    ```TypeScript
    const wrappedCustomRNComponentBuilder = wrapBuilder(buildCustomRNComponent);
    ···
    // 作为RNApp的参数
    RNApp({
      ···
      wrappedCustomRNComponentBuilder: wrappedCustomRNComponentBuilder,
      ···
    })
    
    // 作为RNComponentContext的参数
    new RNComponentContext(
      RNOHContext.fromCoreContext(rnohCoreContext!, rnInstance),
      wrappedCustomRNComponentBuilder,
      wrapBuilder(buildRNComponentForTag),
      new Map(),
    )
    ```

4. 如果您使用`RNApp`创建`RNInstance`，那么这一步可以跳过。否则，请构造一个`CustomRNComponentFrameNodeFactory`对象，并传递给`RNOHCoreContext`提供的`createAndRegisterRNInstance`方法。`CustomRNComponentFrameNodeFactory`是为CPP侧提供通道，用于调用自定义组件的的构建方法，所以这个类是必须的。

    ```TypeScript
    this.rnohCoreContext!.createAndRegisterRNInstance(rnInstanceOption as RNInstanceOptions, 
      new CustomRNComponentFrameNodeFactory(uiContext, this.rnohCoreContext!.logger, () => rnComponentContext as RNComponentContext))
    ```

    需要注意的是，`UIContext`使用`getUIContext()`并不一定可以获取到数据，例如在`EntryAbility`的`onCreate()`中就无法获取到`UIContext`。您可通过调用`rnInstance.setFrameNodeFactory(frameNodeFactory: FrameNodeFactory | null)`方法，将`CustomRNComponentFrameNodeFactory`设置到`RNInstance`中。需要注意的是，在UI渲染之前，一定要保证`UIContext`的值是正确的，否则可能会导致闪退等问题。

5. 使用`RNApp`或者`RNSurface`启动 React Native for OpenHarmony。

## C-API组件中使用ArkTS组件

当前RNOH框架支持C-API组件挂载一个ArkTs组件

1. 通过`createArkTSComponent`创建ArkTs组件。

   `createArkTSComponent`接口需要传递三个参数：

   - `tag`： 组件的tag
   - `componentHandle`：component句柄（`facebook::react::ComponentHandle`）
   - `componentName`：组件名，需要与入口文件的`buildCustomRNComponent`函数中定义的自定义ArkTS组件名相对应。

   ```cpp
   auto componentInstanceFactory = rnInstance->getComponentInstanceFactory();
   auto newChildComponentInstance = componentInstanceFactory->createArkTSComponent(tag, componentHandle, componentName);
   ```

2. 然后调用组件的`onChildInserted`方法插入。

   ```cpp
   if (newChildComponentInstance != nullptr) {
     this->onChildInserted(newChildComponentInstance, index);
   }
   ```
