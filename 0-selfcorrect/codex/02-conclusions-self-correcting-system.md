# Self-Correcting Code‑Writing System — Conclusions

## What We’re Building
- A stripped‑back, self‑improving code‑writing loop that operates directly on our existing big prompts embedded in commands.
- No new frameworks; a lightweight Python overseer orchestrates runs, observes outcomes, proposes small prompt edits, and accepts only proven improvements.
- Works in our CLI workflow against real tasks, not synthetic demos.

## Core Beliefs
- Small, targeted prompt edits can measurably improve code quality and reliability over time.
- The final outcome is the ground truth: if the produced code executes and passes tests better, the upstream prompts improved.
- Reflection → hypothesis → minimal change → re‑test is superior to ad‑hoc retries.
- Monotonic acceptance (only keep improvements that win on agreed metrics) stabilizes progress and limits regressions.
- We can do all of this with Python alone (subprocess, diffs, logs) wrapped around our existing commands.

## Minimal Python‑Only Loop (Conceptual)
1) Run a target command with its current embedded prompt on a concrete task.
2) Capture artifacts: exit code, stdout/stderr, test results, and any diffs on edited files.
3) Generate a reflective critique from the failure/success signals to hypothesize a tiny prompt edit (e.g., add a constraint, clarify acceptance criteria, reduce verbosity, enforce tests first).
4) Apply one small, surgical prompt change; re‑run on the same task set.
5) Accept the change only if metrics improve by threshold and remain stable across a short holdout set; otherwise revert.
6) Log the diff + rationale so we can learn and audit.

## Signals That Matter
- Hard outcomes: exit code, unit/integration test pass rate, runtime errors, type errors.
- Lightweight quality: presence of required files/functions, token/latency budgets, basic lint/format checks when cheap.
- Resource/behavior: token usage, wall time, tool invocations (if any).

## Safety + Stability
- Change budget: only one small prompt edit per iteration; cap total edit size.
- A/B against the last accepted baseline before promoting a change.
- Fast revert: keep diffs and a rolling baseline to undo instantly.
- Backoff/plateau detection: stop when no improvement after N attempts.
- Prompt hygiene: avoid prompt bloat; prefer deletions and clarifications over additions.

## Why This Can Work
- Backward evaluation: optimizing for end‑to‑end outcomes tunes upstream prompts without modeling every internal step.
- Recursion with deep supervision: reflective self‑critiques focus edits on failure causes, not symptoms.
- Determinism where possible: fix seeds/models/tasks per iteration to attribute causality.

## Boundaries (What We’re Not Doing)
- No dependency on DSPy/TensorZero/PromptFoo, etc. Research informed thinking, but the system remains Python‑only over our existing commands.
- No large architectural rewrites; we adapt prompts inside the current command files.
- No open‑ended “optimize everything”; improvements are scoped to chosen commands and metrics.

## Open Questions
- Where in each command prompt do edits yield the highest leverage (constraints, examples, rubric, tool‑use instructions)?
- What metric weights reflect our true priorities (pass rate vs. latency vs. token spend)?
- How much exploration vs. exploitation: when to try bolder edits vs. incremental ones?
- Do we maintain per‑command specialized prompts or a shared core with command‑specific deltas?

## Next Conversation Seeds
- Pick one representative command to pilot (small surface, clear tests).
- Define its pass/fail rubric and plateau rules (thresholds, holdouts, N retries).
- Decide the smallest safe unit of change for that command’s prompt (and where to insert it).
- Choose a simple run log format (JSONL) and a diffs directory to persist evidence.

In short: we can run this today with Python alone, wrapped around our existing commands. The essence is disciplined iteration, tiny edits, hard outcome metrics, and monotonically accepted improvements.

