# External Workflow Loading System

**Purpose:** Load workflow definitions from `~/.cyrus/workflows/` instead of Cyrus's internal definitions, enabling iteration on prompts and workflow structure without modifying Cyrus code.

**Date:** 2025-12-04

---

## 1. What We're Building

When Cyrus needs a procedure (e.g., `full-development`), check if an external version exists. If yes, use it. If no, use internal.

The decision happens at runtime when a procedure is requested, not at startup.

---

## 2. What We've Built

### 2.1 External Workflow Structure

Location: `~/.cyrus/workflows/`

```
~/.cyrus/workflows/
└── full-development/
    ├── registry.js              ← Exact duplicate of Cyrus's registry.ts (as JavaScript)
    └── subroutines/             ← Prompt files
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

### 2.2 registry.js

Our `registry.js` is an exact duplicate of Cyrus's `registry.ts`, converted to JavaScript:

- Same exports: `SUBROUTINES`, `PROCEDURES`, `CLASSIFICATION_TO_PROCEDURE`, `getProcedure`, `getProcedureForClassification`, `getAllProcedureNames`
- Same structure, same flags, same everything
- Only difference: `promptPath` uses absolute paths via `join(__dirname, "subroutines/...")` instead of relative paths

This means when our registry is loaded, it behaves identically to Cyrus's internal registry, but points to our prompt files.

---

## 3. The Integration

### 3.1 What Cyrus Does Today

1. Orchestrator classifies the issue (e.g., "full-development")
2. `getProcedure("full-development")` returns the procedure from internal `PROCEDURES`
3. Cyrus runs the subroutines, loading prompts from internal paths

### 3.2 What We Want

1. Orchestrator classifies the issue (e.g., "full-development")
2. `getProcedure("full-development")` checks: does `~/.cyrus/workflows/full-development/registry.js` exist?
   - If yes: load procedure from external registry
   - If no: use internal `PROCEDURES`
3. Cyrus runs the subroutines, loading prompts from whatever paths the procedure specifies

### 3.3 Minimal Change in Cyrus

One small change in `getProcedure()` that calls out to our external code. All logic lives in our external file, not in Cyrus.

Cyrus should not contain:
- Path checking logic
- File existence checks
- Complex conditionals

Cyrus should only:
- Call a function that returns a procedure (or undefined)
- If returned, use it
- If not, fall back to internal

---

## 4. Why This Works

Our `registry.js` exports the same interface as Cyrus's `registry.ts`. When loaded:

- `getProcedure("full-development")` returns the same shape
- `promptPath` values are absolute paths to our files
- Cyrus's `loadSubroutinePrompt()` reads from whatever path it's given

No changes needed to:
- Types
- ProcedureRouter (except the one hook point)
- EdgeWorker prompt loading
- Anything else

---

## 5. Adding New Workflows

To add `youtube-scripts`:

1. Create `~/.cyrus/workflows/youtube-scripts/registry.js`
2. Define the procedure with its subroutines
3. Create prompt files in `subroutines/`

Cyrus will find it when `getProcedure("youtube-scripts")` is called.

---

## 6. Implementation Status

**Done:**
- [x] Created `~/.cyrus/workflows/full-development/` folder
- [x] Created `registry.js` as exact duplicate of Cyrus's registry (JavaScript)
- [x] Copied all prompt files to `subroutines/`

**Pending:**
- [ ] Minimal change in Cyrus to check external before internal

---

**End of Document**
