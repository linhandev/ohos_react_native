# HERMES
add_library(hermes-engine::libhermes SHARED IMPORTED)
target_compile_definitions(hermes-engine::libhermes INTERFACE
 # TODO: check if building in debug mode
                    HERMES_ENABLE_DEBUGGER)
set_property(
  TARGET hermes-engine::libhermes
  PROPERTY IMPORTED_LOCATION
           "${third_party_dir}/prebuilt/${OHOS_ARCH}/libhermes.so")
set(hermes_include_dirs "${third_party_dir}/hermes/API"
                        "${third_party_dir}/hermes/public")

add_react_common_subdir(hermes/executor)
target_include_directories(hermes_executor_common
                           PUBLIC "${hermes_include_dirs}")
add_react_common_subdir(react/runtime/hermes)
target_include_directories(bridgelesshermes PUBLIC "${hermes_include_dirs}")

# HERMES INSPECTOR
add_react_common_subdir(hermes/inspector-modern)
target_include_directories(hermes_inspector_modern
                           PRIVATE "${hermes_include_dirs}")
target_compile_options(hermes_inspector_modern PRIVATE ${folly_FLAGS})

# hermestooling is a shared library where we merge all the hermes* related libraries.
add_library(hermestooling
        SHARED
        $<TARGET_OBJECTS:bridgelesshermes>
        $<TARGET_OBJECTS:hermes_executor_common>
        $<TARGET_OBJECTS:hermes_inspector_modern>
)
target_link_libraries(hermestooling
        PUBLIC
        reactnative
        jsi
        hermes-engine::libhermes
)
target_include_directories(hermestooling
        PUBLIC
        $<TARGET_PROPERTY:bridgelesshermes,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:hermes_executor_common,INTERFACE_INCLUDE_DIRECTORIES>
        $<TARGET_PROPERTY:hermes_inspector_modern,INTERFACE_INCLUDE_DIRECTORIES>
)