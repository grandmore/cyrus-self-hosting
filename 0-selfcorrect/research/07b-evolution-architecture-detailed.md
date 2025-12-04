# Evolution Architecture: Complete Design Document

**Purpose:** Capture every detail, every decision, every piece of reasoning about the Evolution system. This is the source of truth before simplification.

**Created:** 2025-12-01

---

## 1. What We Are Building

We are building a self-improving AI development system. The system executes development tasks (write code, fix bugs, create features) and then improves its own ability to execute those tasks over time.

The system is called Evolution. It extends Cyrus, which is an existing tool that automates software development by connecting Linear (issue tracking) with Claude Code (AI coding).

### 1.1 The Core Insight

Human and AI collaborate to improve systems. Neither alone is optimal:
- Pure AI (non-deterministic): creative, handles novelty, but can hallucinate, go off track
- Pure deterministic code: reliable, enforceable, but brittle, can't handle ambiguity
- Human alone: intelligent, but slow

The best systems mix all three. Where AI is weak, add determinism. Where determinism is weak, add AI. Where something fails, identify why and fix it - whether that's a prompt, a verification step, or the process itself.

### 1.2 Scale Through Parallelism

Claude Code SDK enables multiple Claude instances running in parallel. We want to harness this:
- Minimum 3 variations, not 1
- Spawn 3 worktrees, write the thing 3 times
- Get variability through variation
- Not sequential iteration, but parallel exploration

To make parallel work useful, we need methodology - logging, grading, process - so we can understand what worked across variations.

### 1.3 Everything Improves, Including the Process

The methodology itself is fallible. We build something, use it, find weaknesses, improve. The system improves the system. Dogfooding all the way.

This conversation - human and AI iterating on understanding, correcting misunderstandings, refining ideas together - is exactly what we want to enable at scale. The collaboration happens faster, in parallel, with methodology to capture what works.

---

## 2. The Relationship to Cyrus

### 2.1 Cyrus Today

Cyrus is a tool that:
- Monitors Linear issues assigned to a specific user
- Creates Git worktrees for each issue
- Runs Claude Code sessions to implement the issue
- Posts results back to Linear
- Maintains conversation continuity across comments

Cyrus has workflows, subroutines, and prompts that control what Claude Code does. These are currently hardcoded in the source.

### 2.2 Evolution Extends Cyrus

Evolution is a new package in the Cyrus monorepo: `packages/evolution/`

It imports from Cyrus packages (edge-worker, claude-runner, core) and extends them. As upstream Cyrus updates, we pull those updates. Our code lives in the evolution package.

The relationship:
```
Cyrus (upstream) ← Evolution (our extension)
```

We add minimal hooks to Cyrus itself. Everything else is in our package.

### 2.3 Why Extension Works

By extending rather than forking, we get upstream improvements automatically. The hooks we add to Cyrus are small - file path overrides, model selection hooks, metrics collection. Maybe 50-100 lines total in Cyrus core. Everything else is in packages/evolution/.

---

## 3. Two Contexts: Development and Production

### 3.1 Development Context

When Cyrus works on the Cyrus repository itself, it sees everything:
- The evolution package source code
- All workflow definitions
- All prompt files
- The system's own machinery

This is dogfooding. Cyrus improves Cyrus. In this context, separation of concerns does NOT apply because it's just coding - reading files, making changes, running tests.

### 3.2 Production Context

When Cyrus runs on other repositories (customer repos, target projects), separation of concerns applies:
- Cyrus executes the deployed workflow
- It can see the target repository code
- It can see its outputs (logs, results)
- It CANNOT see or modify its own machinery during the run

The grading happens AFTER the run, in a separate session. The grading session reads the outputs and produces grades. It cannot influence the run it's grading.

### 3.3 Why This Distinction Matters

In development, we're improving the system. In production, we're using the system. Different rules apply.

Development is unconstrained - change anything, experiment freely.
Production is constrained - run the deployed version, grade afterward.

---

## 4. Workflows

### 4.1 What is a Workflow?

A workflow is a sequence of steps that accomplish a task. For example:
1. Research the codebase
2. Create a plan
3. Implement the plan
4. Run tests
5. Create a PR

Each step is a session or sub-session with its own prompt and context.

### 4.2 Workflows Are Manually Designed

This is a critical distinction. Workflows are designed by humans through discussion and coding.

