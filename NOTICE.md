NOTICE

---

This project integrates a variety of open-source components,
each subject to its own licensing terms.

## 1. Third Party Code

### RN patches

- Code located in `react-native-harmony/Libraries` contains patched code copied from <https://github.com/facebook/react-native>,
  which is under the MIT license.
  The license can be found at `react-native-harmony/Libraries/LICENSE`.
  Files in this directory may include a comment that points to a LICENSE file located in the root.
  That comment is incorrect in context of this project.

### Dependencies

1. **Precompiled Hermes**
   - **Path**: `tester/harmony/react_native_openharmony/src/main/cpp/third-party/prebuilt/**/libhermes.so`
   - **License**: MIT License
   - **License Path**: `tester/harmony/react_native_openharmony/src/main/cpp/third-party/prebuilt/LICENSE`
2. **ReactCommon**
   - **Path**: `tester/harmony/react_native_openharmony/src/main/cpp/third-party/rn/ReactCommon`
   - **Path to Patches**: `tester/harmony/react_native_openharmony/src/main/cpp/patches/react_native_core`
   - **License**: MIT License
   - **License Path 1**: `tester/harmony/react_native_openharmony/src/main/cpp/third-party/rn/LICENSE`
   - **License Path 2**: `tester/harmony/react_native_openharmony/src/main/cpp/patches/react_native_core/LICENSE`
   - **Note**: Files may include a comment that points to a LICENSE file
     located in the root of this repository.
     That comment is incorrect in context of this project.

### 2. Commit History

- The `.git` directory includes the commit history.
  The current license affects the entire commit history
  unless a historic code revision is under the scope of a different license.
  If a revision does not specify LICENSE files for third-party code,
  licenses from the newest revision apply unless otherwise specified,
  regardless of whether the location of the third-party code has changed.

End of Notice
