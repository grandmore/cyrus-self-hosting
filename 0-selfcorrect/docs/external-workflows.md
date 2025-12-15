# Extending Cyrus: Externalizing Internal Logic

Cyrus has been extended to externalize its internal workflow logic into `~/.cyrus/workflows/`.

This means you can now:
- **Override system prompts** without touching the core codebase
- **Define custom procedures** (sequences of subroutines)
- **Add new classification mappings** for different request types
- **Swap out the EdgeWorker entirely** if needed

All without forking or modifying the main Cyrus package.

## How it works

Drop a folder in `~/.cyrus/workflows/my-workflow/` with:
- `registry.js` — your procedures, subroutines, and mappings
- `system-prompts/*.md` — custom prompt templates

Cyrus loads these at startup and uses them instead of (or alongside) the built-in ones.

## Example structure

```
~/.cyrus/workflows/
└── my-custom-workflow/
    ├── registry.js
    └── system-prompts/
        ├── builder.md
        ├── debugger.md
        └── my-custom-prompt.md
```

## registry.js exports

Your `registry.js` can export any of the following:

```javascript
// Custom subroutines
export const SUBROUTINES = {
  mySubroutine: {
    name: "my-subroutine",
    promptPath: "subroutines/my-subroutine.md",
    description: "Description of what this subroutine does",
  },
};

// Custom procedures (sequences of subroutines)
export const PROCEDURES = {
  "my-procedure": {
    name: "my-procedure",
    description: "Description of the procedure",
    subroutines: [SUBROUTINES.mySubroutine],
  },
};

// Map classifications to procedures
export const CLASSIFICATION_TO_PROCEDURE = {
  code: "my-procedure",
};

// Register new prompt types
export const PROMPT_TYPES = ["my-custom-prompt"];
```

## Load order

External workflows override internal definitions:
1. Cyrus scans `~/.cyrus/workflows/` for subdirectories
2. Each workflow's `registry.js` is loaded
3. System prompts from `system-prompts/*.md` are cached
4. When resolving a procedure or prompt, external definitions take priority

Later workflows (alphabetically) override earlier ones if they define the same names.

## Implementation details

The external loading system is implemented in approximately **800 lines of code**:
- `packages/edge-worker/src/procedures/external-loader.ts` (403 lines)
- `packages/edge-worker/test/external-loader.test.ts` (349 lines)
- `packages/edge-worker/test/external-workflows.test.ts` (75 lines)

## Why this matters

If you want to customize how Cyrus:
- Classifies requests
- Sequences steps for different issue types
- Prompts Claude at each stage

This mechanism makes it dramatically easier to iterate without constantly rebuilding packages or maintaining a full fork.
