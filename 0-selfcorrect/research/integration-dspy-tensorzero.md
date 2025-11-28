# DSPy + TensorZero Integration Guide

## Quick Reference

| Task | Tool | When to Use |
|------|------|------------|
| Optimize prompts/logic | DSPy | Development phase, <2 weeks to optimize |
| Production deployment | TensorZero | Once optimized prompts are ready |
| Monitor & improve | Both together | Continuous feedback loops |

---

## PART 1: DSPy QUICK START

### Installation
```bash
pip install dspy-ai
```

### Basic Structure for Multi-Stage Pipeline

```python
import dspy

class StageOne(dspy.ChainOfThought):
    """First stage of your pipeline"""
    def forward(self, input_data):
        # Process input
        return output

class StageTwo(dspy.ChainOfThought):
    """Second stage"""
    def forward(self, stage_one_output):
        # Process output from stage one
        return output

class CompletePipeline(dspy.Module):
    def __init__(self):
        self.stage_one = StageOne()
        self.stage_two = StageTwo()
        # ... add more stages

    def forward(self, input_data):
        # Chain stages
        s1_out = self.stage_one(input_data)
        s2_out = self.stage_two(s1_out)
        # ... more stages
        return final_output

# Define metric (evaluates final output)
def my_metric(example, prediction, trace=None):
    # Return 0.0 to 1.0 score
    # This propagates backward to optimize all stages
    return score

# Optimize
dspy.settings.configure(lm=dspy.OpenAI(model="gpt-4"))
optimizer = dspy.MIPROv2(metric=my_metric, num_threads=4)
optimized_pipeline = optimizer.compile(
    student=CompletePipeline(),
    trainset=training_data,
    valset=validation_data,
)

# Use optimized pipeline
result = optimized_pipeline(example_input)
```

### Key Concepts

**Metrics are Critical**:
- Return float 0.0-1.0
- Evaluates FINAL output only
- DSPy automatically optimizes all intermediate stages
- This is backward evaluation

**Data Requirements**:
- Training set: 50-100 examples minimum
- Validation set: 20-50 examples
- Both need input + expected output

**Variable Length Pipelines**:
```python
class VariableLengthPipeline(dspy.Module):
    def forward(self, items):
        results = []
        for item in items:  # Variable number of items
            result = self.process(item)
            results.append(result)
        return self.synthesize(results)  # Combine variable results
```

---

## PART 2: TENSORZERO QUICK START

### Installation
```bash
# Option 1: Using the Python client
pip install tensorzero

# Option 2: Run the gateway
docker run -p 3000:3000 tensorzero/gateway:latest
```

### Basic Configuration

**config.yml**:
```yaml
models:
  gpt4:
    provider: openai
    model: gpt-4

functions:
  my_pipeline:
    type: inference
    description: "My multi-stage LLM pipeline"
    input:
      type: object
      properties:
        input_data:
          type: string
    output:
      type: object
      properties:
        result:
          type: string

evaluations:
  correctness:
    type: inference
    description: "Check if output is correct"
    metrics:
      - type: llm_judge
        prompt: "Is the output correct? Response: YES or NO"
```

### Wrapping DSPy Pipeline

**tensorzero_wrapper.py**:
```python
from tensorzero import TensorZeroGateway
from optimized_pipeline import optimized_pipeline  # Your DSPy pipeline

def execute_pipeline(input_data: str) -> dict:
    """Wrapper function for TensorZero"""
    result = optimized_pipeline(input_data)
    return {"result": str(result)}

# Register with TensorZero
with TensorZeroGateway.build_embedded(
    clickhouse_url="sqlite:///:memory:",
    config_file="config.yml"
) as client:
    # Your pipeline is now available via TensorZero API
    response = client.inference(
        model_name="my_pipeline",
        input={"input_data": "Test input"}
    )
    print(response)
```

### Python Integration

```python
from openai import OpenAI
from tensorzero import patch_openai_client

# Patch OpenAI client to use TensorZero gateway
client = OpenAI(api_key="your-key")
patch_openai_client(
    client,
    clickhouse_url="http://localhost:8123",
    config_file="config.yml"
)

# Now use OpenAI client as normal - it routes through TensorZero
response = client.chat.completions.create(
    model="tensorzero::my_pipeline::gpt4",
    messages=[{"role": "user", "content": "..."}]
)
```

