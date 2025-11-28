# Hypothesis-Driven Prompt Optimization: Building Goal-Oriented Improvement Systems

**Your actual requirement:** You're not building a simple evaluation system. You're building a scientific experiment framework where:
1. Each stage generates 3 variants: 1 human baseline + 2 AI-generated prompts
2. You evaluate all 3 against stage-specific metrics
3. You formulate hypotheses about what will improve performance
4. The system tests those hypotheses
5. You iterate based on whether the hypothesis was validated

**The critical insight you've identified:** Without knowing *what* you're trying to improve and *why*, optimization is random search. You need goal-directed improvement with measurable outcomes.

This is fundamentally different from "run optimizer, get better prompts." This is: "I believe adding requirements validation to the plan stage will reduce implementation bugs by 20%. Let's test that hypothesis."

---

## The Framework You Actually Need

### Core Components

**1. Hypothesis Specification System**
You need to explicitly define:
- **Current state**: "Plan prompts generate vague requirements 40% of the time"
- **Target state**: "Plan prompts should generate complete requirements with validation criteria"
- **Hypothesis**: "Adding 'include acceptance criteria for each requirement' will reduce vagueness"
- **Success metric**: "Vagueness score drops from 6/10 to 8/10 or better"
- **Side effect monitoring**: "Ensure plan generation time doesn't exceed 30 seconds"

**2. Multi-Variant Testing Infrastructure**
Each evaluation run tests:
- **Human baseline**: Your manually crafted prompt (control group)
- **AI Variant 1**: Current best AI-generated prompt
- **AI Variant 2**: New hypothesis-driven modification

You compare all three across your metrics to see:
- Does AI beat human? (Are we competitive?)
- Does variant 2 beat variant 1? (Did our hypothesis work?)
- What specific metrics improved/degraded? (Understanding causality)

**3. Stage-Specific Evaluation Matrices**

**Plan Stage Metrics:**
- Completeness: Are all requirements present? (0-10 score)
- Clarity: Can a developer implement without questions? (0-10)
- Validation criteria: Does each requirement have testable acceptance criteria? (yes/no)
- Ambiguity count: How many vague terms ("should be fast", "user-friendly")? (number)
- Implementation feasibility: Is this actually buildable? (0-10)

**Code Stage Metrics:**
- Correctness: Does it pass tests? (pass/fail + test coverage %)
- First-attempt accuracy: Works without iteration? (yes/no)
- Bug count: Linter errors + runtime errors (number)
- Code quality: Maintainability score via static analysis (0-100)
- Iteration count: How many Claude Code CLI passes to get working code? (number)
- Architectural alignment: Follows project patterns? (0-10)

**Test Stage Metrics:**
- Coverage: % of code exercised by tests (0-100%)
- Edge case detection: Does it test boundary conditions? (0-10)
- Assertion quality: Are assertions specific and meaningful? (0-10)
- Test independence: Can tests run in any order? (yes/no)
- Failure clarity: Do test failures pinpoint issues? (0-10)

**4. Causal Analysis System**
After each evaluation, you need to determine:
- **What changed?** Diff between variant 1 and variant 2 prompts
- **What improved?** Which specific metrics went up
- **What degraded?** Which metrics went down (trade-offs)
- **Why?** Connect the prompt change to the metric change
- **Confidence?** Is this reproducible or luck? (run N=3-5 times)

**5. Improvement Generation Loop**
Based on evaluation results, the system should:
- **Identify failure modes**: "30% of plans missing database schema"
- **Generate hypotheses**: "Adding 'include data model section' should fix this"
- **Create variants**: Modify AI prompt with hypothesis
- **Test**: Run 3-way comparison
- **Validate**: Did the hypothesis hold?
- **Iterate**: If yes, keep change. If no, try different hypothesis.

---

## Which Frameworks Support This Approach?

### Tier 1: Build Your Own Orchestrator + These Components

**Why no single framework fits:**
Your hypothesis-driven, multi-variant, goal-oriented approach is more sophisticated than what existing frameworks support out of the box. You need to compose tools.

**The Architecture:**

**Component 1: PromptFoo (Multi-Variant Testing)**
- Purpose: Run human + AI variant 1 + AI variant 2 in parallel
- Why: Matrix testing is exactly what you need
- Integration: Feed your 3 prompt variants, get comparative scores
- Output: Structured JSON with per-variant, per-metric results

