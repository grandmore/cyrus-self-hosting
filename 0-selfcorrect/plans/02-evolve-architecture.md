# Evolve: Self-Improving Agentic System Architecture

**Version:** 0.1
**Date:** 2025-12-01
**Status:** Draft - Capturing design discussion

---

## 1. The Core Problem

Cyrus runs agentic workflows (via Claude Code Agent SDK), but:
- Workflows are static - defined once, don't improve
- No systematic way to know if output is good
- No mechanism to try variations and keep what works
- Prompts may not be optimal for the task

**Goal:** Create a system that improves Cyrus's workflows automatically, while keeping Cyrus itself simple and unaware of the improvement process.

---

## 2. Two Separate Systems

### 2.1 Cyrus (The Agentic System)

**What it is:**
- Existing system using Claude Code Agent SDK
- Executes workflows defined in a config file
- Runs subroutines and commands as defined
- Outputs logs, code, PRs, results

**Key constraint:**
- Cyrus **cannot modify** its own workflow config
- It just executes what the config says
- Unaware it's being improved

**Why this constraint:**
- Prevents gaming its own evaluation
- Clean separation of concerns
- Can't accidentally break itself

### 2.2 Evolve (The Evolution System)

**What it is:**
- New package: `packages/evolution`
- Reads Cyrus's outputs and logs
- Grades quality of outputs
- Modifies workflow config to improve
- Tests if changes helped

**Permissions:**
- CAN read Cyrus logs/outputs
- CAN modify workflow.json
- CAN run grading prompts
- CAN compare before/after metrics

---

## 3. What Evolve Controls

Evolve doesn't just control the workflow sequence - it controls **everything** that determines behavior:

### 3.1 Two Levels of Evolution

| Level | What | Files | Example Change |
|-------|------|-------|----------------|
| **Workflow** | Sequence, steps, parameters | `workflow.json` | Add a research step before planning |
| **Prompts** | The actual instructions | `prompts/*.md` | Add "consider error handling" to planning prompt |

Both must evolve. A perfect workflow with bad prompts won't work. Perfect prompts in the wrong order won't work either.

### 3.2 Workflow Config (workflow.json)

Controls the flow:

```json
{
  "name": "deep-development",
  "version": "1.2.3",
  "steps": [
    {
      "id": "research",
      "type": "command",
      "prompt": "prompts/research.md",
      "description": "Explore codebase and document patterns",
      "outputs": ["docs/patterns.md"]
    },
    {
      "id": "plan",
      "type": "subroutine",
      "prompt": "prompts/planning.md",
      "description": "Create implementation plan from research",
      "inputs": ["docs/patterns.md"],
      "outputs": ["plan.md"]
    },
    {
      "id": "validate-plan",
      "type": "checkpoint",
      "requiresApproval": true,
      "description": "Human validates plan before implementation"
    },
    {
      "id": "implement",
      "type": "subroutine",
      "prompt": "prompts/implement.md",
      "iterate": true,
      "maxIterations": 5
    },
    {
      "id": "verify",
      "type": "subroutine",
      "prompt": "prompts/verify.md"
    },
    {
      "id": "commit",
      "type": "subroutine",
      "prompt": "prompts/git-gh.md"
    }
  ]
}
```

### 3.3 Prompt Files (prompts/*.md)

Each step references a prompt file that Evolve can modify:

```
evolve/
├── workflow.json           ← Flow control
├── prompts/
│   ├── research.md         ← What research step does
│   ├── planning.md         ← What planning step does
│   ├── implement.md        ← What implementation step does
│   ├── verify.md           ← What verification step does
│   └── git-gh.md           ← What commit step does
└── graders/
    ├── plan-quality.md     ← How to grade plans
    ├── code-quality.md     ← How to grade code
    └── outcome.md          ← How to grade final result
```

### 3.4 What Evolve Can Change

**Workflow changes:**
- Add/remove steps
- Reorder steps
- Change step parameters (iterations, approvals)
- Add conditional logic
- Add parallel execution

**Prompt changes:**
- Add instructions ("always consider error handling")
- Remove instructions (if causing problems)
- Clarify vague instructions
- Add examples
- Change tone/style
- Add constraints

**Grader changes:**
- Adjust what constitutes "good"
- Add/remove evaluation criteria
- Change scoring weights

### 3.5 Benefits of This Separation

| Aspect | Benefit |
|--------|---------|
| **Versioning** | Can version workflow and prompts independently |
| **Debugging** | Know if issue is flow or prompt |
| **Rollback** | Can rollback just the prompt that broke |
| **Experimentation** | A/B test prompts without changing flow |
| **Granularity** | Small, targeted changes |

---

## 4. Mixing Commands and Subroutines

### Why Both?

| Type | Source | Benefit |
|------|--------|---------|
| **Subroutines** | Cyrus's `prompts/subroutines/*.md` | Integrated with EdgeWorker flow |
| **Commands** | Claude Code's `.claude/commands/*.md` | Can run manually, easier to iterate |

