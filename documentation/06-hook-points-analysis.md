# Hook Points Analysis: Cyrus Integration for Self-Improving AI

**Document Purpose:** Identify exactly where we can hook into the existing Cyrus codebase to implement the self-improving AI system described in the research documents, and what constraints exist.

**Created:** 2025-11-28
**Status:** Research complete - ready for implementation planning

---

## Executive Summary

The Cyrus codebase has **excellent hookability** for our self-improving system. Nine verified hook points exist across three key files, with clear integration paths requiring minimal code changes.

**Key Finding:** The architecture already supports most of what we need:
- Per-subroutine model selection (just needs config)
- Custom prompt loading (simple path override)
- Metrics collection (event-based system ready)
- Quality gates (hook framework exists)

**Main Gaps:**
- No parallel execution support (worktrees are sequential)
- Prompt assembly is monolithic (not plugin-based)
- No built-in A/B testing infrastructure

---

## Verified Hook Points

### Hook 1: Procedure Selection (Classification)

| Property | Value |
|----------|-------|
| **File** | `packages/edge-worker/src/procedures/ProcedureRouter.ts` |
| **Lines** | 126-165 |
| **Method** | `determineRoutine(requestText: string)` |
| **Hookability** | EXCELLENT |

**What it does:**
Uses SimpleClaudeRunner to classify Linear issues into request types (question, documentation, transient, planning, code, debugger, orchestrator) and selects the appropriate procedure.

**Current implementation:**
```typescript
async determineRoutine(requestText: string): Promise<RoutingDecision> {
  const result = await this.routingRunner.query(
    `Classify this Linear issue request:\n\n${requestText}`
  );
  const classification = result.response;
  const procedureName = getProcedureForClassification(classification);
  const procedure = this.procedures.get(procedureName);
  return {
    classification,
    procedure,
    reasoning: `Classified as "${classification}" → using procedure "${procedureName}"`
  };
}
```

**Self-improvement opportunities:**
- Capture classification decisions + actual outcomes for retraining
- A/B test different classification strategies
- Override classification based on learned patterns
- Analyze misclassifications to improve system prompt

---

### Hook 2: Subroutine Advancement

| Property | Value |
|----------|-------|
| **File** | `packages/edge-worker/src/AgentSessionManager.ts` |
| **Lines** | 285-428 |
| **Method** | `handleProcedureCompletion()` |
| **Hookability** | EXCELLENT |

**What it does:**
When a subroutine completes, decides whether to advance to the next subroutine, handles approval workflows, and emits `subroutineComplete` event.

**Current implementation:**
- Checks for next subroutine via `ProcedureRouter.getNextSubroutine()`
- Handles `requiresApproval` flag with webhook-based approval
- Emits events for monitoring

**Self-improvement opportunities:**
- Observe which transitions succeed vs. fail
- Track metrics per transition (time, cost, quality)
- Insert quality gates before advancing
- Dynamic procedure reordering based on success rates

---

### Hook 3: Subroutine Transition Handler

| Property | Value |
|----------|-------|
| **File** | `packages/edge-worker/src/EdgeWorker.ts` |
| **Lines** | 528-594 |
| **Method** | `handleSubroutineTransition()` |
| **Hookability** | GOOD |

**What it does:**
Loads the next subroutine's prompt from disk, resumes the Claude session with that prompt.

**Self-improvement opportunities:**
- Override prompt loading with custom paths
- Modify prompt content dynamically
- Inject metrics collection per phase
- Different model selection per subroutine

---

### Hook 4: Prompt Path Resolution (PRIMARY HOOK POINT)

| Property | Value |
|----------|-------|
| **File** | `packages/edge-worker/src/EdgeWorker.ts` |
| **Lines** | 4079-4118 |
| **Method** | `loadSubroutinePrompt(subroutine, workspaceSlug)` |
| **Hookability** | EXCELLENT - MINIMAL CHANGE |

**What it does:**
Loads subroutine prompts from `packages/edge-worker/src/prompts/subroutines/{promptPath}.md`.

