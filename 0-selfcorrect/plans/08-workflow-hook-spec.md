# Workflow Hook Specification

**Purpose:** Enable external TypeScript workflows that hook into Cyrus, with a structure that supports Evolution (prompt improvement system) without Cyrus being aware of it.

---

## Loading Order

```
1. ~/.cyrus/workflows/{name}/          ← User overrides (highest priority)
2. {this-repo}/workflows/{name}/       ← This repository's workflows
3. Internal Cyrus registry.ts          ← Default fallback
```

This allows:
- Users to override any workflow in `~/.cyrus/workflows/`
- This repo to define workflows that Cyrus loads
- Cyrus defaults if nothing external exists

## Folder Structure

**This repository (cyrus/):**
```
cyrus/
├── packages/
├── apps/
└── workflows/                       ← Repository workflows folder
    └── full-development/            ← MUST match Cyrus procedure name
        ├── workflow.ts              ← Procedure definition + resolve() hook
        ├── prompts/                 ← Active prompts (what Cyrus loads)
        │   ├── 10-coding.md
        │   ├── 20-verify.md
        │   ├── 30-git.md
        │   └── 40-summary.md
        └── versions/                ← Version history (Evolution manages)
            ├── versions.json
            ├── 10-coding.v1.md
            └── ...
```

The folder name **must match** the procedure name in Cyrus's `registry.ts`. This is how the override works - Cyrus asks for `full-development`, we provide our version.

**Available procedure names (from Cyrus):**
- `full-development` - Code changes with verification and PR
- `simple-question` - Quick questions, no code changes
- `documentation-edit` - Docs-only changes
- `debugger-full` - Debug with orchestrator
- `orchestrator-full` - Multi-issue orchestration
- `plan-mode` - Planning only

**User overrides (optional):**
```
~/.cyrus/workflows/{procedure-name}/
└── (same structure as above)
```

### Naming Convention

- **Prompts:** `{order}-{name}.md` (e.g., `10-coding.md`, `20-verify.md`)
- **Versions:** `{order}-{name}.v{n}.md` (e.g., `10-coding.v1.md`, `10-coding.v2.md`)
- **Order numbers:** 10, 20, 30... allows inserting steps (15, 25, etc.)

---

## workflow.ts

Mirrors the structure in `packages/edge-worker/src/procedures/registry.ts`:

```typescript
import type { ProcedureDefinition, SubroutineDefinition } from '@anthropic-ai/cyrus';

/**
 * Subroutine definitions - each step in the workflow
 */
const SUBROUTINES: Record<string, SubroutineDefinition> = {
  coding: {
    name: 'coding',
    promptPath: 'prompts/10-coding.md',
    description: 'Implementation phase - write code, no git operations',
  },
  verify: {
    name: 'verify',
    promptPath: 'prompts/20-verify.md',
    description: 'Run tests, linting, type checking',
  },
  git: {
    name: 'git',
    promptPath: 'prompts/30-git.md',
    description: 'Commit changes, create/update PR',
  },
  summary: {
    name: 'summary',
    promptPath: 'prompts/40-summary.md',
    description: 'Brief summary for Linear',
    singleTurn: true,
  },
};

/**
 * Procedure definition - the sequence of subroutines
 */
const PROCEDURE: ProcedureDefinition = {
  name: 'full-development',
  description: 'Full development workflow with verification',
  subroutines: [
    SUBROUTINES.coding,
    SUBROUTINES.verify,
    SUBROUTINES.git,
    SUBROUTINES.summary,
  ],
};

/**
 * Resolve hook - called once when workflow loads
 *
 * Evolution wraps this to modify paths for A/B testing.
 * Returns the procedure definition (possibly with modified paths).
 */
export async function resolve(context: ResolveContext): Promise<ProcedureDefinition> {
  // Default: return procedure as-is
  // Evolution will wrap this function to modify paths
  return PROCEDURE;
}

/**
 * Context passed to resolve()
 */
export interface ResolveContext {
  issueId: string;
  labels: string[];
  repositoryId: string;
}
```