Why? Because workflow design is about structure, sequencing, checkpoints, approvals. These are architectural decisions. When we want to try a new approach - like TDD (write tests first, then implement) - we design a new workflow:

1. Write tests
2. Verify tests fail appropriately
3. Write implementation
4. Verify tests pass
5. Create PR

We design it, deploy it, test it, see if it works better. This is "trying a new idea" - a human design decision.

### 4.3 The Distinction: New Ideas vs Evolution

**Trying a new idea** = Creating a new workflow
- Human designs the structure
- Deploy and test
- Compare against other workflows
- This is manual design work

**Evolution** = Improving parts within a workflow
- AI analyzes what's not working
- AI proposes changes to prompts, agents, behaviors
- Test and grade
- Keep improvements

The workflow structure is fixed by humans. The components within evolve via AI. These are different activities.

### 4.4 Why Static Workflows Are Essential

If everything moves, you can't understand what's working. The workflow is the deterministic structure that prevents cheating.

**TDD Example:** Without a fixed workflow enforcing "write tests first, then implement":
- AI writes code
- AI then writes tests that pass the code it already wrote
- This is backwards - tests should define behavior, not validate existing code

The workflow forces: write tests → verify tests fail → write implementation → verify tests pass. The AI cannot bypass this sequence. This is the deterministic harness constraining non-deterministic behavior.

Workflows are the definition of an idea. They say "we're going to try THIS process." The static structure is what makes the experiment meaningful.

### 4.5 Why TypeScript for Workflows

Workflows are TypeScript files:

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

Why TypeScript:
- JSDoc is the human-readable description
- Code IS the logic - no interpreter needed
- Full language capabilities: conditionals, loops, async, error handling
- TypeScript gives type safety
- Adding a step = adding one line of code

The workflow file exports a function. The function runs the workflow. The binary loads and executes it.

### 4.6 Where Workflows Live

Workflows live in `~/.cyrus/workflows/`.

When Cyrus runs as a binary, the binary needs to load workflows from somewhere accessible. The `~/.cyrus/` folder is the runtime configuration directory. The binary is the engine; workflows are the instructions.

---

## 5. Evolution

### 5.1 What Evolution Does

Evolution improves the PARTS within a workflow:
- Prompts (what agents are told to do)
- Agents (specialist prompts with context and tools)
- Commands (Claude Code slash commands)
- MCPs (tool configurations)
- Grading criteria (what "good" means)
- Output formats (how data is structured)

The workflow structure stays fixed. The components evolve.

### 5.2 Evolution is Intelligent Improvement

Evolution is not random mutation. It is not just "tweaking prompt text." Evolution understands:
- What we're trying to achieve
- What's currently not working
- What changes might help

Evolution proposes changes to what agents DO, not just the words they're given.

Example:
- Observation: "Planning struggles to find information in research output"
- Proposal: "Add indexing to research output. Structure as searchable JSON alongside markdown. Create a 100-word summary with headers for quick lookup."
- Reasoning: "If planning can query specific topics instead of scanning text, it will find information faster and more accurately."

This changes the agent's behavior significantly. The research agent now produces indexed, structured, summarized output. But the workflow structure (research → planning → implementation) stays the same.

### 5.3 The Evolution Process

1. **State a hypothesis** in plain language
   - "Specialist agents will improve planning by providing better context"
   - "Adding indexing to research output will help planning find information"

2. **Define measurable targets**
   - Plan quality score
   - Context usage metrics
   - Error rates
   - Time to completion

3. **AI proposes changes**
   - Intelligent analysis of what's not working
   - Specific proposals with reasoning

4. **Test the changes**
   - Run the same task with new instructions
   - Collect outputs

5. **Grade the results**
   - Compare to baseline
   - Multiple metrics

6. **Keep or discard**
   - Keep improvements
   - Discard regressions
   - Sometimes keep neutral changes if they simplify

### 5.4 What Evolution Can Propose

Evolution can propose adding new capabilities to agents:
- "Add an approval agent that validates research before planning"
- "Create a second output format (JSON) alongside markdown"
- "Run a pre-scan to summarize documents before detailed research"

These are behavioral changes, not just text changes. If the proposal requires code changes to implement, those code changes happen. The workflow structure remains fixed, but what happens within each step can change significantly.

---

## 6. Specialist Agents

