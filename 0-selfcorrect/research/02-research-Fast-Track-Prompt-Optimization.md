# Fast-Track Prompt Optimization for Claude Code CLI Custom Sequences

**Your context**: You're running Claude Code CLI with custom prompts in sequence (plan → code → test → etc.). You need to evaluate the outputs and improve the prompts systematically. Claude Code CLI will build the system, so you need clear documentation and straightforward integration paths.

**The critical question**: Which platform gets you from "manual prompt tweaking" to "data-driven improvement" fastest, while being simple enough that Claude Code CLI can build it reliably?

## Tier 1: Start Here (Days to First Value)

### PromptFoo - The Obvious First Choice
**Time to first evaluation: 2-4 hours**  
**Implementation complexity: Very Low**

**Why this wins for your use case:**
- **YAML configuration** - Your entire test suite is declarative config files, not code
- **CLI-first design** - Runs `promptfoo eval` and get instant results, no server setup
- **TypeScript native** - Zero Python bridging complexity
- **Built-in Claude support** - Add your API key, specify `anthropic:claude-sonnet-4.5`, done
- **Matrix testing** - Test plan prompt × code prompt × test prompt combinations automatically
- **Immediate visual feedback** - Web UI shows results instantly with `promptfoo view`

**What Claude Code CLI builds:**
1. **promptfooconfig.yaml** defining your prompt sequence tests
2. **Test cases file** with inputs/expected outputs for each stage (plan quality, code correctness, test coverage)
3. **Assertion definitions** for your four dimensions (quality, speed, capability, etc.)
4. **Wrapper scripts** to run your actual Claude Code CLI commands and capture outputs
5. **CI integration** to track prompt performance over time

**Your workflow becomes:**
```
1. Run: promptfoo eval (tests all prompt combinations)
2. Review: promptfoo view (visual comparison of results)
3. Improve: Edit prompts based on failures
4. Repeat: Automated regression detection
```

**The catch:** PromptFoo evaluates but doesn't automatically generate improved prompts. You make improvements manually based on the data. This is actually a feature for getting started—you understand what's working before automating optimization.

**Documentation quality:** Excellent. Claude Code CLI will have zero ambiguity building this.

**GitHub:** github.com/promptfoo/promptfoo  
**Docs:** promptfoo.dev/docs/intro/

---

## Tier 2: Add This Second (1-2 Weeks Later)

### OPRO - Simplest Automated Improvement
**Time to automated optimization: 1 week after PromptFoo is running**  
**Implementation complexity: Medium (Python subprocess bridge)**

**Why OPRO specifically fits your sequence:**
Your plan → code → test workflow maps perfectly to OPRO's optimization loop:
1. OPRO receives: "Current plan prompt generated vague requirements. Score: 6/10"
2. OPRO generates: 5-8 improved plan prompt variations
3. PromptFoo evaluates: All variations across your test suite
4. OPRO receives: Scores for each variation
5. Repeat: Until prompts converge to optimal performance

**What Claude Code CLI builds:**
1. **Python subprocess wrapper** calling OPRO with your PromptFoo scores
2. **Meta-prompt templates** teaching OPRO about your domain (code generation quality criteria)
3. **Score aggregation** combining quality/speed/capability metrics into optimization signal
4. **Candidate testing harness** running PromptFoo on each OPRO-generated prompt
5. **Version tracking** storing prompt evolution with git commits

**The key advantage:** OPRO is API-based meta-prompting. No training, no complex ML concepts, just "here are past prompts and scores, generate better ones." Claude Code CLI can absolutely build this.

**The simplicity factor:** You're essentially wrapping PromptFoo (which you already have) with a Python script that calls OpenAI/Anthropic API to suggest improvements. The OPRO paper provides clear pseudo-code.

**Expected improvement:** 10-30% on targeted metrics within first optimization cycle (typically 10-15 iterations).

**GitHub:** github.com/google-deepmind/opro  
**Paper:** arxiv.org/abs/2309.03409

---

## Tier 3: Skip Unless You Hit Limits

### DeepEval - When Determinism Matters
**Time to implementation: 2-3 weeks**  
**Complexity: Medium-High (Python, many concepts)**

**When you need this:**
- PromptFoo's LLM-as-judge scoring varies too much (50% variance between runs)
- You need legally defensible evaluation metrics (compliance, safety critical)
- Your prompts are for RAG or complex agentic workflows with many failure modes

**Why you probably don't need this first:**
Your plan/code/test sequence can be evaluated with simpler methods:
- **Plan quality**: Parse structured output + human rubric
- **Code correctness**: Run actual tests (EvalPlus style)
- **Test coverage**: Static analysis of generated tests

