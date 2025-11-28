# Evolutionary Orchestration System for Cyrus

## Document Purpose

This document captures the design and rationale for building a self-improving, meta-orchestration system on top of Cyrus. It serves as a reference for continuing this work and understanding the architectural philosophy behind the approach.

## Core Philosophy: Wrapping Non-Determinism in Deterministic Systems

**The fundamental insight:** Large Language Models (LLMs) are inherently non-deterministic. Rather than fighting this characteristic, we embrace it as a feature while wrapping it in deterministic quality gates and orchestration.

### The 80-20 Problem

Current LLM performance follows an approximately 80-20 distribution:
- **80% of the time**: Produces correct, high-quality output
- **20% of the time**: Makes mistakes, produces suboptimal solutions

This percentage is improving over time, but the fundamental non-deterministic nature remains.

### The Solution: Farming Non-Determinism

Instead of trying to eliminate variability, we **farm it for value**:

1. **Run multiple parallel attempts** on the same problem
2. **Apply deterministic quality gates** (TDD, tests, linting)
3. **Filter out failures**, keeping only passing variants
4. **Compare successful variants** to identify the best solution
5. **Analyze logs** to understand why winners succeeded
6. **Evolve prompts and processes** based on analysis

## System Architecture

### High-Level Flow

```
Linear Issue (ENG-24)
    ↓
Planning Phase (Opus + Multi-Model Consensus)
    ↓
Coding Phase (Parallel Worktrees with Sonnet)
    ↓
Quality Gates (TDD, Tests, Linting)
    ↓
Variant Selection (Compare A/B/C)
    ↓
Log Analysis (Evolution Engine)
    ↓
Prompt Evolution (Self-Improvement)
```

### Phase 1: Planning Phase

**Goal:** Spend tokens on quality planning. The better the plan, the better the implementation.

**Process:**
1. **Parallel Planning Sessions**: Run multiple isolated planning sessions simultaneously
   - Same planning prompt to each
   - Natural divergence due to non-determinism creates different perspectives
   - No worktrees needed (no code yet)

2. **Multi-Model Validation**: Use Claude Code Advanced (CCA) MCP integration
   - Consult Claude (Anthropic)
   - Consult OpenAI models
   - Consult Gemini (Google)
   - Cross-validate plans across different "neural nets"

3. **Iterative Refinement**:
   - Challenge assumptions
   - Identify over-engineering
   - Enforce constraints (simplicity, minimum changes)
   - Iterate until consensus on optimal approach

4. **Model Used**: Opus (token-heavy, quality-focused)

**Output:** A refined, validated plan ready for implementation

### Phase 2: Coding Phase

**Goal:** Embrace non-determinism to generate multiple valid implementations.

**Process:**
1. **Worktree Spawning**: When entering `coding-activity` subroutine
   ```
   ~/.cyrus/worktrees/
     ├── ENG-24-A/    ← Implementation variant A
     ├── ENG-24-B/    ← Implementation variant B
     └── ENG-24-C/    ← Implementation variant C
   ```

2. **Parallel Execution**:
   - **Same prompt** to all three variants
   - Same plan, same constraints
   - Natural variance creates different implementations
   - Each runs independently in isolation

3. **Deterministic Quality Gates**:
   - **TDD Guard**: Ensures failing tests written FIRST
   - **Internal Iteration**: Each variant iterates until tests pass
   - **Verification**: Linting, type checking, builds

4. **Model Used**: Sonnet (efficient for execution)

**Output:** Three different implementations, all passing tests, all valid

### Phase 3: Variant Selection

**Goal:** Identify the best implementation from the valid variants.

**Process:**
1. **All variants have passed quality gates** (tests, linting, builds)
2. **Compare outcomes**:
   - Code quality
   - Simplicity
   - Performance
   - Maintainability

3. **Selection Methods**:
   - **Automated**: Metrics-based (lines changed, complexity, test coverage)
   - **Manual**: Human review and selection
   - **Hybrid**: System recommends, human confirms

**Output:** Selected variant (e.g., variant B chosen)

### Phase 4: Log Analysis & Evolution

**Goal:** Understand WHY the winning variant succeeded, evolve the system.

**Logging Structure:**
```
~/.cyrus/logs/
  ├── ENG-24-A/
  │   └── session-{uuid}-{timestamp}.jsonl
  ├── ENG-24-B/     ← Winner
  │   └── session-{uuid}-{timestamp}.jsonl
  └── ENG-24-C/
      └── session-{uuid}-{timestamp}.jsonl
```

