# DevContainer

**Full Documentation:** See [`.devcontainer/README.md`](../../.devcontainer/README.md)

## What It Is

This project's DevContainer configuration that enables both local and remote Agentic coding.

## What It Does

1. **Local Development** - Automatically boots VS Code in isolated branch workspaces via the `rd` command
2. **Agentic Coding** - Enables Claude Code to run ADWS (Agentic Development Workflow System) with authenticated CLI tools

The container provides pre-authenticated access to:
- GitHub CLI (for repository operations)
- Google Cloud SDK (for GCP services)
- Claude CLI (for AI-powered development workflows)

This allows ADWS to execute the full development lifecycle (plan → build → test) without manual authentication or intervention.

---

**For setup instructions, architecture details, and troubleshooting, read [`.devcontainer/README.md`](../../.devcontainer/README.md)**