### Key Concepts

**Gateway**: Central point for all LLM calls
**Evaluations**: Measure pipeline quality
**Experiments**: A/B test different approaches
**Data Flywheel**: Collect feedback → retrain → improve

---

## PART 3: INTEGRATION WORKFLOW

### Week 1: Develop with DSPy

**Day 1-2: Define Pipeline**
```python
# spec_parser.py
import dspy

class ParseSpec(dspy.ChainOfThought):
    """Parse spec into requirements"""
    input_variable = "spec"

    def forward(self, spec):
        # Implementation
        pass

# ... define all 5 stages similarly
```

**Day 3-4: Create Metric**
```python
def backward_grading_metric(example, prediction, trace=None):
    """
    Backward grading: Final output determines success.
    If review doesn't match spec, all stages failed.
    """

    # Check if final review matches original spec
    spec_compliance = check_compliance(
        example.spec,
        prediction.review
    )

    if not spec_compliance:
        return 0.0  # Failure propagates backward

    # Partial credit for intermediate stages
    score = (
        0.1 * quality_of(prediction.parsed_spec) +
        0.2 * quality_of(prediction.plan) +
        0.3 * quality_of(prediction.code) +
        0.2 * quality_of(prediction.tests) +
        0.2 * quality_of(prediction.review)
    )
    return score
```

**Day 5: Prepare Data & Optimize**
```python
# Collect training examples
training_examples = [
    dspy.Example(
        spec="...",
        expected_review="..."
    )
    # 50+ examples
]

# Optimize
optimizer = dspy.MIPROv2(
    metric=backward_grading_metric,
    num_threads=4
)

optimized = optimizer.compile(
    student=CompletePipeline(),
    trainset=training_examples,
    valset=validation_examples,
    num_trials=100
)

# Evaluate
results = dspy.Evaluate()(optimized, test_examples)
print(f"Accuracy: {results['accuracy']}")
```

### Week 2-3: Deploy to TensorZero

**Day 1-2: Setup Infrastructure**
```bash
# Create TensorZero config
cat > config.yml << EOF
models:
  default:
    provider: openai
    model: gpt-4

functions:
  complete_workflow:
    type: inference
    description: "Multi-stage spec→plan→code→test→review"
    input:
      type: object
      properties:
        spec:
          type: string
    output:
      type: object
      properties:
        review:
          type: string

evaluations:
  backward_grading:
    type: workflow
    description: "Evaluate complete workflow"
    metrics:
      - type: llm_judge
        prompt: "Does output fully address the specification?"
EOF

# Start TensorZero
docker-compose up -d
```

**Day 3-4: Integration**
```python
# server.py
from tensorzero import TensorZeroGateway
from optimized_dspy_pipeline import optimized_pipeline

with TensorZeroGateway.build_embedded(
    clickhouse_url="postgresql://user:pass@localhost/tensorzero",
    config_file="config.yml"
) as client:

    # Log inference
    inference_id = client.inference(
        function_name="complete_workflow",
        input={"spec": "User specification..."},
        model_name="default"
    )

    # Later: collect feedback
    client.log_feedback(
        inference_id=inference_id,
        feedback={
            "correct": True,
            "quality_score": 0.95
        }
    )
```

**Day 5: Testing & Deployment**
```python
# Run evaluation
test_cases = [
    {"spec": "...", "expected": "..."},
    # More test cases
]

for test in test_cases:
    result = client.inference(
        function_name="complete_workflow",
        input={"spec": test["spec"]},
        model_name="default"
    )

    # Check against expected
    assert test["expected"] in result["review"]

# Deploy
docker tag tensorzero-app:latest tensorzero-app:v1.0
docker push tensorzero-app:v1.0
```

### Week 4+: Continuous Improvement

