# Cyrus Complete Orchestration Flow

**Purpose:** Document the ENTIRE execution system - every procedure, every subroutine, every prompt, every decision point.

---

## Overview

Cyrus processes issues through **procedures**. Each procedure is a sequence of **subroutines**. Each subroutine loads a **prompt** and executes Claude/Gemini.

```
Issue → Classification → Procedure → Subroutine[0] → Subroutine[1] → ... → Done
```

---

## 1. All Procedures (7 Total)

| Procedure | Subroutine Count | Subroutine Sequence |
|-----------|------------------|---------------------|
| `simple-question` | 2 | question-investigation → question-answer |
| `documentation-edit` | 3 | primary → git-gh → concise-summary |
| `full-development` | 4 | coding-activity → verifications → git-gh → concise-summary |
| `debugger-full` | 6 | debugger-reproduction → get-approval → debugger-fix → verifications → git-gh → concise-summary |
| `orchestrator-full` | 2 | primary → concise-summary |
| `plan-mode` | 2 | preparation → plan-summary |

---

## 2. All Subroutines (14 Total)

| Subroutine | Prompt File | Type | Special Flags |
|------------|-------------|------|---------------|
| `primary` | **SPECIAL** (label-resolved) | Multi-turn | - |
| `question-investigation` | `subroutines/question-investigation.md` | Multi-turn | - |
| `question-answer` | `subroutines/question-answer.md` | Single-turn | suppressThoughts, noComment |
| `coding-activity` | `subroutines/coding-activity.md` | Multi-turn | - |
| `verifications` | `subroutines/verifications.md` | Multi-turn | - |
| `git-gh` | `subroutines/git-gh.md` | Multi-turn | - |
| `concise-summary` | `subroutines/concise-summary.md` | Single-turn | suppressThoughts, noComment |
| `verbose-summary` | `subroutines/verbose-summary.md` | Single-turn | suppressThoughts, noComment |
| `debugger-reproduction` | `subroutines/debugger-reproduction.md` | Multi-turn | - |
| `get-approval` | `subroutines/get-approval.md` | Single-turn | **requiresApproval** |
| `debugger-fix` | `subroutines/debugger-fix.md` | Multi-turn | - |
| `preparation` | `subroutines/preparation.md` | Multi-turn | - |
| `plan-summary` | `subroutines/plan-summary.md` | Single-turn | suppressThoughts, noComment |

---

## 3. All Prompt Files

### Subroutine Prompts (12 files)
```
packages/edge-worker/src/prompts/subroutines/
├── coding-activity.md
├── concise-summary.md
├── debugger-fix.md
├── debugger-reproduction.md
├── get-approval.md
├── git-gh.md
├── plan-summary.md
├── preparation.md
├── question-answer.md
├── question-investigation.md
├── verbose-summary.md
└── verifications.md
```

### System Prompts (4 files)
```
packages/edge-worker/prompts/
├── builder.md          ← For feature implementation
├── debugger.md         ← For bug fixing
├── scoper.md           ← For PRD/spec creation
└── orchestrator.md     ← For issue decomposition
```

### Shared Instructions
```
packages/edge-worker/prompts/
└── todolist-system-prompt-extension.md
```

---

## 4. Classification → Procedure Mapping

| Classification | Procedure | When Used |
|----------------|-----------|-----------|
| `question` | simple-question | "How does X work?", "What is Y?" |
| `documentation` | documentation-edit | "Update README", "Add docstrings" |
| `transient` | simple-question | "Search web for X", "Check Linear" |
| `planning` | plan-mode | Vague requests needing clarification |
| `code` | full-development | Clear bug fixes, features, tests |
| `debugger` | debugger-full | **EXPLICIT**: "Debug with approval" |
| `orchestrator` | orchestrator-full | **EXPLICIT**: "Break into sub-issues" |

---

## 5. Label-Based Overrides

Before AI classification, labels are checked:

| Label Match | Action | Procedure |
|-------------|--------|-----------|
| Has debugger labels | Skip AI, use directly | debugger-full |
| Has orchestrator labels | Skip AI, use directly | orchestrator-full |
| No override labels | Use AI classification | (varies) |

---

## 6. System Prompt Selection

The `primary` subroutine is special - its prompt comes from labels:

| Label Match | System Prompt Used |
|-------------|-------------------|
| debugger labels (e.g., "bug") | `prompts/debugger.md` |
| builder labels (e.g., "feature") | `prompts/builder.md` |
| scoper labels (e.g., "prd") | `prompts/scoper.md` |
| orchestrator labels (e.g., "epic") | `prompts/orchestrator.md` |
| No match | Shared instructions only |

---

## 7. Complete Execution Sequences

### Sequence A: Simple Question

```
Issue: "How does authentication work?"
    │
    ▼
Classification: "question"
    │
    ▼
Procedure: simple-question
    │
    ├─► [0] question-investigation
    │       Prompt: subroutines/question-investigation.md
    │       Type: Multi-turn
    │       Task: Search codebase, read files, gather info
    │       Output: "Investigation complete"
    │
    └─► [1] question-answer ✓ DONE
            Prompt: subroutines/question-answer.md
            Type: Single-turn
            Flags: suppressThoughts, noComment
            Task: Format and post final answer
            Output: Answer posted to Linear
```

### Sequence B: Full Development

```
Issue: "Add user profile page"
    │
    ▼
Classification: "code"
    │
    ▼
Procedure: full-development
    │
    ├─► [0] coding-activity
    │       Prompt: subroutines/coding-activity.md
    │       System: builder.md (if label matches)
    │       Type: Multi-turn
    │       Task: Write code, run tests locally
    │       DO NOT: commit, push, create PR
    │       Output: "Implementation complete"
    │
    ├─► [1] verifications
    │       Prompt: subroutines/verifications.md
    │       Type: Multi-turn
    │       Task: Run tests, lint, typecheck
    │       DO NOT: commit, push, create PR
    │       Output: "All checks passed"
    │
    ├─► [2] git-gh
    │       Prompt: subroutines/git-gh.md
    │       Type: Multi-turn
    │       Task: Commit, push, create/update PR
    │       Output: "PR created at [URL]"
    │
    └─► [3] concise-summary ✓ DONE
            Prompt: subroutines/concise-summary.md
            Type: Single-turn
            Flags: suppressThoughts, noComment
            Output: Summary posted to Linear
```

### Sequence C: Debugger Full (with Approval Gate)

```
Issue: "Debug login timeout" + label "bug"
    │
    ▼
Label Override: Has "bug" label → Skip AI classification
    │
    ▼
Procedure: debugger-full
    │
    ├─► [0] debugger-reproduction
    │       Prompt: subroutines/debugger-reproduction.md
    │       System: prompts/debugger.md
    │       Type: Multi-turn
    │       Task: Investigate, find root cause, create failing test
    │       DO NOT: Fix yet
    │       Output: Failing test + root cause analysis
    │
    ├─► [1] get-approval ⚠️ GATE
    │       Prompt: subroutines/get-approval.md
    │       Type: Single-turn
    │       Flag: requiresApproval=true
    │       Task: Request user approval
    │       Action: Posts approval button to Linear
    │       BLOCKS: Until user approves/rejects/gives feedback
    │
    ├─► [2] debugger-fix
    │       Prompt: subroutines/debugger-fix.md
    │       System: prompts/debugger.md
    │       Type: Multi-turn
    │       Task: Implement minimal fix
    │       Output: "Bug fixed, tests passing"
    │
    ├─► [3] verifications
    │       Prompt: subroutines/verifications.md
    │       Type: Multi-turn
    │       Task: Full quality assurance
    │       Output: "All checks passed"
    │
    ├─► [4] git-gh
    │       Prompt: subroutines/git-gh.md
    │       Type: Multi-turn
    │       Task: Commit, push, create PR
    │       Output: "PR created"
    │
    └─► [5] concise-summary ✓ DONE
            Prompt: subroutines/concise-summary.md
            Type: Single-turn
            Output: Summary posted
```

### Sequence D: Orchestrator Full

```
Issue: "Implement checkout flow" + label "epic"
    │
    ▼
Label Override: Has "epic" label → Skip AI classification
    │
    ▼
Procedure: orchestrator-full
    │
    ├─► [0] primary
    │       Prompt: SPECIAL (resolved to orchestrator.md)
    │       System: prompts/orchestrator.md
    │       Type: Multi-turn
    │       Role: Software architect
    │       Task:
    │         1. Analyze parent issue
    │         2. Create atomic sub-issues with:
    │            - Clear titles
    │            - Appropriate labels (bug/feature)
    │            - Model hints (sonnet for simple)
    │            - Acceptance criteria
    │         3. Delegate to child agents via:
    │            - mcp__cyrus-tools__linear_agent_session_create
    │         4. For EACH child (sequential, not parallel):
    │            - Wait for child completion
    │            - Navigate to child worktree
    │            - Run verification commands
    │            - If pass: merge branch
    │            - If fail: give feedback, await re-work
    │       Output: All sub-issues completed and merged
    │
    └─► [1] concise-summary ✓ DONE
            Prompt: subroutines/concise-summary.md
            Type: Single-turn
            Output: Summary posted
```

