# Minimal Evolution Architecture: Testing Ideas Before Building Systems

## Document Purpose

This document captures our discussion about building an evolutionary self-improvement system for Cyrus with the **lightest possible footprint**. The core question: Can we achieve self-improvement through prompts and minimal code rather than complex frameworks?

## The Central Philosophy

### Evolve the Evolver

We're not just improving prompts - we're building a system that improves **itself**:

```
Level 1: Prompts generate code
Level 2: Graders evaluate code quality
Level 3: Meta-graders evaluate grader quality
Level 4: The evaluation criteria themselves evolve
```

Each level should be:
- Prompt-driven where possible
- Minimal deterministic code where necessary
- Easily testable and replaceable
- Able to be evolved independently

### Question: Is DSPy/TensorZero Over-Engineering?

**Arguments FOR using DSPy:**
- Built specifically for LLM pipeline optimization
- Production-proven (23,000 GitHub stars)
- Backward evaluation built-in
- Handles variable-length pipelines

**Arguments AGAINST:**
- Another framework to maintain
- May be overkill for our needs
- We want to evolve our own system, not depend on theirs
- Adds complexity when we want simplicity

**Our Approach:** Test the lightest version first. If simple prompt chains achieve what DSPy does, we don't need DSPy. If we hit limits, we know exactly what we need.

## The Minimal System: What We Actually Need

### Core Capability 1: Parallel Execution (Farming Non-Determinism)

**What it does:**
- Run 3 instances of the same task
- Compare outputs
- Pick the best

**Lightest implementation:**
```
1. Planning creates spec
2. Linear MCP creates 3 sub-issues (impl-A, impl-B, impl-C)
3. Existing Cyrus handles each in separate worktrees
4. Compare results
```

**Code required:** Zero. Just prompt changes.

### Core Capability 2: Visual Testing (The System Can See)

**What it does:**
- System can view its own output (UI, screenshots, browser)
- Verify visual correctness against spec
- Catch issues automated tests miss

**Required MCPs:**
- **Playwright MCP** - Browser automation, screenshot capture
- **Gemini Vision MCP** (or Claude Vision) - Analyze screenshots
- **DOM inspection** - Verify element positions, styles

**Implementation approach:**
```
After code generation:
1. Playwright runs the application
2. Takes screenshots of key views
3. Vision model compares to spec requirements
4. Returns pass/fail with specific issues
```

**Question:** Does Cyrus already have this? Check:
- `packages/claude-runner/src/tools/` for existing MCPs
- Whether Claude Code has built-in browser capabilities

### Core Capability 3: Iterative Testing Loop

**What it does:**
- Write code
- Check against spec (visual + tests)
- If fails, iterate with specific feedback
- Continue until correct or max iterations reached

**The loop:**
```
while not (tests_pass AND visual_match AND spec_satisfied):
    if attempt > MAX_ATTEMPTS:
        escalate_to_human()
        break

    # Get specific failures
    failures = collect_failures(test_results, visual_check, spec_check)

    # Feed back to Claude for iteration
    revised_code = iterate_with_feedback(current_code, failures)

    # Re-run checks
    test_results = run_tests()
    visual_check = run_visual_verification()
    spec_check = check_spec_compliance()

    attempt += 1
```

**Key insight:** This is NOT new code in Cyrus. This is a **prompt pattern** that instructs Claude to iterate.

### Core Capability 4: PR Review Cycle

**What it does:**
- Code complete → Create PR
- PR triggers Claude Code review in GitHub
- Review feedback comes back
- Changes made in worktree (or new iteration)

**Flow:**
```
Worktree (coding complete)
    ↓
Create PR via GitHub MCP
    ↓
GitHub Actions triggers Claude Code review
    ↓
Review comments posted to PR
    ↓
Option A: Feed comments back to worktree Claude for fixes
Option B: Claude Code review makes fixes directly in PR branch
    ↓
Re-review until approved
    ↓
Merge
```

**Question:** Should review happen:
- In the worktree before PR? (catch issues earlier)
- In GitHub after PR? (cleaner separation)
- Both? (defense in depth)

**Likely answer:** Review in worktree first (self-review), then external review in GitHub. Two-tier.

## Technology Choices: Testing Different Approaches

### Option A: LangGraph for Agent Coordination

**What it is:** Graph-based orchestration of LLM agents