### 6.1 What is an Agent?

An agent is more than a prompt. It's:
- A prompt (instructions)
- Context (what it knows about)
- Tools (what it can do)
- Behavior (how it operates)

Agents are specialists. A Postgres agent knows about database patterns. An Auth agent knows about authentication flows.

### 6.2 Why Agents Have Separate Context

The orchestrator (the main workflow runner) has limited context. If the orchestrator reads all documentation for every domain, it runs out of context space. There's no room left for actual planning.

Agents solve this:
- Each agent has its own context window
- Agent reads all relevant docs, code, patterns in its domain
- Agent processes in its own context
- Agent returns a SUMMARY to the orchestrator
- Orchestrator gets the summary (small), not the raw data (huge)

Result: Orchestrator context stays clean. It gets expert summaries from specialists.

### 6.3 What Agents Do

1. **Research** - Read docs, code, external resources about their domain
2. **Document** - Write findings to a docs folder
3. **Update** - Check if documentation is stale, refresh it
4. **Respond** - Answer queries about their domain

The orchestrator asks: "What do I need to know about Postgres for this task?"
The Postgres agent researches, updates its docs if needed, and returns a summary.

### 6.4 Agent Lifecycle

```
Task starts
    │
    ▼
Orchestrator calls specialist agents
    │
    ├── Agent checks: Is my documentation current?
    │   ├── Yes → Return summary from cached docs
    │   └── No → Research, update docs, return summary
    │
    ▼
Orchestrator receives summaries (small context)
    │
    ▼
Planning uses summaries + can query agents for details
    │
    ▼
Implementation proceeds with accurate information
```

### 6.5 Agent Evolution

Agents themselves evolve. If an agent's output isn't helping planning:
- Analyze what's missing
- Propose changes (add indexing, structure differently, include more detail)
- Test and grade
- Keep improvements

Example:
- Observation: "Postgres agent returned query patterns, but code failed on connection pooling"
- Proposal: "Agent needs to document connection pooling patterns"
- Action: Update agent prompt to include connection pooling research
- Next run: Agent documents connection pooling, planning has better info, code works

---

## 7. Grading System

### 7.1 Why Grading Exists

Grading enables evolution at every level. Without grading, we don't know if outputs are good. Without knowing if outputs are good, we can't improve.

### 7.2 Grading is a Process, Not a Prompt

Grading is not "AI evaluating AI" in a naive single-prompt sense. A grader is a PROCESS that combines:
- Multiple neural nets having a conversation (Claude, Gemini, others)
- Consensus building across models
- Deterministic code mixed in (compilation, linting, test execution)
- Structured evaluation methodology

The grader itself follows the same principle as the whole system: mix deterministic and non-deterministic. Use AI where judgment is needed, use code where verification is possible.

### 7.3 Three Levels

1. **Task outputs** - The code, PRs, results from the actual work
2. **Graders** - Evaluate task outputs ("Was this code good?")
3. **Meta-graders** - Evaluate the graders ("Was the grading criteria correct?")

Why meta-graders? To check if THE GRADER is wrong, not just what it's grading. If grading criteria are flawed, all evolution guided by those grades goes in the wrong direction. Meta-grading validates the evaluation criteria itself.

### 7.4 Separate Sessions Enable Independent Evolution

Each grading level runs in its own session:
- Session 1: Task execution → outputs
- Session 2: Grade the outputs → grades
- Session 3: Grade the graders → meta-grades

Each session only reads outputs from previous sessions. Session 2 cannot modify Session 1's outputs. Session 3 cannot modify Session 2's grades.

This isolation enables independent evolution:
- Task execution evolves based on output grades
- Grading evolves based on meta-grades
- Each layer improves independently

### 7.5 Everything Evolves

- Task prompts evolve based on output grades
- Grader prompts evolve based on meta-grades
- Meta-grader prompts could evolve based on higher-level assessment (if needed)
- The evolution system itself evolves when Cyrus works on the Cyrus repo

It's evolution all the way down.

---

## 8. Propositions

### 8.1 What is a Proposition?

Every evolution needs a hypothesis - a proposition about what will improve and why.

Example: "Creating specialist documentation agents will improve planning, because planning will have accurate, indexed information instead of guessing."

The proposition has:
- What we're trying: specialist documentation agents
- Why we think it helps: accurate indexed information
- What we expect to improve: planning quality