### SubroutineDefinition Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Identifier for the subroutine |
| `promptPath` | string | Yes | Path to prompt file (relative to workflow folder) |
| `description` | string | No | Human-readable description |
| `singleTurn` | boolean | No | If true, Claude responds once (maxTurns=1) |
| `requiresApproval` | boolean | No | Pause for human approval before proceeding |
| `suppressThoughtPosting` | boolean | No | Don't post thoughts to Linear |
| `disallowedTools` | string[] | No | Tools Claude cannot use in this subroutine |

---

## Prompt Files

### Location
`~/.cyrus/workflows/{workflow-name}/prompts/{order}-{name}.md`

### Format
```markdown
<!-- Version: v3 -->
<!-- Description: Improved error handling based on failure analysis -->

# {Subroutine Name}

{Prompt content}

## Steps
1. ...
2. ...

## Success Criteria
- ...
- ...
```

The version comment is for human reference and tracking. Cyrus ignores it.

---

## Versions Folder

### Purpose
Evolution stores version history here. Cyrus never accesses this folder.

### versions.json
```json
{
  "prompts": {
    "10-coding": {
      "current": "v3",
      "versions": [
        {
          "version": "v1",
          "created": "2024-01-15T10:00:00Z",
          "author": "human",
          "reasoning": "Initial version from Cyrus defaults"
        },
        {
          "version": "v2",
          "created": "2024-01-16T14:30:00Z",
          "author": "evolution",
          "reasoning": "Added error handling - 23% failures from unclear recovery",
          "from": "v1",
          "metrics": {
            "before": { "successRate": 0.77 },
            "after": { "successRate": 0.89 }
          }
        },
        {
          "version": "v3",
          "created": "2024-01-17T09:00:00Z",
          "author": "human",
          "reasoning": "Simplified language, removed redundancy",
          "from": "v2"
        }
      ]
    },
    "20-verify": {
      "current": "v1",
      "versions": [...]
    }
  },
  "experiments": []
}
```

---

## Cyrus Integration

### Changes Required

**1. Check for external workflow before internal procedure**

In `EdgeWorker.ts`, check locations in order:

```typescript
private async loadProcedure(
  procedureName: string,
  context: ResolveContext,
  repoWorkflowsPath?: string,  // Path to repo's workflows/ folder
): Promise<ProcedureDefinition> {
  // 1. Check user overrides first
  const userPath = path.join(
    os.homedir(), '.cyrus', 'workflows', procedureName, 'workflow.js'
  );
  if (await exists(userPath)) {
    const { resolve } = await import(userPath);
    return resolve(context);
  }

  // 2. Check repository's workflows folder
  if (repoWorkflowsPath) {
    const repoPath = path.join(repoWorkflowsPath, procedureName, 'workflow.js');
    if (await exists(repoPath)) {
      const { resolve } = await import(repoPath);
      return resolve(context);
    }
  }

  // 3. Fall back to internal registry
  return PROCEDURES[procedureName];
}
```

**2. Load prompts relative to workflow folder**

When loading prompt for external workflow:

```typescript
private async loadSubroutinePrompt(
  subroutine: SubroutineDefinition,
  workflowDir: string | null,  // null = internal
): Promise<string> {
  const promptPath = workflowDir
    ? path.join(workflowDir, subroutine.promptPath)
    : path.join(__dirname, 'prompts', subroutine.promptPath);

  return readFile(promptPath, 'utf-8');
}
```

### TypeScript Compilation

Workflows are `.ts` files but Node needs `.js`. Options:

1. **Pre-compiled:** User runs `tsc` to create `workflow.js`
2. **On-the-fly:** Use `esbuild` at import time (~5 lines)
3. **tsx:** Use `tsx` to run TypeScript directly

Recommend option 2 for best developer experience.

---

## Evolution Integration Points

Evolution is a separate system. These are the integration points:

### 1. The resolve() Hook

Evolution wraps the `resolve()` function to modify paths:

```typescript
// Evolution's wrapper (conceptual)
const originalResolve = workflow.resolve;

workflow.resolve = async (context) => {
  const procedure = await originalResolve(context);

  // Check if this issue is in an experiment
  const experiment = getExperiment(context.issueId);
  if (experiment) {
    // Modify paths based on experiment
    procedure.subroutines = procedure.subroutines.map(sub => ({
      ...sub,
      promptPath: experiment.paths[sub.name] || sub.promptPath,
    }));
  }

  return procedure;
};
```