**Current implementation:**
```typescript
private async loadSubroutinePrompt(
  subroutine: SubroutineDefinition,
  workspaceSlug?: string,
): Promise<string | null> {
  if (subroutine.promptPath === "primary") {
    return null;
  }

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const subroutinePromptPath = join(__dirname, "prompts", subroutine.promptPath);

  try {
    let prompt = await readFile(subroutinePromptPath, "utf-8");
    // Template substitution for workspace slug
    if (workspaceSlug) {
      prompt = prompt.replace(
        /https:\/\/linear\.app\/linear\/profiles\//g,
        `https://linear.app/${workspaceSlug}/profiles/`
      );
    }
    return prompt;
  } catch (error) {
    return null;
  }
}
```

**Proposed minimal change (~10 lines):**
```typescript
// Add at start of method:
const customPromptPath = join(
  process.env.CYRUS_HOME || path.join(os.homedir(), '.cyrus'),
  'evolved-prompts',
  subroutine.promptPath
);
try {
  const customPrompt = await readFile(customPromptPath, 'utf-8');
  console.log(`[EdgeWorker] Loaded evolved prompt for ${subroutine.name}`);
  // Apply workspace slug substitution
  return workspaceSlug ? customPrompt.replace(...) : customPrompt;
} catch {
  // Fall through to built-in prompt
}
```

**Self-improvement opportunities:**
- Load evolved prompts from `~/.cyrus/evolved-prompts/`
- A/B test prompt variants
- Workspace-specific prompt overrides
- Dynamic prompt generation based on context

---

### Hook 5: Model Selection Per Subroutine

| Property | Value |
|----------|-------|
| **File** | `packages/edge-worker/src/EdgeWorker.ts` |
| **Lines** | 2137-2217, 4246-4268 |
| **Method** | `determineRunnerFromLabels()`, `buildAgentRunnerConfig()` |
| **Hookability** | EXCELLENT |

**What it does:**
Selects runner (Claude/Gemini) and model based on issue labels. Supports: opus, sonnet, haiku for Claude; gemini-2.5-pro, gemini-2.5-flash for Gemini.

**Current implementation:**
- Label-based: `if (labels.includes("opus")) return { model: "opus" }`
- Falls back to repository default or config default

**Proposed minimal change:**
Add `preferredModel?: string` to `SubroutineDefinition` in `packages/edge-worker/src/procedures/types.ts`:
```typescript
export interface SubroutineDefinition {
  name: string;
  promptPath: string;
  description: string;
  maxTurns?: number;
  singleTurn?: boolean;
  requiresApproval?: boolean;
  preferredModel?: string;  // NEW: "opus" | "sonnet" | "haiku" | etc.
  disallowedTools?: string[];
}
```

Then in `buildAgentRunnerConfig()`:
```typescript
const model = currentSubroutine?.preferredModel ||
              modelOverride ||
              repository.model ||
              this.config.defaultModel;
