# Linear CLI (linearis) Documentation

**Version:** 2025.11.2
**Package:** `linearis` (npm)
**Description:** CLI for Linear.app with JSON output

---

## Installation

```bash
npm install -g linearis
```

**Installed Location:** `~/.npm-packages/bin/linearis`

---

## Creating a Shortcut Alias

To use `linear` instead of `linearis`, add an alias to your shell configuration:

### For Zsh (macOS default)

```bash
# Add to ~/.zshrc
echo "alias linear='linearis'" >> ~/.zshrc
source ~/.zshrc
```

### For Bash

```bash
# Add to ~/.bashrc or ~/.bash_profile
echo "alias linear='linearis'" >> ~/.bashrc
source ~/.bashrc
```

### Verify the Alias

```bash
linear --version  # Should show: 2025.11.2
```

---

## Authentication

Set your Linear API token:

```bash
export LINEAR_API_TOKEN="your-api-token-here"
```

Or pass it with each command:

```bash
linearis --api-token "your-token" issues list
```

**To get your API token:**
1. Go to Linear Settings → API → Personal API keys
2. Create a new API key
3. Save it securely

---

## Command Structure

```bash
linearis [options] [command]
```

**Global Options:**
- `-V, --version` - Output the version number
- `--api-token <token>` - Linear API token
- `-h, --help` - Display help for command

---

## Commands Overview

| Command | Description |
|---------|-------------|
| `issues` | Issue operations (list, search, create, read, update) |
| `comments` | Comment operations (create) |
| `labels` | Label operations (list) |
| `projects` | Project operations (list) |
| `cycles` | Cycle operations (list, read) |
| `project-milestones` | Project milestone operations (create, list, read, update) |
| `embeds` | Download embedded files from Linear storage |
| `usage` | Show usage info for all tools |

---

## Issues Commands

### List Issues

```bash
linearis issues list [options]
```

**Options:**
- `-l, --limit <number>` - Limit results (default: 25)

**Example:**
```bash
linearis issues list --limit 50
```

---

### Search Issues

```bash
linearis issues search [options] <query>
```

**Options:**
- `--team <team>` - Filter by team key, name, or ID
- `--assignee <assigneeId>` - Filter by assignee ID
- `--project <project>` - Filter by project name or ID
- `--states <states>` - Filter by states (comma-separated)
- `-l, --limit <number>` - Limit results (default: 10)

**Example:**
```bash
linearis issues search "authentication bug" --team "ENG" --limit 20
linearis issues search "API" --states "In Progress,Todo"
```

---

### Create Issue

```bash
linearis issues create [options] <title>
```

**Options:**
- `-d, --description <desc>` - Issue description
- `-a, --assignee <assigneeId>` - Assign to user ID
- `-p, --priority <priority>` - Priority level (1-4)
- `--project <project>` - Add to project (name or ID)
- `--team <team>` - Team key, name, or ID (required if not specified)
- `--labels <labels>` - Labels (comma-separated names or IDs)
- `--project-milestone <milestone>` - Project milestone name or ID (requires --project)
- `--cycle <cycle>` - Cycle name or ID (requires --team)
- `--status <status>` - Status name or ID
- `--parent-ticket <parentId>` - Parent issue ID or identifier

**Example:**
```bash
linearis issues create "Add JWT authentication" \
  --description "Implement JWT auth with Firebase" \
  --team "ENG" \
  --labels "feature,security" \
  --priority 2 \
  --status "Todo"
```

---

### Read Issue

```bash
linearis issues read <issueId>
```

**Accepts:** UUID or identifiers like `ABC-123`

**Example:**
```bash
linearis issues read "ENG-123"
linearis issues read "550e8400-e29b-41d4-a716-446655440000"
```

---

### Update Issue

```bash
linearis issues update [options] <issueId>
```

**Basic Options:**
- `-t, --title <title>` - New title
- `-d, --description <desc>` - New description
- `-s, --state <stateId>` - New state name or ID
- `-p, --priority <priority>` - New priority (1-4)
- `--assignee <assigneeId>` - New assignee ID
- `--project <project>` - New project (name or ID)

