# Self-Improving ADW Pipeline Specification

## Purpose
Define the minimal measurement and feedback loop that lets the existing ADW (AI Developer Workflow) improve its own stage prompts without introducing external tooling. The goal: for each run, detect whether the shipped code satisfies spec requirements, identify the stage responsible when it does not, and use that evidence to update the stage prompt before re-running.

## Current Assets
- **Prompts**: `.claude/commands/*.md` (`/feature`, `/implement`, `/test`, `/review`, `/patch`, etc.) – the “brains” of each stage.
- **Schedulers**: `../adws/*.py` orchestrate deterministic execution of each stage (plan → build → test → review → document).
- **Artifacts per run** (already produced):
  - Plans in `specs/issue-*.md`
  - Raw transcripts & prompts in `agents/<adw_id>/<stage>/`
  - Test output JSON from `/test`
  - Review JSON + screenshots from `/review`
  - Git diffs & state files

These give us deterministic traces around stochastic model calls.

## Requirements
1. **Objective Spec Validation**  
   - For each requirement, run deterministic checks (CLI, tests, Playwright, DOM probe, etc.) to produce pass/fail with details.

2. **Stage Attribution**  
   - If a requirement fails, determine which stage failed to enforce it (plan, implement, test, review, or missing spec).

3. **Metric Logging**  
   - Record per-run, per-requirement metrics in a structured file, referencing the stages, artifacts, and outcomes.

4. **Prompt Adjustment Loop**  
   - Use the attribution data to patch the relevant prompt (via existing `/patch` or manual edits) and re-run targeted specs.
   - Compare new metrics to previous runs to confirm improvement or rollback.

## Data Model

### Validation Result
```json
{
  "run_id": "adw-1234",
  "spec_id": "issue-456",
  "requirement": "Button positioned 50px from right",
  "check": "playwright/button_position.ts",
  "status": "failed",
  "details": {
    "observed_offset_px": 120,
    "expected_offset_px": 50,
    "screenshot_path": "agents/adw-1234/reviewer/review_img/03_button.png"
  }
}
```

### Attribution Record
```json
{
  "run_id": "adw-1234",
  "spec_id": "issue-456",
  "requirement": "Button positioned 50px from right",
  "blamed_stage": "implement",
  "evidence": {
    "plan_mentions_requirement": true,
    "diff_contains_required_css": false,
    "tests_cover_requirement": false,
    "review_flagged_issue": false
  }
}
```

### Metrics File
Create `agents/<adw_id>/metrics.jsonl` containing merged validation + attribution entries:
```json
{
  "timestamp": "2025-01-01T12:34:56Z",
  "stage": "implement",
  "spec_id": "issue-456",
  "requirement": "button-offset",
  "status": "failed",
  "before_score": 0,
  "after_score": null,
  "evidence": {...}
}
```

## Process Flow

1. **Run Benchmark**
   - Execute `uv run adw_plan_build_test_review.py <issue>` (or `adw_sdlc.py`) across a curated set of specs.
   - Each run produces the standard artifacts.

2. **Validate Requirements**
   - For each spec, execute deterministic checks defined in `validation/` (scripts or existing tests).
   - Append validation results to `metrics.jsonl`.

3. **Attribution Logic**
   - Inspect artifacts in order:
     - Plan: parse sections & tasks; ensure requirement present.
     - Implementation: inspect git diff for relevant files/changes.
     - Test: parse `/test` JSON to see if requirement-specific test exists and if it failed.
     - Review: read review JSON for relevant issues.
   - Apply rule-based blame mapping (see table below) and append attribution to metrics.

4. **Prompt Adjustment**
   - For each failed requirement, use evidence to edit the appropriate `.claude/commands/*.md`.
   - Prefer using `/patch` to generate focused patch plans, then implement them manually or via `/implement`.

5. **Re-run & Compare**
   - Re-run the same spec(s); log new validation + attribution entries with `after_score`.
   - Compare aggregated metrics (e.g., requirement pass rate) to confirm improvement.

## Blame Mapping Table

| Condition                                                                    | Blamed Stage  | Remediation                                               |
|------------------------------------------------------------------------------|---------------|-----------------------------------------------------------|
| Requirement missing from plan                                                | `plan`        | Update `/feature` or `/bug` prompt to include detail      |
| Plan includes requirement, diff lacks implementation                         | `implement`   | Update `/implement` prompt                                |
| Plan & code correct, but tests don’t cover/detect failure                    | `test`        | Update `/test` prompt                                     |
| Tests miss it, review also marks success                                     | `review`      | Update `/review` prompt (add checklist/check)             |
| Requirement absent from spec input                                           | `dataset`     | Human action (spec fix)                                   |

## Deliverables
- `validation/` directory with deterministic checks per requirement type (CLI scripts, Playwright, etc.).
- `scripts/log_metrics.py` (or similar) to append validation + attribution records.
- Updates to ADW Python scripts (as needed) to call `log_metrics` after each stage.
- Documented procedure for prompt patching (`/patch` usage or manual workflow).
- Regression suite (list of specs/tests) to re-run after prompt updates.

## Success Criteria
- Every failure yields a `metrics.jsonl` entry with stage attribution and evidence.
- Prompt changes apply to specific stage `.md` files and result in measurable improvement (higher pass rate) over the regression suite.
- The process remains within existing ADW tooling—no external frameworks required.