**Pros:**
- Visual graph of agent interactions
- Built-in state management
- Conditional branching
- Parallel execution support

**Cons:**
- Python-only
- Another framework to learn
- May be overkill for linear workflows

**Best for:** Complex multi-agent workflows with conditional logic

### Option B: Claude Agent SDK

**What it is:** Anthropic's official agent framework

**Pros:**
- Native Claude integration
- TypeScript available
- Already used by Cyrus
- Same tools, same patterns

**Cons:**
- Less mature than LangGraph
- Fewer examples

**Best for:** Claude-centric workflows, existing Cyrus integration

### Option C: Simple Prompt Chains (No Framework)

**What it is:** Just prompts calling prompts

**Pros:**
- Zero framework overhead
- Maximum flexibility
- Easiest to evolve
- No dependencies

**Cons:**
- Manual state management
- Less structure

**Best for:** Testing ideas quickly before committing to a framework

### Our Approach: Test All Three

Create minimal implementations of the same capability using each approach:

```
Test Case: "Plan → Code → Test → Review → Fix" cycle

Implementation A: LangGraph version
Implementation B: Claude Agent SDK version
Implementation C: Pure prompt chain version

Measure:
- Lines of code required
- Success rate on 10 test specs
- Iteration count to correct output
- Developer experience (ease of modification)
```

Let the data decide which approach wins.

## The Grader System: Two-Tier Evaluation

### Tier 1: Code Graders

**What they evaluate:**
- Does code pass tests?
- Does code match spec requirements?
- Does code follow patterns?
- Is code quality acceptable?

**Types of graders:**
```
1. Deterministic graders (preferred):
   - Test pass rate
   - Type error count
   - Lint error count
   - Build success/failure

2. Visual graders:
   - Screenshot comparison
   - DOM inspection
   - Layout verification

3. Semantic graders (LLM-based):
   - Spec compliance
   - Code readability
   - Architecture alignment
```

### Tier 2: Meta-Graders (Grading the Graders)

**What they evaluate:**
- Is the grader catching real issues?
- Is the grader missing issues that humans catch?
- Is the grader producing false positives?

**How to evaluate graders:**

```
1. Known-good test cases (should pass)
   - Run grader on verified-correct code
   - False positive rate = % incorrectly marked as failing

2. Known-bad test cases (should fail)
   - Run grader on verified-broken code
   - False negative rate = % incorrectly marked as passing

3. Human agreement
   - Sample of grader decisions reviewed by human
   - Agreement rate = % where human agrees with grader

4. Downstream impact
   - When grader approves code, does it work in production?
   - Production bug rate correlates to grader quality
```

### Evolving Graders

**The loop:**
```
1. Grader v1 evaluates code
2. Meta-grader evaluates Grader v1 (precision, recall, agreement)
3. If Grader v1 performance is poor:
   - Analyze failure patterns
   - Generate hypothesis for improvement
   - Create Grader v2 with modification
   - A/B test v1 vs v2
   - Deploy winner
4. Repeat
```

**Key insight:** Graders are prompts. Evolving graders = evolving prompts. The same recursive improvement applies.

## Hook Points in Cyrus (From Earlier Discussion)

### Where We Need to Hook

```
Hook 1: Procedure Selection
  Location: ProcedureRouter.determineRoutine()
  Purpose: Register custom procedures with parallel/iterative behavior

Hook 2: Subroutine Transition
  Location: AgentSessionManager.advanceToNextSubroutine()
  Purpose: Fork to parallel sessions when entering coding phase

Hook 3: Resume Callback
  Location: resumeNextSubroutine callback
  Purpose: Custom logic for what happens after subroutine completes

Hook 4: Prompt Loading
  Location: Prompt path resolution in EdgeWorker
  Purpose: Load evolved prompts from ~/.cyrus/evolved-prompts/
```

### Minimal Changes Required

1. **Prompt path override** (1 function change):
   - Check custom location before built-in
   - Allows prompt evolution without code changes

2. **Model per subroutine** (~5 lines):
   - Add `model?: string` to SubroutineDefinition
   - Use subroutine model when creating runner
   - Enables Opus for planning, Sonnet for coding

3. **Metrics logging** (new utility):
   - Log session outcomes to metrics.jsonl
   - Stage attribution (which stage caused failure)
   - Evidence for evolution analysis

