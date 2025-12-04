# Conditional Documentation Guide
# v1.3 - Updated for clarity on index files

## Why This Exists

**Purpose:** Provide project context without flooding your memory. Maintain context efficiently.

**The Strategy:**
1. **Read the index files** (listed below) to build a mental map of what documentation exists and what this project does
2. **Don't read all detailed docs** - that would consume too much context
3. **Use the indexes as references** - when you need to work on something specific (e.g., fix runners), you already know which detailed doc to read because you learned the map

**Result:** You have strong understanding of the project structure, can make intelligent decisions about what to do, and know exactly where to find detailed information when needed.

---

This prompt helps you determine what documentation you should read based on the specific changes you need to make in the codebase. Review the conditions below and read the relevant documentation before proceeding with your task.

## Instructions
- Review the task you've been asked to perform
- Check each documentation path in the Conditional Documentation section
- For each path, evaluate if any of the listed conditions apply to your task
  - IMPORTANT: Only read the documentation if any one of the conditions match your task
- IMPORTANT: You don't want to excessively read documentation. Only read the documentation if it's relevant to your task.

## Documentation Map

### MANDATORY: Foundation Files (Read First)

Read ALL of these when initializing your understanding of the project. These are small documentation maps, NOT detailed docs:

- **README.md** - Project overview and structure
- **`.claude/references/_conditional_docs.md`** - **MUST READ ENTIRE FILE** - Index of reference documentation for this project
- **`.claude/rules/_conditional_docs.md`** - **MUST READ ENTIRE FILE** - Index of coding rules and patterns for this project
- **`.claude/runners/_conditional_docs.md`** - **MUST READ ENTIRE FILE** - Index of test/lint runner documentation for this project

**Important:** These ARE the documentation. They're indexes that map your tasks to detailed docs. Read them fully when first learning the codebase to understand what documentation exists, then use them as references during work.

### CONDITIONAL: Detailed Documentation (Read When Needed)

Only read these when the conditions match your current task:
