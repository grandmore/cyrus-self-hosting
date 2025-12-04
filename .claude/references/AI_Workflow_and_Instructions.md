## 3. Core Workflow: Iterative Project Model

### Project-Iteration-Output Structure

We maintain a three-level hierarchy for continuous improvement and perfect traceability:

### Project Structure:

**Project Level (Root):**
The project contains all iterations of a specific workflow type:
```
0-video-flow/                  # Project level (the "0")
├── 04_video-framework-workflow/  # Iteration 4 (creates "0/4")
├── 05_video-framework-workflow/  # Iteration 5 (creates "0/5") 
└── 06_video-framework-workflow/  # Iteration 6 (creates "0/6")
```

**Iteration Level (Workflow Evolution):**
Each iteration is a complete refresh/improvement of the methodology:
```
04_video-framework-workflow/   # Iteration 4 of video framework
├── prompts/                   # The actual prompts for each step
├── outputs/                   # Numbered execution outputs (1, 2, 3...)
├── execution-guide.md         # How to run this iteration
├── workflow-notes.md          # Improvements and learnings
├── README.md                  # What this iteration does
└── CLAUDE.md                  # Context for this iteration
```

**Output Level (Individual Executions):**
Each execution creates numbered results within the iteration:
```
outputs/
├── 1/                         # First execution
│   ├── keywords/              # Keyword research files
│   ├── documents/             # Generated documents
│   ├── research/              # Background research
│   ├── data/                  # Raw data files
│   └── execution-log.md       # What happened in this run
├── 2/                         # Second execution
└── 3/                         # Third execution
```

### Naming Convention:

**Project Folders:**
- Format: `[project-number]-[project-name]`
- Example: `0-video-flow`, `1-seogrid-content`, `2-email-sequences`
- Project-number: Sequential identifier
- Project-name: Descriptive name using hyphens

**Iteration Folders:**
- Format: `[iteration-number]_[workflow-name]`
- Example: `04_video-framework-workflow`, `05_video-framework-workflow`
- Iteration-number: Two-digit sequential number (01, 02, 03...)
- Workflow-name: Descriptive name using hyphens

**Output Folders:**
- Format: Simple sequential numbers: `1`, `2`, `3`, `4`, `5`...
- Location: Inside each iteration's `outputs/` directory
- Each contains the standard structure (keywords/, documents/, research/, data/)

### Key Principles:

1. **Project Evolution**: Each project (0-video-flow) contains all iterations of that workflow type
2. **Iteration Improvement**: Each iteration (04_, 05_, 06_) is a complete methodology refresh
3. **Self-Contained Outputs**: Each numbered execution (1, 2, 3...) contains all files from that run
4. **Consistent Structure**: Every output uses the same internal organization (keywords/, documents/, research/, data/)
5. **Easy Comparison**: Same structure across executions enables easy comparison
6. **Clear Hierarchy**: Project/Iteration/Output creates perfect traceability (e.g., "0/4" = Project 0, Iteration 4)

## 4. Knowledge Base Directory Structure

Our knowledge base is organized into multiple locations for different purposes:

### Active Documentation (`/docs/`)
Current, authoritative documents that guide our work:
- `Master_Operating_Manual.md` - Complete system guide
- `Strategic_Foundation.md` - Core strategic principles
- `Desire_Loop.md` - Latest content system framework

### Reference Library (`.claude/references/`)
Comprehensive collection of strategic and tactical documents:
- **Strategic Documents:**
  - `strategic-foundation.md` - Customer acquisition physics and awareness levels
  - `customer-types.md` - Customer mindset spectrum analysis
  - `big-idea-development.md` - Framework for creating unique central messages
  - `messaging-principles.md` - Tactical rules for customer-centric copy
  
- **Execution Documents:**
  - `content-structure.md` and `content-structure-detailed.md` - Content formatting and structure
  - `ai-execution-patterns.md` and `ai-execution-patterns-detailed.md` - AI workflow patterns
  - `testing-framework.md` and `testing-framework-detailed.md` - Testing methodologies
  