## Testing Framework: Rapid Idea Validation

### The Test Harness

We need a simple way to test ideas:

```typescript
// test-idea.ts
interface Idea {
  name: string;
  description: string;
  implementation: () => Promise<Result>;
  metrics: MetricDefinition[];
}

async function testIdea(idea: Idea, testCases: TestCase[]): Promise<Report> {
  const results = [];

  for (const testCase of testCases) {
    const result = await idea.implementation(testCase);
    const scores = evaluateMetrics(result, idea.metrics);
    results.push({ testCase, result, scores });
  }

  return generateReport(idea, results);
}
```

### What We Can Test Quickly

| Idea | Test Approach | Time to Test |
|------|---------------|--------------|
| 3 parallel worktrees | Create 3 sub-issues via Linear MCP | 1 hour |
| Visual verification | Add Playwright + Vision MCP | 2-4 hours |
| Iterative fixing loop | Prompt pattern with retry logic | 30 min |
| PR review cycle | GitHub Actions + Claude Code | 2 hours |
| LangGraph vs SDK | Same task, both implementations | 4 hours |
| Grader evolution | A/B test two grader prompts | 1 hour |

### Success Criteria for Each Test

**Parallel worktrees:**
- All 3 produce working code
- At least 2/3 pass tests
- Measurable difference in approaches

**Visual verification:**
- Catches UI issues tests miss
- False positive rate < 20%
- Adds < 30 seconds to verification

**Iterative loop:**
- Reduces human intervention
- Converges within 5 iterations (or escalates)
- Each iteration shows measurable improvement

**PR review:**
- Catches real issues
- Suggestions are actionable
- Review + fix cycle < 30 minutes

## Implementation Priority

### Phase 0: Validate Core Assumptions (This Week)

1. **Confirm Linear MCP can create sub-issues**
   - Test: Prompt creates 3 implementation sub-issues
   - If yes: Parallel worktrees are "free"
   - If no: Need alternative approach

2. **Confirm iterative prompt pattern works**
   - Test: Claude iterates on code until tests pass
   - Measure: How many iterations? Success rate?

3. **Evaluate current visual capabilities**
   - Check: What MCPs exist for browser/vision?
   - Gap analysis: What's missing?

### Phase 1: Minimal Viable Evolution (Week 1-2)

1. **Prompt path override**
   - Load prompts from custom location
   - Enable A/B testing of prompts