### 8.2 Why Propositions Matter

Propositions give direction. Without a proposition, evolution has no target. "Let's try changing this and see what happens" isn't systematic.

### 8.3 Tournaments, Not Merging

When multiple improvements target the same component, run a tournament:
1. Proposition A: "Add indexing to improve searchability"
2. Proposition B: "Add JSON output for machine readability"

Don't merge prompts - merging often destroys both approaches. Instead:
- Run both as separate variations
- Grade each
- Winner replaces loser
- Or: winner incorporates elements of loser in a NEW proposition that gets tested

Competition, not combination. Let results decide.

### 8.4 Evolving Propositions

Propositions themselves evolve. A proposition may start as:
- "Agents should improve planning"

And evolve to:
- "Agents should improve planning by providing structured, indexed documentation in JSON format that the planning step can query"

The proposition gets more specific as we learn what works. We evolve the proposition, then evolve the agent to meet the refined proposition.

### 8.5 Proposition Lifecycle

1. Human defines initial proposition in plain language
2. AI refines with specific measurable targets
3. AI proposes changes to meet the proposition
4. Changes are tested and graded
5. Proposition may be refined based on results
6. Successful evolutions complete the proposition
7. New propositions are created for the next improvement

---

## 9. Linear Integration

### 9.1 Linear is the Source of Truth

Linear is the issue tracking system. Every task comes from a Linear issue. Linear controls what happens.

### 9.2 Workflow Selection via Naming

The orchestrator reads the issue and selects a workflow based on naming conventions:
- ENG-13-W1: Run workflow W1
- ENG-13-W2: Run workflow W2

When instructed "run with W1 and W2 in parallel", the orchestrator creates these issues. We don't manually create the workflow issues. The orchestrator creates them based on the instruction.

### 9.3 Sub-issues

When Cyrus breaks up work, it creates sub-issues following the same pattern:
- ENG-13-W1 (root)
- ENG-13-W1-A (sub-task created by Cyrus)
- ENG-13-W1-B (sub-task created by Cyrus)

Worktrees and tracing work exactly as before. The naming tells us which workflow was used.

### 9.4 Parallel Workflow Comparison

To compare workflows:
1. Human creates one issue: "Build X, use W1 and W2 in parallel"
2. Orchestrator reads the instruction
3. Orchestrator creates ENG-13-W1 and ENG-13-W2
4. Both run in parallel, separate worktrees
5. Results are compared

This enables A/B testing of workflows.

---

## 10. Hooks

### 10.1 How Evolution Hooks into Cyrus

The hook mechanism is file substitution. Evolution decides which version of a file to load.

- Cyrus loads a file
- Evolution can substitute a different file
- Same function signature
- Different behavior

### 10.2 Example

Default: Cyrus loads `workflows/full-development.ts`
Evolution: Substitutes `~/.cyrus/workflows/experimental-v2.ts`

The function signature is the same. The implementation is different.

### 10.3 What Hooks Are Needed

Minimal hooks in Cyrus core:
- Prompt path override (~10 lines) - load prompts from different location
- Per-subroutine model (~15 lines) - use different models for different steps
- Metrics collection (~50 lines) - capture outcomes for grading

Everything else is in the evolution package.

---

## 11. Storage: The cyrus-base Repository

### 11.1 Local Writes, Git for Sync

All execution writes to local filesystem. Fast, no contention, no bottleneck. 200 parallel agents write to `~/.cyrus/` on disk - this is just file I/O.

Git is for synchronization AFTER work is done:
- Work locally → files accumulate on disk
- Ready to share → git commit, git push
- Other machines → git pull to get updates

The `~/.cyrus/` folder is a Git repository called "cyrus-base". But Git is not involved during execution - only for syncing results across machines.

On install:
1. Install Cyrus binary
2. Clone cyrus-base repo into `~/.cyrus/`
3. Cyrus binary runs, writes to the folder (local disk, not Git operations)

### 11.2 Current Structure Issues

The current `~/.cyrus/` folder has structural issues that need fixing:
- Attachments are in the wrong place (ENG-1/, ENG-2/ folders at root instead of attachments/ENG-1/)
- This should be cleaned up and proposed as a change to upstream Cyrus

### 11.3 Follow Existing Structure

Mirror the existing ~/.cyrus structure. Don't invent new naming patterns.

