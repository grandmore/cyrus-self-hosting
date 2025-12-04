# Prompt Loading System: How Cyrus Resolves Prompts

**Purpose:** Document exactly how Cyrus loads prompts today, what context exists but isn't used, and where a hook would go.

---

## Current State: Simple File Lookup

The prompt loading is a straightforward file read:

```typescript
// EdgeWorker.ts:4079-4118
private async loadSubroutinePrompt(
  subroutine: SubroutineDefinition,
  workspaceSlug?: string,
): Promise<string | null> {
  if (subroutine.promptPath === "primary") {
    return null;  // Special case, no file
  }

  // Hard-coded path: edge-worker/src/prompts/{promptPath}
  const subroutinePromptPath = join(__dirname, "prompts", subroutine.promptPath);

  let prompt = await readFile(subroutinePromptPath, "utf-8");

  // Only template substitution: workspace slug for Linear mentions
  if (workspaceSlug) {
    prompt = prompt.replace(
      /https:\/\/linear\.app\/linear\/profiles\//g,
      `https://linear.app/${workspaceSlug}/profiles/`,
    );
  }

  return prompt;
}
```

**What it receives:**
- `subroutine.promptPath` - e.g., `"subroutines/coding-activity.md"`
- `workspaceSlug` - e.g., `"mycompany"` (for Linear profile URLs)

**What it does NOT receive:**
- Session info
- Worktree path
- Issue context
- Repository config
- Anything that could be used for A/B selection

---

## Where loadSubroutinePrompt Is Called

### Call Site 1: Subroutine Transition

```typescript
// EdgeWorker.ts:528-594
private async handleSubroutineTransition(
  linearAgentActivitySessionId: string,
  session: CyrusAgentSession,      // ← AVAILABLE but not passed
  repo: RepositoryConfig,           // ← AVAILABLE but not passed
  agentSessionManager: AgentSessionManager,
) {
  const nextSubroutine = this.procedureRouter.getCurrentSubroutine(session);

  // Only passes subroutine and workspaceSlug
  const subroutinePrompt = await this.loadSubroutinePrompt(
    nextSubroutine,
    this.config.linearWorkspaceSlug,
  );

  await this.resumeAgentSession(...);
}
```

### Call Site 2: Initial Prompt Assembly

```typescript
// EdgeWorker.ts:3962-3977 (inside buildNewSessionPrompt)
private async buildNewSessionPrompt(input: PromptAssemblyInput) {
  // input has: session, fullIssue, repository, labels, userComment, etc.

  const currentSubroutine = this.procedureRouter.getCurrentSubroutine(input.session);

  // Only passes subroutine and workspaceSlug
  const subroutinePrompt = await this.loadSubroutinePrompt(
    currentSubroutine,
    this.config.linearWorkspaceSlug,
  );
}
```

---

## Context That EXISTS But Is Not Used

At both call sites, rich context is available:

| Context | Available At | Could Be Used For |
|---------|--------------|-------------------|
| `session.workspace.path` | Both | Worktree-specific prompts |
| `session.issueId` | Both | Issue-based A/B selection |
| `session.claudeSessionId` | Both | Session-specific behavior |
| `session.metadata.procedure` | Both | Procedure state awareness |
| `repo.id` | Both | Repository-specific prompts |
| `repo.model` | Both | Model-aware prompts |
| `input.labels` | Initial only | Label-based prompt variants |
| `input.fullIssue` | Initial only | Issue context in prompt selection |
| `this.config.*` | Both | Global configuration flags |

**The gap:** All this context is available at the call sites, but `loadSubroutinePrompt()` only receives `(subroutine, workspaceSlug)`.

---

## Where Prompts Live

```
packages/edge-worker/src/prompts/
├── subroutines/              ← Subroutine prompts (loadSubroutinePrompt)
│   ├── coding-activity.md
│   ├── verifications.md
│   ├── git-gh.md
│   ├── concise-summary.md
│   ├── debugger-reproduction.md
│   ├── debugger-fix.md
│   └── ...
└── (parent dir)
    ├── builder.md            ← System prompts (different path)
    ├── debugger.md
    ├── scoper.md
    └── orchestrator.md
```

---

## How promptPath Is Defined

Subroutines are defined in a static registry:

```typescript
// registry.ts
export const SUBROUTINES = {
  codingActivity: {
    name: "coding-activity",
    promptPath: "subroutines/coding-activity.md",  // ← Static string
    description: "Implementation phase",
  },
  verifications: {
    name: "verifications",
    promptPath: "subroutines/verifications.md",    // ← Static string
    description: "Run tests, linting, type checking",
  },
  // ...
};

