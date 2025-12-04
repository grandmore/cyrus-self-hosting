# Minimal Cyrus Integration Plan

**Goal:** Enable Cyrus to load external workflows from `~/.cyrus/workflows/{procedure-name}/` with minimal code changes.

---

## Current Flow

```
Issue → AI Classification → procedureName (e.g., "full-development")
                                  ↓
                    ProcedureRouter.getProcedure(name)
                                  ↓
                    Returns from internal PROCEDURES Map
                                  ↓
                    EdgeWorker loads subroutine prompts
                    using: __dirname + "prompts" + promptPath
```

**Key files:**
- `ProcedureRouter.ts:298` - `getProcedure(name)` returns from `this.procedures` Map
- `ProcedureRouter.ts:117` - `loadPredefinedProcedures()` populates Map from `PROCEDURES`
- `EdgeWorker.ts:4090-4094` - `loadSubroutinePrompt()` builds path from `__dirname + "prompts" + promptPath`

---

## Proposed Flow

```
Issue → AI Classification → procedureName (e.g., "full-development")
                                  ↓
                    ProcedureRouter.getProcedure(name)
                                  ↓
            Check: ~/.cyrus/workflows/{name}/workflow.js exists?
                    ├─ YES: import and call resolve() → return procedure with workflowDir
                    └─ NO:  return from internal PROCEDURES Map
                                  ↓
                    EdgeWorker loads subroutine prompts
                    using: workflowDir ? (workflowDir + promptPath) : (__dirname + "prompts" + promptPath)
```

---

## Minimal Changes to Cyrus

### Change 1: Add workflowDir to ProcedureDefinition

**File:** `packages/edge-worker/src/procedures/types.ts`

```typescript
export interface ProcedureDefinition {
  name: string;
  description: string;
  subroutines: SubroutineDefinition[];
  workflowDir?: string;  // NEW: Set by external workflows to enable relative prompt paths
}
```

**Lines changed:** 1

---

### Change 2: Modify ProcedureRouter.getProcedure()

**File:** `packages/edge-worker/src/procedures/ProcedureRouter.ts`

**Current (lines 298-300):**
```typescript
getProcedure(name: string): ProcedureDefinition | undefined {
  return this.procedures.get(name);
}
```

**Proposed:**
```typescript
async getProcedure(name: string, context?: ResolveContext): Promise<ProcedureDefinition | undefined> {
  // Check external workflow first
  const externalPath = join(homedir(), '.cyrus', 'workflows', name, 'workflow.js');
  if (existsSync(externalPath)) {
    try {
      const { resolve } = await import(externalPath);
      const procedure = await resolve(context || {});
      console.log(`[ProcedureRouter] Loaded external workflow: ${externalPath}`);
      return procedure;
    } catch (error) {
      console.warn(`[ProcedureRouter] Failed to load external workflow: ${error}`);
    }
  }

  // Fall back to internal
  return this.procedures.get(name);
}
```

**Imports needed:**
```typescript
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
```

**Lines changed:** ~15

**Breaking change:** Method becomes async. Call sites need `await`.

---

### Change 3: Update call sites to use async getProcedure

**File:** `packages/edge-worker/src/EdgeWorker.ts`

Locations that call `this.procedureRouter.getProcedure()`:
- Line 1431: `this.procedureRouter.getProcedure("debugger-full")`
- Line 1442: `this.procedureRouter.getProcedure("orchestrator-full")`
- Line 4797: `this.procedureRouter.getProcedure("orchestrator-full")`

Change each to: `await this.procedureRouter.getProcedure("...", context)`

**Lines changed:** ~6 (2 per location)

---

### Change 4: Modify loadSubroutinePrompt to use workflowDir

**File:** `packages/edge-worker/src/EdgeWorker.ts`

**Current (lines 4088-4094):**
```typescript
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const subroutinePromptPath = join(
  __dirname,
  "prompts",
  subroutine.promptPath,
);
```

**Proposed:**
```typescript
let subroutinePromptPath: string;

// Check if procedure has workflowDir (external workflow)
const procedureMetadata = session?.metadata?.procedure as ProcedureMetadata | undefined;
const procedure = procedureMetadata ? this.procedureRouter.getProcedureSync(procedureMetadata.procedureName) : null;

if (procedure?.workflowDir) {
  // External workflow: use workflowDir + promptPath
  subroutinePromptPath = join(procedure.workflowDir, subroutine.promptPath);
} else {
  // Internal: use __dirname + prompts + promptPath
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  subroutinePromptPath = join(__dirname, "prompts", subroutine.promptPath);
}
```

