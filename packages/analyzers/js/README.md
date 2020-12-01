#### How this should work

- Default to automagic mode where we start by analyzing a package json

  - find entrypoints in
    - main
    - bin
    - workspaces
  - add the package.json as own node, which dependsOn main and bin files (maybe don't do this for workspaces, might create an unnecessary connection?)

- automatically collect tsconfig/webpack/require config for module aliasing

  - this might be more complicated in case of files that extend each other
  - this would only become a problem if these settings radically differ between workspaces

- allow multiple exclusion regexp

- allow custom config mode, defining your own entries (similar to how it's working now)
