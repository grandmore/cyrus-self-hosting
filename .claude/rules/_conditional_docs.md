# Strategic Index & Operating Context

This document provides the master index to the core strategic pillars of the business. It is the primary entry point for understanding the entire system.

## Purpose

This index enables efficient context loading by describing all reference documents. Read this index first, then load only the documents relevant to your current task.

---

## 📚 Reference Document Index

### 1. **AI_Workflow_and_Instructions.md**

**What it contains:**
- Three-level project hierarchy: Project → Iteration → Output
- Folder naming conventions and structure standards
- Knowledge base directory organization
- Working instructions for AI assistant sessions
- Documentation and communication protocols
- Quality standards for all work

**When to read:**
- Setting up new projects or iterations
- Creating documentation structure
- Understanding file organization system
- Starting a new AI session and need workflow guidance
- Creating execution logs or session documentation

**Key information:**
- Project structure: `[number]-[name]/` contains all iterations
- Iteration structure: `[number]_[name]/` contains outputs and docs
- Output structure: `1/`, `2/`, `3/` contain execution results
- Standard folders: `prompts/`, `outputs/`, `keywords/`, `documents/`, `research/`, `data/`

**Related documents:**
- Works with all strategic documents as the organizational framework

---

### 2. **Business_Model.md**

**What it contains:**
- Multi-layered revenue ecosystem overview
- Three revenue streams: SaaS, mid-ticket services, high-ticket transformation
- Community-led growth flywheel strategy
- Financial model with pricing tiers
- Customer acquisition and ascension path

**When to read:**
- Understanding revenue strategy and pricing decisions
- Working on subscription/payment features
- Implementing monetization logic
- Creating marketing funnel features
- Understanding customer value ladder

**Key information:**
- **SaaS**: SEOGrid (~$100/mo), Ecomacy (~$200/mo), Micro-recurring activation fees (~$100/mo/campaign)
- **Mid-Ticket**: Productized ad campaigns ($2k-$5k)
- **High-Ticket**: Market dominance package ($20k-$50k)
- **Growth Strategy**: Free community → Immediate value → SaaS → Productized services → High-ticket

**Related documents:**
- `Product_Strategy_and_Workflow.md` - Product details
- `Product_Ecosystem_Strategy.md` - Product flywheel
- `Customer_Journey.md` - Customer progression path

---

### 3. **Customer_Journey.md**

**What it contains:**
- Nine-phase methodology for local business success
- Step-by-step progression from MVP to market dominance
- Specific actions and goals for each phase
- Role of each product (SEOGrid, Ecomacy) in the journey

**When to read:**
- Implementing onboarding flows
- Creating customer progression features
- Building educational content systems
- Designing phase-specific UI/UX
- Understanding customer lifecycle stages

**Key information:**
- **Phase 1**: MVP - Test market with simple ads
- **Phase 2**: Foundation - "Level 1" website + scaled intent ads
- **Phase 3**: Authority - Dominate with reviews
- **Phase 4**: Dominance - Content strategy implementation
- **Phase 5**: Interruption marketing - Facebook ads
- **Phase 6**: Organic expansion - Advanced SEO content
- **Phase 7**: Video content - YouTube strategy
- **Phase 8**: Omnichannel presence
- **Phase 9+**: Market leadership

**Related documents:**
- `Business_Model.md` - Revenue model aligned with journey
- `Product_Ecosystem_Strategy.md` - Product activation sequence
- `Desire_Loop.md` - Behavioral interventions per phase

---

### 4. **Desire_Loop.md**

**What it contains:**
- Psychological persuasion system technical specification
- Data-driven intervention engine mechanics
- Product components and behavioral tracking methods
- Individual business profiling system
- Intervention types and delivery optimization
- Success reinforcement and failure amplification tactics

**When to read:**
- Implementing analytics/tracking features
- Building notification/alert systems
- Creating behavioral intervention logic
- Working on competitive intelligence displays
- Designing psychological triggers in UI
- **CRITICAL**: Implementing ANY tracking or analytics features