**Monthly Retraining Loop**
```python
# collect_production_data.py
from tensorzero import TensorZeroGateway

client = TensorZeroGateway.build_embedded(...)

# Get production examples
production_data = client.get_feedback(
    function="complete_workflow",
    time_window="7d"
)

# Combine with original training data
combined_examples = training_examples + production_data

# Retrain DSPy optimizer
optimizer = dspy.MIPROv2(metric=backward_grading_metric)
updated_pipeline = optimizer.compile(
    student=CompletePipeline(),
    trainset=combined_examples,
    valset=validation_examples,
    num_trials=100
)

# Deploy updated version
deploy_new_version(updated_pipeline)
```

---

## PART 4: HANDLING VARIABLE-LENGTH PIPELINES

### The Challenge
Your spec can be 50 words or 5000 words. Your plan might have 3 stages or 20 stages. How do you handle variable length?

### The Solution

**DSPy Approach**:
```python
class VariableLengthPipeline(dspy.Module):
    def __init__(self):
        self.spec_parser = ParseSpec()
        self.plan_gen = GeneratePlan()
        self.code_gen = GenerateCode()
        self.test_gen = GenerateTests()
        self.reviewer = ReviewComplete()

    def forward(self, spec):
        # Parse variable-length spec
        parsed = self.spec_parser(spec)

        # Generate plan (variable number of sections)
        plan = self.plan_gen(parsed)

        # Generate code for each plan section (variable length)
        code_sections = []
        for section in plan.sections:  # Variable number
            code = self.code_gen(section)
            code_sections.append(code)

        # Generate tests for each section (variable length)
        test_sections = []
        for section in code_sections:  # Variable number
            test = self.test_gen(section)
            test_sections.append(test)

        # Final review aggregates all variable sections
        review = self.reviewer(parsed, plan, code_sections, test_sections)

        return review

# Metric still evaluates final output
# Optimization propagates backward through all variable branches
def metric(example, pred, trace=None):
    return check_spec_compliance(example.spec, pred.review)
```

**TensorZero Approach**:
```yaml
functions:
  complete_workflow:
    type: inference
    input:
      type: object
      properties:
        spec:
          type: string
    output:
      type: object
      properties:
        # Final output doesn't change despite variable intermediate steps
        review:
          type: string

evaluations:
  # Evaluate only the final output
  final_review_quality:
    type: workflow
    metrics:
      - type: llm_judge
        prompt: "Does review comprehensively address spec?"
        # This is the backward grading trigger
        # Single evaluation for any pipeline length
```

---

## PART 5: MONITORING & DEBUGGING

### Track Optimization Progress
```python
import dspy

# During optimization
results = dspy.Evaluate()(optimized_pipeline, devset)

print(f"Accuracy: {results['accuracy']:.2%}")
print(f"F1 Score: {results['f1']:.2%}")
print(f"Average Score: {results['average_score']:.2f}")

# Save results
import json
with open("optimization_results.json", "w") as f:
    json.dump(results, f, indent=2)
```

### Monitor TensorZero Performance
```python
from tensorzero import TensorZeroGateway

client = TensorZeroGateway.build_embedded(...)

# Get metrics
metrics = client.get_metrics(
    function="complete_workflow",
    time_window="7d",
    metrics=["latency", "cost", "accuracy"]
)

print(f"Avg Latency: {metrics['latency']['mean']:.0f}ms")
print(f"Total Cost: ${metrics['cost']['total']:.2f}")
print(f"Accuracy: {metrics['accuracy']['mean']:.2%}")
```

### Debug Failed Cases
```python
# Find cases where pipeline failed
failed_cases = client.get_feedback(
    function="complete_workflow",
    filter={"correct": False},
    limit=10
)

for case in failed_cases:
    print(f"Input: {case['input']}")
    print(f"Output: {case['output']}")
    print(f"Feedback: {case['feedback']}")
    print("---")

# Retrain optimizer on failed cases
combined_data = training_examples + failed_cases
optimizer.compile(
    student=CompletePipeline(),
    trainset=combined_data,
    valset=validation_examples
)
```

---

## PART 6: COST OPTIMIZATION

### DSPy Cost
- Optimization is expensive (many LLM calls)
- But runtime cost is LOW (optimized prompts)
- Typical: $100-500 to optimize, $0.01-0.10 per inference