**Log Contents** (already captured by Cyrus):
- `workingDirectory`: Which worktree (identifies variant)
- `model`: Which model was used
- `timestamp`: Precise timing for every event
- All `sdk-message` entries: Complete execution trace
- Tool calls: What was executed, parameters, results
- Token usage: Cost, efficiency metrics
- `result`: Summary of what was accomplished
- `permission_denials`: Tools that were blocked

**Analysis Process:**
1. **Identify the winning variant** (e.g., ENG-24-B)
2. **Read logs from winning variant**: `~/.cyrus/logs/ENG-24-B/`
3. **Read logs from losing variants**: `~/.cyrus/logs/ENG-24-A/`, `ENG-24-C/`
4. **Compare decision points**: Where did they diverge?
5. **Extract success patterns**: What did B do differently?
6. **Generate insights**: Why was B better?

**Evolution Outputs:**
- Improved prompt variants
- Better constraint definitions
- Optimized quality gates
- Enhanced planning strategies

## Package Structure

### New Package: `packages/orchestration`

```
packages/orchestration/
├── src/
│   ├── PlanningOrchestrator.ts      # Spawns parallel planning sessions
│   ├── CodingOrchestrator.ts        # Spawns 3 worktrees for implementation
│   ├── WorktreeManager.ts           # Creates/manages variant worktrees
│   ├── VariantComparator.ts         # Compares A/B/C implementations
│   ├── LogAnalyzer.ts               # Reads and parses session logs
│   ├── EvolutionEngine.ts           # Analyzes logs, improves prompts
│   └── types.ts                     # Shared types
├── prompts/                         # Evolved prompt variants
│   ├── planning/
│   │   ├── v1-baseline.md
│   │   ├── v2-improved.md
│   │   └── current.md → v2-improved.md
│   └── coding/
│       ├── v1-baseline.md
│       └── current.md → v1-baseline.md
└── package.json
```

### New Package: `packages/prompt-evolution`

```
packages/prompt-evolution/
├── src/
│   ├── PromptAnalyzer.ts            # Analyzes prompt performance
│   ├── PromptGenerator.ts           # Generates new prompt variants
│   ├── PerformanceTracker.ts        # Tracks success rates
│   └── PromptRegistry.ts            # Manages prompt versions
└── package.json
```

## Minimal Code Changes to Core Cyrus

### Principle: Extend, Don't Modify

We want to:
- Pull updates from upstream Cyrus regularly
- Avoid merge conflicts
- Keep core system intact
- Add extensibility hooks minimally

### Required Changes

#### 1. Prompt Path Override (Interception Point)

**Location:** Prompt loading logic in EdgeWorker

**Change:** Before loading built-in prompts, check for custom prompts:
```typescript
// Check custom location first
const customPromptPath = `~/.cyrus/evolved-prompts/${promptName}.md`;
if (fs.existsSync(customPromptPath)) {
  return loadPrompt(customPromptPath);
}
// Fallback to built-in
return loadPrompt(builtInPromptPath);
```

**Impact:** Minimal. Single function change.

#### 2. Model Per Subroutine

**Location:** `packages/edge-worker/src/procedures/types.ts`

**Change:** Add optional `model` field to `SubroutineDefinition`:
```typescript
export interface SubroutineDefinition {
  name: string;
  promptPath: string;
  maxTurns?: number;
  description: string;
  model?: string;  // ← New field
  // ... existing fields
}
```

**Location:** `packages/edge-worker/src/EdgeWorker.ts`

**Change:** Use subroutine model when building runner config:
```typescript
const model = currentSubroutine?.model ||
              modelOverride ||
              repository.model ||
              this.config.defaultModel;
```

**Impact:** Minimal. ~5 lines added.

#### 3. Worktree Spawning Hook

**Location:** `packages/edge-worker/src/EdgeWorker.ts`

**Change:** When entering `coding-activity` subroutine, call orchestrator:
```typescript
if (currentSubroutine?.name === 'coding-activity' && shouldUseMultiVariant) {
  return await this.codingOrchestrator.spawnVariants(session, repository);
}
```

**Impact:** Minimal. Hook point for orchestration.

## Configuration via Files, Not Code

### Repository Config Extensions

**Location:** `~/.cyrus/config.json`

Add orchestration configuration to repositories:
```json
{
  "repositories": [
    {
      "name": "cyrus",
      "orchestration": {
        "enabled": true,
        "planningVariants": 3,
        "codingVariants": 3,
        "planningModel": "opus",
        "codingModel": "sonnet"
      }
    }
  ]
}
```

### Evolved Prompts Storage

**Location:** `~/.cyrus/evolved-prompts/`

