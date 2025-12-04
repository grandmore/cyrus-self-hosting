# Workflow Structure Specification

**Purpose:** Define the exact structure for external workflows at `~/.cyrus/workflows/`

---

## Core Principle

**We only create folders for workflows we want to override or create new.**

Cyrus has internal procedures (full-development, simple-question, debugger-full, etc.). If we don't override one, Cyrus uses its internal version unchanged. We don't mirror everything - only what we're customizing.

---

## Folder Structure

Each workflow lives in its own folder, named after the procedure:

```
~/.cyrus/workflows/
└── {procedure-name}/                     ← Folder name = procedure name
    ├── workflow.ts                       ← REQUIRED: exports resolve() hook
    ├── types.ts                          ← Type definitions
    ├── registry.ts                       ← Procedure/subroutine definitions
    ├── system-prompts/                   ← System prompts used by this workflow
    │   └── *.md
    ├── subroutines/                      ← Subroutine prompts used by this workflow
    │   └── *.md
    ├── templates/                        ← Templates used by this workflow
    │   └── *.md
    └── versions/                         ← Evolution's version tracking (our addition)
        ├── versions.json
        └── *.v1.md, *.v2.md, etc.
```

---

## Example: full-development

This workflow overrides Cyrus's `full-development` procedure.

```
~/.cyrus/workflows/
└── full-development/
    ├── workflow.ts                       ← resolve() hook
    ├── types.ts
    ├── registry.ts
    ├── system-prompts/
    │   └── builder.md                    ← Only what full-development uses
    ├── subroutines/
    │   ├── coding-activity.md            ← full-development uses these 4
    │   ├── verifications.md
    │   ├── git-gh.md
    │   └── concise-summary.md
    ├── templates/
    │   └── prompt-template.md
    └── versions/
        ├── versions.json
        ├── coding-activity.v1.md
        ├── verifications.v1.md
        ├── git-gh.v1.md
        └── concise-summary.v1.md
```

**Note:** We do NOT include `question-answer.md`, `debugger-fix.md`, etc. because those belong to other procedures (simple-question, debugger-full). Each workflow folder only contains what that workflow uses.

---

## Example: Adding a New Workflow (full-development-tdd)

To create a TDD variant that enforces test-driven development:

```
~/.cyrus/workflows/
├── full-development/                     ← Existing override
└── full-development-tdd/                 ← NEW workflow
    ├── workflow.ts                       ← Different subroutine sequence
    ├── types.ts
    ├── registry.ts
    ├── system-prompts/
    │   └── builder.md
    ├── subroutines/
    │   ├── write-failing-test.md         ← TDD-specific steps
    │   ├── implement-minimal.md
    │   ├── verify-pass.md
    │   ├── refactor.md
    │   ├── git-gh.md
    │   └── concise-summary.md
    ├── templates/
    └── versions/
```

This is a **sibling** to full-development, not nested inside it. It would need to be added to Cyrus's classification mapping to be routable.

---

## Example: Non-Code Workflows

Workflows aren't limited to code. Examples:

```
~/.cyrus/workflows/
├── full-development/
├── full-development-tdd/
├── copywriting/                          ← Writing copy for websites
│   ├── workflow.ts
│   ├── subroutines/
│   │   ├── research-audience.md
│   │   ├── draft-copy.md
│   │   ├── review-tone.md
│   │   └── finalize.md
│   └── versions/
└── youtube-content/                      ← Video content creation
    ├── workflow.ts
    ├── subroutines/
    │   ├── research-topic.md
    │   ├── write-script.md
    │   ├── plan-visuals.md
    │   └── create-thumbnail-brief.md
    └── versions/
```

---

## What We Don't Create

- `simple-question/` - Not overriding, Cyrus internal works fine
- `debugger-full/` - Not overriding, Cyrus internal works fine
- `orchestrator-full/` - Not overriding, Cyrus internal works fine
- `plan-mode/` - Not overriding, Cyrus internal works fine
- `documentation-edit/` - Not overriding, Cyrus internal works fine

If we later want to override any of these, we create the folder with the same structure.

---

## The resolve() Hook

`workflow.ts` must export a `resolve()` function:

```typescript
import type { ProcedureDefinition } from './types';

export async function resolve(context: ResolveContext): Promise<ProcedureDefinition> {
  // Return the procedure definition
  // Evolution wraps this to modify paths for A/B testing
  return PROCEDURE;
}
```

---

## Fallback Behavior

When Cyrus loads a procedure:

1. Check `~/.cyrus/workflows/{procedure-name}/workflow.js` exists?
   - YES → import and call `resolve()` → use returned procedure
   - NO → use Cyrus internal procedure

This means:
- No external folder = Cyrus works exactly as before
- External folder exists = Cyrus uses our override

---

## versions/ Folder

This is **our addition** for Evolution. Cyrus doesn't know about it.

- `versions.json` - Tracks current version and history for each prompt
- `*.v1.md`, `*.v2.md` - Historical versions of prompts

Evolution uses this for A/B testing and tracking improvements.