**Labels Options:**
- `--labels <labels>` - Labels to work with (comma-separated names or IDs)
- `--label-by <mode>` - How to apply labels: 'adding' (default) or 'overwriting'
- `--clear-labels` - Remove all labels from issue

**Parent Ticket Options:**
- `--parent-ticket <parentId>` - Set parent issue ID or identifier
- `--clear-parent-ticket` - Clear existing parent relationship

**Project Milestone Options:**
- `--project-milestone <milestone>` - Set project milestone (name or ID)
- `--clear-project-milestone` - Clear existing project milestone assignment

**Cycle Options:**
- `--cycle <cycle>` - Set cycle (name or ID)
- `--clear-cycle` - Clear existing cycle assignment

**Accepts:** UUID or identifiers like `ABC-123`

**Examples:**
```bash
# Update status
linearis issues update "ENG-123" --state "In Progress"

# Add labels (additive)
linearis issues update "ENG-123" --labels "bug,high-priority"

# Replace all labels
linearis issues update "ENG-123" --labels "feature,backend" --label-by overwriting

# Clear labels
linearis issues update "ENG-123" --clear-labels

# Assign to someone
linearis issues update "ENG-123" --assignee "user-id-123"

# Update multiple fields
linearis issues update "ENG-123" \
  --title "New title" \
  --description "Updated description" \
  --priority 1 \
  --state "In Progress"
```

---

## Comments Commands

### Create Comment

```bash
linearis comments create [options] <issueId>
```

**Options:**
- `--body <body>` - Comment body (required)

**Accepts:** UUID or identifiers like `ABC-123`

**Example:**
```bash
linearis comments create "ENG-123" --body "Work started on authentication"
```

---

## Labels Commands

### List Labels

```bash
linearis labels list [options]
```

**Options:**
- `--team <team>` - Filter by team key, name, or ID

**Example:**
```bash
linearis labels list
linearis labels list --team "ENG"
```

---

## Projects Commands

### List Projects

```bash
linearis projects list [options]
```

**Options:**
- `-l, --limit <number>` - Limit results (default: 100)

**Note:** Linear SDK doesn't implement limit, shows all projects.

**Example:**
```bash
linearis projects list
```

---

## Cycles Commands

### List Cycles

```bash
linearis cycles list [options]
```

**Options:**
- `--team <team>` - Team key, name, or ID
- `--active` - Only active cycles
- `--around-active <n>` - Return active +/- n cycles (requires --team)

**Example:**
```bash
linearis cycles list --team "ENG" --active
linearis cycles list --team "ENG" --around-active 2
```

---

### Read Cycle

```bash
linearis cycles read [options] <cycleIdOrName>
```

**Options:**
- `--team <team>` - Team key, name, or ID to scope name lookup
- `--issues-first <n>` - How many issues to fetch (default: 50)

**Accepts:** UUID or cycle name (optionally scoped by --team)

**Example:**
```bash
linearis cycles read "Sprint 42" --team "ENG"
linearis cycles read "cycle-uuid-123" --issues-first 100
```

---

## Project Milestones Commands

### Create Milestone

```bash
linearis project-milestones create [options] <name>
```

**Options:**
- `--project <project>` - Project name or ID
- `-d, --description <description>` - Milestone description
- `--target-date <date>` - Target date in ISO format (YYYY-MM-DD)

**Example:**
```bash
linearis project-milestones create "MVP Release" \
  --project "Authentication System" \
  --description "First production release" \
  --target-date "2025-12-31"
```

---

### List Milestones

```bash
linearis project-milestones list [options]
```

**Options:**
- `--project <project>` - Project name or ID
- `-l, --limit <number>` - Limit results (default: 50)

**Example:**
```bash
linearis project-milestones list --project "Authentication System"
```

---

### Read Milestone

```bash
linearis project-milestones read [options] <milestoneIdOrName>
```

