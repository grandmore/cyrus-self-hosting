# Application Validation Test Suite

Execute comprehensive validation tests for all configured components (defined in `.claude/runners/_config.yaml`), returning results in a standardized JSON format for automated processing.

## Purpose

Proactively identify and fix issues in the application before they impact users or developers. By running this comprehensive test suite, you can:
- Detect syntax errors, type mismatches, and import failures
- Identify broken tests or security vulnerabilities  
- Verify build processes and dependencies
- Ensure the application is in a healthy state

## Variables

TEST_COMMAND_TIMEOUT: 5 minutes

## Instructions

- Execute each test in the sequence provided below
- Capture the result (passed/failed) and any error messages
- IMPORTANT: Return ONLY the JSON array with test results
  - IMPORTANT: Do not include any additional text, explanations, or markdown formatting
  - We'll immediately run JSON.parse() on the output, so make sure it's valid JSON
- If a test passes, omit the error field
- If a test fails, include the error message in the error field
- Execute all tests even if some fail
- Error Handling:
  - If a command returns non-zero exit code, mark as failed and immediately stop processing tests
  - Capture stderr output for error field
  - Timeout commands after `TEST_COMMAND_TIMEOUT`
  - IMPORTANT: If a test fails, stop processing tests and return the results thus far
- Some tests may have dependencies (e.g., server must be stopped for port availability)
- API health check is required
- Test execution order is important - dependencies should be validated first
- All file paths are relative to the project root
- Always run `pwd` and `cd` before each test to ensure you're operating in the correct directory for the given test

## Test Execution Sequence

### System Tests

**Instructions:**
1. Read `.claude/runners/_config.yaml` to get name-to-path mappings
2. For EACH name in the config, execute TWO tests in order:
   - Linting test
   - Functionality test

**For each name:**

1. **{Name} Code Quality Check**
   - Preparation Command: None
   - Command: `uv run adws/adw_lint_path.py {name}`
   - test_name: "{name}_linting"
   - test_purpose: "Validates code quality, identifies unused imports, style violations, and potential bugs"

2. **{Name} Functionality Tests**
   - Preparation Command: None
   - Command: `uv run adws/adw_test_path.py {name}`
   - test_name: "all_{name}_tests"
   - test_purpose: "Validates functionality including unit tests, integration tests, and component-specific validations"

**Example:** If `_config.yaml` contains:
```yaml
frontend: main/interface
backend: main/api
```

Then execute:
1. `uv run adws/adw_lint_path.py frontend` → test_name: "frontend_linting"
2. `uv run adws/adw_test_path.py frontend` → test_name: "frontend_tests"

## Report

- IMPORTANT: Return results exclusively as a JSON array based on the `Output Structure` section below.
- Sort the JSON array with failed tests (passed: false) at the top
- Include all tests in the output, both passed and failed
- The execution_command field should contain the exact command that can be run to reproduce the test
- This allows subsequent agents to quickly identify and resolve errors

### Output Structure

```json
[
  {
    "test_name": "string",
    "passed": boolean,
    "execution_command": "string",
    "test_purpose": "string",
    "error": "optional string"
  },
  ...
]
```

### Example Output

```json
[
  {
    "test_name": "all_frontend_tests",
    "passed": false,
    "execution_command": "uv run adws/adw_test_frontend.py",
    "test_purpose": "Validates all frontend functionality including unit tests, component tests, and build process",
    "error": "FAIL src/components/Button.test.tsx - TypeError: Cannot read property 'onClick' of undefined"
  },
  {
    "test_name": "all_backend_tests",
    "passed": true,
    "execution_command": "uv run adws/adw_test_backend.py",
    "test_purpose": "Validates all backend functionality including unit tests, integration tests, and API endpoints"
  }
]
```