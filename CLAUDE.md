# MoodVibe Creator - Claude Code Automation Guide

This guide outlines automation flows and best practices for working with the MoodVibe Creator project using specialized agents.

## Project Overview

**Tech Stack:**
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy (SQLite), FFmpeg, yt-dlp
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand

**Project Purpose**: Automated music playlist creation and video upload to YouTube/TikTok

## Available Specialized Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `requirement-architect` | Transform raw ideas into structured requirements | New features, project concepts, brainstorming |
| `tech-architect` | Design technical architecture and tech stack | After requirements are defined |
| `fastapi-api-builder` | Create FastAPI REST/GraphQL endpoints | New backend API routes, database models |
| `nextjs-uiux-builder` | Build Next.js 15 UI/UX components | New frontend features, UI components |
| `database-schema-architect` | Design/optimize PostgreSQL/SQLite schemas | Database tables, migrations, performance |
| `api-sync-specialist` | Sync backend API definitions with frontend | After backend API changes |
| `code-reviewer` | Review code for quality, security, best practices | Before committing code |
| `bug-fix-tracer` | Debug and fix runtime errors | Exceptions, stack traces, error logs |
| `test-runner-executor` | Write and run tests | Unit tests, integration tests, E2E tests |

---

## 🔄 Automation Flows

### Flow 1: New Feature Development

**Use when**: Adding significant new functionality (e.g., TikTok upload integration)

```
1. requirement-architect
   ├─ Define feature requirements
   ├─ Document success criteria
   └─ Identify edge cases

2. tech-architect
   ├─ Design architecture
   ├─ Select technology approach
   └─ Plan data flow

3. fastapi-api-builder (if backend needed)
   ├─ Create Pydantic models
   ├─ Implement API endpoints
   └─ Add database models

4. nextjs-uiux-builder (if frontend needed)
   ├─ Build UI components
   ├─ Implement state management
   └─ Add styling with Tailwind

5. api-sync-specialist
   ├─ Sync frontend API client
   └─ Update TypeScript types

6. test-runner-executor
   ├─ Write unit tests
   ├─ Write integration tests
   └─ Run test suite

7. code-reviewer
   └─ Review implementation

8. (Optional) qa skill
   └─ QA test the feature
```

### Flow 2: Bug Fix

**Use when**: Debugging errors or fixing bugs

```
1. bug-fix-tracer
   ├─ Analyze stack traces
   ├─ Identify root cause
   └─ Implement fix

2. test-runner-executor
   ├─ Write regression tests
   └─ Verify fix

3. code-reviewer
   └─ Review the fix
```

### Flow 3: API Changes

**Use when**: Modifying backend API endpoints

```
1. Read existing API code
2. Modify backend (Pydantic models, endpoints)
3. api-sync-specialist
   ├─ Update frontend API client methods
   ├─ Sync TypeScript interfaces
   └─ Ensure type safety
4. test-runner-executor
   └─ Test API changes
5. code-reviewer
   └─ Review changes
```

### Flow 4: Database Changes

**Use when**: Adding tables or optimizing database

```
1. database-schema-architect
   ├─ Design schema
   ├─ Create migration scripts
   └─ Optimize performance

2. fastapi-api-builder
   ├─ Create SQLAlchemy models
   └─ Implement CRUD endpoints

3. api-sync-specialist
   └─ Update frontend API client

4. test-runner-executor
   └─ Test database operations
```

### Flow 5: UI/UX Updates

**Use when**: Building or modifying frontend components

```
1. nextjs-uiux-builder
   ├─ Design component structure
   ├─ Implement with TypeScript
   └─ Style with Tailwind CSS

2. test-runner-executor
   └─ Write component tests

3. code-reviewer
   └─ Review UI code
```

### Flow 6: Code Review Before Commit

**Use when**: Preparing to commit changes

```
1. code-reviewer
   └─ Review all changed files

2. test-runner-executor
   └─ Run full test suite

3. /commit skill
   └─ Create commit with review feedback
```

### Flow 7: From Idea to Production

**Use when**: Starting from a raw concept

```
1. requirement-architect
   Input: "Add playlist scheduling feature"
   Output: Structured requirements.md

2. tech-architect
   Input: requirements.md
   Output: Technical design, architecture decisions

3. Implement in parallel:
   ├─ fastapi-api-builder (backend)
   └─ nextjs-uiux-builder (frontend)

4. api-sync-specialist
   Sync backend and frontend

5. test-runner-executor
   Full test coverage

6. code-reviewer
   Final review

7. /qa skill
   End-to-end QA testing

8. /ship skill
   Merge, bump version, update CHANGELOG
```

