# Recursive Prompt Optimization: Applying TRM Principles to Self-Improving Systems

**Core Insight:** Samsung's Tiny Recursive Model (TRM) proves that **recursive refinement with deep supervision beats massive scale**. A 7M-parameter model with recursive architecture outperforms billion-parameter models by looping through itself 16 times with self-correction at each step. We should apply the same principle to prompt optimization: **small recursive improvement loops beat complex multi-stage optimization**.

## The TRM Parallel

**What TRM Does:**
```
Single 2-layer network
   ↓
Loop 16 times, each iteration:
   ├─> Update reasoning state
   ├─> Refine answer
   ├─> Self-supervise (did we improve?)
   └─> Adaptive halt (good enough?)
```

**Result:** 44.6% accuracy on ARC-AGI (beats Gemini 2.5 Pro's 37%)
**Cost:** $500, 2 days, 4 GPUs
**Key:** Recursive refinement > Parameter scale

## What We Should Do (TRM Applied to Prompts)

**Instead of complex optimization:**
```
Simple recursive loop
   ↓
Each iteration:
   ├─> Current prompt generates output
   ├─> Evaluate output (deterministic + LLM)
   ├─> Identify failure pattern
   ├─> Generate refined prompt
   ├─> Test refined prompt
   ├─> Compare (better or worse?)
   ├─> Adopt if better
   └─> Adaptive halt (if plateau)
```

**Result:** Continuous improvement through recursive refinement
**Cost:** Minimal - just API calls, no massive infrastructure
**Key:** Recursive improvement > Complex frameworks

## TRM Principles Applied

### 1. Recursive Refinement (Not Multi-Stage Complexity)

**TRM:** Single tiny network loops 16 times, self-correcting
**Us:** Single simple loop runs indefinitely, self-improving

**Wrong Approach:**
- Build 5 different optimizers for 5 stages
- Complex pipeline orchestration
- Heavy evaluation infrastructure

**Right Approach (TRM-inspired):**
```python
while True:
    output = run_prompt(current_prompt, test_case)
    evaluation = evaluate(output)

    if evaluation.good_enough():
        break  # Adaptive halting

    improved_prompt = refine_prompt(current_prompt, evaluation.failures)

    if improved_prompt.better_than(current_prompt):
        current_prompt = improved_prompt  # Self-correction

    # Recursive loop continues...
```

### 2. Deep Supervision (Each Step Graded)

**TRM:** Learns not just final answer but intermediate reasoning states
**Us:** Grade not just final output but each stage backward

**Implementation:**
```
Final output → Grade
   ↓
Review stage → Did it catch real issues? → Grade
   ↓
Test stage → Did tests validate code? → Grade
   ↓
Implementation → Does code match plan? → Grade
   ↓
Plan → Does plan satisfy spec? → Grade
   ↓
Each stage's prompt improves based on its grade
```

### 3. Adaptive Halting (Know When to Stop)

**TRM:** Learned mechanism determines when answer is good enough
**Us:** Stop iterating when improvement plateaus

**Implementation:**
```python
def should_halt(recent_iterations: List[Iteration]) -> bool:
    # If last 5 iterations show <2% improvement
    if improvement_rate(recent_iterations[-5:]) < 0.02:
        return True

    # If we've achieved target quality
    if current_quality >= target_threshold:
        return True

    # Otherwise keep iterating
    return False
```

### 4. Smaller Is Better (Simplicity Over Complexity)

**TRM:** 2-layer network beat 4-layer (less overfitting, better generalization)
**Us:** Simple recursive loop beats complex multi-framework orchestration

**Key Insight:**
- Don't integrate 5 different frameworks (PromptFoo, OPRO, DeepEval, etc.)
- Build ONE simple recursive improvement loop
- Use minimal tooling (deterministic metrics + LLM judgment)
- Complexity reduces generalization

### 5. Specialized Excellence (Purpose-Built)

**TRM:** Purpose-built for reasoning tasks, not general-purpose
**Us:** Each stage gets its own specialized recursive optimizer

**Architecture:**
```
Plan Stage Optimizer (recursive loop)
   ├─> Improve plan prompts specifically
   ├─> Measure: spec coverage, clarity, feasibility
   └─> Running continuously

Implementation Stage Optimizer (recursive loop)
   ├─> Improve implementation prompts specifically
   ├─> Measure: test pass rate, type errors, quality
   └─> Running continuously

Test Stage Optimizer (recursive loop)
   ├─> Improve test prompts specifically
   ├─> Measure: coverage, edge cases, assertion quality
   └─> Running continuously

[Each stage independent, specialized, recursive]
```

### 6. Latent Reasoning (Not Verbose Explanation)

**TRM:** Works in representation space, not language
**Us:** Deterministic metrics where possible, LLM only for semantic understanding

**Wrong:**
```python
# Ask LLM to explain everything
evaluation = llm.evaluate(
    "Explain in detail why this plan is good or bad, "
    "analyze each section, provide reasoning..."
)
# Verbose, expensive, unreliable
```

**Right:**
```python
# Deterministic metrics first
metrics = {
    'has_all_sections': check_sections(plan),
    'validation_criteria_count': count_criteria(plan),
    'spec_coverage': calculate_coverage(plan, spec)
}

# LLM only for what can't be measured deterministically
if metrics.pass_threshold():
    semantic = llm.judge("Rate this plan 0-10 for clarity")
```

## The Recursive Meta-Improvement Loop

**TRM inspired:** Just as TRM improves its answer recursively, we improve our improvement system recursively.

```
Loop A: Improve Prompts (using Grader v1)
   └─> Runs continuously, prompts get better

Loop B: Improve Grader (using meta-evaluation)
   └─> Runs continuously, grader gets better

Both loops feed each other:
   Better grader → Better prompt evaluation → Better prompts
   Better prompts → More data → Better grader

Recursive meta-improvement
```

**Meta-Grader Evaluation:**
```python
def evaluate_grader(grader_version: str):
    """Does the grader catch real issues?"""

    # Run grader on known-good outputs
    false_positives = grader.grade(known_good_outputs)

    # Run grader on known-bad outputs
    false_negatives = grader.grade(known_bad_outputs)

    # Grader quality = how well it distinguishes good from bad
    precision = 1 - false_positive_rate
    recall = 1 - false_negative_rate

    # If precision/recall improve, adopt new grader
    if better_than_previous(precision, recall):
        deploy_grader(grader_version)
```

## DSPy Integration (The Right Tool)

**Why DSPy is perfect for this:**

1. **Backward optimization** - Evaluates final output, optimizes all stages backward automatically
2. **Recursive by design** - MIPROv2 optimizer uses bootstrapping (recursive refinement)
3. **Minimal framework** - Library, not framework; hook into existing code
4. **Metric-driven** - You define success metric, it optimizes toward it
5. **Proven** - 23,000 GitHub stars, production use at scale

**DSPy Applied to Our Use Case:**

```python
import dspy

# Define your pipeline as composable modules
class SpecToPlan(dspy.Module):
    def forward(self, spec):
        return self.plan_prompt(spec=spec)

class PlanToCode(dspy.Module):
    def forward(self, plan):
        return self.implement_prompt(plan=plan)

class CodeToTests(dspy.Module):
    def forward(self, code):
        return self.test_prompt(code=code)

# Compose into full workflow
class FullSDLC(dspy.Module):
    def __init__(self):
        self.plan = SpecToPlan()
        self.implement = PlanToCode()
        self.test = CodeToTests()

    def forward(self, spec):
        plan = self.plan(spec)
        code = self.implement(plan)
        tests = self.test(code)
        return code, tests

# Define backward grading metric
def sdlc_metric(spec, prediction, trace=None):
    """Evaluate final output against original spec"""
    code, tests = prediction

    # Deterministic checks
    tests_pass = run_tests(code, tests)
    no_errors = count_errors(code) == 0

    # LLM semantic check
    spec_match = llm_judge(f"Does this code satisfy spec?\nSpec: {spec}\nCode: {code}")

    # Backward grading: final output validates everything
    return tests_pass and no_errors and spec_match > 0.8

# Recursive optimization (TRM-style)
optimizer = dspy.MIPROv2(
    metric=sdlc_metric,
    num_candidates=10,  # Generate 10 variants per iteration
    init_temperature=1.0  # Exploration
)

# This automatically optimizes ALL stages recursively
optimized_pipeline = optimizer.compile(
    FullSDLC(),
    trainset=test_cases,
    valset=held_out_cases
)

# Now optimized_pipeline has better prompts for ALL stages
# Achieved through recursive refinement, just like TRM
```

**How DSPy Implements TRM Principles:**

1. **Recursive Refinement** - MIPROv2 bootstraps: generates candidates, evaluates, refines, repeats
2. **Deep Supervision** - Optimizes each module based on final metric (backward grading)
3. **Adaptive Halting** - Stops when validation performance plateaus
4. **Simplicity** - You write simple modules, it handles optimization
5. **Specialized** - Each module optimizes for its specific task
6. **Efficient** - Works with 50-100 examples, not millions

## The Complete System (TRM + DSPy)

```
┌─────────────────────────────────────────────────────┐
│  DSPy Pipeline (Composable Modules)                 │
│  ├─> Spec → Plan module                             │
│  ├─> Plan → Code module                             │
│  ├─> Code → Test module                             │
│  └─> Test → Review module                           │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Backward Grading Metric (Final Output Validates)   │
│  ├─> Does final code satisfy original spec?         │
│  ├─> Do tests pass?                                 │
│  ├─> Are there errors?                              │
│  └─> Score: 0.0 - 1.0                               │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Recursive Optimizer (TRM-inspired)                 │
│  ├─> Generate 10 prompt variants                    │
│  ├─> Test each on 20 examples                       │
│  ├─> Score via backward metric                      │
│  ├─> Select best performers                         │
│  ├─> Bootstrap (refine based on what worked)        │
│  └─> Repeat until convergence (adaptive halt)       │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Optimized Prompts Deployed                         │
│  ALL stages improved simultaneously                 │
│  Through backward evaluation from final output      │
└─────────────────────────────────────────────────────┘
```

## Why This Works (TRM Proof)

**TRM showed:**
- 7M parameters beat billion-parameter models
- Recursive loops beat massive scale
- Deep supervision at each step enables learning
- Simplicity enables generalization
- $500 and 2 days beats millions and weeks

**Our system will show:**
- Simple recursive loop beats complex frameworks
- Backward grading beats stage-by-stage metrics
- DSPy's bootstrapping (recursive) beats manual tuning
- Specialization (per-stage) beats general optimization
- Minimal infrastructure beats heavyweight pipelines

## Implementation Priority

### Week 1: DSPy Proof of Concept (TRM-inspired)
```python
# 1. Define one module (plan stage)
class SpecToPlan(dspy.Module):
    def forward(self, spec):
        return self.generate_plan(spec=spec)

# 2. Define backward metric
def plan_quality(spec, plan):
    # Does plan satisfy spec?
    # Deterministic + LLM check
    return score

# 3. Optimize recursively
optimizer = dspy.MIPROv2(metric=plan_quality)
optimized = optimizer.compile(SpecToPlan(), trainset)

# 4. Compare before/after
baseline_quality = evaluate(baseline_prompt, test_cases)
optimized_quality = evaluate(optimized_prompt, test_cases)

# If optimized > baseline: TRM principles validated
```

**Time:** 1-2 hours (not weeks!)
**Cost:** $50-100 in API calls
**Proof:** Does recursive optimization work?

### Week 2: Full Pipeline Optimization
```python
# Extend to all 5 stages
class FullSDLC(dspy.Module):
    def __init__(self):
        self.plan = SpecToPlan()
        self.implement = PlanToCode()
        self.test = CodeToTests()
        self.review = CodeToReview()
        self.document = CodeToDocs()

    def forward(self, spec):
        # Full workflow
        plan = self.plan(spec)
        code = self.implement(plan)
        tests = self.test(code)
        review = self.review(code, spec)
        docs = self.document(code, review)
        return code, tests, review, docs

# Backward metric: final output grades everything
def full_sdlc_metric(spec, prediction):
    code, tests, review, docs = prediction

    # All must pass
    return (
        tests_pass(code, tests) and
        no_errors(code) and
        review_valid(review) and
        spec_satisfied(spec, code)
    )

# Optimize ALL stages recursively
optimized_pipeline = optimizer.compile(FullSDLC(), trainset)

# DSPy automatically improves all 5 stages through backward evaluation
```

**Time:** 2-4 hours
**Cost:** $200-500 in API calls
**Result:** All stages improved simultaneously

### Week 3-4: Continuous Recursive Improvement
```python
# Run forever, like TRM's 16 recursive loops
while True:
    # Collect new examples from production
    new_examples = collect_production_data()

    # Re-optimize (recursive refinement)
    reoptimized = optimizer.compile(
        current_pipeline,
        trainset=new_examples,
        valset=held_out
    )

    # Adaptive halting
    if not improved_significantly(reoptimized, current_pipeline):
        sleep(1_hour)  # Wait for more data
        continue

    # Deploy improvement
    current_pipeline = reoptimized
    log_improvement()
```

**Time:** Runs indefinitely
**Cost:** $100-300/month
**Result:** Continuous recursive self-improvement (TRM-style)

## Meta-Improvement: Optimizing the Optimizer

**TRM principle:** Just as network improves answer recursively, we improve improvement recursively.

```python
# Loop A: Optimize prompts using metric v1
optimized_prompts = optimize(prompts, metric_v1)

# Loop B: Optimize metric itself
class MetricOptimizer(dspy.Module):
    """Learn better evaluation metrics"""
    def forward(self, output):
        return self.score(output)

# Train metric to distinguish good from bad
optimized_metric = optimizer.compile(
    MetricOptimizer(),
    trainset=labeled_good_bad_examples
)

# Use optimized metric to optimize prompts
better_prompts = optimize(prompts, optimized_metric)

# Recursive meta-improvement achieved
```

## Key Differences from What I Suggested Before

### Before (Wrong):
- ❌ PromptFoo + OPRO + DeepEval + Reflexion + EvalPlus
- ❌ 5 different frameworks integrated
- ❌ Complex multi-stage orchestration
- ❌ 1-4 week timeline
- ❌ Heavy infrastructure

### Now (TRM-inspired, Right):
- ✅ DSPy only (one library)
- ✅ Simple recursive optimization loop
- ✅ Backward evaluation (final output grades all)
- ✅ 1-4 hour timeline for proof of concept
- ✅ Minimal infrastructure

## Why DSPy is the Samsung TRM of Prompt Optimization

**TRM Achievement:**
- 7M parameters vs billions
- $500 vs millions
- 2 days vs weeks
- Recursive refinement
- **Beat the giants**

**DSPy Achievement:**
- Simple modules vs complex frameworks
- Minimal infrastructure vs heavyweight pipelines
- Hours vs weeks
- Recursive bootstrapping (MIPROv2)
- **Beat manual prompt engineering**

Both prove: **Architectural elegance + recursive refinement > brute force scale**

## Conclusion: The Right Tool is DSPy with TRM Principles

**Your question:** "Is PromptFoo the right tool?"
**Answer:** No. DSPy is the right tool.

**Your insight:** Apply Samsung TRM's recursive principles
**Answer:** Exactly. DSPy already implements this (MIPROv2 bootstrapping).

**Your requirement:** Variable-length pipelines (2-7 stages)
**Answer:** DSPy handles this (composable modules).

**Your requirement:** Backward grading (final output validates all)
**Answer:** DSPy's core design (define metric on final output, optimize all stages).

**Your requirement:** Simple, powerful, proven
**Answer:** DSPy (23,000 stars, production proven, research-backed).

**The system:**
1. Define pipeline as DSPy modules (2-7 stages, variable)
2. Define backward metric (final output quality)
3. Run MIPROv2 optimizer (recursive refinement, TRM-style)
4. Prompts improve automatically
5. Loop forever (continuous improvement)

**Timeline:**
- Week 1: Proof of concept (1-2 hours)
- Week 2: Full pipeline (2-4 hours)
- Week 3+: Continuous operation (runs forever)

**This is the TRM approach applied to prompts:** Recursive refinement, deep supervision, adaptive halting, simplicity over complexity, specialized excellence.