### When to Use Each

- **Subroutines:** Core workflow steps that need EdgeWorker integration (session management, Linear posting, etc.)
- **Commands:** Experimental steps, research tasks, anything you want to test by hand first

### The Flow

```
workflow.json defines step
        │
        ├── type: "subroutine" → EdgeWorker loads from prompts/subroutines/
        │
        └── type: "command" → Claude Code runs from .claude/commands/
```

---

## 5. The Grading System

### 5.1 Why Grading?

To know if a change is an improvement, we need to measure quality. Grading provides:
- Objective (or at least consistent) quality scores
- Ability to compare before/after
- Signal for what to improve

### 5.2 Grading Hierarchy

```
Level 0: Cyrus outputs
         (code, PRs, test results, logs)
              │
              ▼
Level 1: Graders
         Prompted to evaluate outputs
         "Did this code solve the problem?"
         "Does the plan cover all requirements?"
              │
              ▼
Level 2: Meta-Graders
         Grade the graders
         "Was the grader's assessment correct?"
         "Did the grader catch the real issues?"
```

### 5.3 Why Meta-Graders?

Without meta-graders:
- A bad grader says everything is great
- System thinks it's improving when it's not
- Garbage in, garbage out

With meta-graders:
- Catches graders that are too lenient/strict
- Validates grading criteria
- Can improve the graders themselves

### 5.4 Grader Types

| Grader | What It Evaluates | How |
|--------|-------------------|-----|
| **Test Grader** | Did tests pass? | Deterministic - read test output |
| **Build Grader** | Does it compile/build? | Deterministic - read build output |
| **Plan Grader** | Is the plan complete? | Prompted - LLM evaluates plan |
| **Code Grader** | Is the code quality good? | Prompted - LLM reviews code |
| **Outcome Grader** | Did it achieve the goal? | Prompted - compare to original task |

---

## 6. Evolve's Understanding of Cyrus

### The Problem

Evolve can't improve what it doesn't understand. Blind optimization (random changes, see if metrics go up) is inefficient.

### What Evolve Needs to Know

| Knowledge | Purpose |
|-----------|---------|
| **Workflow structure** | What steps exist, in what order |
| **Step descriptions** | What each step is supposed to achieve |
| **Task input** | What was requested |
| **Task output** | What was produced |
| **Logs** | What happened during execution |
| **Grader feedback** | What was good/bad about output |

### How Evolve Reasons

```
1. Read: Task was "add user authentication"
2. Read: Workflow used was [research → plan → implement → verify]
3. Read: Implementation failed - "missing password hashing"
4. Read: Grader said: "Security requirement not addressed"
5. Reason: Plan step didn't include security research
6. Hypothesis: Add "security-research" step before planning
7. Modify: workflow.json with new step
8. Test: Run again, see if grader score improves
```

---

## 7. Building Knowledge First

### The Insight

Quality out requires quality in. Before Cyrus plans or implements, it needs context:
- How does this codebase work?
- What patterns are used?
- What libraries are available?
- What has been tried before?

### The Knowledge Building Process

```
FIRST (before any task):
  Run research commands (manually or automated)
  Build documentation:
    - docs/patterns.md
    - docs/libraries.md
    - docs/architecture.md
    - docs/lessons-learned.md

THEN (for each task):
  Step 1: Read relevant knowledge
  Step 2: Plan with that context
  Step 3: Implement with that context
```

### Why This Improves Quality

- Better context → better planning
- Better planning → better implementation
- Documented patterns → consistent code
- Lessons learned → don't repeat mistakes

---

## 8. Iterative Development (TDD Style)

### The Pattern

```
workflow step: {
  "id": "implement",
  "type": "subroutine",
  "name": "coding-activity",
  "iterate": true,
  "iterationPattern": "tdd",
  "maxIterations": 5
}
```

### TDD Cycle in Workflow

```
Iteration 1: Write failing test
Iteration 2: Write minimal code to pass
Iteration 3: Refactor if needed
(repeat until done or max iterations)
```

### Alternative: TDD Guard

Instead of explicit iterations, use TDD Guard hooks:
- Block implementation unless failing test exists
- Block more code unless current tests pass
- Enforced by Claude Code hooks, not prompts

---

## 9. Self-Improvement Loop

### How Evolve Improves the System

```
┌──────────────────────────────────────────────────────────────┐
│  1. Cyrus runs workflow v1.0 on Task A                       │
│     → Outputs: code, logs, results                           │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  2. Evolve grades output                                     │
│     → Graders score: 0.6 (not great)                         │
│     → Grader feedback: "Missing error handling"              │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  3. Evolve reasons about improvement                         │
│     → "Error handling not mentioned in plan"                 │
│     → "Plan step doesn't prompt for error cases"             │
│     → Hypothesis: Add error-case-analysis to plan step       │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  4. Evolve modifies workflow.json → v1.1                     │
│     → Adds: "Consider error cases" to plan step description  │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  5. Cyrus runs workflow v1.1 on Task B                       │
│     → Outputs: code, logs, results                           │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  6. Evolve grades output                                     │
│     → Graders score: 0.8 (better!)                           │
│     → Keep v1.1, try more improvements                       │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
                    (repeat loop)
```