```
~/.cyrus/evolved-prompts/
  ├── planning/
  │   ├── preparation-v1.md
  │   ├── preparation-v2.md
  │   └── preparation-current.md → v2.md
  ├── coding/
  │   └── coding-activity-v1.md
  └── registry.json    # Tracks performance of each variant
```

### Evolution Metadata

**Location:** `~/.cyrus/evolution/`

```
~/.cyrus/evolution/
  ├── metrics/
  │   ├── ENG-24-analysis.json
  │   └── ENG-25-analysis.json
  ├── insights/
  │   └── patterns-discovered.md
  └── prompt-performance.json
```

## Why This Approach?

### 1. Embrace Non-Determinism as a Feature

Traditional approach: "How do we make LLMs more consistent?"

Our approach: "How do we extract value from variance?"

By running multiple attempts in parallel, we:
- Increase probability of hitting the 80% "good" outcome
- Generate diverse solutions to the same problem
- Can compare and select the best

### 2. Deterministic Quality Gates Filter Failures

TDD and test-driven development provide deterministic validation:
- Tests must be written first (TDD Guard)
- Tests must pass before completion
- This filters out the 20% failure cases automatically

Result: All variants that complete are valid. We're choosing between good solutions, not filtering bad ones.

### 3. Self-Improving Through Analysis

The system improves itself by:
- Logging everything that happens
- Analyzing what worked vs. what didn't
- Extracting patterns from successful executions
- Evolving prompts based on evidence

This creates a **virtuous cycle**: Better prompts → Better outcomes → Better analysis → Better prompts

### 4. Parallel Execution for Speed

Running 3 variants in parallel is faster than:
- Running 1 variant 3 times sequentially
- Trying once, failing, retrying

Wall-clock time is approximately the same as running once, but with 3x the options to choose from.

### 5. Multi-Model Consensus for Planning

Different LLMs have different:
- Training data
- Architectural biases
- Strengths and weaknesses

By consulting Claude, GPT, and Gemini during planning:
- We get diverse perspectives
- We catch blind spots
- We validate assumptions across different reasoning systems

### 6. Minimal Core Changes

By keeping changes to Cyrus minimal, we:
- Can pull upstream updates easily
- Avoid merge conflicts
- Contribute useful features back upstream if desired
- Keep the innovation in isolated packages

## Next Steps for Implementation

### Phase 1: Foundation
1. Add `model` field to `SubroutineDefinition`
2. Implement prompt path override
3. Create `packages/orchestration` skeleton
4. Test basic worktree spawning

### Phase 2: Planning Orchestration
1. Implement `PlanningOrchestrator`
2. Test parallel planning sessions
3. Add multi-model MCP integration
4. Validate plan synthesis

### Phase 3: Coding Orchestration
1. Implement `CodingOrchestrator`
2. Test 3-variant worktree spawning
3. Validate TDD guard integration
4. Test variant comparison

### Phase 4: Evolution Engine
1. Implement `LogAnalyzer`
2. Build comparison algorithms
3. Create prompt evolution logic
4. Test self-improvement cycle

### Phase 5: Integration & Testing
1. End-to-end test on real issues
2. Measure improvement over time
3. Refine selection criteria
4. Document learnings

## Success Metrics

How do we know this is working?

1. **Quality Improvement**: Better code from evolved prompts
2. **Success Rate**: Higher percentage of passing variants
3. **Efficiency**: Lower token cost per successful outcome
4. **Consistency**: More predictable results over time
5. **Learning**: Documented patterns and insights accumulating

## Risks and Mitigations

### Risk: Increased Cost (3x variants)

**Mitigation:**
- Only use for important/complex issues
- Use cheaper Sonnet for implementation
- Savings from fewer retry cycles
- Quality improvements justify cost

### Risk: Coordination Complexity

**Mitigation:**
- Keep orchestration in isolated packages
- Clear separation of concerns
- Extensive logging for debugging
- Gradual rollout and testing

### Risk: Variant Selection Errors

**Mitigation:**
- All variants pass tests (quality floor)
- Multiple selection criteria
- Human review option
- Track selection accuracy over time

## Conclusion

This system represents a paradigm shift from "fighting non-determinism" to "farming it systematically." By combining:

- **Parallel execution** (embrace variance)
- **Deterministic gates** (filter failures)
- **Systematic analysis** (learn from outcomes)
- **Prompt evolution** (continuous improvement)

We create a self-improving development system that gets better over time, while keeping the core Cyrus codebase stable and maintainable.

The key insight: **Wrap the non-deterministic AI in a deterministic orchestration system** that extracts value from variance rather than trying to eliminate it.