### 2. Updating Active Prompts

When Evolution determines a version is better:

1. Creates new version file: `versions/10-coding.v4.md`
2. Updates `versions/versions.json`
3. Copies content to: `prompts/10-coding.md`

Cyrus picks up the new prompt on next run. Unaware anything changed.

### 3. A/B Testing Flow

1. Human creates issue: "Fix bug X. Run 3 variants."
2. Orchestrator creates sub-issues (A, B, C)
3. Evolution configures experiment in `versions.json`
4. Each issue runs → `resolve()` returns different paths
5. Cyrus logs show exactly which files were loaded
6. Evolution analyzes logs, compares results

---

## What We Build Now

### In This Repository (cyrus/workflows/)

| Component | Description |
|-----------|-------------|
| `workflows/full-development/workflow.ts` | First workflow definition |
| `workflows/full-development/prompts/*.md` | Prompt files (copied from Cyrus) |
| `workflows/full-development/versions/` | Empty folder for Evolution |

### In Cyrus (minimal changes)

| Component | Description | Lines (est) |
|-----------|-------------|-------------|
| Workflow loader | Check user → repo → internal | ~25 |
| Prompt loader update | Support external workflow paths | ~10 |
| TypeScript compiler | On-the-fly esbuild for workflow.ts | ~10 |
| Type definitions | ResolveContext, exported interfaces | ~30 |

**Total: ~75 lines of changes in Cyrus**

### What We Don't Build Now

- Evolution system (analyzes logs, improves prompts)
- Experiment management
- Version tracking logic
- A/B test orchestration

These use the same structure but are built separately.

---

## Implementation Steps

### Step 1: Create folder structure at repo root

```bash
# From cyrus/ root
mkdir -p workflows/full-development/prompts
mkdir -p workflows/full-development/versions
```

### Step 2: Create workflow.ts

Copy the template from this spec, matching Cyrus's `registry.ts` structure.

### Step 3: Copy prompts from Cyrus

```bash
# Copy existing prompts as starting point
cp packages/edge-worker/src/prompts/subroutines/coding-activity.md \
   workflows/full-development/prompts/10-coding.md

cp packages/edge-worker/src/prompts/subroutines/verifications.md \
   workflows/full-development/prompts/20-verify.md

cp packages/edge-worker/src/prompts/subroutines/git-gh.md \
   workflows/full-development/prompts/30-git.md

cp packages/edge-worker/src/prompts/subroutines/concise-summary.md \
   workflows/full-development/prompts/40-summary.md
```

### Step 4: Create initial versions

```bash
# Copy each prompt as v1
cp workflows/full-development/prompts/10-coding.md \
   workflows/full-development/versions/10-coding.v1.md

cp workflows/full-development/prompts/20-verify.md \
   workflows/full-development/versions/20-verify.v1.md

cp workflows/full-development/prompts/30-git.md \
   workflows/full-development/versions/30-git.v1.md

cp workflows/full-development/prompts/40-summary.md \
   workflows/full-development/versions/40-summary.v1.md
```

### Step 5: Create versions.json

Empty structure ready for Evolution:

```json
{
  "prompts": {
    "10-coding": { "current": "v1", "versions": [] },
    "20-verify": { "current": "v1", "versions": [] },
    "30-git": { "current": "v1", "versions": [] },
    "40-summary": { "current": "v1", "versions": [] }
  },
  "experiments": []
}
```

### Step 6: Modify Cyrus (separate PR)

Add the workflow loader to `EdgeWorker.ts`.

---

## File Traceability

Every Cyrus log includes the exact file path loaded:

```
[2024-01-17T10:30:00Z] Loading subroutine: coding
[2024-01-17T10:30:00Z] Prompt path: /Users/x/.cyrus/workflows/full-development/prompts/10-coding.md
```

For A/B tests, logs show which version was used:

```
[2024-01-17T10:30:00Z] Prompt path: /Users/x/.cyrus/workflows/full-development/versions/10-coding.v2.md
```

This makes debugging and analysis straightforward.
