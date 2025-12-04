# ADW Execution Flow

## Architecture Pattern

**Two types of scripts:**

1. **Orchestrators** - Chain Python scripts together
   - Examples: `adw_plan_build_test.py`, `adw_sdlc.py`
   - Use: `subprocess.run(['uv', 'run', 'adw_*.py'])`
   - Purpose: Compose workflows from individual Python scripts

2. **Workers** - Call Claude CLI directly
   - Examples: `adw_plan.py`, `adw_test.py`, `adw_build.py`
   - Use: `execute_template(slash_command='/feature', ...)`
   - Purpose: Execute Claude commands and log output

**Rule:**
- Calling **Python scripts** → use `subprocess.run()`
- Calling **Claude CLI** → use `execute_template()`

**Why `execute_template()` for Claude calls:**
- Logs output to `agents/{adw_id}/{agent_name}/raw_output.jsonl`
- Provides debugging/observability
- Consistent error handling
- Organized state tracking under ADW ID

## Standard Workflow

```
uv run adws/adw_plan_build_test.py <issue-number>
│
├─► uv run adws/adw_plan.py <issue-number> <adw-id>
│   ├─► gh issue view <issue-number> --json number,title,body
│   ├─► claude -p "/classify_issue <issue_json>"
│   ├─► claude -p "/generate_branch_name <issue_json> <command> <adw_id>"
│   ├─► git checkout -b <branch_name>
│   ├─► claude -p "/prime <issue>
│   ├─► claude -p "/tools <issue>
│   ├─► claude -p "/feature <issue_number> <adw_id> <issue_json>"
│   │   OR
│   │   claude -p "/bug <issue_number> <adw_id> <issue_json>"
│   │   OR
│   │   claude -p "/chore <issue_number> <adw_id> <issue_json>"
│   │   └─► Output: specs/issue-{num}-adw-{id}-sdlc_planner-*.md
│   ├─► git add specs/*.md
│   ├─► git commit -m "<message>"
│   └─► git push && gh pr create
│
├─► uv run adws/adw_build.py <issue-number> <adw-id>
│   ├─► Read plan_file from state: agents/<adw_id>/adw_state.json
│   └─► claude -p "/implement <plan_file>"
│       └─► Implements code from plan
│
└─► uv run adws/adw_test.py <issue-number> <adw-id> --skip-e2e
    └─► Test Loop (max 4 attempts):
        │
        ├─► Attempt 1/4:
        │   ├─► claude -p "/test"
        │   │   ├─► uv run adws/adw_lint_backend.py
        │   │   │   └─► .claude/runners/backend-lint.sh
        │   │   ├─► uv run adws/adw_test_backend.py
        │   │   │   └─► .claude/runners/backend-test.sh
        │   │   ├─► uv run adws/adw_lint_frontend.py
        │   │   │   └─► .claude/runners/frontend-lint.sh
        │   │   └─► uv run adws/adw_test_frontend.py
        │   │       └─► .claude/runners/frontend-test.sh
        │   │
        │   └─► If PASS: git commit && git push → Exit (success)
        │
        ├─► If FAIL:
        │   ├─► claude -p "/resolve_failed_test <error_output>"
        │   │   └─► Fixes code issues
        │   └─► Loop to Attempt 2/4
        │
        ├─► Attempt 2/4: (repeat /test → /resolve_failed_test)
        ├─► Attempt 3/4: (repeat /test → /resolve_failed_test)
        └─► Attempt 4/4: (repeat /test → /resolve_failed_test)
            └─► If still FAIL: Exit with error
```


## Claude Commands Called

### Python Script → Claude CLI Command

**adw_plan.py:**
```python
execute_template(slash_command="/classify_issue", args=[issue_json])
→ claude -p "/classify_issue <issue_json>"

execute_template(slash_command="/generate_branch_name", args=[issue_json, command, adw_id])
→ claude -p "/generate_branch_name <issue_json> <command> <adw_id>"

execute_template(slash_command="/feature", args=[issue_number, adw_id, issue_json])
→ claude -p "/feature <issue_number> <adw_id> <issue_json>"
```

**adw_build.py:**
```python
execute_template(slash_command="/implement", args=[plan_file])
→ claude -p "/implement <plan_file>"
```

**adw_test.py:**
```python
execute_template(slash_command="/test", args=[])
→ claude -p "/test"

execute_template(slash_command="/resolve_failed_test", args=[error_output])
→ claude -p "/resolve_failed_test <error_output>"
```

## State File

**Location:** `agents/<adw-id>/adw_state.json`

**Updated by:**
- `adw_plan.py` - stores plan_file path, branch_name
- `adw_build.py` - stores build completion
- `adw_test.py` - stores test attempts, results

## Test Runners (Called by `/test` command)

```bash
uv run adws/adw_lint_backend.py
└─► .claude/runners/backend-lint.sh
    └─► cd main/api && yarn lint

uv run adws/adw_test_backend.py
└─► .claude/runners/backend-test.sh
    └─► cd main/api && yarn test

uv run adws/adw_lint_frontend.py
└─► .claude/runners/frontend-lint.sh
    └─► cd main/frontend && yarn lint

uv run adws/adw_test_frontend.py
└─► .claude/runners/frontend-test.sh
    └─► cd main/frontend && yarn test
```