### Monotonic Acceptance

Only accept changes that improve scores:
- If v1.1 is worse than v1.0, revert
- If v1.1 is same, maybe keep (more data needed)
- If v1.1 is better, keep and try more

---

## 10. Farming Non-Determinism

### The Problem with Single Runs

If you ask Claude to "create 3 plans and pick the best":
- It optimizes for #1
- Invents #2 and #3 as filler
- Not real variation

### The Solution: Parallel Sessions

```
Evolve spawns:
├── Session A: "Create a plan for X"
├── Session B: "Create a plan for X" (same prompt)
└── Session C: "Create a plan for X" (same prompt)

Each runs independently, gets different output (non-determinism)

Evolve then:
├── Collects all 3 plans
├── Uses DIFFERENT model (Gemini/GPT) to evaluate
└── Picks winner based on grading
```

### Why This Works

- Each session genuinely tries its best
- No session knows about the others
- Different model does evaluation (can't favor itself)
- True variation from non-determinism

---

## 11. Implementation Phases

### Phase 1: Foundation
- [ ] Create `packages/evolution` package
- [ ] Define workflow.json schema
- [ ] Create workflow runner that mixes commands + subroutines
- [ ] Basic logging of all outputs

### Phase 2: Grading
- [ ] Implement deterministic graders (tests, build)
- [ ] Implement prompted graders (plan quality, code quality)
- [ ] Create grading storage (scores over time)
- [ ] Basic meta-grader for prompted graders

### Phase 3: Knowledge Building
- [ ] Research command that explores codebase
- [ ] Documentation generation and storage
- [ ] Context injection into planning step
- [ ] Lessons learned capture

### Phase 4: Self-Improvement
- [ ] Evolve reads outputs and grades
- [ ] Evolve proposes workflow changes
- [ ] A/B testing of workflow versions
- [ ] Monotonic acceptance of improvements

### Phase 5: Advanced
- [ ] Parallel session farming
- [ ] Cross-model evaluation
- [ ] Grader improvement loop
- [ ] Meta-grader improvement

---

## 12. Relationship to DSPy

Plan 01 describes using DSPy for backward grading. How does that fit?

### DSPy as Implementation Option

DSPy could be used for:
- The grading/optimization logic inside Evolve
- Automatic backward credit assignment
- Prompt optimization within steps

### But Evolve is Broader

Evolve handles:
- The separation of systems (Cyrus can't modify itself)
- The workflow config approach
- Knowledge building
- Meta-grading
- Integration with Cyrus's existing architecture

### They Can Work Together

```
Evolve (orchestrates everything)
    │
    ├── Uses DSPy for prompt optimization
    ├── Uses DSPy for backward grading
    └── But also handles: permissions, config, knowledge, meta-grading
```

---

## 13. Key Design Principles

1. **Separation of Concerns**
   - Cyrus runs, Evolve improves
   - Never mixed

2. **Config as Interface**
   - workflow.json is the contract
   - Small changes, big effects

3. **Grading Everything**
   - Can't improve what you can't measure
   - Grade outputs AND graders

4. **Monotonic Progress**
   - Only accept improvements
   - Never regress

5. **Understanding Before Optimization**
   - Evolve must understand what Cyrus is trying to do
   - Blind optimization is inefficient

6. **Knowledge First**
   - Research before planning
   - Context improves quality

7. **Non-Determinism as Feature**
   - Multiple runs give variation
   - Pick best from genuine alternatives

---

## 14. Open Questions

1. **Config Schema:** What exactly goes in workflow.json? Need to define precisely.

2. **Step Types:** What types beyond "command" and "subroutine"? Conditional? Parallel?

3. **Grader Prompts:** How are graders defined? Inline in config or separate files?

4. **Meta-Grader Frequency:** How often do we grade the graders? Every run? Periodically?

5. **Human Checkpoints:** How do approval steps work? Blocking? Async?

6. **Parallel Execution:** How do we run parallel sessions within Cyrus's architecture?

7. **DSPy Integration:** Use DSPy inside Evolve, or build our own optimization?

8. **Storage:** Where do grades, logs, knowledge live? File system? Database?

---

## 15. Next Steps

1. **Define workflow.json schema** - Precisely what fields, types, validation

2. **Prototype workflow runner** - Execute a simple config with mixed steps

3. **Implement basic graders** - Start with deterministic (test pass/fail)

4. **Create knowledge building command** - Research and document codebase

5. **Test on simple task** - Run full loop on one real issue

---

**Document Status:** Initial draft from design discussion
**Next Review:** After workflow.json schema is defined