**Key information:**
- **Core Mechanism**: Pain of inaction > Pain of action
- **Data Dependency**: Requires Splitstream for all behavioral intelligence
- **SEOGrid Functions**: Ranking tracking, competitor identification, loss quantification
- **Ecomacy Functions**: Call intelligence, lead tracking, operational metrics, verification
- **5 Intervention Levels**: Awareness → Competitive context → Loss quantification → Trend projection → Peer comparison
- **Trigger Events**: Competitor passes, ranking drops, missed calls, declining metrics

**Related documents:**
- **MUST READ WITH**: `Splitstream.md` - Data infrastructure that powers Desire Loop
- `Product_Strategy_and_Workflow.md` - Products being tracked
- `Product_Ecosystem_Strategy.md` - Product integration strategy

---

### 5. **Product_Ecosystem_Strategy.md**

**What it contains:**
- CapturingLocal umbrella brand strategy
- Community and product flywheel mechanics
- Psychological foundation: Inaction Gap and Pain Switch
- Two-stage product journey (Ecomacy → SEOGrid)
- Social proof and exclusivity principles

**When to read:**
- Understanding product positioning and messaging
- Implementing product integration features
- Building community platform features
- Creating product recommendation logic
- Designing cross-product workflows

**Key information:**
- **CapturingLocal**: Invitation-only community, proof-driven progressive access
- **Stage 1**: Ecomacy provides immediate value, control, and relief (solves missed calls)
- **Stage 2**: SEOGrid provides clarity, strategic advantage, and aspiration (market dominance)
- **Flywheel**: Community attracts → Teach ads → Introduce Ecomacy → Fund SEOGrid → Measure success → Reinforce ecosystem
- **Psychology**: Inaction Gap closed by Pain Switch (inaction pain > action pain)

**Related documents:**
- `Product_Strategy_and_Workflow.md` - Detailed product specifications
- `Business_Model.md` - Revenue integration
- `Desire_Loop.md` - Psychological mechanisms

---

### 6. **Product_Strategy_and_Workflow.md**

**What it contains:**
- Three core entities: CapturingLocal, SEOGrid, Ecomacy
- Detailed product specifications and functions
- User workflow: Generate revenue → Dominate market
- Three marketing funnels (community-led, SEOGrid-led, Ecomacy-led)
- Tracking context and Splitstream integration

**When to read:**
- Implementing product-specific features
- Understanding product capabilities and data flows
- Building cross-product integrations
- Creating product-specific UI/UX
- Working on any SEOGrid or Ecomacy features

**Key information:**
- **CapturingLocal**: Community/training hub, methodology teaching
- **SEOGrid**: Competitive intelligence, GBP ranking tracking, AI-driven strategy, competitor mapping
- **Ecomacy**: Operational system, AI call answering, lead tracking CRM, review automation
- **User Path**: Step 1 (Ecomacy for immediate revenue) → Step 2 (SEOGrid for dominance)
- **Tracking**: Every interaction tracked through Splitstream's unified analytics

**Related documents:**
- **MUST READ WITH**: `Splitstream.md` - How products are tracked
- `Product_Ecosystem_Strategy.md` - Strategic positioning
- `Desire_Loop.md` - Behavioral intervention system
- `Business_Model.md` - Pricing and revenue model

---

### 7. **Splitstream.md**

**What it contains:**
- Analytics Splitstream unified analytics proxy system
- Data collection infrastructure and architecture
- Four tracking systems (Membership, SEO Grid, Ecomacy, Website)
- Hot vs cold event classification
- Identity resolution and multi-level attribution
- Technical deployment and configuration

**When to read:**
- Implementing ANY analytics or tracking features
- Working on event capture or behavioral monitoring
- Building PostHog integrations
- Creating behavioral triggers or interventions
- Debugging tracking issues
- **CRITICAL**: Before implementing Desire Loop features