2. **Basic metrics logging**
   - Log outcomes: pass/fail, stage, evidence
   - Store in ~/.cyrus/logs/*/metrics.jsonl

3. **Simple grader**
   - Did tests pass? Did build succeed?
   - Deterministic first, LLM later

### Phase 2: Visual + Iterative (Week 3-4)

1. **Add Playwright MCP**
   - Browser automation
   - Screenshot capture

2. **Add Vision analysis**
   - Gemini Vision or Claude Vision MCP
   - Screenshot-to-assessment

3. **Implement iteration loop**
   - Prompt pattern for self-correction
   - Max iterations with escalation

### Phase 3: Grader Evolution (Month 2)

1. **Meta-grader implementation**
   - Evaluate grader accuracy
   - Track over time

2. **A/B testing for graders**
   - Compare grader versions
   - Automatic promotion of winners

3. **Hypothesis-driven improvement**
   - Analyze grader failures
   - Generate improvement hypotheses
   - Test and validate

## Open Questions

### 1. Framework vs No Framework?

**Question:** Do we need LangGraph/DSPy, or can prompt chains achieve the same result?

**How to answer:** Build the same capability both ways, measure results.

### 2. Where Does Review Happen?

**Question:** Review in worktree (before PR) or in GitHub (after PR)?

**Likely answer:** Both. Self-review in worktree catches obvious issues. External review in GitHub catches what self-review missed.

### 3. How Do We Handle Stuck Iterations?

**Question:** What happens when the iterative loop can't converge?

**Options:**
- Escalate to human after N attempts
- Try different approach (regenerate from scratch)
- Split into smaller sub-tasks
- Log failure for analysis and prompt improvement

### 4. How Minimal Can We Go?

**Question:** What's the absolute minimum to demonstrate self-improvement?

**Answer:** A prompt that:
1. Generates code
2. Runs tests
3. If tests fail, analyzes failures and regenerates
4. Logs what worked for future reference

This requires no new code - just a well-crafted prompt.

## Critical Insight: Guardrails at Every Step

### The Problem with "Prompts All The Way Down"

Prompts make mistakes. If we chain prompts without validation, we compound errors:

```
Prompt A generates X (80% correct)
    ↓
Prompt B uses X to generate Y (80% correct)
    ↓
Prompt C uses Y to generate Z (80% correct)
    ↓
Final correctness: 0.8 × 0.8 × 0.8 = 51%
```

**Without guardrails, a 3-step chain has ~50% success rate.**

### The Solution: Validate Every Output

Every prompt output must pass through a guardrail:

```
Prompt generates output
    ↓
┌─────────────────────────────────────────────────┐
│  GUARDRAIL (choose one or more):                │
│                                                 │
│  1. MULTIPLY - Run 3 times, compare/vote        │
│  2. DETERMINISTIC - Tests, lint, type check     │
│  3. MULTI-MODEL - Claude + Gemini + GPT agree   │
│  4. CHAIN VERIFY - Another AI checks the work   │
│  5. HUMAN GATE - Critical decisions need human  │
└─────────────────────────────────────────────────┘
    ↓
If valid → proceed to next step
If invalid → iterate (max N times) or escalate
```

### TDD Guard: The Reference Implementation

**TDD Guard** (https://github.com/nizos/tdd-guard) is a perfect example of this pattern:

**What it does:**
- Enforces Test-Driven Development in Claude Code
- Uses hooks (PreToolUse, SessionStart, UserPromptSubmit) to **block violations**
- Can't write implementation without failing tests first
- Can't implement beyond current test requirements

**The pattern:**
```
Developer/AI wants to write code
    ↓
TDD Guard hook intercepts (PreToolUse)
    ↓
Check: Do failing tests exist for this change?
    ↓
If no → BLOCK the change, force test-first
If yes → ALLOW the change
```

**Key insight:** The guardrail is **deterministic code** that wraps **non-deterministic AI**. The AI can't bypass it.

### Guardrail Types for Each Stage

| Stage | Output | Guardrail Options |
|-------|--------|-------------------|
| **Planning** | Spec/Plan | Multi-model consensus, human review gate |
| **Test Writing** | Test code | Must compile, must be runnable, coverage check |
| **Implementation** | Code | TDD Guard (tests must pass), lint, type check |
| **Visual Check** | Screenshot | Vision model validation, DOM inspection |
| **Review** | Review comments | Deterministic: are comments actionable? |
| **PR** | Pull request | GitHub CI, Claude Code review, human approval |

### The Corrected Architecture

```
Prompt A generates X
    ↓
GUARDRAIL: Validate X (deterministic + multi-model)
    ↓ (only if X passes)
Prompt B uses X to generate Y
    ↓
GUARDRAIL: Validate Y (tests pass, lint clean)
    ↓ (only if Y passes)
Prompt C uses Y to generate Z
    ↓
GUARDRAIL: Validate Z (visual check, integration tests)
    ↓ (only if Z passes)
Final output
```

**With guardrails, each step is 95%+ correct before proceeding.**

### Guardrail Implementation Patterns

#### Pattern 1: Multiply and Vote
```typescript
async function multiplyAndVote(prompt: string, input: any): Promise<Output> {
  // Run 3 times
  const outputs = await Promise.all([
    runPrompt(prompt, input),
    runPrompt(prompt, input),
    runPrompt(prompt, input),
  ]);

  // Vote on best (deterministic comparison or LLM judge)
  return selectBest(outputs);
}
```

#### Pattern 2: Deterministic Gate
```typescript
async function deterministicGate(code: string): Promise<boolean> {
  const results = {
    compiles: await compile(code),
    testsPass: await runTests(code),
    lintClean: await lint(code),
    typesafe: await typecheck(code),
  };

  // ALL must pass - no negotiation
  return Object.values(results).every(r => r === true);
}
```

#### Pattern 3: Multi-Model Consensus (via CCA)

**Claude Code Advanced (CCA)** is an MCP at `/Users/stuartfenton/docker/claude-code-mcp-advanced` that provides:
- Unified access to Gemini, OpenAI/GPT, and Claude CLIs
- 18 tool types including **`consensus`** - built-in multi-model agreement
- Model routing: `gemini`, `flash`, `gpt`, `o3`, `codex`, or `claude`

**Available via MCP:**
```
mcp__cca__llm(tool_type="consensus", model="gemini", prompt="...")
```

**Implementation using CCA:**
```typescript
async function multiModelConsensus(question: string, artifact: any): Promise<boolean> {
  // CCA routes to different model CLIs automatically
  const [claude, gemini, gpt] = await Promise.all([
    mcp.cca.llm({ tool_type: 'chat', model: 'claude', prompt: `Is this correct? ${question}\n\n${artifact}` }),
    mcp.cca.llm({ tool_type: 'chat', model: 'gemini', prompt: `Is this correct? ${question}\n\n${artifact}` }),
    mcp.cca.llm({ tool_type: 'chat', model: 'gpt', prompt: `Is this correct? ${question}\n\n${artifact}` }),
  ]);

  // Majority must agree
  const votes = [claude, gemini, gpt].filter(v => v.includes('correct') || v.includes('yes'));
  return votes.length >= 2;
}

// OR use the built-in consensus tool
async function ccaConsensus(question: string, artifact: any): Promise<string> {
  return mcp.cca.llm({
    tool_type: 'consensus',
    model: 'gemini',  // Primary model
    prompt: `Evaluate this artifact and reach consensus:\n${question}\n\n${artifact}`
  });
}
```

**CCA Tool Types for Guardrails:**
| Tool Type | Use Case |
|-----------|----------|
| `consensus` | Multi-model agreement on quality |
| `codereview` | AI code review |
| `secaudit` | Security audit |
| `testgen` | Generate test cases |
| `debug` | Analyze failures |
| `thinkdeep` | Extended reasoning |
| `challenge` | Devil's advocate critique |

#### Pattern 4: TDD Guard Hook
```typescript
// Claude Code hook - runs BEFORE file modification
async function preToolUse(context: HookContext): Promise<HookResult> {
  if (context.tool === 'write' || context.tool === 'edit') {
    const hasFailingTests = await checkForFailingTests(context.targetFile);

    if (!hasFailingTests) {
      return {
        block: true,
        message: "Write a failing test first. TDD requires test-first development."
      };
    }
  }

  return { block: false };
}
```

### Why This Matters for Evolution

The evolution system itself must follow these patterns:

```
Prompt optimizer generates new prompt
    ↓
GUARDRAIL: Test new prompt on validation set
    ↓
If improvement > threshold → adopt
If not → reject (don't contaminate the system)
```

**Grader evolution:**
```
Meta-grader suggests grader improvement
    ↓
GUARDRAIL: A/B test on known-good/known-bad examples
    ↓
If precision/recall improve → adopt new grader
If not → keep current grader
```

**The system can't make itself worse because every change must pass validation.**

## The Vision: Guarded Prompts All The Way Down

The corrected ultimate goal:

```
Cyrus runs on prompts + guardrails
  ↓
Every prompt output passes a validation gate
  ↓
Prompts are evaluated by grader prompts + deterministic checks
  ↓
Grader prompts are evaluated by meta-graders + A/B tests
  ↓
All evolution must prove improvement before adoption
  ↓
Deterministic code enforces the guardrails
  ↓
The system improves itself safely
```

**The deterministic code does:**
- Orchestration (run prompts in sequence)
- **Guardrail enforcement (block invalid outputs)**
- **Validation gates (tests, lint, type check)**
- Metrics collection (store results)
- Version management (track prompt versions)
- A/B testing infrastructure (compare versions)

**Prompts do the creative work. Deterministic gates ensure quality.**

This makes the entire system:
- Evolvable (prompts can change)
- **Safe (guardrails prevent degradation)**
- Observable (all reasoning + gate results in logs)
- Testable (swap any prompt, guardrails catch regressions)
- Rigorous (every output is validated)

## Next Steps

1. **Read and validate** - Does this capture the vision correctly?

2. **Prioritize tests** - Which ideas should we validate first?

3. **Identify blockers** - What capabilities are missing in Cyrus?

4. **Build test harness** - Simple framework for testing ideas

5. **Run first test** - Pick one idea, validate in 1 hour

---

**Document Status:** Draft - Capturing discussion
**Created:** 2025-11-26
**Context:** Continuation of 03-evolutionary-orchestration-system.md with focus on minimal implementation