```

**Self-improvement opportunities:**
- Opus for planning (quality), Sonnet for coding (efficiency), Haiku for summaries (cost)
- Track cost vs. quality per model per subroutine
- Adaptive model selection based on complexity

---

### Hook 6: Post Tool Use Hook (Framework Ready)

| Property | Value |
|----------|-------|
| **File** | `packages/edge-worker/src/EdgeWorker.ts` |
| **Lines** | 4223-4244 |
| **Method** | `buildAgentRunnerConfig()` hooks |
| **Hookability** | EXCELLENT - FRAMEWORK EXISTS |

**What it does:**
Allows inspection/modification of tool execution results before Claude sees them. Currently only handles `playwright_screenshot`.

**Current implementation:**
```typescript
const hooks: Partial<Record<HookEvent, HookCallbackMatcher[]>> = {
  PostToolUse: [
    {
      matcher: "playwright_screenshot",
      hooks: [
        async (input, _toolUseID, { signal: _signal }) => {
          return {
            continue: true,
            additionalContext: "Screenshot taken successfully..."
          };
        }
      ]
    }
  ]
};
```

**Self-improvement opportunities:**
- Add quality checks after every tool execution
- Log all tool executions for metrics
- Inject corrective feedback on tool failures
- Validate outputs before returning to Claude

---

### Hook 7: Message Handler

| Property | Value |
|----------|-------|
| **File** | `packages/edge-worker/src/EdgeWorker.ts` |
| **Lines** | 4294-4300 |
| **Method** | `buildAgentRunnerConfig()` onMessage |
| **Hookability** | EXCELLENT |

**What it does:**
Receives all Claude messages (streaming), routes to AgentSessionManager.

**Current implementation:**
```typescript
onMessage: (message: SDKMessage) => {
  this.handleClaudeMessage(
    linearAgentActivitySessionId,
    message,
    repository.id
  );
}
```

**Self-improvement opportunities:**
- Inspect all Claude outputs before posting to Linear
- Extract metrics and quality signals
- Filter or modify responses
- Log decision-making process

---

### Hook 8: Session Completion Handler

| Property | Value |
|----------|-------|
| **File** | `packages/edge-worker/src/AgentSessionManager.ts` |
| **Lines** | 216-254, 259-428 |
| **Method** | `completeSession()`, `handleProcedureCompletion()` |
| **Hookability** | GOOD |

**What it does:**
Processes final results, checks for next subroutines, handles approval workflows.

**Self-improvement opportunities:**
- Capture outcomes for learning
- Measure quality of completion
- Adjust future procedures based on success
- Log metrics (tokens, time, cost)

---

### Hook 9: Session Initialization

| Property | Value |
|----------|-------|
| **File** | `packages/edge-worker/src/EdgeWorker.ts` |
| **Lines** | 1129-1213, 1318+ |
| **Method** | `createLinearAgentSession()`, `initializeAgentRunner()` |
| **Hookability** | MEDIUM (complex flow) |

**What it does:**
Creates workspace, downloads attachments, initializes procedure metadata, performs AI-based routing, selects runner.

**Self-improvement opportunities:**
- Hook into workspace creation for custom setup
- Pre-process attachments
- Inject custom tools per session
- Capture initial session metrics

---

## Architecture Flow Diagram

```
Linear Webhook (agentSessionCreated/agentSessionPrompted)
    │
    ▼
[RepositoryRouter] - Route to correct repository
    │
    ▼
[initializeAgentRunner] - Create workspace, download attachments
    │
    ▼
╔══════════════════════════════════════════════════════════╗
║  HOOK 1: ProcedureRouter.determineRoutine()              ║
║  → Classification decision point                          ║
║  → Can capture outcomes, A/B test strategies              ║
╚══════════════════════════════════════════════════════════╝
    │
    ▼
╔══════════════════════════════════════════════════════════╗
║  HOOK 4: loadSubroutinePrompt()                          ║
║  → Primary hook for evolved prompts                       ║
║  → Check ~/.cyrus/evolved-prompts/ before built-in        ║
╚══════════════════════════════════════════════════════════╝
    │
    ▼
╔══════════════════════════════════════════════════════════╗
║  HOOK 5: Model Selection                                  ║
║  → Per-subroutine model override                          ║
║  → Opus for planning, Sonnet for coding                   ║
╚══════════════════════════════════════════════════════════╝
    │
    ▼
[ClaudeRunner.start()] - Start streaming Claude session
    │
    ▼
╔══════════════════════════════════════════════════════════╗
║  HOOK 6 & 7: PostToolUse + onMessage                     ║
║  → Quality checks, metrics logging                        ║
║  → Output validation before Linear posting                ║
╚══════════════════════════════════════════════════════════╝
    │
    ▼
╔══════════════════════════════════════════════════════════╗
║  HOOK 8: completeSession() → handleProcedureCompletion() ║
║  → Capture final outcomes                                 ║
║  → Metrics: tokens, time, success/failure                 ║
╚══════════════════════════════════════════════════════════╝
    │
    ▼
[Has next subroutine?]
    │
YES ▼
╔══════════════════════════════════════════════════════════╗
║  HOOK 2 & 3: Subroutine Advancement                      ║
║  → Quality gate before advancing                          ║
║  → Dynamic procedure reordering                           ║
║  → Resume with new prompt → Loop back                     ║
╚══════════════════════════════════════════════════════════╝
    │
