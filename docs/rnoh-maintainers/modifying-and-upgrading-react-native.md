# Modifying and Upgrading React Native

## Target Audience

- RNOH maintainers responsible for upgrading the React Native used by RNOH
- RN maintainers who want to help reduce friction between RN and RNOH

## Modifying React Native and Handling OpenHarmony-specific code

RNOH maintainers should avoid introducing changes to React Native. However, sometimes this isn't feasible or possible. In those situations, an RNOH maintainer can use `pnpm patch:rn` command to update `react-native.patch`.
The modification should aim to modify RN in a platform-agnostic manner, because those changes should be submitted later to the React Native repo. At the same time, changes should be as small as possible to avoid generating conflicts when upgrading React Native. These changes create an interface between RN and Out-of-Tree RN platforms. OpenHarmony-specific changes should be kept in `<RNOH>/packages/react-native-harmony`.

For debugging purposes, modify files directly in `<RNOH>/packages/react-native-harmony`, then use `pnpm patch:rn` and move the changes to `<RNOH>/packages/react-native`.

RNOH and RN maintainers should work towards eliminating that patch.


## Upgrading React Native used by RNOH

RNOH maintainers should keep RNOH as close as possible to RN to simplify the RN upgrading process for RNOH library and application maintainers. The difficulty of upgrading RN grows exponentially with time. This is a complex task. It should be done by an experienced RNOH maintainer.

1. Request RNOH repo maintainers to create a new branch in the remote RNOH repo.
1. Create and switch to a new branch (follow the naming convention already used in the repo, keep it private).
1. Update `<RNOH>/packages/react-native`.
1. Fix issues that may arise when trying to apply react-native.patch.
1. Resolve compilation errors (it may require many iterations).
1. Resolve runtime issues - use concurrent and sequential tests in the tester app.
1. Resolve issues that may arrise during reloads - keep reloading the tester application for ~2 minutes (memory leaks, deadlocks, and crashes can be detected with this approach).
1. Unlink failing libraries from `<RNOH>/tester-ecosystem` and document errors.
1. Rebase your local branch.
1. Submit a Merge Request (MR) to that new branch.

At this stage, RN is updated. However, it's likely RNOH isn't stable enough, and some new RN features may need to be implemented. RNOH with upgraded RN should be distributed gradually, but it's reasonable to publish a Release Candidate relatively quickly, so that RNOH library maintainers can start adapting incompatible libraries. Once the Release Candidate is public, notify maintainers of those libraries and send them documented errors, to speed up the process of migrating the RNOH ecosystem to the newer RN version.