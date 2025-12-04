# Session File Format: Executable Context Transfer System

**Purpose**: Session files enable **60-second context pickup** while accumulating **comprehensive system understanding** over multiple sessions. This system creates executable context transfer for seamless AI agent handoffs.

**Architecture**: **Stratified Growth** - information grows vertically in depth while maintaining horizontal accessibility. Agents read top-down until they have enough context to act; experienced agents scan "Right Now" and continue immediately.

---

# Template with Embedded Instructions

## Usage Philosophy

**Each section answers three questions:**
1. **What do I know?** (Information with full context and reasoning chains)
2. **How do I verify it's still true?** (Validation with exact commands and expected outputs)  
3. **What do I do next?** (Action with complete technical specifications and rationale)

**Growth Pattern**: Sessions 1-3 focus on discovery and failed attempts. Sessions 4-7 focus on working solutions. Sessions 8+ focus on integration and completion.

## ⚠️ CRITICAL WRITING PRINCIPLES

**PRESERVE CONTEXT AT ALL COSTS**: Never reduce complex problems to simple labels. When describing "React crashing with parallel nodes", write the FULL technical context: "React memory crashes when two parallel nodes run simultaneously because there's a resource clash where one process cancels the other's memory allocation during concurrent DOM rendering operations."

**CAPTURE CAUSALITY**: Always include the WHY behind every observation. Don't write "API returns 401" - write "API returns 401 because the JWT token expires after 15 minutes but our refresh logic only runs every 20 minutes, creating a 5-minute vulnerability window."

**MAINTAIN TECHNICAL SPECIFICITY**: Preserve exact error messages, file paths, line numbers, command outputs, and behavioral symptoms. The difference between "authentication fails" and "Firebase Auth returns 'invalid-custom-token' after 30 seconds when using custom claims with expired timestamps" is the difference between useful and useless documentation.

**WRITE COMPLETE THOUGHTS**: Each entry should contain enough context that someone could understand and act on it without reverse-engineering your thought process. Incomplete thoughts create archaeological records - complete thoughts create executable context.

---

