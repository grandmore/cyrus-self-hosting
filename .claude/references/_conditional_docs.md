# Strategic Index & Operating Context

This document provides the master index to the core strategic pillars of the business. It is the primary entry point for understanding the entire system.

## Conditional Documentation

- README.md
  - Conditions:
    - When operating on anything under main/spi
    - When operating on anything under main/frontend
    - When first understanding the project structure
    - When you want to learn the commands to start or stop the server or client

- Read
  - `.claude/rules/_conditional_docs.md`
  - `.claude/references/_conditional_docs.md`

- app/client/src/style.css
  - Conditions:
    - When you need to make changes to the client's style

- .claude/commands/classify_adw.md
  - Conditions:
    - When adding or removing new `adws/adw_*.py` files

- adws/README.md
  - Conditions:
    - When you're operating in the `adws/` directory

- .claude/references/devcontainer-setup.md
  - Conditions:
    - When working with DevContainer or DevPod configuration
    - When setting up development environments
    - When troubleshooting container or CLI authentication issues
    - When understanding how ADWS runs in containerized environments
    - When onboarding new developers to the project

- .claude/references/linear-cli.md
  - Conditions:
    - When you need to interact with Linear (issue tracking system)
    - When creating, updating, or searching Linear issues
    - When managing Linear labels, projects, cycles, or milestones
    - When integrating Linear with GitHub Actions or automation workflows
    - When you need to control Linear directly via CLI

### 1. The Core Business Model
*   **What it is:** A multi-layered revenue ecosystem combining a free community, recurring SaaS, and high-ticket services to create market leaders in local service verticals.
*   **Primary Document:** `Business_Model.md`

### 2. The Foundational "Physics"
*   **What it is:** The fundamental principles of customer awareness and the two engines of growth (Demand Capturing vs. Demand Creation) that govern all marketing and sales activities.
*   **Primary Document:** `Strategic_Foundation.md`

### 3. The Customer Journey & Methodology
*   **What it is:** The step-by-step "Freedom Roadmap" we teach our clients, guiding them from MVP market validation to full market dominance.
*   **Primary Document:** `Customer_Journey.md`

### 4. The Product Ecosystem & Workflow
*   **What it is:** The suite of products (`Capturing Local`, `SEOGrid`, `Ecomacy`) and the logical workflow that guides a customer from immediate revenue generation to long-term market dominance.
*   **Primary Documents:**
    *   `Product_Strategy_and_Workflow.md`
    *   `Product_Ecosystem_Strategy.md`

### 5. The Psychological Persuasion System (Desire Loop + Splitstream)
*   **What it is:** The complete behavioral influence system combining:
    - **The Strategy (Desire Loop):** Data-driven psychological triggers that compel clients to take revenue-generating actions
    - **The Foundation (Splitstream):** The analytics infrastructure that captures every behavioral signal across all platforms
*   **How they work together:** 
    1. Splitstream's trackers capture all user behavior across platforms
    2. Data flows to both hot (PostHog) and cold (BigQuery) storage
    3. Desire Loop analyzes patterns to determine intervention timing/type
    4. Interventions are triggered based on behavioral thresholds
    5. Results flow back through Splitstream to measure effectiveness
*   **Primary Documents:**
    *   `Desire_Loop.md` - The psychological strategy
    *   `Splitstream.md` - The data foundation (REQUIRED)