NO  ▼
[Post final result to Linear]
```

---

## Constraint Analysis: What We CAN'T Hook Into Easily

### 1. Parallel Worktree Execution

**Current State:** Worktrees are created sequentially via `handlers?.createWorkspace()` callback. No built-in support for running multiple worktrees in parallel on the same issue.

**Why it's hard:**
- Session state is tied to a single worktree
- Linear integration expects one active session per issue
- AgentSessionManager tracks one session at a time

**Workaround:** Create sub-issues via Linear MCP, each gets its own session/worktree.

**Effort to fix properly:** HIGH (200+ lines, architectural change)

---

### 2. Prompt Assembly Logic

**Current State:** The `buildInitialPrompt()` method (lines 3870-4015) is a monolithic multi-step composition that handles system prompts, issue context, subroutine prompts, user comments, and guidance rules.

**Why it's hard:**
- Not designed as a plugin system
- Many interdependencies between components
- Would need significant refactoring for extensibility

**Workaround:** Use the prompt path override (Hook 4) to replace entire prompts.

**Effort to fix properly:** MEDIUM (150 lines, but risky refactor)

---

### 3. MCP Configuration

**Current State:** MCP servers are configured in `buildMcpConfig()` (lines 3610-3790), injected at runner creation. Adding new MCPs requires config changes.

**Why it's hard:**
- Tight coupling to Linear + Cyrus tools
- No dynamic MCP registration

**Workaround:** Configure MCPs in `~/.cyrus/config.json` at repository level.

**Effort to fix properly:** LOW (existing config system supports it)

---

### 4. Real-Time Session Persistence

**Current State:** Session state is loaded at EdgeWorker startup and serialized post-completion. No real-time persistence mechanism.

**Why it's hard:**
- Persistence happens in batches
- No streaming persistence of intermediate state

**Impact:** If session crashes mid-execution, progress may be lost.

**Effort to fix properly:** MEDIUM (100 lines, needs careful error handling)

---

### 5. Tool Filtering

**Current State:** `buildAllowedTools()` and `buildDisallowedTools()` have hard-coded hierarchies per subroutine.

**Why it's hard:**
- Would need extensible configuration system
- `disallowedTools` in SubroutineDefinition is limited

**Workaround:** `disallowedTools` field in SubroutineDefinition already works.

**Effort to fix properly:** LOW (existing mechanism, just needs extension)

---

## Minimal Changes Required for Self-Improving System

### Phase 1: Data Collection (Zero Code Changes Possible)

**Use existing logging:**
- Sessions already log to `~/.cyrus/logs/`
- Contains: model, timestamps, tool calls, results
- Can analyze existing logs for training data

**Capture missing data by:**
1. Adding metrics fields to session metadata (5 lines)
2. Logging classification outcomes (10 lines)

---

### Phase 2: Custom Prompt Loading (10 Lines)

**File:** `packages/edge-worker/src/EdgeWorker.ts`
**Location:** `loadSubroutinePrompt()` method

```typescript
// At start of method, before existing path resolution:
const customPromptPath = join(
  process.env.CYRUS_HOME || path.join(os.homedir(), '.cyrus'),
  'evolved-prompts',
  subroutine.promptPath
);
try {
  const customPrompt = await readFile(customPromptPath, 'utf-8');
  if (workspaceSlug) {
    return customPrompt.replace(/https:\/\/linear\.app\/linear\/profiles\//g,
      `https://linear.app/${workspaceSlug}/profiles/`);
  }
  return customPrompt;
} catch {
  // Fall through to built-in prompt
}
```

---

### Phase 3: Per-Subroutine Model Selection (15 Lines)

**File 1:** `packages/edge-worker/src/procedures/types.ts`
```typescript
export interface SubroutineDefinition {
  // ... existing fields
  preferredModel?: string;  // Add this
}
```

**File 2:** `packages/edge-worker/src/EdgeWorker.ts` (in model selection logic)
```typescript
const currentSubroutine = this.procedureRouter.getCurrentSubroutine(session);
const model = currentSubroutine?.preferredModel ||
              modelOverride ||
              repository.model ||
              this.config.defaultModel;