### TensorZero Cost
- Infrastructure: ~$100/month for ClickHouse
- Optimization: $50-500/month (fine-tuning)
- Runtime: Can be 50-90% cheaper than non-optimized

### Optimization Strategies

**1. Reduce Training Set Size**
```python
# Start with 20 examples
optimizer.compile(
    student=pipeline,
    trainset=training_examples[:20],  # Small set
    valset=validation_examples,
    num_trials=50
)
```

**2. Use Cheaper Models for Optimization**
```python
dspy.settings.configure(
    lm=dspy.OpenAI(model="gpt-3.5-turbo")  # Cheaper
)

# Optimize with cheaper model
optimizer.compile(...)

# Deploy with expensive model
dspy.settings.configure(
    lm=dspy.OpenAI(model="gpt-4")
)
```

**3. Run Optimization in Batches**
```python
# Optimize each stage separately
for stage in [spec_parser, plan_gen, code_gen, test_gen, reviewer]:
    optimizer.compile(
        student=stage,
        trainset=training_examples,
        valset=validation_examples,
        num_trials=20  # Fewer trials per stage
    )
```

---

## PART 7: TROUBLESHOOTING

### Problem: Optimizer Not Improving
**Solution**:
```python
# Check if metric is meaningful
test_scores = []
for example in test_set:
    pred = pipeline(example.input)
    score = metric(example, pred)
    test_scores.append(score)

print(f"Score distribution: {np.histogram(test_scores)}")

# If all scores are 0.0 or 1.0, metric is too binary
# Make it more granular
def better_metric(example, pred, trace=None):
    score = 0.0
    if check1(pred):
        score += 0.25
    if check2(pred):
        score += 0.25
    if check3(pred):
        score += 0.25
    if check4(pred):
        score += 0.25
    return score
```

### Problem: Variable-Length Pipeline Failing
**Solution**:
```python
# Add intermediate validation
class SafeVariablePipeline(dspy.Module):
    def forward(self, spec):
        parsed = self.spec_parser(spec)

        # Validate parsed output
        assert parsed.is_valid(), "Parse failed"

        plan = self.plan_gen(parsed)

        # Validate plan output
        assert len(plan.sections) > 0, "No sections in plan"
        assert len(plan.sections) < 50, "Too many sections"

        # ... rest of pipeline
```

### Problem: High Latency
**Solution**:
```python
# Use TensorZero's dynamic in-context learning
# Instead of multiple LLM calls, combine into one

class OptimizedPipeline(dspy.Module):
    def forward(self, spec):
        # Single call instead of 5 separate calls
        combined_prompt = f"""
        Spec: {spec}

        Please provide:
        1. Parsed requirements
        2. Implementation plan
        3. Code
        4. Tests
        5. Review
        """

        result = dspy.ChainOfThought()(combined_prompt)
        return result
```

---

## QUICK REFERENCE CHECKLIST

### Before Starting DSPy
- [ ] Have at least 50 training examples
- [ ] Define clear metric (0.0-1.0 score)
- [ ] Have validation set ready
- [ ] OpenAI API key configured

### Before Deploying to TensorZero
- [ ] DSPy pipeline optimized and tested
- [ ] TensorZero config file created
- [ ] Database (ClickHouse) running
- [ ] Evaluation functions defined

### After Deployment
- [ ] Monitor latency metrics
- [ ] Collect production feedback
- [ ] Plan monthly retraining cycle
- [ ] Set up alerts for degradation

---

## RECOMMENDED READING

1. **DSPy Documentation**: https://dspy.ai/learn/
2. **TensorZero Docs**: https://www.tensorzero.com/docs/
3. **DSPy Optimization Guide**: https://dspy.ai/learn/optimization/optimizers/
4. **TensorZero Comparison Guide**: https://www.tensorzero.com/docs/comparison/dspy/

## Getting Help

- **DSPy Issues**: https://github.com/stanfordnlp/dspy/issues
- **TensorZero Issues**: https://github.com/tensorzero/tensorzero/issues
- **DSPy Discord**: https://discord.gg/CbFBYAqFWC
