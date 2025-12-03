# AI-Assisted Development Strategies (Extracted Directly From Transcript)

## 1. Build a workflow around the AI; don’t rely on out-of-the-box behaviour
- AI tools hallucinate, lack context, and produce generic code.
- The missing piece is the workflow you build around them.
- Teach the AI your own development processes.
- This workflow is bootstrapped at the start of every project.

## 2. Use context-management systems
- Never use Claude Code without custom context management.
- Carry over knowledge from Cursor / WindSurf.
- Build your own system for context management tailored to the project.

## 3. Create custom commands and sub-agents at the beginning of the project
- The first step in every project is building custom commands and sub-agents.
- Commit these to version control.
- As tasks are completed, commit the documents for each task.

## 4. Use specialised research sub-agents (not implementation agents)
- Sub-agents are researchers.
- They read documentation, codebases, repos, swagger docs.
- They return recommendations.
- The main orchestrating agent does the implementation.

## 5. Give each sub-agent its own context space
- Each sub-agent gets its own contextual window.
- Avoids burning tokens in the main orchestrator.
- Main agent receives only their summaries.

## 6. Provide vague implementation directions but specific context
- Be vague about how to implement things.
- Be specific about what each expert needs to consider.
- Corrections during review naturally teach the system your goals.

## 7. Use idiomatic patterns of underlying frameworks
- Sub-agents identify idiomatic ways to solve problems.
- Extend existing patterns (“be a chameleon”).
- Do not introduce new abstractions unless needed.
- Helps new developers avoid learning extra layers.

## 8. Store all docs, plans, decisions, statuses in a task folder
Assistant produces:
- Implementation notes (full research results)
- Plan document
- Decisions document
- Status document

Documents must be:
- Reviewed before implementation
- Synced during implementation
- Capturing learnings per task

## 9. Maintain a project-specific root docs folder
- Contains subfolders (e.g., PipeCat).
- Stores recurring lessons learned.
- Acts as project-specific memory.

## 10. Sub-agents must check the lessons folder
- Experts check relevant subfolders.
- Evaluate whether stored learnings apply.
- Forms a retrieval/memory mechanism.

## 11. Use task decomposition
- Don’t give overly large tasks.
- Split tasks into phases.
- Decompose complexity into manageable instructions.

## 12. Root cause analysis workflow
Steps:
1. Identify issue.
2. AI forms hypothesis.
3. AI adds debug logging.
4. AI runs the server/frontend.
5. You reproduce the issue.
6. AI checks logs.
7. If hypothesis correct → AI resets code and applies fix.
8. If not → repeat until solved.

## 13. Use a “create command” custom command
- Accesses Claude documentation.
- Reads existing commands.
- Generates new custom commands using examples.

## 14. Use a “create subagent” command
Uses:
- Online Anthropic best practices.
- Existing subagent examples.
- Optional example folder.

## 15. Use a prompt-engineering expert sub-agent
- Contains 18 months of accumulated knowledge.
- Applies context management + task decomposition.
- Helps with drafting complex multi-node prompts.

## 16. Validate planning documents before implementation
- Plan must be correct before writing code.
- Decisions document must be corrected first.
- Only then can implementation begin.

## 17. Strict configuration strategy (from decisions)
- Provider-specific schema → multiple config classes.
- No fallback behaviour → break if missing config.
- Strict validation with safe API error messages.
- No hot reload; restart required.
- JSON only; no YAML.
- Env vars only for API keys/system-level config.

## 18. Iterative correction cycle
- AI drafts implementation.
- Human reads code as it is produced.
- Human identifies corrections.
- AI updates code.
- Docs sync automatically.

## 19. Core principles: context management + task decomposition
- Must provide the right context to the right agent.
- Must decompose tasks so the AI can succeed.

## 20. First version should be minimal
- Load config from file first.
- Intentionally basic.
- Iterate to production-ready quality.