```

**File 3:** Procedure definitions (e.g., `full-development.ts`)
```typescript
{
  name: "preparation",
  promptPath: "subroutines/preparation.md",
  preferredModel: "opus",  // Use Opus for planning
  // ...
},
{
  name: "coding-activity",
  promptPath: "subroutines/coding-activity.md",
  preferredModel: "sonnet",  // Use Sonnet for coding
  // ...
}
```

---

### Phase 4: Metrics Collection Hook (50 Lines)

**Add to `handleProcedureCompletion()`:**
```typescript
// After subroutine completes, before advancing:
const metrics = {
  sessionId: linearAgentActivitySessionId,
  subroutine: currentSubroutine?.name,
  model: session.metadata?.model,
  startTime: session.metadata?.startTime,
  endTime: Date.now(),
  success: resultMessage.subType === "success",
  tokenUsage: resultMessage.totalTokenUsage,
  toolCalls: session.metadata?.toolCallCount
};

// Write to metrics file
const metricsPath = path.join(
  process.env.CYRUS_HOME || path.join(os.homedir(), '.cyrus'),
  'metrics',
  `${linearAgentActivitySessionId}.jsonl`
);
await fs.appendFile(metricsPath, JSON.stringify(metrics) + '\n');
```

---

### Phase 5: Quality Gate Hook (75 Lines)

**Add new hook type in `buildAgentRunnerConfig()`:**
```typescript
// Add BeforeLinearPost hook (conceptual)
onBeforeLinearPost: async (content: string, session: CyrusAgentSession) => {
  // Run deterministic checks
  const checks = await runQualityChecks(content, session);

  if (!checks.pass) {
    // Optionally: trigger re-iteration instead of posting
    return { post: false, reason: checks.failures };
  }

  return { post: true };
}
```

---

## Implementation Priority Summary

| Phase | Description | Lines | Effort | Impact |
|-------|-------------|-------|--------|--------|
| 1 | Metrics logging (existing logs) | 0 | None | Low |
| 2 | Custom prompt path override | 10 | Easy | HIGH |
| 3 | Per-subroutine model selection | 15 | Easy | HIGH |
| 4 | Metrics collection hook | 50 | Medium | Medium |
| 5 | Quality gate hook | 75 | Medium | HIGH |
| TOTAL | | ~150 | 1-2 days | Complete foundation |

---

## Recommendation

**Start with Phase 2 (custom prompts) and Phase 3 (model selection).**

These two changes (~25 lines total) unlock:
- A/B testing of evolved prompts
- Opus for planning, Sonnet for coding
- Foundation for all other self-improvement features

The existing event-based architecture and logging system provide everything else needed for initial experiments.

**Parallel execution (farming non-determinism) requires the sub-issue workaround** via Linear MCP until we decide if the architectural changes are worth it.

---

## File Locations Quick Reference

| Hook | File | Lines | Change Difficulty |
|------|------|-------|-------------------|
| Procedure Selection | `ProcedureRouter.ts` | 126-165 | Easy |
| Subroutine Advancement | `AgentSessionManager.ts` | 285-428 | Easy |
| Transition Handler | `EdgeWorker.ts` | 528-594 | Medium |
| **Prompt Loading** | `EdgeWorker.ts` | 4079-4118 | **Easy** |
| **Model Selection** | `EdgeWorker.ts` | 2137-2217, 4246 | **Easy** |
| Session Init | `EdgeWorker.ts` | 1129-1213, 1318+ | Hard |
| Message Handler | `EdgeWorker.ts` | 4294-4300 | Easy |
| Completion Handler | `AgentSessionManager.ts` | 216-428 | Medium |
| Post Tool Hook | `EdgeWorker.ts` | 4223-4244 | Easy |

---

## Next Steps

1. **Implement Phase 2 & 3** - Custom prompts + model selection (25 lines)
2. **Create `~/.cyrus/evolved-prompts/` directory structure**
3. **Test with one subroutine** - Verify prompt override works
4. **Analyze existing logs** - Build initial training dataset
5. **Design DSPy integration** - Based on research documents

---

**Document Status:** Complete
**Ready for:** Implementation planning