### Sequence E: Plan Mode

```
Issue: "Improve performance" (vague)
    │
    ▼
Classification: "planning"
    │
    ▼
Procedure: plan-mode
    │
    ├─► [0] preparation
    │       Prompt: subroutines/preparation.md
    │       Type: Multi-turn
    │       Task:
    │         - If unclear: Identify ambiguities
    │         - If clear: Break down into steps
    │       Output: "Preparation complete"
    │
    └─► [1] plan-summary ✓ DONE
            Prompt: subroutines/plan-summary.md
            Type: Single-turn
            Flags: suppressThoughts, noComment
            Output:
              - If unclear: Clarifying questions
              - If clear: Implementation plan
```

### Sequence F: Documentation Edit

```
Issue: "Update installation docs"
    │
    ▼
Classification: "documentation"
    │
    ▼
Procedure: documentation-edit
    │
    ├─► [0] primary
    │       Prompt: SPECIAL (label-resolved or shared)
    │       Type: Multi-turn
    │       Task: Edit documentation files
    │       Output: "Edits complete"
    │
    ├─► [1] git-gh
    │       Prompt: subroutines/git-gh.md
    │       Type: Multi-turn
    │       Task: Commit, push, create PR
    │       Output: "PR created"
    │
    └─► [2] concise-summary ✓ DONE
            Prompt: subroutines/concise-summary.md
            Type: Single-turn
            Output: Summary posted
```

---

## 8. Prompt Resolution Rules

### Rule 1: "primary" is Special

When `subroutine.promptPath === "primary"`:
1. Check issue labels against repository.labelPrompts config
2. Load matching system prompt (debugger/builder/scoper/orchestrator.md)
3. If no match, use shared instructions only
4. This becomes the SYSTEM prompt, not user prompt

### Rule 2: All Other Subroutines

When `subroutine.promptPath !== "primary"`:
1. Load file from `src/prompts/{promptPath}`
2. Apply template substitution (workspace slug)
3. This becomes part of the USER prompt

### Rule 3: Template Substitution

Currently only one substitution exists:
```
https://linear.app/linear/profiles/ → https://linear.app/{workspaceSlug}/profiles/
```

---

## 9. Subroutine Flags

| Flag | Effect | Used By |
|------|--------|---------|
| `singleTurn: true` | maxTurns = 1, exactly one response | question-answer, summaries, plan-summary, get-approval |
| `suppressThoughtPosting: true` | Don't post internal thoughts to Linear | All single-turn subroutines |
| `requiresApproval: true` | Pause workflow until user approves | get-approval only |
| `disallowedTools: [...]` | Block specific tools | Summaries block mcp__linear__create_comment |

---

## 10. Hook Points for Workflows

To build a workflow system, we need hooks at these points:

| Point | What Happens | What Hook Provides |
|-------|--------------|-------------------|
| **Procedure Selection** | AI classifies issue | Override classification |
| **Subroutine Sequence** | Static array from registry | Dynamic sequence |
| **Prompt Loading** | File read from disk | Custom prompt resolution |
| **System Prompt** | Label-based selection | Custom system prompt |
| **Model Selection** | Repository config | Per-subroutine model |
| **Subroutine Completion** | Advance to next | Custom transition logic |
| **Approval Gate** | Pause for user | Custom gates |

---

## 11. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ISSUE ASSIGNED                              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Fetch Issue Labels  │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
      ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
      │ Has debugger  │ │ Has orchestra │ │ No override   │
      │ label?        │ │ -tor label?   │ │ label         │
      └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
              │ YES             │ YES             │
              ▼                 ▼                 ▼
      ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
      │ debugger-full │ │orchestrator-  │ │ ProcedureRouter│
      │               │ │full           │ │ .classify()   │
      └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
              │                 │                 │
              └─────────────────┼─────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Initialize Procedure │
                    │  - procedureName      │
                    │  - subroutineIndex: 0 │
                    └───────────┬───────────┘
                                │
         ┌──────────────────────┴──────────────────────┐
         │                                             │
         ▼                                             │