**Component 2: DeepEval (Stage-Specific Metrics)**
- Purpose: Different metric sets for plan/code/test stages
- Why: 14+ research-backed metrics covering different aspects
- Integration: Call different metric combinations per stage
- Output: Deterministic scores via DAG metrics (no variance)

**Component 3: OPRO (Hypothesis-to-Prompt Translation)**
- Purpose: Convert improvement goals into prompt modifications
- Why: Meta-prompting lets you specify "make the prompt emphasize X"
- Integration: Give it hypothesis + current prompt, get modified prompt
- Output: Variant 2 prompt that tests your hypothesis

**Component 4: Reflexion (Failure Analysis)**
- Purpose: Analyze why variants failed specific test cases
- Why: Self-critique generates natural language explanations
- Integration: Feed failed outputs, get "why it failed" + "how to fix"
- Output: Hypotheses for next iteration

**Component 5: EvalPlus (Code Correctness)**
- Purpose: Rigorous test-based evaluation for code stage
- Why: 80x more tests than standard benchmarks catches real bugs
- Integration: Run generated code through comprehensive test suite
- Output: Pass rate, bug types, edge cases failed

---

## The Hypothesis-Driven Optimization Loop

### Iteration N

**Step 1: Define Goal**
```
Stage: Code
Current Problem: 35% of generated code fails type checking
Goal: Reduce type errors to <10%
Hypothesis: Adding "use explicit TypeScript types for all function signatures" 
           will catch type issues during generation
Success Metric: Type error rate drops from 35% to <10%
Side Effect Watch: Ensure code verbosity doesn't increase >20%
```

**Step 2: Generate Variants**
- **Human prompt**: Your manually optimized code prompt
- **AI Variant 1**: Current best AI-generated code prompt (from last iteration)
- **AI Variant 2**: Use OPRO with your hypothesis to modify Variant 1
  - Input to OPRO: "Add emphasis on explicit TypeScript types"
  - Output: Modified prompt with type guidance

**Step 3: Execute Test Suite**
Run all 3 variants through 20 test cases:
- 10 training cases (used in optimization)
- 10 held-out validation cases (never seen before)

For each test case, each variant generates code.

**Step 4: Evaluate with Stage-Specific Metrics**

Code stage evaluation runs:
- **EvalPlus**: Correctness via comprehensive test suite
- **TypeScript compiler**: Type error count
- **ESLint**: Code quality score
- **Token counter**: Verbosity metric (side effect watch)

Output matrix:
```
Variant      | Type Errors | Pass Rate | Quality | Verbosity
-------------|-------------|-----------|---------|----------
Human        | 12/20 (60%) | 85%       | 82/100  | 450 tok
AI Variant 1 | 7/20 (35%)  | 78%       | 79/100  | 420 tok
AI Variant 2 | 2/20 (10%)  | 82%       | 84/100  | 480 tok
```

**Step 5: Causal Analysis**

Results show:
- ✅ **Hypothesis validated**: Type errors dropped from 35% to 10%
- ✅ **Primary goal achieved**: Met <10% target
- ⚠️ **Side effect acceptable**: Verbosity up 14% (within 20% limit)
- ✅ **No quality degradation**: Quality score maintained
- ⚠️ **Minor trade-off**: Pass rate slightly up but not significant

**Step 6: Decision**
- **Adopt AI Variant 2** as new baseline (becomes AI Variant 1 in next iteration)
- **Document learning**: "Explicit type guidance reduces type errors without sacrificing correctness"
- **Next hypothesis**: Focus on the remaining 10% type errors - analyze what types they are

**Step 7: Reflexion Analysis**
For the 2 test cases that still had type errors, run Reflexion:
- Feed: Failed code + error messages
- Output: "Type errors occurred in generic function parameters. Suggest adding 'use TypeScript generics with constraints' to prompt"
- **Next iteration hypothesis**: This becomes your next goal

---

### Iteration N+1

**Step 1: Define Goal**
```
Stage: Code  
Current Problem: 10% of code has type errors in generic functions
Goal: Reduce to <5%
Hypothesis: Adding "use constrained TypeScript generics" will handle edge cases
Success Metric: Type error rate drops from 10% to <5%
```

And the cycle continues...

---

## Implementation Architecture

### Your Codebase Structure

