# Prepare Application

Setup the application for the review or test.

## Setup

Run the prepare-app runner:
- Execute: `bash .claude/runners/prepare-app.sh`
- The runner is project-specific and handles application preparation based on the project type
- For projects with an application (frontend/backend), it will start the services
- For projects without an application (like MCP servers), it will exit successfully

## Port Configuration

If the project has a `.ports.env` file, the prepare-app runner will use those ports.
Otherwise, it defaults to standard ports (typically 5173 for frontend, 8000 for backend).

## Verification

After running the prepare-app runner, check its output to confirm the application is ready for testing.

