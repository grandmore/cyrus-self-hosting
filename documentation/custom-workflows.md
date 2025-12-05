# Custom Workflows and Template Overloading

This guide explains how to customize Cyrus workflows using the external workflow loading system. You can override built-in procedures, create custom workflows, and modify system prompts without changing Cyrus's source code.

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Quick Start](#quick-start)
- [Creating Custom Workflows](#creating-custom-workflows)
  - [The registry.js File](#the-registryjs-file)
  - [Subroutine Definitions](#subroutine-definitions)
  - [Procedure Definitions](#procedure-definitions)
  - [Classification Mappings](#classification-mappings)
- [System Prompts](#system-prompts)
- [Custom EdgeWorker](#custom-edgeworker)
- [Precedence Rules](#precedence-rules)
- [Debugging](#debugging)
- [Examples](#examples)

---

## Overview

Cyrus uses a **three-tier loading system** that checks for workflow definitions in this order:

```
1. ~/.cyrus/workflows/           ← User overrides (HIGHEST PRIORITY)
2. {repository}/workflows/       ← Repository-specific workflows
3. Internal Cyrus registry       ← Built-in defaults (LOWEST PRIORITY)
```

This allows you to:
- Override any built-in workflow globally in `~/.cyrus/workflows/`
- Create repository-specific workflows
- Fall back to Cyrus defaults when no override exists

---

## Directory Structure

External workflows are located at `~/.cyrus/workflows/`. Each workflow is a folder containing:

```
~/.cyrus/workflows/
├── full-development/                    ← Workflow folder (matches procedure name)
│   ├── registry.js                      ← Procedure and subroutine definitions
│   └── system-prompts/                  ← System prompt overrides
│       ├── builder.md                   ← Override for builder prompt type
│       ├── debugger.md                  ← Override for debugger prompt type
│       └── custom-type.md               ← New custom prompt type
├── my-custom-workflow/                  ← Custom workflow
│   ├── registry.js
│   └── system-prompts/
│       └── ...
└── EdgeWorker.js                        ← Optional: Override entire EdgeWorker class
```

### Key Files

| File | Purpose |
|------|---------|
| `registry.js` | Exports procedures, subroutines, and classification mappings |
| `system-prompts/*.md` | System prompt files (Markdown) |
| `EdgeWorker.js` | Complete EdgeWorker class override (advanced) |

---

## Quick Start

### Step 1: Create the workflows directory

```bash
mkdir -p ~/.cyrus/workflows/full-development/system-prompts
```

### Step 2: Create a registry.js file

```javascript
// ~/.cyrus/workflows/full-development/registry.js
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define subroutines
export const SUBROUTINES = {
  codingActivity: {
    name: "coding-activity",
    promptPath: join(__dirname, "subroutines/coding-activity.md"),
    description: "Implementation phase for code changes",
  },
  verifications: {
    name: "verifications",
    promptPath: join(__dirname, "subroutines/verifications.md"),
    description: "Run tests, linting, and type checking",
  },
  gitGh: {
    name: "git-gh",
    promptPath: join(__dirname, "subroutines/git-gh.md"),
    description: "Commit changes and create/update PR",
  },
  conciseSummary: {
    name: "concise-summary",
    promptPath: join(__dirname, "subroutines/concise-summary.md"),
    singleTurn: true,
    description: "Brief summary for Linear",
    suppressThoughtPosting: true,
    disallowedTools: ["mcp__linear__create_comment"],
  },
};

// Define procedures
export const PROCEDURES = {
  "full-development": {
    name: "full-development",
    description: "Full development workflow with verification",
    subroutines: [
      SUBROUTINES.codingActivity,
      SUBROUTINES.verifications,
      SUBROUTINES.gitGh,
      SUBROUTINES.conciseSummary,
    ],
  },
};

// Optional: Map classifications to procedures
export const CLASSIFICATION_TO_PROCEDURE = {
  code: "full-development",
};

// Optional: Register custom prompt types
export const PROMPT_TYPES = ["tdd-builder", "custom-reviewer"];
```

### Step 3: Create subroutine prompt files

```bash
mkdir -p ~/.cyrus/workflows/full-development/subroutines
```

Create `~/.cyrus/workflows/full-development/subroutines/coding-activity.md`:

```markdown
# Coding Activity

Your task is to implement the requested changes.

## Guidelines
- Write clean, maintainable code
- Follow existing patterns in the codebase
- Do NOT run git commands in this phase

## Steps
1. Analyze the requirements
2. Plan the implementation
3. Write the code
4. Add appropriate tests
```

### Step 4: Restart Cyrus

Cyrus loads external workflows at startup. Restart the agent to pick up your changes.

---

## Creating Custom Workflows

### The registry.js File

The `registry.js` file is the entry point for your workflow. It must be a JavaScript ES module (not CommonJS) and can export:

| Export | Type | Description |
|--------|------|-------------|
| `SUBROUTINES` | Object | Map of subroutine definitions |
| `PROCEDURES` | Object | Map of procedure definitions |
| `CLASSIFICATION_TO_PROCEDURE` | Object | Maps request types to procedures |
| `PROMPT_TYPES` | Array | Custom prompt type names |

### Subroutine Definitions

A subroutine represents a single step in a workflow. Each subroutine has:

```javascript
{
  name: string,              // Unique identifier
  promptPath: string,        // Absolute path to prompt file
  description: string,       // Human-readable description
  singleTurn?: boolean,      // If true, Claude responds once (maxTurns=1)
  requiresApproval?: boolean, // Pause for human approval
  suppressThoughtPosting?: boolean, // Don't post thoughts to Linear
  disallowedTools?: string[], // Tools Claude cannot use
}
```

**Important**: For external workflows, `promptPath` must be an **absolute path**. Use `join(__dirname, "...")` to build paths relative to your registry.js file.

#### Subroutine Fields Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique identifier for the subroutine |
| `promptPath` | string | Yes | Absolute path to the prompt file |
| `description` | string | Yes | Human-readable description |
| `singleTurn` | boolean | No | If true, Claude responds once and moves on |
| `requiresApproval` | boolean | No | Pause workflow for human approval |
| `suppressThoughtPosting` | boolean | No | Skip posting thoughts to Linear (still posts summary) |
| `skipLinearPost` | boolean | No | Skip all Linear activity posts |
| `disallowedTools` | string[] | No | Tools Claude cannot use in this subroutine |

### Procedure Definitions

A procedure is an ordered sequence of subroutines:

```javascript
{
  name: string,              // Unique identifier (matches folder name)
  description: string,       // When to use this procedure
  subroutines: SubroutineDefinition[], // Ordered steps
}
```

### Classification Mappings

Classifications route issues to procedures based on their type:

```javascript
export const CLASSIFICATION_TO_PROCEDURE = {
  question: "simple-question",
  documentation: "documentation-edit",
  transient: "simple-question",
  planning: "plan-mode",
  code: "full-development",
  debugger: "debugger-full",
  orchestrator: "orchestrator-full",
};
```

Valid classifications:
- `question` - Questions that don't modify code
- `documentation` - Docs-only changes
- `transient` - Temporary/one-off requests
- `planning` - Planning without implementation
- `code` - Code changes (default)
- `debugger` - Bug debugging workflow
- `orchestrator` - Multi-issue orchestration

---

## System Prompts

System prompts define Claude's persona and capabilities for different types of work.

### Built-in Prompt Types

| Prompt Type | Description |
|-------------|-------------|
| `builder` | Default coding persona |
| `debugger` | Bug investigation persona |
| `scoper` | Issue analysis and planning |
| `orchestrator` | Multi-issue coordination |

### Overriding System Prompts

Create files in `~/.cyrus/workflows/{workflow}/system-prompts/`:

```
~/.cyrus/workflows/full-development/system-prompts/
├── builder.md      ← Overrides internal builder prompt
├── debugger.md     ← Overrides internal debugger prompt
└── tdd-builder.md  ← New custom prompt type
```

### Creating Custom Prompt Types

1. Create the prompt file:

```markdown
<!-- ~/.cyrus/workflows/full-development/system-prompts/tdd-builder.md -->

# TDD-First Developer

You are a test-driven development expert. Before writing any implementation:

1. Write failing tests that define the expected behavior
2. Run the tests to confirm they fail
3. Write minimal code to make tests pass
4. Refactor if needed

Never write implementation before tests.
```

2. Register the prompt type in your registry.js:

```javascript
export const PROMPT_TYPES = ["tdd-builder"];
```

---

## Custom EdgeWorker

For advanced customization, you can override the entire EdgeWorker class:

```javascript
// ~/.cyrus/workflows/EdgeWorker.js
import { EdgeWorker as BaseEdgeWorker } from "@anthropic-ai/cyrus-edge-worker";

export class EdgeWorker extends BaseEdgeWorker {
  // Override methods as needed
  async processIssue(issue) {
    console.log("[Custom EdgeWorker] Processing:", issue.identifier);
    return super.processIssue(issue);
  }
}
```

**Warning**: This is an advanced feature. Breaking changes in the base EdgeWorker may require updates to your override.

---

## Precedence Rules

When Cyrus loads workflows, it follows this precedence:

### For Procedures

1. Check `~/.cyrus/workflows/{name}/registry.js` for procedure
2. If found, use external procedure
3. If not found, use internal Cyrus procedure

### For System Prompts

1. Check `~/.cyrus/workflows/{workflow}/system-prompts/{type}.md`
2. If found, use external prompt
3. If not found, use internal Cyrus prompt

### For Classifications

1. Check external `CLASSIFICATION_TO_PROCEDURE` mappings
2. If classification has external mapping, use it
3. If not, use internal Cyrus mapping

---

## Debugging

### Logging

Cyrus logs all external workflow loading with the `[External Workflow]` prefix:

```
[External Workflow] Loaded subroutine "coding-activity" from ~/.cyrus/workflows/full-development/registry.js
[External Workflow] Loaded procedure "full-development" from ~/.cyrus/workflows/full-development/registry.js
[External Workflow] Loaded system prompt "builder" from ~/.cyrus/workflows/full-development/system-prompts/builder.md
[External Workflow] Using external full-development system prompt from /Users/x/.cyrus/workflows/system-prompts/builder.md
```

### Verifying Prompt Loading

Check which prompt file was loaded:

```
[EdgeWorker] Loaded coding-activity subroutine prompt (2543 characters)
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Workflow not loading | Ensure `registry.js` uses ES module syntax (`export`, not `module.exports`) |
| Prompt not found | Verify `promptPath` is an absolute path |
| Changes not taking effect | Restart Cyrus to reload external workflows |
| Import errors | Ensure paths use `fileURLToPath` for cross-platform compatibility |

---

## Examples

### Example 1: Override coding-activity prompt

```bash
# Create the directory structure
mkdir -p ~/.cyrus/workflows/full-development/subroutines

# Copy the internal prompt as a starting point (from Cyrus source)
# Then edit to customize
```

### Example 2: Add a new verification step

```javascript
// ~/.cyrus/workflows/full-development/registry.js
export const SUBROUTINES = {
  // ... existing subroutines ...

  securityReview: {
    name: "security-review",
    promptPath: join(__dirname, "subroutines/security-review.md"),
    description: "Check for security vulnerabilities",
  },
};

export const PROCEDURES = {
  "full-development": {
    name: "full-development",
    description: "Full development with security review",
    subroutines: [
      SUBROUTINES.codingActivity,
      SUBROUTINES.securityReview,  // New step
      SUBROUTINES.verifications,
      SUBROUTINES.gitGh,
      SUBROUTINES.conciseSummary,
    ],
  },
};
```

### Example 3: Create a custom workflow for documentation

```javascript
// ~/.cyrus/workflows/docs-only/registry.js
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const SUBROUTINES = {
  writeDocumentation: {
    name: "write-documentation",
    promptPath: join(__dirname, "subroutines/write-docs.md"),
    description: "Write or update documentation",
  },
  reviewDocs: {
    name: "review-docs",
    promptPath: join(__dirname, "subroutines/review-docs.md"),
    description: "Review documentation for accuracy",
    singleTurn: true,
  },
  commitDocs: {
    name: "commit-docs",
    promptPath: join(__dirname, "subroutines/commit-docs.md"),
    description: "Commit documentation changes",
  },
};

export const PROCEDURES = {
  "docs-only": {
    name: "docs-only",
    description: "Documentation-only workflow without code verification",
    subroutines: [
      SUBROUTINES.writeDocumentation,
      SUBROUTINES.reviewDocs,
      SUBROUTINES.commitDocs,
    ],
  },
};

// Route documentation requests to this workflow
export const CLASSIFICATION_TO_PROCEDURE = {
  documentation: "docs-only",
};
```

### Example 4: Override system prompt with TDD focus

```markdown
<!-- ~/.cyrus/workflows/full-development/system-prompts/builder.md -->

# Test-Driven Developer

You are an expert software developer who follows strict TDD practices.

## Core Principles

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Clean up while keeping tests green

## Rules

- NEVER write implementation code before tests
- Each test should test ONE thing
- Tests are documentation - make them readable
- Prefer integration tests over unit tests for behavior

## Workflow

1. Understand the requirement
2. Write a failing test that would pass if the requirement is met
3. Run the test - confirm it fails
4. Write the simplest code to make the test pass
5. Run the test - confirm it passes
6. Refactor if needed (tests should still pass)
7. Repeat for next requirement
```

---

## API Reference

### Exported Functions from external-loader.ts

| Function | Description |
|----------|-------------|
| `getProcedure(name)` | Get procedure by name (external first, then internal) |
| `getProcedureForClassification(classification)` | Get procedure name for a classification |
| `getSystemPromptPath(promptType, internalDir)` | Get system prompt path (external first, then internal) |
| `loadExternalProcedure(name)` | Get only external procedure (undefined if not cached) |
| `loadExternalSystemPrompt(promptType)` | Get only external system prompt path |
| `loadExternalSubroutine(name)` | Get external subroutine by name |
| `getExternalClassificationToProcedure(classification)` | Get external classification mapping |
| `getAllExternalClassificationMappings()` | Get all external classification mappings |
| `getExternalPromptTypes()` | Get registered external prompt types |
| `getAllLoadedPromptTypes()` | Get all loaded prompt types (external and internal) |

---

## Built-in Procedures Reference

| Procedure | Classification | Description |
|-----------|----------------|-------------|
| `simple-question` | question, transient | Questions without code changes |
| `documentation-edit` | documentation | Docs-only changes |
| `full-development` | code | Full workflow with tests and PR |
| `debugger-full` | debugger | Bug reproduction and fix |
| `orchestrator-full` | orchestrator | Multi-issue coordination |
| `plan-mode` | planning | Planning without implementation |

### Built-in Subroutines Reference

| Subroutine | Used By | Description |
|------------|---------|-------------|
| `primary` | documentation-edit, orchestrator-full | Main work execution |
| `coding-activity` | full-development | Code implementation |
| `verifications` | full-development, debugger-full | Tests, linting, type checking |
| `git-gh` | full-development, documentation-edit, debugger-full | Git and GitHub operations |
| `concise-summary` | multiple | Brief summary for Linear |
| `verbose-summary` | - | Detailed summary |
| `debugger-reproduction` | debugger-full | Bug reproduction |
| `debugger-fix` | debugger-full | Bug fix implementation |
| `question-investigation` | simple-question | Research for answers |
| `question-answer` | simple-question | Format final answer |
| `preparation` | plan-mode | Analyze and plan |
| `plan-summary` | plan-mode | Present plan |
| `get-approval` | - | User approval workflow |