```
prompt-optimization/
├── orchestrator/
│   ├── hypothesis.ts          # Define goals, hypotheses, success criteria
│   ├── variant-generator.ts   # Creates 3-variant test configs
│   ├── evaluator.ts           # Runs evaluation across all variants
│   ├── analyzer.ts            # Causal analysis and decision making
│   └── iteration-manager.ts   # Tracks optimization over time
├── stages/
│   ├── plan/
│   │   ├── metrics.ts         # Plan-specific evaluation
│   │   └── prompts/           # Human + AI variant prompts
│   ├── code/
│   │   ├── metrics.ts         # Code-specific evaluation
│   │   └── prompts/
│   └── test/
│       ├── metrics.ts         # Test-specific evaluation
│       └── prompts/
├── integrations/
│   ├── promptfoo.ts           # Multi-variant testing runner
│   ├── deepeval.ts            # Metric computation
│   ├── opro.ts                # Hypothesis-to-prompt generator
│   ├── reflexion.ts           # Failure analysis
│   └── evalplus.ts            # Code correctness testing
├── data/
│   ├── test-cases/            # Your evaluation test suite
│   ├── results/               # Per-iteration results
│   └── history/               # Optimization trajectory
└── config/
    └── experiments.yaml       # Hypothesis definitions
```

### Key Workflow Scripts

**`run-experiment.ts`**
- Takes: Hypothesis definition (goal, change, metrics)
- Generates: 3 variants (human, AI baseline, AI hypothesis-test)
- Executes: All variants across test suite
- Evaluates: Stage-specific metrics
- Analyzes: Did hypothesis succeed?
- Outputs: Decision (adopt/reject) + next hypothesis suggestions

**`analyze-iteration.ts`**
- Takes: Results from N iterations
- Identifies: What's working (patterns in successful hypotheses)
- Suggests: Next high-value optimization targets
- Outputs: Prioritized hypothesis backlog

**`compare-stages.ts`**
- Takes: Results across plan/code/test stages
- Analyzes: How does plan quality affect code quality?
- Identifies: Upstream improvements with downstream impact
- Outputs: Cross-stage optimization opportunities

---

## Why This Approach Is Superior

### Problem with Blind Optimization

**Standard approach:**
```
1. Run optimizer (DSPy/OPRO/EvoPrompt)
2. Get "improved" prompts
3. Hope they're better
4. No understanding of why/how
```

**Your hypothesis-driven approach:**
```
1. Identify specific problem: "Type errors in 35% of code"
2. Formulate testable hypothesis: "Explicit types will fix this"
3. Test hypothesis: Variant with type guidance
4. Measure outcome: Type errors at 10%
5. Understand causality: Yes, explicit types helped
6. Build on learning: Next hypothesis targets remaining 10%
```

### Benefits

**1. Directed Improvement**
You're not searching blindly. Each iteration targets a specific known problem.

**2. Causal Understanding**
You know *why* prompts improve, not just that they score higher. This compounds over iterations.

**3. Human-AI Comparison**
Your human baseline shows whether AI is competitive. If AI can't beat human, you know optimization isn't ready.

**4. Hypothesis Validation**
Some improvements won't work. That's valuable negative information. "Adding examples didn't help" prevents wasting time on similar approaches.

**5. Stage-Specific Optimization**
Plan optimization needs different metrics than code optimization. Your system handles this naturally.

**6. Trade-off Visibility**
You explicitly monitor side effects. Improving one metric while degrading another is visible and controllable.

---

## Concrete Example: Full Optimization Cycle

### Starting State

**Plan Prompt (Human Baseline):**
```
Create a detailed implementation plan including:
- Requirements breakdown
- Technical approach
- Data models
- API design
```

**Problem Identified:**
30% of plans missing data models entirely.

### Iteration 1: Test "Explicit Section Headers"

**Hypothesis:**
"Adding explicit 'Data Model Section' requirement will ensure it's always included"

**AI Variant 2 Prompt (OPRO-generated):**
```
Create a detailed implementation plan with these REQUIRED sections:

1. REQUIREMENTS BREAKDOWN
   - Functional requirements
   - Non-functional requirements

2. DATA MODELS (MANDATORY)
   - Entity definitions
   - Relationships
   - Schema design

3. TECHNICAL APPROACH
   - Architecture decisions
   - Technology choices

4. API DESIGN
   - Endpoints
   - Request/response formats
```

**Results:**
- Human: Data models in 75% of plans
- AI Variant 1: Data models in 70% of plans
- AI Variant 2: Data models in 95% of plans ✅

**Decision:** Adopt AI Variant 2. Hypothesis validated.

### Iteration 2: Test "Example-Driven Learning"

