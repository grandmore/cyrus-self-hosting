# Claude Memory Rules - Cognitive Architecture for AI Instructions

<core_principles>
**AI models process instructions through attention mechanisms where every token creates probability distributions.** This document codifies cognitive engineering principles that align with how transformer architectures actually process information at the computational level.
</core_principles>

<fundamental_mechanics>

## The Attention Economy

**CRITICAL:** Transformer models allocate attention based on token position, frequency, and structural emphasis. Understanding this mechanism is essential for instruction design because attention creates reality in AI processing.

### Token Salience Hierarchy
- **Position Weight**: Early tokens receive exponentially higher attention scores
- **Frequency Amplification**: Repeated concepts accumulate activation energy
- **Structural Emphasis**: Bold, caps, and XML tags trigger attention spikes
- **Negation Paradox**: Forbidden concepts still activate through mention

### Cognitive Load Distribution
**NEVER** overload working memory with competing directives. Transformer attention has finite bandwidth - optimal instruction design respects these computational limits.

</fundamental_mechanics>

<instruction_architecture>

## Hermetic Cognitive Containers

**ALWAYS** separate instruction types into distinct processing domains. Mixed directives create attention conflicts that degrade performance.

### Container Types:
  - **Primary Directives**: `<actions>`
    - Lead with positive action verbs
    - Specify concrete behaviors: `"Use Firebase authentication"`  
    - Include context parameters: `(when handling user data)`
    - Maintain single-focus: each directive targets one specific outcome

  - **Boundary Constraints**: `<boundaries>`  
    - Frame as limitation scoping: `"Avoid mock objects"`
    - Provide computational rationale: `(reduces test reliability)`
    - Separate from positive instructions: cognitive isolation prevents contamination

  - **Conditional Logic**: `<exceptions>`
    - Structure as decision trees: `IF condition THEN action ELSE default`
    - Prioritize safety overrides: `CRITICAL exceptions supersede all rules`
    - Include validation checkpoints: `[verify condition before applying exception]`

### Emphasis Engineering

**CRITICAL:** Use hierarchical emphasis to guide attention allocation:

- **CRITICAL/PRIORITY**: Non-negotiable system requirements  
- **ALWAYS/NEVER**: Binary behavioral mandates
- **MUST/SHOULD**: Graduated obligation levels
- **Avoid/Prevent**: Soft boundaries with preserved context
- Regular text: Supporting information and rationale

</instruction_architecture>

<cognitive_processing_rules>

## Rule 1: Explicit Presence Creates Activation
**"Unmentioned concepts have zero probability weight"**

**MUST** explicitly state every desired behavior because AI attention operates through direct token activation. Implicit expectations fail because transformer models cannot infer unstated requirements.

✅ **Effective Pattern:**
```xml
<required_actions>
- Check function parameters for unused variables
- Verify return type matches specification  
- Validate input sanitization before processing
</required_actions>
```

❌ **Ineffective Pattern:**
```
Write good functions [hoping AI will remember quality standards]
```

**Rationale:** Attention mechanisms require explicit cognitive triggers. Absent instructions equal absent consideration in transformer processing.

## Rule 2: Positive Framing Dominates Attention
**"First-mentioned concepts capture primary attention weight"**

