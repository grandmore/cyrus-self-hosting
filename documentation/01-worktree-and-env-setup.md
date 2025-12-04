# Worktree Creation and Environment Setup

This document explains how Cyrus creates git worktrees and installs environment files.

## Worktree Creation Flow

```
Main Repo: ~/.cyrus/repos/<repo-name>/     (stays in sync with GitHub)
Worktrees: ~/.cyrus/workspaces/<issue-id>/ (created per issue)
```

```
1. Issue assigned to Cyrus (e.g., PROJ-123 "Fix login bug")
        ↓
2. Branch name determined (e.g., "proj-123-fix-login-bug")
   - Uses Linear's branchName if provided
   - Or generates: <issue-id>-<title-slugified>
        ↓
3. git fetch origin (runs in MAIN REPO)
   ← Updates main repo's origin/main ref to match GitHub
        ↓
4. git worktree add "<path>" -b "<branch>" "origin/main"
   ← Creates worktree FROM the main repo
   ← New branch based on the now-updated origin/main
        ↓
5. global-setup.sh runs      ← Installs env files from secure config
        ↓
6. Claude session starts in the worktree (on the new branch)
```

**Key points:**
- The main repo is the source of truth, kept in sync via `git fetch`
- Worktrees are created FROM the main repo, not directly from GitHub
- When you merge a PR on GitHub → next `git fetch` updates main repo → next worktree gets that code

### Source Code Location

- **GitService.ts**: `apps/cli/src/services/GitService.ts`
- **WorkerService.ts**: `apps/cli/src/services/WorkerService.ts`

### Key Behavior

1. **Determines branch name** (GitService.ts:168-175):
   ```typescript
   const branchName = issue.branchName || `${issue.identifier}-${issue.title...}`;
   ```

2. **Fetches from remote** (GitService.ts:261):
   ```typescript
   execSync("git fetch origin", { cwd: repository.repositoryPath, ... });
   ```

3. **Creates NEW BRANCH and worktree together** (GitService.ts:302-308):
   ```typescript
   const remoteBranch = `origin/${baseBranch}`;
   // -b creates a new branch; worktree is checked out to that branch
   worktreeCmd = `git worktree add "${workspacePath}" -b "${branchName}" "${remoteBranch}"`;
   ```

4. **Runs global setup script** (GitService.ts:350-358):
   ```typescript
   if (globalSetupScript) {
     await this.runSetupScript(globalSetupScript, "global", workspacePath, issue);
   }
   ```

### Why Merged PRs Are Included

The cycle:

```
1. PR merged on GitHub        → GitHub's main updated
2. New issue triggers Cyrus   → git fetch origin runs in main repo
3. Main repo's origin/main    → Now matches GitHub
4. Worktree created           → Based on updated origin/main
5. Worktree has merged code   ✓
```

The main repo acts as a local cache that stays in sync with GitHub via `git fetch`.

### Sub-Issue Branch Hierarchy

If an issue has a parent issue:
- The new branch is created from the **parent's branch**, not main
- This enables dependency management where sub-tasks build on parent work

---

## Environment File Setup

### Configuration

The global setup script is configured in `~/.cyrus/config.json`:

```json
{
  "global_setup_script": "~/.cyrus/scripts/global-setup.sh"
}
```

### How It Works

The script at `~/.cyrus/scripts/global-setup.sh`:

1. **Detects the repository name** from `git remote.origin.url`
2. **Looks for a config file** at `~/.cyrus/secure-configs/<repo-name>/config.json`
3. **Reads the mappings** and copies files from the secure config to the worktree

### Secure Config Structure

```
~/.cyrus/secure-configs/
├── review-leads/
│   ├── config.json
│   ├── api/
│   │   ├── .env.dev
│   │   ├── .env.live
│   │   └── .review-leads-firebase-auth.json
│   └── frontend/
│       ├── .env.dev
│       └── .env.live
└── seogrid.io/
    ├── config.json
    ├── api/
    │   ├── .env.dev
    │   ├── .env.live
    │   └── .seogrid-firebase-auth.json
    └── frontend/
        ├── .env.dev
        └── .env.live
```

### Config.json Format

```json
{
  "mappings": [
    {
      "source": "api/.env.dev",
      "target": "main/api/.env.dev"
    },
    {
      "source": "api/.env.live",
      "target": "main/api/.env.live"
    },
    {
      "source": "frontend/.env.dev",
      "target": "main/frontend/.env.dev"
    }
  ]
}
```

- **source**: Path relative to the secure config directory
- **target**: Path relative to the worktree root (or repo root)

### Handling Symlinks

The setup script explicitly removes existing files before copying. This handles the case where:

- A repo might have symlinked env files checked in
- A previous worktree run left stale files
- Files need to be replaced with fresh copies

```bash
# Remove existing file or symlink first (handles symlinks correctly)
if [ -e "$TARGET_PATH" ] || [ -L "$TARGET_PATH" ]; then
    rm -f "$TARGET_PATH"
    echo "  Removed existing: $target"
fi
```

The `-L` check is important because `-e` returns false for broken symlinks.

---

## Adding Environment Files for a New Repository

1. **Create the secure config directory**:
   ```bash
   mkdir -p ~/.cyrus/secure-configs/<repo-name>/api
   mkdir -p ~/.cyrus/secure-configs/<repo-name>/frontend
   ```

2. **Copy your env files** into the appropriate subdirectories

3. **Create config.json** with the mappings:
   ```bash
   cat > ~/.cyrus/secure-configs/<repo-name>/config.json << 'EOF'
   {
     "mappings": [
       { "source": "api/.env.dev", "target": "main/api/.env.dev" },
       { "source": "api/.env.live", "target": "main/api/.env.live" }
     ]
   }
   EOF
   ```

4. **Test the setup** by running the script manually in a repo:
   ```bash
   cd ~/.cyrus/repos/<repo-name>
   ~/.cyrus/scripts/global-setup.sh
   ```

---

## Troubleshooting

### "No env config found for <repo>"

The script couldn't find `~/.cyrus/secure-configs/<repo-name>/config.json`. Check:
- The repository name matches (derived from git remote URL)
- The config.json file exists and is valid JSON

### "Source file not found"

A file listed in config.json mappings doesn't exist. Check:
- The source path is relative to the secure config directory
- The file actually exists at that location

### Environment files not appearing in worktree

1. Verify the target paths match your repo structure
2. Check if the repo has a `main/` subdirectory (some repos do, some don't)
3. Run the script manually and check output for errors
