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

#### TODOS

- The UI shall allow to colorize based on labels through
  config options

- Expose metadata about the trees creation

  - which analyzer was used
  - which version
  - maybe it's config options

- Expose debug information

  - nodes that couldn't be resolved
  - entry points that couldn't be found

- Resolve a package.json's browser field. Treat as alternative to main
- If a webpack.config.js is present, check it's entries as well.