```markdown
# [Feature Name] - Session [N]
*Created: [DATE] | Last Updated: [DATE] | Status: [ACTIVE/BLOCKED/COMPLETE]*

## 🚀 RIGHT NOW
> **PURPOSE**: 60-second pickup for immediate continuation
> **HOW TO READ**: Scan this section first - it contains everything needed to continue
> **HOW TO UPDATE**: Completely rewrite each session to reflect current reality with FULL technical context
> **COMPLETION**: When status = COMPLETE and handoff recipient needs no reverse-engineering
> **DETAIL REQUIREMENT**: Write with complete technical specificity. Don't say "tests failing" - say "3 out of 8 integration tests failing in test/auth.js because Firebase emulator port 9099 conflicts with existing service, causing 'EADDRINUSE' errors on test initialization"

**Status**: [ACTIVE/BLOCKED/COMPLETE] - [Brief current state]
**Last Action Completed**: `exact_command_run` → `exact_result_achieved`
**Current System State**: [Precise description of what's working/broken]
**Immediate Next Action**: `cd /exact/path && exact_command_to_run`
**Expected Result**: `exact_output_or_file_change_expected`
**Time to Feature Completion**: [Realistic estimate: hours/days]

**Quick Verification Commands**:
```bash
# Verify current state is as described above
cd /exact/working/directory
exact_command_to_verify_system_state
# Expected: exact_expected_output
```

**If Verification Fails**: 
1. Run `exact_recovery_command`  
2. Check `exact_file_path` for `exact_issue_to_look_for`
3. Restart from: [exact step to restart from]

**Critical Context**: [Essential information that affects immediate next actions]

---

## 💭 WORKING MEMORY EVOLUTION
> **PURPOSE**: Preserve thought process and evidence trail across sessions
> **HOW TO READ**: Review current session first, then scan historical context as needed
> **HOW TO UPDATE**: Add new session at top, move previous session to historical context
> **COMPLETION**: When hypothesis is proven and all evidence is documented
> **DETAIL REQUIREMENT**: Document the COMPLETE reasoning chain with all contextual factors. Don't write "database connection issues" - write "PostgreSQL connection pool exhaustion occurring after 47 concurrent users because connection timeout set to 30s but average query execution time is 35s during peak load, causing cascade failures in auth middleware"

### Current Session [N]: [Current hypothesis being tested]
**Hypothesis**: [Exact theory you're testing/building right now]
**Evidence Supporting**:
- **File Evidence**: `/exact/path/file.js:line_number` contains `exact_code_snippet`  
- **Command Evidence**: `exact_command` produces `exact_output`
- **Log Evidence**: Error in `exact_log_location` shows `exact_error_message`
- **Behavior Evidence**: When X happens, system does Y (verified by Z)

**Evidence Against**: [Contradictory evidence discovered]
**Debugging Trail**: 
1. Started with assumption: [exact assumption]
2. Tried approach: [exact approach] → Result: [exact result]
3. Discovered: [exact discovery that changed understanding]
4. Led to current hypothesis: [how evidence led to current theory]

**Open Questions**: [Specific unknowns that need investigation]

### Historical Context (Sessions [1] to [N-1])
**Session [N-1]**: [Previous session's main discovery] → Status: [completed/superseded]
**Session [N-2]**: [Earlier discovery] → Status: [completed/superseded]  
[Continue for all previous sessions...]

**Overall Progress Arc**: [How understanding has evolved from Session 1 to now]

---

## ⚡ EXECUTABLE TODO QUEUE
> **PURPOSE**: Clear action pipeline with verification at each step
> **HOW TO READ**: Execute Immediate items in order, then move Soon items to Immediate
> **HOW TO UPDATE**: Move completed items to Completed, add new discoveries to Soon/Later
> **COMPLETION**: When only "Later" items remain and all core functionality works
> **DETAIL REQUIREMENT**: Each todo must include complete technical context and rationale. Don't write "Fix API endpoint" - write "Fix /api/users POST endpoint returning 500 errors when email field contains special characters because express-validator.isEmail() fails on unicode domains, causing user registration failures for international users"

### Immediate (Execute in Order)
- [ ] **NEXT**: `cd /path && exact_command` 
  - *Expected*: `exact_expected_output`
  - *If fails*: [exact troubleshooting steps]
- [ ] **THEN**: Modify `/exact/file.js:line_number` 
  - *Change*: `old_code_snippet` → `new_code_snippet`
  - *Reason*: [why this change is needed]
- [ ] **VERIFY**: Run `exact_test_command`
  - *Expected*: [exact_success_indicator]
  - *Validates*: [what this proves is working]

### Soon (Next Session Focus)
- [ ] **FIX**: [Exact problem description] in `exact_file_location`
  - *Context*: [why this needs fixing]
  - *Approach*: [planned solution approach]
- [ ] **TEST**: [Exact scenario] with `exact_command_and_parameters`
  - *Purpose*: [what this test validates]

### Later (Future Sessions)
- [ ] **REFACTOR**: [Exact component] to [exact improvement]
- [ ] **DOCUMENT**: [Exact knowledge] in [exact location]

### ✅ Completed (Newest First)
- [x] **Session [N]**: [Exact achievement] via `exact_solution` → *Result*: [exact_outcome]
- [x] **Session [N-1]**: [Previous achievement] → *Result*: [outcome]
[Continue chronologically...]

---

## 🔍 SYSTEM STATE ARCHAEOLOGY  
> **PURPOSE**: Concrete evidence of current system reality
> **HOW TO READ**: Use verification commands to confirm each claim is still true
> **HOW TO UPDATE**: Update with each session's file changes and state modifications  
> **COMPLETION**: When all system components are documented and verified
> **DETAIL REQUIREMENT**: Document exact system state with complete environmental context. Don't write "Service running on port 3000" - write "Express server running on port 3000 with PM2 process ID 1847, consuming 156MB RAM, serving 23 active websocket connections, with SSL certificate expiring in 14 days, environment variables loaded from .env.production"

### Current State (Session [N])
**Git State**: 
- Branch: `exact_branch_name` 
- Last Commit: `commit_hash` - "exact_commit_message"
- Uncommitted Files: `file1.js, file2.js` (changes: [exact_changes])
- Status: `git_status_output`

**Environment**: 
- Working Directory: `/exact/path`
- Key Variables: `VAR1=value1, VAR2=value2` (verified by: `env | grep VAR`)
- Services Running: [port_numbers and service_names]
- Dependencies: [exact_versions of critical dependencies]

**File Modifications This Session**:
- `/exact/path/file1.js` @ `timestamp`: [exact_changes_made]
- `/exact/path/file2.js` @ `timestamp`: [exact_changes_made]

**Current Test Results**:
- **Passing**: `exact_test_command` → `exact_success_output` 
- **Failing**: `exact_failing_test` → `exact_error_message`
- **Manual Verification**: `exact_manual_check` → `exact_result`

### State Evolution History
**Session [N-1] End State**: [how system state changed from previous session]
**Session [N-2] End State**: [earlier state for comparison]

---

## 🧠 KNOWLEDGE ACCUMULATION
> **PURPOSE**: Deep system understanding and decision rationale preservation  
> **HOW TO READ**: Reference when making similar decisions or debugging similar issues
> **HOW TO UPDATE**: Add new insights and decisions as they're discovered/made
> **COMPLETION**: When all system behaviors are explained and all decisions documented
> **DETAIL REQUIREMENT**: Capture complete decision context and system behavior patterns. Don't write "Chose Redis over PostgreSQL" - write "Chose Redis over PostgreSQL for session storage because session data averages 2KB, requires sub-10ms access times during authentication flows, expires automatically after 24 hours, and Redis atomic operations prevent race conditions during concurrent login attempts that caused data corruption in PostgreSQL implementation"

### System Behavior Insights
**How [System Component] Actually Works**:
- **Discovery**: [What you learned about how it really behaves]
- **Evidence**: [Exact evidence that proved this understanding]  
- **Implications**: [What this means for implementation/debugging]

**Key Patterns Discovered**:
- **Pattern**: [Specific pattern observed]
- **Trigger**: [What causes this pattern]
- **Evidence**: [Where/how this pattern manifests]

### Decision Audit Trail
**Major Decision**: [Exact decision made]
- **Context**: [Exact problem that required this decision]  
- **Options Evaluated**: 
  - Option A: [exact_approach] - Pros: [list] - Cons: [list]
  - Option B: [exact_approach] - Pros: [list] - Cons: [list]
- **Decision Criteria**: [What factors determined the choice]
- **Supporting Evidence**: [Concrete evidence that supports this choice]
- **Validation**: `command_to_verify_decision_still_makes_sense`

**Implementation Decisions**:
- **Used X instead of Y**: [Exact technical reason with evidence]
- **Chose approach Z**: [Specific constraint or requirement that drove this]

### Dead Ends Archive (Don't Retry)
**❌ Approach: "[Exact approach name]"**
- **What Was Tried**: `exact_commands_run` and `exact_code_written`
- **Failure Mode**: [Exact error or problem encountered]
- **Why It Failed**: [Root cause analysis]  
- **Key Learning**: [What this teaches about the system/problem]
- **Evidence**: [Exact error messages, file states, or outputs]

---

## 🎯 SESSION HANDOFF & COMPLETION
> **PURPOSE**: Seamless context transfer to next session or handoff recipient
> **HOW TO READ**: Final validation of session completeness before handoff
> **HOW TO UPDATE**: Fill out when ending each session
> **COMPLETION**: When next person can continue without asking clarifying questions
> **DETAIL REQUIREMENT**: Provide complete context for next session including all environmental factors and technical prerequisites. Don't write "Need to finish authentication" - write "Need to complete OAuth2 flow integration with Google Identity Platform, specifically implementing refresh token rotation for tokens expiring every 3600 seconds, handling scope elevation for admin users accessing /api/admin/* endpoints, and fixing CSRF token validation that currently fails when requests cross the 15-minute session boundary"

### Session [N] Summary
**Session Goal**: [What this session was supposed to accomplish]
**Achieved**: [What was actually accomplished with evidence]
**Discoveries**: [Unexpected things learned this session]
**Blocked By**: [If blocked, exact blocker with reproduction steps]

### Handoff Status
**Overall Status**: [ACTIVE/BLOCKED/COMPLETE/NEEDS_REVIEW]
**Feature Completion**: [X]% complete ([exact_criteria_for_percentage])

**Next Session Should**:
1. **Immediate Priority**: [Exact next action with success criteria]
2. **Session Goal**: [What the next session should accomplish]  
3. **Success Criteria**: [How to know the next session succeeded]

**Critical Handoff Info**:
- **Environment Setup**: [Exact steps to recreate working environment]
- **Gotchas**: [Specific things that will trip up the next person]
- **Validation Steps**: [How to verify you're in the right state to continue]

### Completion Criteria 
**Feature Complete When**:
- [ ] [Exact_functional_requirement] works as demonstrated by [exact_test]
- [ ] [Another_requirement] verified by [exact_verification_method]
- [ ] Documentation updated at [exact_location] with [exact_content]
- [ ] Handoff recipient can [exact_capability] without assistance

**Knowledge Transfer Complete When**:
- [ ] All system behaviors explained with evidence
- [ ] All decisions documented with rationale  
- [ ] All failure modes documented with recovery procedures
- [ ] Next person can maintain/extend without reverse-engineering

---

## 📖 USAGE INSTRUCTIONS

### Starting New Session (First Time)
1. Copy template, rename to `[feature-name]-session-001.md`
2. Fill "RIGHT NOW" with current understanding
3. Start "Working Memory" with initial hypothesis
4. Create basic "TODO QUEUE" with known next steps
5. Document current "SYSTEM STATE" with verification commands

### Continuing Existing Session  
1. **First**: Run verification commands in "RIGHT NOW" 
2. **If verification passes**: Execute next action from TODO QUEUE
3. **If verification fails**: Debug using "SYSTEM STATE" and "KNOWLEDGE" sections
4. **Update "Working Memory"** with new discoveries
5. **Move completed TODOs** to Completed section

### Ending Session
1. **Update "RIGHT NOW"** to reflect current state
2. **Move current session** in Working Memory to Historical Context  
3. **Fill "SESSION HANDOFF"** with next session guidance
4. **Verify handoff completeness**: Could someone else continue immediately?

### Growing the Document
- **Sessions 1-3**: Focus on discovery, document failures heavily
- **Sessions 4-7**: Focus on solutions, build working patterns  
- **Sessions 8+**: Focus on integration, edge cases, completion

### Completion and Archival
When feature is complete and knowledge transfer verified:
1. Update status to COMPLETE in all relevant sections
2. Archive to permanent documentation
3. Extract reusable patterns for future similar work

---

## 📋 QUALITY CHECKLIST

Before ending each session, verify ALL writing includes complete technical context:

**RIGHT NOW Section**:
- [ ] Someone could continue in under 60 seconds with FULL technical understanding
- [ ] Verification commands actually work and include expected outputs
- [ ] Next action is completely specified with reasoning and environmental context  
- [ ] Recovery procedures are exact with specific file paths and error conditions
- [ ] NO reductive descriptions - all technical details preserved

**WORKING MEMORY Section**:
- [ ] Current hypothesis includes complete reasoning chain and all contributing factors
- [ ] Evidence is specific (exact files, line numbers, full command outputs, complete error messages)
- [ ] Evolution from previous sessions captures WHY understanding changed
- [ ] NO summary language that loses context - preserve full technical narrative

**TODO QUEUE Section**:
- [ ] Immediate items are executable without interpretation and include complete technical rationale
- [ ] Each item has success criteria with exact expected outputs and validation methods
- [ ] Dependencies and blockers are explicit with full technical explanation of constraints
- [ ] NO simplified task descriptions - maintain complete context of WHY each action is needed

**SYSTEM STATE Section**:
- [ ] All claims verified by actual commands with full output documentation
- [ ] File changes are precisely documented with exact line numbers and complete change context
- [ ] Environment can be recreated with complete dependency versions and configuration details
- [ ] NO environment shorthand - document complete technical state

**KNOWLEDGE SECTION**:
- [ ] Insights are backed by concrete evidence including reproduction steps and system behavior
- [ ] Decisions include complete reasoning process with all evaluated options and selection criteria
- [ ] Dead ends have enough detail to avoid repetition including full failure analysis
- [ ] NO decision summaries - preserve complete evaluation context

**HANDOFF Section**:
- [ ] Next person's success criteria are clear with complete technical specifications
- [ ] Critical context is explicitly stated including all environmental and technical dependencies  
- [ ] Completion criteria are measurable with exact validation procedures
- [ ] NO high-level handoff notes - include complete technical context for continuation
```