DeepEval's 14+ research-backed metrics and DAG determinism solve problems you likely don't have yet. The cognitive overhead of learning Answer Relevancy, Faithfulness, Contextual Precision, G-Eval, etc. slows you down when you just need "did the plan include all requirements?"

**When to add it:** After 4-6 weeks of PromptFoo + OPRO, when you've identified specific evaluation failure modes (inconsistent scoring, edge cases, ambiguous rubrics).

**GitHub:** github.com/confident-ai/deepeval

---

### EvoPrompt - When OPRO Plateaus
**Time to implementation: 2-3 weeks**  
**Complexity: Medium-High (evolutionary algorithms, hyperparameter tuning)**

**When you need this:**
- OPRO converges to local optimum after 3-4 cycles
- Your prompt space is large (many variables, complex structure)
- You want exploration rather than hill-climbing

**Why you probably don't need this first:**
Evolutionary algorithms (genetic algorithm, differential evolution) require:
- Population size tuning (10-20 typical)
- Mutation/crossover rate optimization
- Selection pressure balancing
- Multiple competing optimization runs

This complexity is overkill when your prompts are still immature. OPRO's simpler meta-prompting will find 80% of improvements with 20% of the complexity.

**When to add it:** Month 3+, after OPRO improvements plateau and you have strong evaluation infrastructure proving the system works.

**GitHub:** github.com/beeevita/EvoPrompt

---

### DSPy - Different Paradigm Entirely
**Time to implementation: 4-6 weeks**  
**Complexity: High (paradigm shift, learning curve)**

**Why this doesn't fit your immediate needs:**
DSPy wants you to define "signatures" (input/output specs) and write Python code defining your prompting logic. Then it compiles and optimizes the whole pipeline.

Your use case is simpler: you have explicit prompts (plan, code, test) that you want to improve. DSPy is solving the problem "I want to define what I need and have the system generate the prompts." You already have the prompts.

**When DSPy makes sense:**
- You're building a new system from scratch
- You want end-to-end pipeline optimization
- You have complex multi-step reasoning chains

**For your current need:** DSPy is a Ferrari when you need a pickup truck. It's technically impressive but wrong tool for "improve my existing plan/code/test prompts."

**GitHub:** github.com/stanfordnlp/dspy

---

## The Recommended Path

### Week 1: PromptFoo Foundation
**Have Claude Code CLI build:**
1. `promptfooconfig.yaml` with your three prompts (plan, code, test)
2. 10-15 test cases per prompt covering common scenarios
3. Assertions for each of your quality dimensions
4. Wrapper to run actual Claude Code CLI commands and capture outputs
5. Initial baseline: Document current prompt performance

**Deliverable:** Command `promptfoo eval` that scores all prompts across all tests with visual results.

**Estimated build time:** 4-8 hours (Claude Code CLI can do this in one session)  
**Your effort:** Define what "good" looks like for each stage (rubrics, test cases)

---

### Week 2-3: Optimization Infrastructure
**Have Claude Code CLI build:**
1. Score aggregation combining quality/speed/capability into single metric
2. Validation set (separate test cases never used in optimization)
3. Prompt version tracking (git-based with metadata)
4. Regression detection (alert when new prompts underperform baseline)
5. A/B testing harness (run old vs new prompts side-by-side)

**Deliverable:** Rigorous evaluation infrastructure that catches prompt regressions and validates improvements.

**Estimated build time:** 8-12 hours  
**Your effort:** Refine test cases based on real usage patterns

---

### Week 4-5: OPRO Integration
**Have Claude Code CLI build:**
1. Python OPRO wrapper spawning subprocess with scores
2. Meta-prompt templates explaining your code generation domain
3. Candidate evaluation loop (OPRO suggests → PromptFoo tests → scores back to OPRO)
4. Convergence detection (stop when improvements < 2% for 3 iterations)
5. Production deployment gating (improvements must exceed threshold with statistical significance)

**Deliverable:** `npm run optimize-prompts` that automatically improves your plan/code/test sequence.

**Estimated build time:** 12-20 hours  
**Your effort:** Review optimization results, provide domain knowledge for meta-prompts

---

### Month 2+: Continuous Improvement
**Add gradually:**
- Reflexion-style self-critique (Claude analyzes its own failures)
- Cost tracking with ccusage integration
- Multi-dimensional Pareto optimization (find best speed/quality tradeoffs)
- Production monitoring (real usage metrics vs test suite)
- Weekly automated optimization cycles

---

## Why This Path Works

**1. Immediate feedback loop**  
PromptFoo gives you data about prompt performance within hours. You see problems immediately instead of building complex systems blind.

