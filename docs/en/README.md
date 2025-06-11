
# RNOH Application Developers

> WARNING: Documents referenced here may be outdated and have not been properly reviewed by RNOH maintainers.

This section targets developers who want to create a new RNOH application, RNOH application maintainers, and RN developers who wish to add the OpenHarmony platform to their RN projects. If you wish to learn how to add a Custom Native Component or Native Module, refer to the [section for RNOH Library Developers](#rnoh-library-developers).

## Prerequisites

- Basic knowledge of [React Native](./about-react-native.md)

## Learning Objectives

- [Set up a development environment and run your first RNOH project.](./environment-setup.md)
- [Manage JavaScript bundles.](rn-js-bundle.md)
- [Identify core elements of native API created for app developers.](./api-description.md)
- [Apply patterns used in real projects.](./common-development-scenarios.md)
- [Debug RNOH application JS and native code.](./debugging.md)
- [Identify common problems and learn how to solve them.](./faqs.md)
- [Understand rendering phases for performance analysis.](./three-rendering-phases.md)
- [Prepare your application for performance analysis.](./application-performance-optimization.md)
- [Analyze performance issues and explore techniques for improving performance.](./performance-optimization.md)

## Useful links

- [RN Libraries compatible with RNOH](https://gitee.com/react-native-oh-library/usage-docs#rnoh-%E4%B8%89%E6%96%B9%E5%BA%93%E6%80%BB%E8%A7%88) - A centralized place that lists adapted RN libraries compatible with RNOH. If you plan to add the OpenHarmony platform to your RN project, consider evaluating your project's dependencies against the supported libraries.
- [Project Samples](./appendix.md) — A curated collection of project examples to help you understand how to integrate RNOH in OH application.
- [RNOH Architecture](./architecture.md) — A peek under the hood of RNOH.

# RNOH Library Developers

> WARNING: Documents referenced here may be outdated and have not been properly reviewed by RNOH maintainers.

If you wish to create a new RNOH library or add Custom Native Components or Native Modules, the documentation listed in this section is for you.

## Prerequisites

- Basic knowledge of C++, and TypeScript  
- [RNOH application developing](#rnoh-application-developers) experience

## Learning Objectives

- [Understand the types of Codegen and learn when and how to use them.](./Codegen.md)
- [Create a custom TurboModule.](TurboModule.md)
- [Create custom Native Components.](custom-components.md)
- [Use ArkTS Native Components in C-API architecture.](usage-of-c-api-component-hybrid-solution.md)
- [Send messages between ArkTS and C++.](arkts-cpp-communication.md)