┌─────────────────────────────────────────────────┐    │
│            SUBROUTINE EXECUTION LOOP            │    │
├─────────────────────────────────────────────────┤    │
│                                                 │    │
│  1. Get current subroutine                      │    │
│     subroutine = procedure.subroutines[index]   │    │
│                                                 │    │
│  2. Load prompt                                 │    │
│     IF promptPath == "primary":                 │    │
│       → Resolve from labels (system prompt)     │    │
│     ELSE:                                       │    │
│       → Load from src/prompts/{promptPath}      │    │
│                                                 │    │
│  3. Build issue context                         │    │
│     - Issue title, description                  │    │
│     - Comments                                  │    │
│     - Attachments                               │    │
│                                                 │    │
│  4. Execute Claude/Gemini                       │    │
│     - Apply subroutine flags                    │    │
│     - Run until completion                      │    │
│                                                 │    │
│  5. Post to Linear                              │    │
│     (unless suppressThoughtPosting)             │    │
│                                                 │    │
│  6. Handle approval (if requiresApproval)       │    │
│     - Post approval button                      │    │
│     - WAIT for user action                      │    │
│                                                 │    │
│  7. Advance to next subroutine                  │    │
│     index++                                     │    │
│     Record in subroutineHistory                 │    │
│                                                 │    │
└───────────────────────┬─────────────────────────┘    │
                        │                              │
                        ▼                              │
              ┌─────────────────────┐                  │
              │ More subroutines?   │──── YES ─────────┘
              │ (index < length)    │
              └─────────┬───────────┘
                        │ NO
                        ▼
              ┌─────────────────────┐
              │   PROCEDURE DONE    │
              └─────────────────────┘
```

---

## 12. What a Workflow Needs to Control

To replicate or extend this system, a workflow.ts needs:

### A. Subroutine Execution
```typescript
await ctx.runSubroutine({
  name: 'coding-activity',
  promptPath: 'subroutines/coding-activity.md',
  // OR
  prompt: 'Custom prompt content directly',
});
```

### B. Prompt Resolution (the key hook)
```typescript
// Instead of: load file from promptPath
// Allow: dynamic prompt selection

const prompt = await ctx.resolvePrompt({
  subroutineName: 'verifications',
  defaultPath: 'subroutines/verifications.md',
  context: {
    worktreePath: ctx.session.workspace.path,
    issueId: ctx.issue.id,
    labels: ctx.labels,
    // ... anything needed for A/B testing
  },
});
```

### C. System Prompt Selection
```typescript
// Instead of: label-based lookup
// Allow: dynamic system prompt

const systemPrompt = await ctx.resolveSystemPrompt({
  labels: ctx.labels,
  context: {
    worktreeId: extractWorktreeId(ctx.session.workspace.path),
    experimentGroup: hash(ctx.issue.id) % 2,
  },
});
```

### D. Conditional Flow
```typescript
// Retry logic
let result;
do {
  result = await ctx.runSubroutine({ name: 'verifications', ... });
} while (!result.success && attempts < 3);

// Conditional steps
if (ctx.labels.includes('needs-review')) {
  await ctx.runSubroutine({ name: 'get-approval', ... });
}
```

### E. Model Selection
```typescript
await ctx.runSubroutine({
  name: 'planning',
  promptPath: 'planning.md',
  model: 'opus',  // Quality for planning
});

await ctx.runSubroutine({
  name: 'coding',
  promptPath: 'coding.md',
  model: 'sonnet',  // Speed for coding
});
```

---

## 13. Summary: The Hook Points

| # | Hook Point | Current Behavior | What Hook Enables |
|---|------------|------------------|-------------------|
| 1 | Procedure Selection | AI classification + label override | Custom routing logic |
| 2 | Subroutine Sequence | Static array | Dynamic, conditional sequence |
| 3 | Prompt Path → Content | File read | A/B testing, worktree-specific, dynamic |
| 4 | System Prompt | Label lookup | Custom system prompt selection |
| 5 | Model Selection | Repository config | Per-subroutine model |
| 6 | Subroutine Transition | Auto-advance | Custom gates, retries |
| 7 | Completion Handling | Post to Linear | Custom post-processing |

The key insight: **Prompt resolution is the critical hook**. Everything else (execution, Linear posting, session management) can remain as-is. The workflow just needs to control:
1. What prompts are loaded (and from where)
2. What sequence they execute in
3. What model runs each step