**Key information:**
- **Purpose**: Sensory nervous system that powers the entire Desire Loop
- **Architecture**: Trackers → Splitstream → PostHog (hot events) + BigQuery (cold storage)
- **Four Trackers**: Membership (M3b7R2), SEO Grid (A7k3M9), Ecomacy (D4n8P1), Website (R2w5X8)
- **Hot Events**: Real-time triggers (job_booked, lead_generated, ranking_dropped, etc.)
- **Cold Events**: All events stored for pattern discovery and retroactive analysis
- **Production Endpoint**: `https://analytics-splitstream-259151934459.europe-west1.run.app`

**Related documents:**
- **MUST READ WITH**: `Desire_Loop.md` - Strategy that Splitstream enables
- `Product_Strategy_and_Workflow.md` - Products generating tracked events
- `Product_Ecosystem_Strategy.md` - Product integration context

---

### 8. **Strategic_Foundation.md**

**What it contains:**
- Eugene Schwartz's Five Levels of Customer Awareness
- Two engines of growth: Responding to demand vs Creating demand
- Strategic operating rules for marketing
- Channel-message fit principles
- Awareness spectrum as the foundational law

**When to read:**
- Creating marketing content or campaigns
- Designing landing pages or messaging
- Building content strategy features
- Understanding customer targeting logic
- Making channel or messaging decisions

**Key information:**
- **5 Awareness Levels**: Unaware → Problem-aware → Solution-aware → Product-aware → Most aware
- **Engine 1 (Capturing)**: Google Search, SEO, LSA - responding to existing demand (States 3-5)
- **Engine 2 (Creating)**: Facebook, Instagram, Display - creating new demand (States 1-5)
- **Operating Rules**: Channel-message fit is absolute, content must be honest to its level, business model dictates engine
- **Critical Insight**: Cannot use demand-response channel with demand-creation message

**Related documents:**
- `Customer_Journey.md` - How awareness progression manifests in customer journey
- `Business_Model.md` - How awareness affects acquisition strategy
- `Product_Ecosystem_Strategy.md` - How products address different awareness levels

---

## 🎯 Quick Reference Guide

### **If you're working on...**

**Analytics/Tracking Features:**
→ Read: `Splitstream.md` + `Desire_Loop.md`

**Product Features (SEOGrid/Ecomacy):**
→ Read: `Product_Strategy_and_Workflow.md` + `Splitstream.md`

**Payment/Subscription Features:**
→ Read: `Business_Model.md` + `Product_Strategy_and_Workflow.md`

**Customer Onboarding/Progression:**
→ Read: `Customer_Journey.md` + `Product_Ecosystem_Strategy.md`

**Marketing Content/Messaging:**
→ Read: `Strategic_Foundation.md` + `Business_Model.md`

**Behavioral Interventions/Notifications:**
→ Read: `Desire_Loop.md` + `Splitstream.md` + `Product_Strategy_and_Workflow.md`

**Project Structure/Documentation:**
→ Read: `AI_Workflow_and_Instructions.md`

**Strategic Understanding/Context:**
→ Read: `Strategic_Foundation.md` + `Business_Model.md` + `Customer_Journey.md`

---

## 🔗 Document Dependency Map

```
Strategic_Foundation.md (Core marketing physics)
    ↓
Business_Model.md (Revenue model)
    ↓
Customer_Journey.md (9-phase progression)
    ↓
Product_Ecosystem_Strategy.md (Product positioning)
    ↓
Product_Strategy_and_Workflow.md (Product specs)
    ↓
Splitstream.md ←→ Desire_Loop.md (Data infrastructure + Psychological strategy)
    ↓
AI_Workflow_and_Instructions.md (Execution framework)
```

**Critical Pairs (Always read together):**
- `Splitstream.md` + `Desire_Loop.md` - Data infrastructure + Strategy
- `Product_Strategy_and_Workflow.md` + `Business_Model.md` - Products + Revenue
- `Strategic_Foundation.md` + `Customer_Journey.md` - Theory + Implementation

---