---

## 📚 REAL-WORLD EXAMPLES

### Session 1: PostHog Integration (Day 1)
```markdown
## 🚀 RIGHT NOW
**Status**: BLOCKED - Environment variables not loading
**Last Action**: `yarn test` → 400/401 errors  
**Current System State**: Events fail to send, API keys not recognized
**Immediate Next**: Debug why `process.env.POSTHOG_API_KEY` returns undefined
**Expected Result**: Environment variables should load from .env.dev
```

### Session 5: PostHog Integration (Day 3)  
```markdown
## 🚀 RIGHT NOW  
**Status**: ACTIVE - SQL verification working, timing issue discovered
**Last Action**: `direnv exec . yarn test` → 4/4 events send (200), 1/4 found in verification
**Current System State**: Full event sending works, SQL query works, 3-second delay insufficient
**Immediate Next**: Increase verification delay from 3sec to 10sec in complete-test.js:line_217
**Expected Result**: All 4 events should be found in PostHog verification query
```

### Session 12: PostHog Integration (Complete)
```markdown
## 🚀 RIGHT NOW
**Status**: COMPLETE - Full verification pipeline working
**Last Action**: `direnv exec . yarn test` → 5/5 tests passing consistently  
**Current System State**: All events send successfully, all events verified in PostHog
**Handoff Complete**: Feature ready for production, documentation updated
**Knowledge Artifact**: `/docs/posthog-integration.md` contains full system understanding
```

These examples demonstrate session progression from blocked states to complete implementations while maintaining immediate actionability throughout the development lifecycle.