**Options:**
- `--project <project>` - Project name or ID to scope name lookup
- `--issues-first <n>` - How many issues to fetch (default: 50)

**Accepts:** UUID or milestone name (optionally scoped by --project)

**Example:**
```bash
linearis project-milestones read "MVP Release" --project "Authentication System"
```

---

### Update Milestone

```bash
linearis project-milestones update [options] <milestoneIdOrName>
```

**Options:**
- `--project <project>` - Project name or ID to scope name lookup
- `-n, --name <name>` - New milestone name
- `-d, --description <description>` - New milestone description
- `--target-date <date>` - New target date in ISO format (YYYY-MM-DD)
- `--sort-order <number>` - New sort order

**Accepts:** UUID or milestone name (optionally scoped by --project)

**Example:**
```bash
linearis project-milestones update "MVP Release" \
  --project "Authentication System" \
  --target-date "2026-01-15"
```

---

## Embeds Commands

### Download Embedded File

```bash
linearis embeds download [options] <url>
```

**Options:**
- `--output <path>` - Output file path
- `--overwrite` - Overwrite existing file (default: false)

**Example:**
```bash
linearis embeds download "https://linear.app/files/abc123" --output "./design.png"
linearis embeds download "https://linear.app/files/abc123" --output "./design.png" --overwrite
```

---

## JSON Output

All commands output JSON by default, making it easy to parse with tools like `jq`:

```bash
# Get issue titles
linearis issues list | jq '.issues[].title'

# Get issue IDs and states
linearis issues list | jq '.issues[] | {id: .identifier, state: .state.name}'

# Search and extract specific fields
linearis issues search "authentication" | jq '.issues[] | {title, assignee: .assignee.name}'
```

---

## Common Workflows

### Create Issue and Get ID

```bash
ISSUE_JSON=$(linearis issues create "Fix login bug" --team "ENG" --status "Todo")
ISSUE_ID=$(echo $ISSUE_JSON | jq -r '.issue.identifier')
echo "Created issue: $ISSUE_ID"
```

---

### Update Issue Status

```bash
linearis issues update "ENG-123" --state "In Progress"
linearis comments create "ENG-123" --body "Started working on this"
```

---

### Check Issues in Current Cycle

```bash
linearis cycles read "Sprint 42" --team "ENG" | jq '.issues[] | {title, state: .state.name}'
```

---

### Add Labels to Multiple Issues

```bash
for issue in ENG-123 ENG-124 ENG-125; do
  linearis issues update "$issue" --labels "urgent"
done
```

---

## Tips and Best Practices

1. **Use Identifiers:** Both UUID and identifiers like `ENG-123` work - identifiers are more human-readable

2. **JSON Parsing:** Combine with `jq` for powerful data extraction and transformation

3. **Environment Variable:** Set `LINEAR_API_TOKEN` in your shell profile for convenience

4. **Scripting:** All commands output JSON, making them easy to use in automation scripts

5. **State Names:** Use exact state names (case-sensitive) when updating issue states

6. **Label Management:** Use `--label-by adding` to add labels without removing existing ones, or `--label-by overwriting` to replace all labels

7. **Team Context:** Always provide `--team` when team context is ambiguous

---

## Error Handling

If you encounter authentication errors:
```bash
# Verify your token is set
echo $LINEAR_API_TOKEN

# Test with explicit token
linearis --api-token "your-token" issues list --limit 1
```

If you encounter "not found" errors with names:
- Try using the UUID instead
- Verify the team context with `--team` option
- Check spelling (names are case-sensitive)

---

## Related Resources

- **Linear API Documentation:** https://developers.linear.app/docs/graphql/working-with-the-graphql-api
- **Linear Web App:** https://linear.app
- **Issue Identifiers:** Format is `{TEAM_KEY}-{NUMBER}` (e.g., `ENG-123`)
- **Priority Levels:** 1 (Urgent), 2 (High), 3 (Medium), 4 (Low)

---

## Version History

- **2025.11.2** - Current version with full issue, comment, label, project, cycle, and milestone support