**Current structure (keep this):**
```
~/.cyrus/
├── logs/ENG-13/
│   ├── session-{uuid}-{timestamp}.jsonl
│   └── session-{uuid}-{timestamp}.md
├── state/
│   └── edge-worker-state.json
├── worktrees/
├── repos/                   ← Excluded from git
└── config.json              ← Excluded from git
```

**Add for Evolution:**
```
├── workflows/               ← TypeScript workflow definitions
│   ├── full-development.ts
│   └── tdd.ts
├── evolution/               ← Evolution state (not timestamped per-run)
│   └── ENG-13/
```

**Grading is part of session data** - it happens during/after a session run and belongs with that session's logs, not in a separate folder with different naming.

### 11.4 What Gets Committed

Everything except secrets and large temporary data:
```
.gitignore:
repos/
.env*
config.json
secure-configs/
```

Commit:
- Workflows
- Grading data
- Evolution tracking
- Logs

### 11.5 Why Logs Get Committed

Logs are timestamped per session. Different machines have different timestamps. No clash when merging.

Logs are the raw data for analysis. Without them, we can't understand what happened.

### 11.6 Retiring Workflows

To retire a workflow:
1. Delete it from the repo
2. Commit
3. On next pull, other machines get the deletion
4. Retired workflow is gone

Normal Git workflow.

---

## 12. Multi-Machine Sync

### 12.1 The Scenario

Multiple people using Evolution. Each machine runs tasks, produces grades, evolves.

How do we:
- Share improvements?
- Avoid conflicts?
- Analyze across machines?

### 12.2 Session-Based Files Prevent Conflicts

Session logs follow existing Cyrus pattern: `session-{uuid}-{timestamp}.jsonl`

Different machines have different UUIDs and timestamps. When you merge two branches, you're adding files together. No content conflicts.

### 12.3 Linear Prevents Duplicate Work

Linear is the source of truth for issues. If I'm working on ENG-13, you can't also work on ENG-13. Linear assigns issues.

If you work on ENG-13, you'd pull my branch - you'd get my code and continue from there.

### 12.4 Three Layers of Storage

**Layer 1: Local Disk (Execution)**
- All parallel agents write here
- Fast file I/O, no contention
- JSON files accumulate during work

**Layer 2: Git (Sync)**
- Push when ready to share
- Pull to get others' work
- Merge adds files together (timestamped = no conflicts)

**Layer 3: ClickHouse (Analysis)**
- Import JSON files for SQL queries
- MCP connects Claude to ClickHouse
- AI can ask "show me all evolutions that improved planning quality by >10%"
- Cross-machine analysis at scale

Each layer serves a different purpose. Execution is local. Sharing is Git. Analysis is ClickHouse.

---

## 13. The Improvement Loop

### 13.1 The Full Cycle

```
1. Cyrus runs task workflow
   → Outputs to logs/

2. Evolution triggers grading workflow
   → Reads logs
   → Outputs grades

3. Evolution triggers meta-grading workflow
   → Reads grades
   → Validates grader quality

4. Evolution triggers improvement workflow
   → Reads all grades
   → Proposes changes based on propositions
   → Writes new prompts/agents

5. New version deployed
   → Next task uses improved system
   → Loop continues
```

### 13.2 Each Step is a Cyrus Session

Every step is Cyrus running a different workflow:
- Task workflow: do the actual work
- Grading workflow: evaluate the output
- Meta-grading workflow: evaluate the grading
- Evolution workflow: propose improvements

We're not building new execution engines. Cyrus already knows how to run Claude Code sessions. We give it different prompts.

### 13.3 Dogfooding

Grading is dogfooding. We use Cyrus to grade Cyrus's output.
Meta-grading is dogfooding. We use Cyrus to grade Cyrus's grading.
Evolution is dogfooding. We use Cyrus to improve Cyrus.

It's Cyrus all the way down.

---

## 14. Starting Point

### 14.1 Start From What Exists

The first workflow replicates current Cyrus exactly. We extract the existing behavior into a workflow file.

Why? Because we need a baseline. If we start with something new, we don't know if it's better or worse than what we had.

### 14.2 The First Workflow

