# Modifying and Upgrading React Native

## Definitions

- RNC (React Native Core) — Unofficial name for the (ideally) platform-agnostic, reusable part of React Native.

## Target Audience

- RNOH maintainers who need to modify React Native to accomplish their tasks (RNOH contributors can't introduce changes to RNC)
- RNOH maintainers responsible for upgrading the React Native used by RNOH
- RN maintainers who want to help reduce friction between RN and RNOH

## Modifying React Native and Handling OpenHarmony-specific code

RNOH maintainers should avoid introducing changes to React Native. However, sometimes this isn't feasible or possible. In those situations, an RNOH maintainer can modify React Native by contributing to the unofficial, private RNC repository. 
The contribution should aim to modify RN in a platform-agnostic manner, because those changes should be submitted later to the React Native repo. At the same time, changes should be as small as possible to avoid generating conflicts when upgrading React Native. These changes should help create an interface between RN and Out-of-Tree RN platforms. OpenHarmony-specific changes should be kept in `<RNOH>/packages/react-native-harmony`.
Once the contribution is merged, the RNOH maintainer should generate a new `react-native.patch` by running the following commands in the RNC repo:

```
yarn install
yarn generate-patch
```

The generated patch file should replace `<RNOH>/packages/react-native.patch`. RNOH and RN maintainers should work towards eliminating that patch.

### Which RNC branch should be used?

`react-native-core/v<RN_VERSION>`. RN_VERSION can be found in `<RNOH>/packages/tester/package.json::dependencies::react-native`. In case of multiple branches for the same RN_VERSION, check the comment at the first line in `<RNOH>/packages/react-native.patch`.

### Where can I find the RNC repo?

If you are an RNOH contributor, you can't. If you are a new RNOH maintainer, ask other RNOH maintainers. 

### Why can't RNC be public?

Bureaucracy...

## Upgrading React Native used by RNOH

RNOH maintainers should keep RNOH as close as possible to RN to simplify the RN upgrading process for RNOH library and application maintainers. The difficulty of upgrading RN grows exponentially with time. This is a complex task. It should be done by an experienced RNOH maintainer.

1. Create a temporary branch in the RNC repo, and cherry-pick patch commits from the current active branch.
1. Simplify patch commits to avoid resolving unnecessary conflicts (some commits may introduce changes and remove them later). Rebase that temporary branch and squash/delete commits if possible.
1. Create a new branch `react-native-core/v<NEW_RN_VERSION>`, let's call it NEW RNC BRANCH.
1. Cherry-pick simplified commits from the temporary branch to the NEW RNC BRANCH and resolve conflicts.
1. Update `<RNOH>/packages/react-native` submodule to point to the same revision as the one used by the starting point of NEW RNC BRANCH.
1. Regenerate the patch (as described [here](#modifying-react-native-and-handling-openharmony-specific-code)) and run pnpm init-ws (work directly on the NEW RNC BRANCH, consider creating an oneliner that generates a patch, copies it to the RNOH repo and runs `pnpm init-ws`).
1. Resolve compilation errors (it may require many iterations).
1. Resolve runtime issues - use concurrent and sequential tests in the tester app.
1. Resolve issues arising during reloads - keep reloading the tester application for ~2 minutes (memory leaks, deadlocks, and crashes can be detected with this approach).
1. Unlink failing libraries from `<RNOH>/tester-ecosystem` and document errors.
1. Create a new branch for the Release Candidate in the RNOH repo (follow the naming convention already used in the repo).
1. Submit a Merge Request (MR) to that new branch.
1. Once the MR is merged, make the NEW RNC BRANCH default.

At this stage, RN is updated. However, it's likely RNOH isn't stable enough, and some new RN features may need to be implemented. RNOH with upgraded RN should be distributed gradually, but it's reasonable to publish a Release Candidate relatively quickly, so that RNOH library maintainers can start adapting incompatible libraries. Once the Release Candidate is public, notify maintainers of those libraries and send them documented errors, to speed up the process of migrating the RNOH ecosystem to the newer RN version.