**Alternative simpler approach:** Pass workflowDir as parameter to loadSubroutinePrompt

```typescript
private async loadSubroutinePrompt(
  subroutine: SubroutineDefinition,
  workspaceSlug?: string,
  workflowDir?: string,  // NEW parameter
): Promise<string | null> {
  if (subroutine.promptPath === "primary") {
    return null;
  }

  let subroutinePromptPath: string;
  if (workflowDir) {
    subroutinePromptPath = join(workflowDir, subroutine.promptPath);
  } else {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    subroutinePromptPath = join(__dirname, "prompts", subroutine.promptPath);
  }
  // ... rest unchanged
}
```

**Lines changed:** ~10

---

## Summary of Changes

| File | Change | Lines |
|------|--------|-------|
| `types.ts` | Add `workflowDir?: string` | 1 |
| `ProcedureRouter.ts` | Make `getProcedure()` async, check external first | 15 |
| `ProcedureRouter.ts` | Add imports | 3 |
| `EdgeWorker.ts` | Update getProcedure call sites to async | 6 |
| `EdgeWorker.ts` | Add workflowDir parameter to loadSubroutinePrompt | 10 |

**Total: ~35 lines of changes**

---

## Why This Works

### Old way (no external workflow):
1. `getProcedure("full-development")` checks `~/.cyrus/workflows/full-development/workflow.js`
2. File doesn't exist → returns from internal `PROCEDURES` Map
3. `workflowDir` is undefined → prompts loaded from internal path
4. **Behavior unchanged**

### New way (with external workflow):
1. `getProcedure("full-development")` checks `~/.cyrus/workflows/full-development/workflow.js`
2. File exists → imports and calls `resolve(context)`
3. Returns procedure with `workflowDir` set to workflow folder
4. `loadSubroutinePrompt()` uses `workflowDir + promptPath`
5. **Prompts loaded from external workflow folder**

---

## Testing Strategy

### Test 1: No external workflow (backwards compat)
- Delete `~/.cyrus/workflows/full-development/`
- Run Cyrus
- Verify: Uses internal procedures and prompts

### Test 2: External workflow exists
- Create `~/.cyrus/workflows/full-development/workflow.js`
- Modify one prompt to add a marker comment
- Run Cyrus
- Verify: Logs show "Loaded external workflow"
- Verify: Prompt content includes marker comment

### Test 3: External workflow error handling
- Create `~/.cyrus/workflows/full-development/workflow.js` with syntax error
- Run Cyrus
- Verify: Falls back to internal procedure with warning log

---

## External Workflow Structure

```
~/.cyrus/workflows/
├── types.ts                    ← Shared type definitions
└── full-development/           ← Matches procedure name
    ├── workflow.ts             ← Exports resolve() function
    ├── prompts/
    │   ├── 10-coding.md
    │   ├── 20-verify.md
    │   ├── 30-git.md
    │   └── 40-summary.md
    └── versions/               ← For Evolution (not used by Cyrus)
        ├── versions.json
        └── *.v1.md
```

---

## Implementation Order

1. Create external workflow structure (done: `~/.cyrus/workflows/`)
2. Add `workflowDir` to `ProcedureDefinition` in types.ts
3. Modify `ProcedureRouter.getProcedure()` to check external first
4. Update call sites to use async
5. Add `workflowDir` parameter to `loadSubroutinePrompt()`
6. Pass workflowDir through the call chain
7. Test both old and new ways work
8. Create PR with explanation

---

## PR Description Template

```markdown
## Add External Workflow Override Support

This PR adds the ability to override procedures by placing workflow files
in `~/.cyrus/workflows/{procedure-name}/`.

### Why
- Enables custom workflow configurations per user
- Allows testing prompt variations without modifying Cyrus core
- Supports external prompt improvement systems

### What
- Added optional `workflowDir` field to `ProcedureDefinition`
- `getProcedure()` now checks `~/.cyrus/workflows/` first
- `loadSubroutinePrompt()` respects `workflowDir` for prompt paths

### Backwards Compatible
- No external workflow → existing behavior unchanged
- All existing tests pass
- New tests verify both paths work

### Usage
1. Create `~/.cyrus/workflows/full-development/workflow.js`
2. Export a `resolve(context)` function that returns `ProcedureDefinition`
3. Place prompts in `prompts/` folder relative to workflow.js
4. Cyrus will use external workflow instead of internal
```
