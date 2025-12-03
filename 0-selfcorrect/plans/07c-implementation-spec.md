# Workflow Integration Specification

**Purpose:** Hook TypeScript workflows into Cyrus with minimal changes by reusing existing infrastructure.

---

## The Problem

Cyrus procedures are static arrays. We want TypeScript logic (conditionals, loops, retries) while reusing:
- Claude/Gemini execution (`resumeAgentSession`)
- Session continuity (`claudeSessionId`/`geminiSessionId`)
- Linear integration (activity posting, comments)
- MCP configuration (tools, Linear API)

---

## The Architecture Gap

**Cyrus uses events:**
```
resumeAgentSession() → returns immediately
... Claude runs ...
AgentSessionManager emits "subroutineComplete" → EdgeWorker.handleSubroutineTransition()
```

**Workflows need promises:**
```typescript
await ctx.runSubroutine({ promptPath: "coding.md" });
await ctx.runSubroutine({ promptPath: "verify.md" });  // Must wait for previous
```

**Solution:** Wrap the event in a Promise.

---

## Folder Structure

```
~/.cyrus/workflows/
└── full-development/
    ├── workflow.ts              ← TypeScript logic
    └── prompts/
        └── subroutines/
            ├── coding-activity.md
            ├── verifications.md
            ├── git-gh.md
            └── concise-summary.md
```

---

## workflow.ts Example

```typescript
import type { WorkflowContext, SubroutineResult } from '@anthropic-ai/cyrus';

export async function run(ctx: WorkflowContext): Promise<void> {
  // 1. Implementation
  await ctx.runSubroutine({
    name: 'coding-activity',
    promptPath: 'subroutines/coding-activity.md',
  });

  // 2. Verification with retry
  let result: SubroutineResult;
  let attempts = 0;
  do {
    result = await ctx.runSubroutine({
      name: 'verifications',
      promptPath: 'subroutines/verifications.md',
    });
    attempts++;
  } while (!result.success && attempts < 3);

  // 3. Git/PR
  await ctx.runSubroutine({
    name: 'git-gh',
    promptPath: 'subroutines/git-gh.md',
  });

  // 4. Summary (single turn, cheap model)
  await ctx.runSubroutine({
    name: 'concise-summary',
    promptPath: 'subroutines/concise-summary.md',
    singleTurn: true,
    model: 'haiku',
  });
}
```

---

## WorkflowContext Interface

```typescript
interface WorkflowContext {
  // Paths
  workflowDir: string;           // ~/.cyrus/workflows/full-development/
  workspaceSlug: string;         // Linear workspace for template substitution

  // Context from Cyrus
  session: CyrusAgentSession;    // Includes claudeSessionId, geminiSessionId
  issue: LinearIssue;
  repository: RepositoryConfig;

  // Execution (the key method)
  runSubroutine(opts: SubroutineOptions): Promise<SubroutineResult>;

  // Shared state across subroutines
  metadata: Record<string, unknown>;
}

interface SubroutineOptions {
  name: string;
  promptPath: string;            // Relative to workflowDir/prompts/
  description?: string;
  model?: 'opus' | 'sonnet' | 'haiku';
  singleTurn?: boolean;
  maxTurns?: number;
  disallowedTools?: string[];
  suppressThoughtPosting?: boolean;
}

interface SubroutineResult {
  success: boolean;
  result: string;                // Final text from Claude
  tokenUsage: { input: number; output: number };
  costUsd: number;
  durationMs: number;
}
```

---

## Implementation in Cyrus

### 1. Entry Point (~30 lines in EdgeWorker.ts)

Before using internal procedure, check for external workflow:

```typescript
private async executeWorkflowOrProcedure(
  procedureName: string,
  session: CyrusAgentSession,
  agentSessionManager: AgentSessionManager,
  repository: RepositoryConfig,
): Promise<void> {
  const workflowPath = path.join(
    os.homedir(), '.cyrus', 'workflows', procedureName, 'workflow.js'
  );

  if (await exists(workflowPath)) {
    const { run } = await import(workflowPath);
    const ctx = this.createWorkflowContext(session, procedureName, ...);
    await run(ctx);
  } else {
    // Fall back to internal procedure
    await this.executeProcedure(procedureName, session, ...);
  }
}
```

### 2. WorkflowContext Factory (~40 lines)

```typescript
private createWorkflowContext(
  session: CyrusAgentSession,
  workflowName: string,
  agentSessionManager: AgentSessionManager,
  repository: RepositoryConfig,
): WorkflowContext {
  const workflowDir = path.join(os.homedir(), '.cyrus', 'workflows', workflowName);

  return {
    workflowDir,
    workspaceSlug: this.config.linearWorkspaceSlug,
    session,
    issue: this.getCurrentIssue(session),
    repository,
    metadata: session.metadata?.workflow || {},

    runSubroutine: (opts) => this.executeSubroutineForWorkflow(
      session, workflowDir, opts, agentSessionManager, repository
    ),
  };
}
```

