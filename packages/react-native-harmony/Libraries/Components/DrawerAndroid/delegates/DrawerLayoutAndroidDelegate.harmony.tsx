/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { View } from "react-native";
import {
  BaseDrawerLayoutAndroidDelegate,
  DrawerLayoutAndroidDelegateInternalProps,
} from "./BaseDrawerLayoutAndroidDelegate";
import AndroidDrawerLayoutNativeComponent from "../AndroidDrawerLayoutNativeComponent";
import StyleSheet from "../../../StyleSheet/StyleSheet";
import StatusBar from "../../StatusBar/StatusBar";
import React from "react";
import requireNativeComponent from "../../../ReactNative/requireNativeComponent";
import type { ViewProps } from "../../View/ViewPropTypes";

const DrawerLayoutChildWrapperView = requireNativeComponent<
  ViewProps & {
    postTouches: boolean;
  }
>("DrawerLayoutChildWrapperView");

export default class DrawerLayoutAndroidDelegate extends BaseDrawerLayoutAndroidDelegate {
  override render(
    internalProps: DrawerLayoutAndroidDelegateInternalProps<any>
  ): React.ReactNode {
    const propsFromCtx = this.ctx.getProps();
    const {
      drawerBackgroundColor = "white",
      onDrawerStateChanged,
      renderNavigationView,
      onDrawerOpen,
      onDrawerClose,
      ...props
    } = propsFromCtx;

    const drawStatusBar = propsFromCtx.statusBarBackgroundColor != null;
    const drawerViewWrapper = (
      <DrawerLayoutChildWrapperView
        style={[
          styles.drawerSubview,
          {
            width: propsFromCtx.drawerWidth,
            backgroundColor: drawerBackgroundColor,
          },
        ]}
        pointerEvents={internalProps.drawerOpened ? "auto" : "none"}
        postTouches={true}
        collapsable={false}
      >
        {renderNavigationView()}
        {drawStatusBar && <View style={styles.drawerStatusBar} />}
      </DrawerLayoutChildWrapperView>
    );
    const childrenWrapper = (
      <DrawerLayoutChildWrapperView
        style={styles.mainSubview}
        collapsable={false}
      >
        {drawStatusBar && (
          <StatusBar
            translucent
            backgroundColor={propsFromCtx.statusBarBackgroundColor}
          />
        )}
        {drawStatusBar && (
          <View
            style={[
              styles.statusBar,
              { backgroundColor: propsFromCtx.statusBarBackgroundColor },
            ]}
          />
        )}
        {propsFromCtx.children}
      </DrawerLayoutChildWrapperView>
    );
    //RNOH patch: reorder the drawer and children wrappers to conform to ArkUI's sidebarcontainer
    return (
      <AndroidDrawerLayoutNativeComponent
        {...props}
        ref={internalProps.nativeRef}
        drawerBackgroundColor={drawerBackgroundColor}
        drawerWidth={propsFromCtx.drawerWidth}
        drawerPosition={propsFromCtx.drawerPosition}
        drawerLockMode={propsFromCtx.drawerLockMode}
        style={[styles.base, propsFromCtx.style]}
        onDrawerSlide={internalProps.onDrawerSlide}
        onDrawerOpen={internalProps.onDrawerOpen}
        onDrawerClose={internalProps.onDrawerClose}
        onDrawerStateChanged={internalProps.onDrawerStateChanged}
      >
        {drawerViewWrapper}
        {childrenWrapper}
      </AndroidDrawerLayoutNativeComponent>
    );
  }
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    elevation: 16,
  },
  mainSubview: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerSubview: {
    position: "absolute",
    top: 0,
    bottom: 0,
  },
  statusBar: {
    height: StatusBar.currentHeight,
  },
  drawerStatusBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: StatusBar.currentHeight,
    backgroundColor: "rgba(0, 0, 0, 0.251)",
  },
});