**New Problem:** Plans have data models but they're often incomplete (missing indexes, constraints).

**Hypothesis:**
"Providing an example of a complete data model will improve quality"

**AI Variant 2 Prompt (builds on Variant 2 from Iteration 1):**
```
[Previous prompt + ]

DATA MODELS example format:
User Entity:
- id: UUID (primary key, indexed)
- email: string (unique, indexed)
- created_at: timestamp (indexed)
- CONSTRAINT: email must be valid format
- RELATIONSHIP: has_many posts
```

**Results:**
- AI Variant 1 (from Iteration 1): Complete data models in 65% of plans
- AI Variant 2: Complete data models in 85% of plans ✅
- Side effect: Plan generation time up 15% (acceptable)

**Decision:** Adopt AI Variant 2. Continue iterating.

---

## Framework Integration Details

### PromptFoo: The Multi-Variant Test Runner

**Configuration for your use case:**

```yaml
# promptfooconfig.yaml for Code stage
prompts:
  - file://prompts/code-human.txt        # Your baseline
  - file://prompts/code-ai-v1.txt        # Current best AI
  - file://prompts/code-ai-v2.txt        # Hypothesis test

providers:
  - anthropic:claude-sonnet-4.5

tests:
  - vars:
      requirement: "Build user authentication endpoint"
    assert:
      - type: javascript
        value: "output.typeErrors < 2"
      - type: javascript  
        value: "output.testPassRate > 0.8"
      - type: javascript
        value: "output.codeQuality > 80"
```

**Why this works:**
- Tests all 3 variants in parallel
- Structured output shows comparative performance
- Assertions encode your success criteria
- Failed assertions highlight where variants fall short

### DeepEval: Stage-Specific Metrics

**Plan Stage Metrics (Python wrapper called from TypeScript):**

```python
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    GEval
)

# Custom metric for plan completeness
plan_completeness = GEval(
    name="completeness",
    criteria="Plan includes requirements, data models, API design, and technical approach",
    evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT]
)

# Custom metric for plan clarity  
plan_clarity = GEval(
    name="clarity",
    criteria="Requirements are specific, unambiguous, and implementable",
    evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT]
)
```

**Code Stage Metrics:**

```python
# Use EvalPlus for correctness
from evalplus.evaluate import evaluate

# Use DeepEval for code quality
code_quality = GEval(
    name="code_quality",
    criteria="Code follows TypeScript best practices, has proper error handling, is maintainable",
    evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT]
)
```

### OPRO: Hypothesis-to-Prompt Translation

**Your orchestrator calls OPRO like this:**

```typescript
// hypothesis-to-prompt.ts
async function generateHypothesisVariant(
  currentPrompt: string,
  hypothesis: string,
  pastResults: OptimizationHistory
): Promise<string> {
  
  const metaPrompt = `
You are optimizing a prompt for code generation.

CURRENT PROMPT:
${currentPrompt}

PAST PERFORMANCE:
${JSON.stringify(pastResults.metrics)}

HYPOTHESIS TO TEST:
${hypothesis}

Generate an improved prompt that implements this hypothesis.
The modification should be targeted and minimal - only change what's needed to test the hypothesis.

OUTPUT ONLY THE NEW PROMPT TEXT.
`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4.5",
    messages: [{ role: "user", content: metaPrompt }]
  });
  
  return response.content[0].text;
}
```

**This gives you:**
- Explicit control over what changes
- Traceable connection between hypothesis and prompt modification
- Ability to test specific improvements rather than random exploration

### Reflexion: Failure Analysis

**After evaluation, analyze failures:**

```typescript
// failure-analyzer.ts
async function analyzeFailures(
  failedTestCases: TestCase[],
  generatedOutput: string
): Promise<Hypothesis[]> {
  
  const analysisPrompt = `
You are analyzing why a code generation prompt failed.

FAILED TEST CASES:
${failedTestCases.map(tc => `
Input: ${tc.input}
Expected: ${tc.expected}
Actual: ${generatedOutput}
Error: ${tc.error}
`).join('\n\n')}

Analyze:
1. What pattern connects these failures?
2. What is the root cause?
3. What specific prompt modification would fix this?

Format each suggestion as:
HYPOTHESIS: [one sentence what to change]
EXPECTED OUTCOME: [what metric should improve]
RATIONALE: [why this should work]
`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4.5", 
    messages: [{ role: "user", content: analysisPrompt }]
  });
  
  return parseHypotheses(response.content[0].text);
}
```