**ALWAYS** lead with desired behaviors before introducing constraints. Negative framing (don't, never, avoid) creates attention conflicts where the forbidden concept still receives activation.

✅ **Cognitive Optimization:**
```xml
<primary_behavior>
Use real Firebase tokens for authentication testing
</primary_behavior>
<constraints>  
Avoid mock authentication objects (reduces test validity)
</constraints>
```

❌ **Attention Conflict:**
```
Don't use mock authentication [makes AI think about mocks first]
```

**Computational Logic:** Token attention weights favor early position. When constraint concepts appear first, they receive primary activation despite negative framing.

## Rule 3: Structural Separation Prevents Contamination  
**"Cognitive boundaries create clean processing domains"**

**NEVER** mix positive directives with negative constraints in the same processing unit. Separated structures enable independent attention allocation without cross-contamination.

✅ **Clean Architecture:**
```xml
<core_actions>
✅ Create comprehensive test coverage
✅ Use meaningful assertion messages  
✅ Implement proper error handling
</core_actions>

<prohibited_patterns>
❌ Avoid superficial test assertions
❌ Avoid hardcoded test data
❌ Avoid skipping error scenarios
</prohibited_patterns>
```

**Neural Processing:** Separated sections allow transformer attention to process each domain independently, reducing cognitive interference between competing concepts.

## Rule 4: Conditional Logic Requires Decision Trees
**"Complex scenarios need explicit branching structure"**

**MUST** structure conditional instructions as formal decision trees because transformer models excel at pattern matching but struggle with implicit rule prioritization.

✅ **Decision Framework:**
```xml
<conditional_processing>
IF user_request contains "security" OR "authentication" THEN
  → Use auth-technology-agent (specialized security handling)
ELSE IF user_request contains "database" OR "SQL" THEN  
  → Use cloudsql-agent (database expertise)
ELSE IF user_request contains "React" OR "frontend" THEN
  → Use react-frontend-engineer (UI specialization)  
ELSE
  → Default to general implementation approach
END
</conditional_processing>
```

**Cognitive Rationale:** Explicit branching leverages transformer pattern matching while eliminating ambiguous prioritization that causes processing conflicts.

</cognitive_processing_rules>

<production_templates>

## Master Instruction Template

```xml
<instruction_goal>
[Single, unambiguous outcome statement]
</instruction_goal>

<core_directives>
✅ **PRIMARY:** [Most critical positive action]
✅ **SECONDARY:** [Supporting positive actions]  
✅ **TERTIARY:** [Additional positive behaviors]
</core_directives>

<boundary_constraints>
❌ **PROHIBITED:** [Specific forbidden approaches]
❌ **RESTRICTED:** [Limited-context constraints]  
❌ **DEPRECATED:** [Outdated patterns to avoid]
</boundary_constraints>

<exception_handling>
**CRITICAL OVERRIDE:** IF [safety_condition] THEN [mandatory_response]
**CONTEXT SWITCH:** IF [domain_change] THEN [specialized_approach]
**FALLBACK:** IF [ambiguous_scenario] THEN [clarification_request]
</exception_handling>

<validation_checkpoint>
Before completion, verify:
- [ ] Primary directive accomplished: [specific_outcome]
- [ ] Boundary constraints respected: [no_prohibited_patterns]  
- [ ] Exception conditions evaluated: [proper_branching_applied]
</validation_checkpoint>
```

## Advanced Pattern: Nested Conditional Architecture

For complex multi-domain instructions:

```xml
<priority_hierarchy>
**LEVEL 1:** Safety and Security Overrides
  IF potential_harm OR security_risk THEN
    → Apply safety_protocols IMMEDIATELY
    → Override all other instructions
    
**LEVEL 2:** Domain-Specific Routing  
  IF domain_expertise_required THEN
    → Route to specialized_agent
    → Apply domain_specific_constraints
    
**LEVEL 3:** General Implementation
  IF standard_approach_sufficient THEN
    → Follow core_directives
    → Apply standard_boundaries
</priority_hierarchy>
```

</production_templates>

<cognitive_engineering_principles>

## Attention Optimization Strategies

### Token Economy Management
**CRITICAL:** Every word consumes attention bandwidth. Optimize for:
- **Precision over Verbosity**: Specific terms activate targeted behaviors
- **Structure over Explanation**: XML boundaries guide processing flow  
- **Hierarchy over Equality**: Emphasis levels direct attention priority
- **Separation over Integration**: Isolated concepts prevent cross-contamination

### Metacognitive Scaffolding  
**MUST** include process instructions alongside content instructions:

```xml
<processing_guidance>
**EVALUATION ORDER:** 
1. Check for safety/security implications FIRST
2. Identify domain expertise requirements  
3. Apply appropriate specialist routing
4. Execute core directives with boundary awareness
5. Validate outcomes against specified criteria

**CONFLICT RESOLUTION:**
IF multiple rules apply → Use priority_hierarchy
IF rules contradict → Apply safety_override  
IF ambiguity exists → Request clarification with context
</processing_guidance>
```

### Self-Monitoring Integration
Build validation directly into instruction architecture:

```xml
<continuous_validation>
**DURING PROCESSING:**
- Am I following the primary positive directive?
- Have I avoided the specified boundary constraints?  
- Do exception conditions apply to current context?

**BEFORE COMPLETION:**
- Does output match intended goal specification?
- Are all critical requirements demonstrably satisfied?
- Would peer review identify any compliance gaps?
</continuous_validation>
```

</cognitive_engineering_principles>

<implementation_wisdom>

## Why This Architecture Works

**Computational Alignment:** These patterns leverage transformer attention mechanisms rather than fighting against them. By understanding how AI actually processes information - through token attention, position weighting, and structural emphasis - we design instructions that work with the neural architecture.

**Cognitive Load Optimization:** Separated containers prevent attention conflicts. Hierarchical emphasis guides processing priority. Explicit conditionals eliminate ambiguous branching. Each element serves the transformer's computational strengths.

**Production Reliability:** This architecture mirrors patterns used by leading AI organizations because it produces consistent, predictable behavior across different models and contexts. The structured approach scales from simple tasks to complex multi-domain scenarios.

**Error Prevention:** Built-in validation checkpoints and conflict resolution frameworks prevent common instruction failure modes. The self-monitoring elements create feedback loops that improve compliance over time.

## The Fundamental Insight

> **"Attention creates reality in transformer models. What receives computational focus becomes behavioral output. Engineer attention allocation deliberately through structural design, hierarchical emphasis, and cognitive separation."**

</implementation_wisdom>