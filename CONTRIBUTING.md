# Contributing to Voice Force

Thank you for your interest in contributing to **Voice Force**! We are committed to building the world's most accessible, reliable, and high-performance open-source AI voice calling platform.

Whether you're fixing a bug, improving documentation, designing new voice tools, or adding new telephony carrier adapters, your contributions are deeply appreciated.

---

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it to ensure a welcoming and inclusive environment for everyone.

---

## 🛠️ Getting Started with Local Development

### 1. Prerequisites
- **Node.js**: `v20.0.0` or higher
- **pnpm**: `v9.0.0` or higher (`npm install -g pnpm`)
- **Docker & Docker Compose**: Installed and running
- **Git**

### 2. Fork and Clone
```bash
# Clone your fork
git clone https://github.com/<your-username>/voice-force.git
cd voice-force

# Add the upstream remote
git remote add upstream https://github.com/180workspace/voice-force.git
```

### 3. Install Dependencies
Voice Force uses **Turborepo** and **pnpm workspaces**:
```bash
pnpm install
```

### 4. Setup Containers & Database
```bash
# Start PostgreSQL (port 5434) and Redis (port 6380)
docker-compose up -d

# Copy environment variables
cp .env.example .env

# Generate Prisma Client & push schema
pnpm db:generate
pnpm db:push
```

### 5. Run the Local Development Environment
```bash
# Run both Backend (:4005) and Frontend (:3007) concurrently
node scripts/dev-runner.js
```

---

## 🔀 Development Workflow & Branching

1. Always create a new branch from `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. Branch naming conventions:
   - `feat/` for new features (e.g., `feat/twilio-sip-adapter`)
   - `fix/` for bug fixes (e.g., `fix/sentence-streamer-punctuation`)
   - `docs/` for documentation updates (e.g., `docs/env-variables-clarification`)
   - `refactor/` for code refactoring without feature changes
   - `test/` for adding or fixing tests

---

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Allowed Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc. (no code change)
- `refactor`: Refactoring production code
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Build tasks, package manager updates, etc.

### Example:
```bash
git commit -m "feat(voiceforce): add Portuguese language acoustic phoneme model"
git commit -m "fix(call-queue): resolve monotonic queue counter overflow on Redis reconnect"
```

---

## 🧪 Testing Guidelines

Before opening a pull request, ensure that your code compiles with zero errors and passes all tests:

```bash
# Run Turbo build across all monorepo packages
pnpm build

# Run linting
pnpm lint

# Run algorithmic validation suite
node scratch/test-all-algorithms-real.js
```

If you are modifying algorithmic engines in `packages/domains/voiceforce`, please include corresponding test assertions.

---

## 🚀 Submitting a Pull Request (PR)

1. **Push your branch**:
   ```bash
   git push origin feat/your-feature-name
   ```

2. **Open a PR**:
   - Go to your fork on GitHub and click **"Compare & pull request"**.
   - Provide a clear and concise description of the changes.
   - Reference any relevant GitHub issues (e.g., `Closes #42`).
   - Include before/after screenshots or terminal test output where appropriate.

3. **Code Review**:
   - Maintainers will review your PR. Be prepared to address feedback or suggestions.
   - Once approved and CI checks pass, your PR will be squash-merged into `main`.

---

## 💼 Commercial Contributors

If you are a commercial user building on Voice Force or participating in the 10% Revenue Share Partner program, bug fixes and core engine enhancements are actively prioritized. Please tag your PR with `[Partner]` or reach out directly at `partners@vanityworkspace.com`.

---

## 💬 Community & Help

- **GitHub Issues**: For bug reports and feature requests.
- **Discussions**: For architecture questions, brainstorming, and showcase.
- **Email**: `developers@vanityworkspace.com`
