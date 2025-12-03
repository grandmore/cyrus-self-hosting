# Evolution Architecture Research

**Purpose:** Define how the Evolution package extends Cyrus to enable self-improving workflows.

**Created:** 2025-12-01
**Status:** Research complete

---

## 1. The Evolution Package

Evolution is a new package in the Cyrus monorepo: `packages/evolution/`

It hooks into Cyrus, extending its capabilities. As upstream Cyrus updates, we pull those updates. Our code lives in the evolution package.

```
cyrus/
├── packages/
│   ├── core/                  (upstream)
│   ├── edge-worker/           (upstream)
│   ├── claude-runner/         (upstream)
│   └── evolution/             (our package)
```

---

## 2. Two Contexts

### Development: Cyrus Working on Cyrus

Cyrus sees everything. It can read and modify the evolution package code, create new workflows, improve prompts. This is where we develop and improve the system. Dogfooding.

### Production: Cyrus Running on Other Repos

Cyrus runs with evolution on target repositories. Separation of concerns applies. The running system cannot see its own machinery. It executes workflows, produces outputs. Evolution grades those outputs in separate sessions.

---

## 3. Workflows

Workflows are manually designed sequences of steps. We create them through discussion and coding. They are not AI-evolved.

A workflow defines the structure:
- What steps run
- In what order
- With what checkpoints

Example: A TDD workflow has three steps running as separate sessions:
1. Write tests
2. Verify tests pass
3. Write implementation code

When we want to try a new approach, we design a new workflow. The orchestrator chooses which workflow to run based on the Linear issue.

### Workflow Format

Workflows are TypeScript files with JSDoc descriptions:

```typescript
/**
 * TDD Development Workflow
 *
 * Enforces test-first development by running tests
 * before implementation in separate sessions.
 */
export async function tddWorkflow(context: WorkflowContext) {
  const tests = await runAgent('write-tests', context);
  await verifyTestsPass(tests);
  const implementation = await runAgent('implement', { ...context, tests });
  return implementation;
}
```

TypeScript is more powerful than JSON configuration. No interpreter needed. Full language capabilities for conditionals, loops, parallel execution.

---

## 4. Evolution

Evolution improves parts within a workflow. The workflow structure stays fixed. The prompts, agents, and behaviors within it evolve.

### What Evolves

Anything that affects system behavior:
- Prompts (what agents are told to do)
- Agents (specialist prompts with context and tools)
- Commands (Claude Code slash commands)
- MCPs (tool configurations)
- Grading criteria (what "good" means)
- Output formats (how data is structured)

### How Evolution Works

1. State a hypothesis in plain language: "Specialist agents will improve planning by providing better context"
2. Define measurable targets: plan quality score, context usage metrics
3. AI proposes changes to achieve the target
4. Test the changes
5. Grade the results
6. Keep improvements, discard regressions

### Evolution Proposes Solutions

Evolution is intelligent improvement. It understands the goal, analyzes what's not working, and proposes solutions.

Example: "Planning struggles to find information. Proposal: Add indexing to research agent output. Structure output as searchable JSON alongside markdown."

This changes what the agent does, not just text. But the workflow structure remains the same.

---

## 5. Specialist Agents

Agents have their own context window. They read extensively and return summaries to the orchestrator.

### Why Agents

The orchestrator needs information but has limited context. An agent:
- Reads all relevant docs, code, patterns
- Processes in its own context
- Returns a summary (not the full content)
- Keeps orchestrator context clean

### What Agents Do

1. Research: Read docs, code, external resources
2. Document: Write findings to docs folder
3. Update: Check if documentation is stale, refresh it
4. Respond: Answer queries about their domain

Example agents: Postgres patterns, Auth flows, API structure, Testing patterns.

### Agent Evolution

Agents evolve. If an agent's output isn't helping planning:
- Analyze what's missing
- Propose changes (add indexing, structure differently, include more detail)
- Test and grade
- Keep improvements

---

## 6. Grading System

Everything evolves, including graders.

### Three Levels

1. Task outputs: The code, PRs, results
2. Graders: Evaluate task outputs
3. Meta-graders: Evaluate the graders

Meta-graders ensure graders are doing a good job. Without them, we cannot improve grading criteria.

### Separate Sessions

Each grading level runs in its own session:
- Session 1: Task execution
- Session 2: Grade the output
- Session 3: Grade the grader

Each session only reads outputs from previous sessions. This isolation enables independent evolution at each level.

---

## 7. Propositions

Every evolution has a proposition: a hypothesis about what will improve and why.

Example: "Creating specialist documentation agents will improve planning, because planning will have accurate, indexed information."

### Combining Propositions

When multiple improvements target the same component, combine them into one proposition. Evolve the proposition, then evolve the component to meet it.

This prevents conflicting improvements from overriding each other.

---

## 8. Linear Integration

Linear is the source of truth. Issue names control what happens.

### Workflow Selection

The orchestrator reads the issue and selects a workflow. Naming conventions control which workflow runs:

- ENG-13-W1: Run workflow W1
- ENG-13-W2: Run workflow W2

When instructed "run with W1 and W2 in parallel," the orchestrator creates these issues.

### Sub-issues

When Cyrus breaks up work, it creates sub-issues following the same pattern:
- ENG-13-W1 (root)
- ENG-13-W1-A (sub-task)
- ENG-13-W1-B (sub-task)

Worktrees and tracing work exactly as before. The naming tells us which workflow was used.

---

## 9. Hooks

The evolution package hooks into Cyrus by loading modified files.

The hook mechanism is file substitution. Evolution decides which version of a file to load. The function signature is the same. The behavior is different.

---

## 10. Storage

Everything is stored in the `~/.cyrus/` folder.

### Current Structure

```
~/.cyrus/
├── logs/
│   └── ENG-13/
│       └── session-{uuid}-{timestamp}.jsonl
├── worktrees/
│   └── ENG-13/
├── repos/
└── config.json
```

Logs are per-issue folders with timestamped JSON files. Different machines have different timestamps. No clash.

### Evolution Folder

Add an evolution folder following the same pattern:

```
~/.cyrus/
├── evolution/
│   └── ENG-13/
│       ├── hypothesis-{timestamp}.json
│       ├── iteration-001-{timestamp}.json
│       ├── grade-{timestamp}.json
│       └── outcome-{timestamp}.json
└── logs/
    └── ...
```

### Multi-Machine Sync

Make `~/.cyrus/` a git repository. Exclude secrets:

```
.gitignore:
repos/
.env*
config.json
secure-configs/
```

Commit everything else. Push to shared repo. Different machines have different timestamps. Merging adds files together, no conflicts.

### Analysis

When ready to analyze across machines:
1. Push all machines to shared GitHub repo
2. Import JSON files to ClickHouse
3. MCP queries ClickHouse
4. AI analyzes across all experiments, proposes merged improvements

---

## 11. Summary

| Component | What It Is | Who Controls It |
|-----------|------------|-----------------|
| Workflow | Sequence of steps | Manual design |
| Parts within workflow | Prompts, agents, behaviors | AI evolution |
| Propositions | Hypotheses about improvement | Human defines, AI refines |
| Grading | Quality evaluation | Evolves with meta-graders |
| Storage | ~/.cyrus/ folder | Git + ClickHouse |

---

**Document Status:** Research complete
**Next:** Planning phase