**This creates your next iteration's hypotheses automatically.**

---

## The Complete Workflow

### Week 1: Infrastructure

Build the orchestration layer that:
1. Manages hypothesis definitions (YAML/TypeScript configs)
2. Generates 3-variant test configurations
3. Runs PromptFoo evaluations
4. Collects and aggregates metrics
5. Stores results with version control

**Deliverable:** `npm run test-hypothesis` works end-to-end

### Week 2: Stage-Specific Metrics

Implement metric sets for each stage:
1. Plan metrics: Completeness, clarity, feasibility
2. Code metrics: Correctness (EvalPlus), quality, type safety
3. Test metrics: Coverage, assertion quality, independence

**Deliverable:** Each stage has deterministic evaluation

### Week 3: OPRO Integration

Connect hypothesis specification to prompt generation:
1. Define hypothesis format (goal, change, expected outcome)
2. Build OPRO meta-prompt templates
3. Generate variant 2 prompts automatically
4. Validate variants before testing

**Deliverable:** `npm run generate-variant` produces hypothesis-driven prompts

### Week 4: Causal Analysis

Build the decision engine:
1. Compare variant performance across metrics
2. Identify which metrics improved/degraded
3. Connect changes to outcomes
4. Make adopt/reject decisions
5. Suggest next hypotheses

**Deliverable:** `npm run analyze-iteration` produces actionable insights

### Week 5: Reflexion Loop

Add automatic failure analysis:
1. Identify failing test cases
2. Run Reflexion analysis
3. Generate hypothesis candidates
4. Prioritize by potential impact
5. Queue for next iteration

**Deliverable:** System suggests its own improvements

---

## Success Metrics for Your System

**Short-term (Week 1-4):**
- 3-variant testing works reliably
- Human baseline establishes competitive bar
- Stage-specific metrics track different aspects
- Results are reproducible (variance <10%)

**Medium-term (Month 2-3):**
- AI variants beating human baseline consistently
- Hypothesis validation rate >60% (most hypotheses work)
- Iteration time <24 hours (test hypothesis within a day)
- 5-10 validated improvements per stage

**Long-term (Month 3+):**
- AI prompts 20-30% better than human baseline on key metrics
- Reflexion-generated hypotheses as good as human-generated
- Cross-stage optimization (improving plan quality improves code quality)
- Production system using AI-generated prompts exclusively

---

## Why This Beats Standard Optimization

**Standard optimization:**
```
Input: Prompt + test cases
Process: [Black box optimizer]
Output: "Better" prompt
Knowledge gained: None
```

**Your hypothesis-driven system:**
```
Input: Specific problem + hypothesis + test cases
Process: Controlled experiment
Output: Validated/rejected hypothesis + new prompt
Knowledge gained: Understanding of what works and why
```

**The compounding advantage:**

Iteration 1: Learn "explicit sections work"
Iteration 2: Learn "examples improve completeness"  
Iteration 3: Learn "constraints prevent errors"
Iteration 4: Combine all three insights
Iteration 5: System suggests novel combinations

Standard optimizers can't do this. They don't build causal models. Your system does.

---

## The Bottom Line

**You don't want a simple evaluation system. You want a scientific experiment platform.**

**The right architecture:**
1. **PromptFoo** - Multi-variant testing infrastructure
2. **DeepEval** - Stage-specific evaluation metrics
3. **OPRO** - Hypothesis-to-prompt translation
4. **Reflexion** - Failure analysis and hypothesis generation
5. **EvalPlus** - Code correctness verification
6. **Custom orchestrator** - Ties everything together with hypothesis-driven logic

**What makes this sophisticated:**
- Explicit goal specification (not blind search)
- Causal understanding (not just correlation)
- Human baseline comparison (competitive bar)
- Stage-specific optimization (right metrics for each stage)
- Hypothesis validation (scientific method)
- Knowledge accumulation (insights compound over iterations)

**Implementation priority:**
1. Build orchestration layer (Week 1)
2. Integrate PromptFoo for variant testing (Week 1-2)
3. Add stage-specific metrics with DeepEval/EvalPlus (Week 2-3)
4. Connect OPRO for hypothesis translation (Week 3-4)
5. Add Reflexion for automatic hypothesis generation (Week 4-5)
6. Iterate and refine based on real usage (ongoing)

**This is not a tool. This is a system for iterative, goal-directed, scientifically rigorous prompt optimization.**

That's what you need to solve the problem you're actually trying to solve.