```typescript
/**
 * Full Development Workflow
 *
 * Replicates current Cyrus behavior exactly.
 * This is the baseline for all improvements.
 */
export async function fullDevelopment(context: WorkflowContext) {
  await runSubroutine('coding-activity', context);
  await runSubroutine('verifications', context);
  await runSubroutine('git-gh', context);
  await runSubroutine('concise-summary', context);
}
```

### 14.3 Then Add Layers

Once baseline exists:
1. Add documentation agents (improve knowledge)
2. Add planning step (uses improved knowledge)
3. Add verification steps (catch issues earlier)

Each layer is tested against baseline. Keep what improves, discard what doesn't.

---

## 15. Binary vs Source

### 15.1 The Distinction

Source: The Git repository with all the TypeScript files
Binary: The compiled executable that users install

When you install Cyrus via npm or download a binary, you get the compiled code. You don't get the source repository.

### 15.2 Implications

Anything the binary needs at runtime must be:
- Compiled into the binary, OR
- Loaded from a known location (like ~/.cyrus/)

Workflows cannot be in `packages/evolution/workflows/` for runtime use. That folder only exists in source.

### 15.3 The Architecture

```
Source repo (packages/evolution/)
    │
    ├── src/           ← Compiled into binary
    │   └── ...
    │
    └── workflows/     ← Development reference only
        └── ...        ← NOT compiled into binary
```

```
~/.cyrus/ (cyrus-base repo)
    │
    └── workflows/     ← Runtime location
        └── ...        ← Binary loads from here
```

The binary is the engine. It knows how to execute workflows.
The workflows are the instructions. They live in ~/.cyrus/.

Separate concerns. Engine and configuration are distinct.

---

## 16. Error Handling and Rollback

### 16.1 When Evolution Makes Things Worse

Not every change is an improvement. Some make things worse.

The grading system catches this:
- Baseline performance recorded
- New version tested
- Grades compared
- If worse, discard the change

### 16.2 Rollback Mechanism

Because everything is in Git:
- Every change is a commit
- To rollback, revert the commit
- Previous version is restored

Git handles rollback.

### 16.3 Experiment Isolation

Experiments happen in branches or in the `experimental/` folder within workflows.

If an experiment fails catastrophically, delete it. The stable workflows are unaffected.

---

## 17. Human Control

### 17.1 Humans Define "Good"

The grading criteria are human-defined. Humans decide:
- What makes code good?
- What makes a plan good?
- What makes documentation good?

AI grades based on these criteria. AI doesn't define the criteria.

### 17.2 Humans Design Workflow Structure

Workflow structure is human-decided:
- Adding a new step
- Changing the order
- Creating a new workflow

AI proposes improvements to components within workflows. Humans design the workflow structures.

### 17.3 Humans Can Override

At any point, humans can:
- Reject a proposed evolution
- Revert a change
- Modify grading criteria
- Design a new approach

The system assists. It doesn't replace judgment.

---

## 18. Summary of Key Decisions

| Decision | What We Chose | Why |
|----------|--------------|-----|
| Package location | packages/evolution/ in Cyrus repo | Extend without forking, get upstream updates |
| Workflow format | TypeScript with JSDoc | Code IS logic, full language capabilities |
| Workflow storage | ~/.cyrus/workflows/ | Binary needs runtime access |
| What evolves | Parts within workflows | Structure is manual design, components evolve |
| Evolution scope | Intelligent improvement of behavior | Not just text tweaking, changes what agents DO |
| Agent architecture | Separate context windows | Keep orchestrator context clean |
| Grading levels | Three (task, grading, meta) | Enable evolution at every level |
| Grading purpose | Evolution feedback | Each level provides feedback to improve the previous |
| Storage | ~/.cyrus/ as Git repo "cyrus-base" | Simple sync, no special infrastructure |
| Multi-machine sync | Git + ClickHouse | Files for local work, SQL for cross-machine analysis |
| Workflow selection | Linear issue naming | ENG-13-W1 = use workflow W1 |
| Propositions | Hypotheses with measurable targets | Direction for evolution, prevents conflicts |

---

## 19. What This Document Is For

This document captures every detail before simplification.

The next step is extreme simplification:
- What can be deleted?
- What's over-engineering?
- What's structural overhead vs essential?

By having all the detail here, we can simplify with confidence. We won't accidentally lose important nuances because they're all recorded.

The goal: Same capability with almost nothing left.

---

**Document Status:** Complete detail capture
**Next:** Extreme simplification pass
