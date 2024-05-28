# Deprecation Policy

## Purpose
The purpose of this policy is to standardize the procedure for DEPRECATING SOFTWARE_ELEMENTS, ensuring that our development process remains agile while providing RN_APP_DEVELOPERs and RN_LIBRARY_DEVELOPERS adequate notice to adjust to changes.

## Definitions
- **RNOH** - react-native-openharmony NPM package
- **SOFTWARE_ELEMENT** - Class, method, function, or parameter, type.
- **BREAKING_CHANGE** - A change in RNOH that forces RN_APP_DEVELOPER or RN_LIBRARY_DEVELOPER to adapt their code.
- **DOC_COMMENT** - A comment created with `///` or `/** */`.
- **NATIVE_API** - An interface on the ArkTS or C++ side intended to be used by RN_APP_DEVELOPER or RN_LIBRARY_DEVELOPER. Consists of SOFTWARE_ELEMENTS marked with a proper DOC_COMMENT.
- **RELEASE** - The result of publishing RNOH in the NPM registry.
- **DEPRECATION** — The process of marking a SOFTWARE_ELEMENT as obsolete, discouraging its use, and signaling its removal in a future RELEASE.
- **EOL (END_OF_LIFE)** - The phase in which a SOFTWARE_ELEMENT can't be used anymore by ACTOR.
- **RN_APP_DEVELOPER** — A software developer responsible for maintaining an OpenHarmony application that uses RNOH.
- **RN_LIBRARY_DEVELOPER** — A software developer responsible for maintaining a React Native package that supports the OpenHarmony platform.
- **ACTOR** - RN_APP_DEVELOPER or RN_LIBRARY_DEVELOPER

## RNOH Versioning
This package doesn't follow semantic versioning. RNOH version consists of three values: MAJOR.MINOR.PATCH. MAJOR and MINOR matches react-native's MAJOR and MINOR, which RNOH aims to be compatible with. PATCH number is increased with every RNOH release for targeted react-native version.

## Notifications
EOL must be preceded with DEPRECATION that should be introduced:
- for RN_APP_DEVELOPERs: at least 4 RELEASES before the planned EOL
- for RN_LIBRARY_DEVELOPERs: at least 8 RELEASES before the planned EOL

EOL can't be introduced sooner than:
- for RN_APP_DEVELOPERs: 1 month after the date of the release that introduces DEPRECATION
- for RN_LIBRARY_DEVELOPERs: 3 months after the date of the release that introduces DEPRECATION

Notification about DEPRECATION will be included:
- in the CHANGELOG.md file included in this repository
- in a DOC_COMMENT of a SOFTWARE_ELEMENT belonging to NATIVE_API
- optionally through warning logs

## Marking NATIVE_API
SOFTWARE_ELEMENT that belongs to the NATIVE_API is marked with a DOC_COMMENT with the `@api` marker.

```cpp
/**
 * @api
 */
```
or 

```cpp
/// @api
```

The `@api` marker can specify for which ACTOR, a SOFTWARE_ELEMENT is designed for, for example:

```cpp
/// @api: RN_LIBRARY_DEVELOPER
```

If no ACTOR is specified, that part of API is designed for all ACTORs.

Children SOFTWARE_ELEMENTs inherit API or deprecation comments from their parents. For example, when a class is marked with as NATIVE_API, then public methods also belong to the NATIVE_API unless they are marked as `@internal`.

## Documentation
DOC_COMMENT for deprecated SOFTWARE_ELEMENTS of NATIVE_API will include:
- alternatives or recommended practices
- latest RNOH version when introducing a deprecation

for example:
```cpp
/**
 * @api
 * @deprecated Use XYZ instead (latestRNOHVersion: 0.72.20).
 */
```

CHANGELOG.md will only include the information that given SOFTWARE_ELEMENT was deprecated in the following form:
```
- deprecated SOFTWARE_ELEMENT
```

## Removal
The removal will be included in the CHANGELOG.md of the version in which the part of NATIVE_API is removed.

## Exceptions
Exceptions to the standard deprecation timeline may occur, especially when updating react-native version RNOH aims to be compatible with, in which case an accelerated timeline may be necessary. Exceptions will be listed in the CHANGELOG.md as BREAKING_CHANGES.

## For RNOH contributors

Please follow the format below when including the information about latest RNOH version:
```
INFO_TO_THE_ACTOR (latestRNOHVersion: X.Y.Z)
```

To include the information in the CHANGELOG.md, a PR that introduces DEPRECATION should include proper information according to the information included in the PR template.