- **Specialized Documents:**
  - `copywriting-system-overview.md` - Overview of the copywriting system
  - `copywriting-knowledge-structure.md` - Structure of copywriting knowledge
  - `advertising-fundamentals.md` - Core advertising principles
  - `competitive-research.md` and `competitive-research-detailed.md` - Competition analysis
  - `content-brief-template.md` - Template for content briefs

### Conversations and Working Documents (`/conversations/`)
Project-specific strategies and implementations:
- `executive-summary.md` - High-level project summaries
- `desire-loop-strategy.md` - Desire Loop implementation strategies
- `behavioral-engagement-strategy.md` - User engagement strategies
- `behavioral-engine-blueprint.md` - Technical behavior engine design
- `data-collection-strategy.md` - Data gathering approaches
- `implementation-roadmap.md` - Project implementation plans
- `technical-implementation-guide.md` - Technical execution details

### Session Documentation (`/sessions/`)
Templates and best practices for documenting work:
- `conversation-documentation-template.md` - Template for documenting AI conversations
- `documentation-best-practices.md` - Guidelines for effective documentation

## 5. Working Instructions for AI Assistant

### When Starting a Session:
1. Read this CLAUDE.md file first to understand the system
2. Ask the human for the specific project or task at hand
3. If starting a new iteration, create new iteration folder (e.g., `05_workflow-name/`)
4. If continuing existing work, navigate to the appropriate iteration folder
5. For new executions, create numbered output folder (1, 2, 3...) in `outputs/`
6. Request to read any relevant documentation from the knowledge base as needed

### During Work Execution:
1. Always work within the designated iteration/output folder structure
2. Document progress in the `execution-log.md` file within the numbered output
3. Save analysis work in the `research/` directory
4. Save creative output in the `documents/` directory
5. Save keyword research in the `keywords/` directory
6. Save raw data in the `data/` directory
7. Reference the knowledge base documents as needed for guidance
8. Maintain clear communication about what is being done and why

### Key Principles to Follow:
1. **Context Preservation**: All work must be traceable and documented
2. **Strategic Alignment**: Always refer back to strategic foundations when creating content
3. **Iterative Process**: Work in cycles of creation, review, and refinement
4. **Human Direction**: Wait for human input on strategic decisions
5. **Documentation**: Maintain comprehensive records of all work and decisions

## 6. Available Resources and Tools

### Strategic Knowledge:
- Five Levels of Customer Awareness framework
- Demand Response versus Demand Creation engines
- Customer urgency and research mindset spectrum
- Big Idea development methodology
- Outside-In messaging principles

### Execution Frameworks:
- Content structure templates
- AI execution patterns for various content types
- Testing and validation frameworks
- Competitive research methodologies

### Project Management:
- Project folder system for context preservation
- Documentation templates and best practices
- Workflow patterns for different project types

## 7. Communication Protocol

### Information Requests:
When the AI needs specific information or documentation, it should:
1. Clearly state what information is needed and why
2. Reference the specific document location if known
3. Ask for clarification if instructions are unclear

### Progress Updates:
The AI should provide regular updates including:
1. What task is currently being worked on
2. What has been completed
3. What decisions or input are needed from the human
4. Any blockers or questions that have arisen

### Decision Points:
When strategic decisions are needed, the AI should:
1. Clearly present the decision that needs to be made
2. Provide relevant context and options
3. Wait for human input before proceeding
4. Document the decision and rationale in the project log

## 8. Quality Standards

All work produced through this system should meet these standards:
1. **Strategic Alignment**: Consistent with core strategic principles
2. **Customer-Centric**: Written from the customer's perspective (Outside-In)
3. **Evidence-Based**: Supported by research and analysis
4. **Documented**: Fully traceable with clear documentation
5. **Iterative**: Refined through multiple rounds of review
6. **Professional**: Meeting high standards of quality and polish