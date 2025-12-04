# Development Patterns - Critical Workflow

## 📋 MANDATORY PATTERNS

**API**: authenticate → validate → verify user → permissions → business logic  
**Testing**: NO MOCKS, tape testing framework, direnv auto-loads environment, t.end() always  
**Production**: NO placeholders/stubs/TODOs/empty functions/console.log error handling

## 🏗️ PROTOTYPE-FIRST WORKFLOW

**Research → Plan → Code → Validate**

1. Search existing code first
2. Create implementation blueprint (YAML format)  
3. Build working prototype
4. Run `yarn test && yarn lint` checkpoints
5. Verify end-to-end functionality

## 🚨 DIRECTORY NAVIGATION FIX

Claude Code blocks `cd ..` - use this pattern:
```bash
(cd $(git rev-parse --show-toplevel)/main/api && npm test)
```

## 🛠️ ESSENTIAL TOOLS

**Zen**: `thinkdeep`, `debug`, `codereview`, `testgen`  
**Browser MCP**: MANDATORY for all frontend testing  
**Task Master**: Track project progress

## 🚫 FORBIDDEN PATTERNS

- NO `any`, `==`, `var`, direct DOM manipulation, sync file ops
- NO ignored Promise rejections, mutable globals
- Delete old code, meaningful names, early returns, async/await

## 📚 FEATURE DOCS

- `/CLAUDE-search-statistics.md` - Firestore live updates (not SQL)
- `/CLAUDE-email-enrichment.md` - Website scraping for emails  
- `/CLAUDE-email-verification.md` - SMTP + Million Verifier API

## 🔑 KEY FILES

- `main/api/app.js` - Express server
- `main/api/firestore.js` - Firebase operations  
- `main/api/cloudsql.js` - PostgreSQL pool
- `main/frontend/src/` - React components

## ✅ COMPLETION CHECKLIST

- [ ] Code runs without errors
- [ ] All tests pass, linting clean
- [ ] Manual test works end-to-end
- [ ] No TODO/FIXME comments

## 🐛 DEBUGGING

**PostgreSQL First, then Firestore sync**  
**Environment errors: throw early, don't fallback**  
**Use `mcp__zen__thinkdeep` for complex problems**