export const PROCEDURES: Record<string, ProcedureDefinition> = {
  "full-development": {
    name: "full-development",
    subroutines: [
      SUBROUTINES.codingActivity,   // ← Static array
      SUBROUTINES.verifications,
      SUBROUTINES.gitGh,
      SUBROUTINES.conciseSummary,
    ],
  },
};
```

**The promptPath is:**
- Defined statically in code
- Resolved to a file path at runtime
- No logic, no conditionals, no context awareness

---

## The Hook Point

To add logic to prompt resolution, the hook goes in `loadSubroutinePrompt()`:

```typescript
private async loadSubroutinePrompt(
  subroutine: SubroutineDefinition,
  workspaceSlug?: string,
  context?: PromptLoadContext,  // ← NEW: Pass context
): Promise<string | null> {

  // NEW: Check for hook first
  if (this.promptResolver) {
    const resolved = await this.promptResolver.resolve({
      subroutineName: subroutine.name,
      promptPath: subroutine.promptPath,
      workspaceSlug,
      ...context,  // session, worktree, issue, etc.
    });

    if (resolved) {
      return resolved;
    }
  }

  // Fall back to file lookup
  const subroutinePromptPath = join(__dirname, "prompts", subroutine.promptPath);
  return readFile(subroutinePromptPath, "utf-8");
}
```

---

## What the Hook Interface Would Look Like

```typescript
interface PromptLoadContext {
  // From session
  sessionId: string;
  workspacePath: string;        // Git worktree path
  issueId: string;

  // From procedure state
  procedureName: string;
  subroutineIndex: number;
  subroutineHistory: SubroutineHistoryEntry[];

  // From repository
  repositoryId: string;
  repositoryPath: string;
  model: string;

  // From issue (if available)
  issueLabels?: string[];
  issueTitle?: string;
}

interface PromptResolver {
  resolve(input: {
    subroutineName: string;
    promptPath: string;
    workspaceSlug?: string;
    context: PromptLoadContext;
  }): Promise<string | null>;  // null = fall back to file
}
```

---

## Use Cases This Enables

### A/B Testing

```typescript
// ~/.cyrus/prompt-resolver.ts
export async function resolve({ subroutineName, context }) {
  if (subroutineName === 'verifications') {
    // 50/50 A/B test
    const variant = hash(context.issueId) % 2 === 0 ? 'a' : 'b';
    return readFile(`~/.cyrus/prompts/verifications-${variant}.md`);
  }
  return null;  // Fall back to default
}
```

### Parallel Worktree Variants

```typescript
// Different prompts for different parallel executions
export async function resolve({ subroutineName, context }) {
  const worktreeId = extractWorktreeId(context.workspacePath);

  // Each worktree gets a different strategy
  const strategy = STRATEGIES[worktreeId % STRATEGIES.length];
  return readFile(`~/.cyrus/prompts/${subroutineName}-${strategy}.md`);
}
```

### Repository-Specific Prompts

```typescript
// Custom prompts per repository
export async function resolve({ promptPath, context }) {
  const customPath = `~/.cyrus/repos/${context.repositoryId}/prompts/${promptPath}`;

  if (await exists(customPath)) {
    return readFile(customPath);
  }
  return null;  // Fall back to default
}
```

### Dynamic Prompt Generation

```typescript
// Build prompt based on context
export async function resolve({ subroutineName, context }) {
  if (subroutineName === 'coding-activity') {
    const basePrompt = await readFile('~/.cyrus/prompts/coding-base.md');

    // Add issue-specific context
    if (context.issueLabels?.includes('security')) {
      return basePrompt + '\n\n## Security Focus\nPay special attention to...';
    }
  }
  return null;
}
```

---

## Changes Required in Cyrus

### 1. Extend loadSubroutinePrompt Signature (~5 lines)

Add `context` parameter:

```typescript
private async loadSubroutinePrompt(
  subroutine: SubroutineDefinition,
  workspaceSlug?: string,
  context?: PromptLoadContext,  // NEW
): Promise<string | null>
```

### 2. Update Call Sites to Pass Context (~10 lines each)

```typescript
// In handleSubroutineTransition:
const subroutinePrompt = await this.loadSubroutinePrompt(
  nextSubroutine,
  this.config.linearWorkspaceSlug,
  {
    sessionId: session.id,
    workspacePath: session.workspace.path,
    issueId: session.issueId,
    procedureName: session.metadata?.procedure?.procedureName,
    // ...
  },
);
```

### 3. Add Hook Loading (~30 lines)

```typescript
// In EdgeWorker constructor or init:
const resolverPath = path.join(os.homedir(), '.cyrus', 'prompt-resolver.js');
if (await exists(resolverPath)) {
  this.promptResolver = await import(resolverPath);
}
```

### 4. Hook Check in loadSubroutinePrompt (~10 lines)

```typescript
// At start of loadSubroutinePrompt:
if (this.promptResolver?.resolve) {
  const resolved = await this.promptResolver.resolve({
    subroutineName: subroutine.name,
    promptPath: subroutine.promptPath,
    workspaceSlug,
    context,
  });
  if (resolved) return resolved;
}
```

**Total: ~60 lines of changes**

---

## Summary

| Aspect | Current State | What's Needed |
|--------|---------------|---------------|
| Prompt resolution | Static file lookup | Hook with context |
| Context at load time | Not passed | Pass through |
| Extension mechanism | None | PromptResolver interface |
| A/B testing | Impossible | Enabled by hook |
| Worktree-specific | Impossible | Enabled by hook |
| Dynamic generation | Impossible | Enabled by hook |

The architecture is sound - the context exists, it's just not flowing through to where decisions are made. Adding the hook is ~60 lines of changes in EdgeWorker.ts.