### 3. Subroutine Execution with Promise Wrapper (~50 lines)

The key integration: wrap the event-based completion in a Promise.

```typescript
private async executeSubroutineForWorkflow(
  session: CyrusAgentSession,
  workflowDir: string,
  opts: SubroutineOptions,
  agentSessionManager: AgentSessionManager,
  repository: RepositoryConfig,
): Promise<SubroutineResult> {
  // 1. Load prompt
  const promptPath = path.join(workflowDir, 'prompts', opts.promptPath);
  let prompt = await fs.readFile(promptPath, 'utf-8');
  prompt = this.applyTemplateSubstitutions(prompt);

  // 2. Create completion promise (wrap the event)
  const completionPromise = new Promise<SDKResultMessage>((resolve) => {
    const handler = ({ session: s, result }: SubroutineCompleteEvent) => {
      if (s.id === session.id) {
        agentSessionManager.off('subroutineComplete', handler);
        resolve(result);
      }
    };
    agentSessionManager.on('subroutineComplete', handler);
  });

  // 3. Start execution (fire-and-forget, uses existing infrastructure)
  await this.resumeAgentSession(
    session,
    repository,
    session.linearAgentActivitySessionId,
    agentSessionManager,
    prompt,
    '',                              // No attachment manifest
    false,                           // Not new session
    [],                              // No additional directories
    opts.singleTurn ? 1 : opts.maxTurns,
  );

  // 4. Wait for completion event
  const result = await completionPromise;

  return {
    success: result.subtype === 'success',
    result: result.result,
    tokenUsage: result.usage,
    costUsd: result.total_cost_usd,
    durationMs: result.duration_ms,
  };
}
```

---

## What We Reuse (No Changes Needed)

| Component | What It Does | Why It Works |
|-----------|--------------|--------------|
| `resumeAgentSession()` | Starts Claude with prompt | Already handles model, MCP, hooks |
| `AgentSessionManager` | Emits completion events | Already provides "subroutineComplete" |
| `buildAgentRunnerConfig()` | Configures runner | Already supports per-session model |
| Session persistence | Saves state between subroutines | Already handles claudeSessionId flow |
| Linear integration | Posts activity/comments | Already wired up via onMessage |

---

## What We Add

| Location | Lines | Description |
|----------|-------|-------------|
| `EdgeWorker.ts` | ~30 | `executeWorkflowOrProcedure()` entry point |
| `EdgeWorker.ts` | ~40 | `createWorkflowContext()` factory |
| `EdgeWorker.ts` | ~50 | `executeSubroutineForWorkflow()` with Promise wrapper |
| New: `types/workflow.ts` | ~30 | TypeScript interfaces for workflow.ts |
| **Total** | **~150** | |

---

## Per-Subroutine Model Selection

Already supported in `buildAgentRunnerConfig()`. To enable from workflow:

```typescript
// In SubroutineOptions handling:
const model = opts.model || repository.model || this.config.defaultModel;
```

This allows:
```typescript
await ctx.runSubroutine({ promptPath: 'planning.md', model: 'opus' });
await ctx.runSubroutine({ promptPath: 'coding.md', model: 'sonnet' });
await ctx.runSubroutine({ promptPath: 'summary.md', model: 'haiku' });
```

---

## TypeScript Execution

Workflows are TypeScript but must be runnable. Options:

1. **Pre-compiled:** User runs `tsc` to create `workflow.js`
2. **On-the-fly:** Use `esbuild` to compile at import time (~5 lines)
3. **Native:** Node 22+ with `--experimental-strip-types`

Recommend option 2 for best DX:
```typescript
import { build } from 'esbuild';

async function importWorkflow(tsPath: string) {
  const result = await build({
    entryPoints: [tsPath],
    bundle: false,
    write: false,
    format: 'esm',
  });
  const code = result.outputFiles[0].text;
  const blob = new Blob([code], { type: 'text/javascript' });
  return import(URL.createObjectURL(blob));
}
```

---

## Prompts

Prompts live in `~/.cyrus/workflows/{name}/prompts/`. See existing Cyrus prompts in `packages/edge-worker/src/prompts/subroutines/` as templates.

---

## Next Steps

1. Implement `executeWorkflowOrProcedure()` entry point
2. Add Promise wrapper for completion events
3. Create types package for workflow.ts
4. Test with one workflow (full-development)
5. Document for users