**2. Builds on success**  
Each phase proves value before adding complexity. Week 1 evaluation proves testing works. Week 4 OPRO proves automation works. Month 2 optimizations prove continuous improvement works.

**3. Claude Code CLI can actually build this**  
PromptFoo's YAML config and CLI design means Claude Code CLI has zero ambiguity. OPRO's clear API and pseudo-code in the paper give Claude Code CLI explicit instructions. Everything has examples and documentation.

**4. Escape hatches everywhere**  
Don't like OPRO's suggestions? Use PromptFoo data to improve manually. OPRO plateaus? Add EvoPrompt. Need better evaluation? Add DeepEval. Each component is independent and replaceable.

**5. Matches your workflow**  
You already have sequential prompts. PromptFoo tests sequences natively. OPRO optimizes one prompt at a time or entire sequences. No paradigm shift required.

---

## What Claude Code CLI Builds First (Concrete)

**Session 1: PromptFoo MVP (4 hours)**

Have Claude Code CLI create:
```
project/
├── promptfooconfig.yaml          # Main config
├── prompts/
│   ├── plan.txt                  # Your current plan prompt
│   ├── code.txt                  # Your current code prompt  
│   └── test.txt                  # Your current test prompt
├── tests/
│   ├── plan-cases.yaml           # Test cases for planning
│   ├── code-cases.yaml           # Test cases for coding
│   └── test-cases.yaml           # Test cases for test generation
└── scripts/
    └── run-sequence.ts           # Runs Claude Code CLI with prompts
```

**The config file** defines:
- Which prompts to test (plan, code, test)
- Which models to use (Claude Sonnet 4.5)
- Which test cases apply to each prompt
- What assertions define success (quality thresholds, required elements, performance bounds)

**The test cases** specify:
- Input scenario (e.g., "Build a REST API endpoint for user authentication")
- Expected output characteristics (plan should include: database schema, security considerations, API routes)
- Assertions (plan length 200-500 words, includes "authentication" and "database", completeness score > 7/10)

**The runner script** does:
- Takes test case input
- Runs Claude Code CLI with current prompt
- Captures output
- Returns to PromptFoo for evaluation

Run `promptfoo eval` and you get a matrix showing which prompts pass/fail on which test cases with scores.

---

## The Decision Tree

**Start here:** PromptFoo (100% certainty this is right for Week 1)

**Add next:** OPRO (95% certainty this is right for Week 4)

**Consider later:**
- DeepEval: Only if scoring variance > 30% between runs
- EvoPrompt: Only if OPRO improvements < 5% after 3 cycles
- DSPy: Only if rebuilding system from scratch
- TextGrad: Only if you're doing research

**Never add:**
- Custom evaluation framework (use PromptFoo)
- Custom optimization algorithm (use OPRO)
- Complex ML training (not needed for prompt optimization)

---

## Cost Projections

**PromptFoo evaluation:**
- 15 test cases × 3 prompts × Claude Sonnet 4.5 = ~$0.50/run
- With caching: ~$0.10/run after first iteration
- Run 5x/day during active development: $2-3/day

**OPRO optimization:**
- 10 iterations × 6 candidates × 15 test cases = 900 API calls
- With aggressive caching: ~$10-15/optimization cycle
- Run weekly: $40-60/month

**Total first month:** ~$150-200 for comprehensive evaluation + initial automation

---

## The Bottom Line

**For fastest capability + simplest implementation:**

**Week 1: PromptFoo alone**  
- Build time: 4-8 hours
- Value: Systematic evaluation of your plan/code/test sequence
- Complexity: Very low (YAML config, CLI commands)

**Week 4: PromptFoo + OPRO**  
- Build time: +12-20 hours  
- Value: Automated prompt improvement with 10-30% gains
- Complexity: Medium (Python subprocess, score feedback loop)

**Month 2+: Gradual enhancement**  
- Build time: Ongoing incremental
- Value: Continuous improvement, production monitoring, advanced optimization
- Complexity: Scales with sophistication needs

This is the pragmatic path that gets you improving prompts with data within days, not months. PromptFoo's simplicity and TypeScript nativity make it ideal for Claude Code CLI to build. OPRO's API-based approach and clear documentation make it ideal for Week 2 automation.

Skip the complex frameworks until you've proven the simple approach works. You'll know when you need them—PromptFoo will show you the evaluation gaps, OPRO will show you the optimization limits. Let the data tell you when to add complexity, don't add it speculatively.

**Start with PromptFoo this week. Add OPRO next month. Everything else is optional optimization once the foundation proves itself.**