---

## 📁 Project Structure Context

```
generateYouTube/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # Entry point
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routers/           # API routes
│   │   ├── services/          # Business logic
│   │   │   ├── music_search.py
│   │   │   ├── audio_processor.py
│   │   │   ├── video_generator.py
│   │   │   └── image_generator.py
│   │   └── utils/
│   │       └── encryption.py  # AES-256 encryption
│   ├── requirements.txt
│   └── .env                   # Environment variables
│
├── frontend/                   # Next.js Frontend
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── create/        # Playlist creation wizard
│   │   │   ├── library/       # Playlist library
│   │   │   ├── settings/      # Settings page
│   │   │   └── playlist/[id]/ # Playlist detail
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   └── [feature components]
│   ├── lib/
│   │   ├── store.ts           # Zustand state
│   │   └── api.ts             # API client
│   └── package.json
│
├── uploads/                    # User uploaded files
└── CLAUDE.md                   # This file
```

---

## 🎯 Common Task Patterns

### Adding a New API Endpoint

```bash
# Trigger: "Add POST /api/playlists/{id}/schedule endpoint"

1. fastapi-api-builder agent
   - Create Pydantic request/response models
   - Implement endpoint in backend/app/routers/
   - Add to database operations if needed

2. api-sync-specialist agent
   - Add frontend API client method in frontend/lib/api.ts
   - Update TypeScript interfaces

3. test-runner-executor agent
   - Write backend tests
   - Write frontend integration tests
```

### Adding a New UI Feature

```bash
# Trigger: "Add dark mode toggle"

1. nextjs-uiux-builder agent
   - Create theme context/store
   - Implement toggle component
   - Add Tailwind dark mode classes

2. test-runner-executor agent
   - Write component tests

3. code-reviewer agent
   - Review for accessibility and best practices
```

### Debugging an Error

```bash
# Trigger: [Stack trace provided]

1. bug-fix-tracer agent
   - Analyze error
   - Locate root cause
   - Implement fix

2. test-runner-executor agent
   - Add regression test

3. code-reviewer agent
   - Review the fix
```

---

## 🔑 Key Technical Constraints

- **No image icons** - Use Heroicons SVG only
- **AES-256 encryption** for all stored API keys
- **Copyright warnings** - Alert users before uploading copyrighted content
- **SQLite database** - Consider migration path to PostgreSQL if scaling
- **FFmpeg required** - Audio/video processing dependency
- **yt-dlp** - Multi-source music downloader

---

## 🚀 Quick Reference Commands

```bash
# Start development
docker-compose up -d              # Docker (recommended)
# OR
start.bat                         # Windows
./start.sh                        # Linux/Mac

# Code quality
/review                           # Review PR/code
/commit                           # Commit changes
/qa                               # Run QA tests
/ship                             # Ship workflow

# Agent workflows (use Task tool)
Task: requirement-architect       # Transform idea to requirements
Task: tech-architect              # Design technical architecture
Task: fastapi-api-builder         # Build FastAPI endpoints
Task: nextjs-uiux-builder         # Build Next.js UI
Task: database-schema-architect   # Design database schema
Task: api-sync-specialist         # Sync frontend/backend APIs
Task: code-reviewer               # Review code quality
Task: bug-fix-tracer              # Debug and fix errors
Task: test-runner-executor        # Write and run tests
```

---

## 📋 Pre-Commit Checklist

Before committing changes, run through this automated flow:

1. **code-reviewer** - Review all changed files
2. **test-runner-executor** - Ensure all tests pass
3. **qa skill** (for significant changes) - End-to-end testing
4. **/commit skill** - Create commit with proper formatting

---

## 🎓 Best Practices

1. **Always read existing code** before modifying - Use `Glob` and `Read` tools first
2. **Use TodoWrite** for multi-step tasks to track progress
3. **Test in isolation** - Ensure individual components work before integrating
4. **Security first** - Never expose API keys, always encrypt sensitive data
5. **Type safety** - Keep TypeScript and Pydantic models in sync
6. **Progressive enhancement** - Build core features first, add enhancements later

---

## 🐛 Known Issues & TODOs

See README.md for current TODO items:
- Implement YouTube Data API v3 upload
- Implement TikTok API upload
- Implement Stable Diffusion API integration
- Add user authentication
- Add real-time progress tracking
- Add dark mode support

When working on these, start with **requirement-architect**, then follow the appropriate flow above.
