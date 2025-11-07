# VS Code Launch Configuration Guide

## Overview
This project includes VS Code launch and task configurations for easy development workflow.

## Launch Configurations

### 1. NestJS Dev Server
**How to use:**
- Press `F5` or go to **Run** → **Start Debugging**
- Select **"NestJS Dev Server"** from the dropdown
- The API will start in debug mode on port 8000

**Features:**
- Auto-recompile on file changes (watch mode)
- Debug breakpoints enabled
- Console output in integrated terminal
- Automatically sets environment variables

**Keyboard Shortcuts:**
- `F5` - Start/Continue
- `Shift+F5` - Stop
- `Ctrl+Shift+B` - Build
- `F9` - Toggle breakpoint

### 2. NestJS Debug (Attach)
**How to use:**
- First start the server with: `npm run start:debug`
- Then press `F5` and select **"NestJS Debug (Attach)"**
- This will attach VS Code debugger to the running process

**Useful for:**
- Remote debugging
- Debugging already running instances

### 3. Run Tests (Watch)
**How to use:**
- Press `F5` and select **"Run Tests (Watch)"**
- Or press `Ctrl+Shift+B` and select **"npm: test:watch"**

**Features:**
- Auto-runs tests on file changes
- Shows test results in terminal
- Watch mode for continuous testing

### 4. Run Current Test File
**How to use:**
- Open a test file (`.spec.ts`)
- Press `F5` and select **"Run Current Test File"**
- Only the current file's tests will run

**Note:** Make sure the test file is active in the editor

## Task Commands

### NPM Scripts
Press `Ctrl+Shift+B` to show build tasks or use **Terminal** → **Run Task**:

| Task | Command | Purpose |
|------|---------|---------|
| npm: start:dev | `npm run start:dev` | Start API in dev mode |
| npm: build | `npm run build` | Build for production |
| npm: test | `npm test` | Run all tests once |
| npm: test:watch | `npm run test:watch` | Run tests in watch mode |
| npm: test:cov | `npm run test:cov` | Run tests with coverage |
| npm: db:seed | `npm run db:seed` | Seed database with sample data |
| npm: lint | `npm run lint` | Run ESLint |
| npm: format | `npm run format` | Format code with Prettier |

### Docker Tasks
| Task | Purpose |
|------|---------|
| Docker: Start Database Services | Start MySQL and MongoDB containers |
| Docker: Stop All Services | Stop all Docker containers |
| Docker: View Logs | Stream Docker logs (Ctrl+C to stop) |

### Prisma Tasks
| Task | Purpose |
|------|---------|
| Prisma: Generate Client | Generate Prisma client |
| Prisma: Migrate | Run database migrations |

## Common Workflows

### ✅ Setup & Run for First Time
1. Open integrated terminal: `` Ctrl+` ``
2. Run task: `Ctrl+Shift+B` → **Docker: Start Database Services**
3. Run task: `Ctrl+Shift+B` → **npm: db:seed**
4. Start debugger: `F5` → **NestJS Dev Server**

### ✅ Development Workflow
1. Press `F5` to start API in debug mode
2. Open a file and set breakpoints with `F9`
3. Make requests using Postman or curl
4. Debugger will pause at breakpoints
5. Step through code with `F10` (step over) or `F11` (step into)

### ✅ Writing & Testing Code
1. Press `F5` → **Run Tests (Watch)**
2. Write/edit tests and source files
3. Tests auto-run on save
4. View results in integrated terminal

### ✅ Testing Single File
1. Open a `.spec.ts` file
2. Press `F5` → **Run Current Test File**
3. Only that file's tests run

### ✅ Quick Database Seed
1. `Ctrl+Shift+B` → **npm: db:seed**
2. Populates database with sample data
3. Use for testing API endpoints

### ✅ Code Quality Checks
1. `Ctrl+Shift+B` → **npm: lint** (find issues)
2. `Ctrl+Shift+B` → **npm: format** (fix formatting)
3. ESLint also runs on save (if enabled)

## Environment Variables

The launch configuration sets these variables:
```
NODE_ENV=development
PORT=8000
DATABASE_URL=mysql://root:rootpassword@localhost:3306/dynamic_webservice
MONGODB_URI=mongodb://localhost:27017/dynamic_db
LOG_LEVEL=debug
```

**To modify:**
- Edit `.vscode/launch.json` → `env` section
- Or create `.env` file in project root

## Debugging Tips

### Setting Breakpoints
- Click on line number to set breakpoint (red dot appears)
- Breakpoint pauses execution when reached
- Right-click for conditional breakpoints

### Debug Console
- View variable values: Type in debug console
- Evaluate expressions: `console.log()` in watch panel
- Call functions: `pm.response.json()` in debug console

### Watch Expressions
- Right-click variable → **Add to Watch**
- Monitor variable changes across debugging session

### Call Stack
- View where you are in the code
- Click frame to jump to that location

## Troubleshooting

### "Port 8000 already in use"
```bash
# Kill process on port 8000
lsof -i :8000
kill -9 <PID>

# Or change port in .vscode/launch.json
```

### "Can't reach database"
```bash
# Check Docker is running
docker ps

# Restart databases
Ctrl+Shift+B → Docker: Start Database Services
```

### "Module not found"
```bash
# Reinstall dependencies
npm install

# Regenerate Prisma client
Ctrl+Shift+B → Prisma: Generate Client
```

### Debugger won't attach
```bash
# Restart VS Code
# Kill all node processes
killall node

# Restart the debugger
F5
```

## Keyboard Shortcuts Summary

| Shortcut | Action |
|----------|--------|
| `F5` | Start/Continue debugging |
| `Shift+F5` | Stop debugging |
| `F9` | Toggle breakpoint |
| `F10` | Step over |
| `F11` | Step into |
| `Shift+F11` | Step out |
| `` Ctrl+` `` | Toggle integrated terminal |
| `Ctrl+Shift+B` | Show build tasks |
| `Ctrl+Shift+D` | Open Debug view |
| `Ctrl+Shift+X` | Open Extensions |

## Extensions Used

Recommended extensions (automatically suggested):
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Jest Runner** - Run tests from editor
- **GitLens** - Git integration
- **Docker** - Docker support
- **Prisma** - Prisma ORM support
- **Thunder Client** - API testing

Install suggestions appear when opening the project.

---

**For more info:** See `POSTMAN_GUIDE.md` and `README.md`
