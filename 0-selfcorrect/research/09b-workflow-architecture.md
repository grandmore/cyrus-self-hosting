# Workflow Architecture

## Overview

External workflow definitions that Cyrus loads from `~/.cyrus/workflows/`. Each workflow is a self-contained folder with a TypeScript definition, prompts, and version history.

---

## Folder Structure

```
~/.cyrus/workflows/develop-advanced/
├── workflow.ts              ← Definition with resolve() hook
├── prompts/                 ← Active prompts (what Cyrus loads)
│   ├── 10-coding.md
│   ├── 20-verify.md
│   ├── 30-git.md
│   └── 40-summary.md
└── versions/                ← Version history
    ├── versions.json        ← Metadata: versions, reasoning
    ├── 10-coding.v1.md
    ├── 10-coding.v2.md
    └── ...
```

---

## workflow.ts

```typescript
const SUBROUTINES = {
  coding: {
    name: "coding",
    promptPath: "prompts/10-coding.md",
    description: "Implementation phase",
  },
  verify: {
    name: "verify",
    promptPath: "prompts/20-verify.md",
    description: "Run tests, linting, type checking",
  },
  git: {
    name: "git",
    promptPath: "prompts/30-git.md",
    description: "Commit and create PR",
  },
  summary: {
    name: "summary",
    promptPath: "prompts/40-summary.md",
    description: "Brief summary",
    singleTurn: true,
  },
};

const PROCEDURE = {
  name: "develop-advanced",
  description: "Advanced development workflow",
  subroutines: [
    SUBROUTINES.coding,
    SUBROUTINES.verify,
    SUBROUTINES.git,
    SUBROUTINES.summary,
  ],
};

export async function resolve(context: ResolveContext): Promise<ProcedureDefinition> {
  // Hook point for Evolution to modify paths
  return PROCEDURE;
}
```

---

## ResolveContext

```typescript
interface ResolveContext {
  issueId: string;
  labels: string[];
  repositoryId: string;
}
```

Called once when loading the workflow. Returns the complete procedure definition with all subroutine paths.

---

## How It Works

1. Cyrus receives an issue with label indicating workflow (e.g., "develop-advanced")
2. Cyrus loads `~/.cyrus/workflows/develop-advanced/workflow.ts`
3. Cyrus calls `resolve(context)`
4. resolve() returns the procedure definition with prompt paths
5. Cyrus steps through subroutines, loading each prompt file
6. Logging captures which files were loaded

---

## Prompt Files

Each prompt file in `prompts/` includes a version header:

```markdown
<!-- Version: v3 -->
<!-- Updated: 2024-01-17 -->

# Coding Phase

...prompt content...
```

The version header indicates which version is currently active.

---

## Version History

`versions/versions.json` tracks all versions and reasoning:

```json
{
  "10-coding": {
    "current": "v3",
    "history": [
      { "version": "v1", "created": "2024-01-15", "author": "human", "reason": "Initial version" },
      { "version": "v2", "created": "2024-01-16", "author": "evolution", "reason": "Improved error handling" },
      { "version": "v3", "created": "2024-01-17", "author": "evolution", "reason": "Simplified language" }
    ]
  }
}
```

Version source files stored in `versions/`:
- `10-coding.v1.md`
- `10-coding.v2.md`
- `10-coding.v3.md`

---

## Evolution Integration

Evolution is a separate system that:

1. **Analyzes logs** - Reads Cyrus execution logs for each issue
2. **Creates experiments** - Writes Linear issues to test prompt variants
3. **Modifies resolve()** - Changes paths at runtime for A/B testing
4. **Updates prompts** - Writes improved content to `prompts/`
5. **Tracks versions** - Maintains history in `versions/`

### A/B Testing Flow

When testing 3 variants:

- Run 1: resolve() returns paths to current prompts
- Run 2: resolve() returns paths to `10-coding.v2.md`
- Run 3: resolve() returns paths to `10-coding.v3.md`

Each run logs which files were loaded. Evolution compares results.

### Permanent Improvements

When Evolution determines a version is better:

1. Creates new version file in `versions/`
2. Updates `versions.json` with reasoning
3. Copies new content to `prompts/10-coding.md`
4. Updates version header in the file

---

## Cyrus Integration

Cyrus loads workflows by checking `~/.cyrus/workflows/{name}/` before internal registry.

```typescript
// In EdgeWorker or ProcedureRouter
async function loadProcedure(name: string, context: ResolveContext) {
  const workflowPath = path.join(os.homedir(), '.cyrus', 'workflows', name, 'workflow.ts');

  if (await exists(workflowPath)) {
    const { resolve } = await import(workflowPath);
    return resolve(context);
  }

  // Fall back to internal registry
  return PROCEDURES[name];
}
```

---

## Separation of Concerns

| Component | Owner | Purpose |
|-----------|-------|---------|
| `workflow.ts` | Human | Define procedure structure |
| `prompts/` | Human + Evolution | Active prompts Cyrus loads |
| `versions/` | Evolution | Version history and sources |
| `resolve()` | Evolution (runtime) | Modify paths for experiments |

Cyrus reads `workflow.ts` and `prompts/`.
Evolution manages `versions/` and modifies `resolve()` behavior.
Cyrus does not access `versions/`.

---

## Self-Improving Loop

```
Cyrus runs workflows
        ↓
Logs generated (files loaded, results, errors)
        ↓
Evolution analyzes logs
        ↓
Evolution creates test issues (via Linear)
        ↓
Cyrus runs tests (multiple versions)
        ↓
Evolution compares results
        ↓
Evolution updates prompts
        ↓
Repeat
```

Evolution uses the same system (Linear issues → Cyrus) to test and improve itself. Cyrus is unaware of Evolution's existence.
