# GitHub Repository Setup Guide

Complete guide to setting up the repository with branch protection, CI/CD pipelines, SonarQube, and industry-standard collaboration rules.

---

## 1. Create the Repository

### Step 1.1 — Create on GitHub
1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `mern-ecommerce` (or your team's name)
3. **Visibility:** Private (for internal projects)
4. **DO NOT** initialize with README, .gitignore, or license (you already have them)
5. Click **Create repository**

### Step 1.2 — Push the boilerplate

```bash
# From the boilerplate root directory
git init
git add .
git commit -m "chore: initial boilerplate setup"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_ORG/mern-ecommerce.git

# Push to main
git push -u origin main
```

### Step 1.3 — Create protected branches

```bash
# Create and push all environment branches
git checkout -b dev
git push -u origin dev

git checkout -b staging
git push -u origin staging

# main already exists
```

**Branch strategy:**
```
main      ← Production-ready code. Direct push BLOCKED.
staging   ← Pre-production testing. Direct push BLOCKED.
dev       ← Integration branch. Direct push BLOCKED.
feature/* ← Your daily work branches (e.g., feature/auth-login)
fix/*     ← Bug fixes (e.g., fix/cart-quantity-bug)
hotfix/*  ← Emergency production fixes
```

---

## 2. Branch Protection Rules

Branch protection ensures no one (including admins) can accidentally break production by force-pushing or merging untested code.

### Setting up protection — Step by step

Go to your repo → **Settings** → **Branches** → **Add branch protection rule**

---

### Rule 1: Protect `main` (Production)

| Setting | Value | Why |
|---|---|---|
| **Branch name pattern** | `main` | Exact match |
| **Require a pull request before merging** | ✅ Enabled | No direct pushes |
| **Required approvals** | `2` | Two people review prod changes |
| **Dismiss stale PR approvals when new commits are pushed** | ✅ Enabled | Prevents approval-then-sneak-changes |
| **Require review from Code Owners** | ✅ Enabled | Senior devs must approve |
| **Require status checks to pass before merging** | ✅ Enabled | CI must pass |
| **Required status checks** | `lint-and-format`, `typecheck`, `test-backend`, `test-frontend`, `sonarqube` | All jobs |
| **Require branches to be up to date before merging** | ✅ Enabled | No merging stale branches |
| **Require conversation resolution before merging** | ✅ Enabled | All review comments addressed |
| **Require signed commits** | ✅ Enabled (optional) | Verify commit author identity |
| **Include administrators** | ✅ Enabled | Even admins follow the rules |
| **Allow force pushes** | ❌ Disabled | Protect history |
| **Allow deletions** | ❌ Disabled | Can't delete main |

---

### Rule 2: Protect `staging`

Same as `main` but with:
| Setting | Value |
|---|---|
| **Required approvals** | `1` (one reviewer is enough for staging) |
| **Required status checks** | Same CI jobs |

---

### Rule 3: Protect `dev`

| Setting | Value | Why |
|---|---|---|
| **Require a pull request before merging** | ✅ Enabled | Peer review, even for dev |
| **Required approvals** | `1` | At least one teammate reviews |
| **Require status checks to pass** | ✅ Enabled | CI must pass |
| **Required status checks** | `lint-and-format`, `typecheck`, `test-backend`, `test-frontend` | (SonarQube optional for dev) |
| **Allow force pushes** | ❌ Disabled | |
| **Allow deletions** | ❌ Disabled | |

> **Note for interns:** You will NEVER push directly to `dev`, `staging`, or `main`.  
> Always create a `feature/your-feature-name` branch and open a Pull Request.

---

## 3. CODEOWNERS File

The `CODEOWNERS` file automatically assigns reviewers to pull requests based on which files were changed.

Create `.github/CODEOWNERS`:

```
# ============================================================
# CODEOWNERS — Automatic PR Review Assignment
# ============================================================
# Format: <path pattern>  <@github-username or @org/team>
#
# WHY CODEOWNERS:
#   Without it, devs might merge PRs without the right expert reviewing.
#   A backend change to auth middleware should always be reviewed by
#   someone who understands security — not just anyone on the team.
# ============================================================

# Global — all files require review from tech lead
*                           @your-org/tech-leads

# Backend security-critical files — must have senior backend review
backend/src/middleware/auth/      @your-org/backend-seniors
backend/src/middleware/security/  @your-org/backend-seniors
backend/src/config/              @your-org/backend-seniors

# Database changes — always need DBA review
backend/src/utils/migrate.ts     @your-org/backend-seniors @your-org/dba

# CI/CD changes — DevOps must review
.github/                        @your-org/devops
docker-compose.yml              @your-org/devops
**/Dockerfile*                  @your-org/devops

# Frontend core architecture
frontend/src/store/             @your-org/frontend-seniors
frontend/src/services/api.ts    @your-org/frontend-seniors
```

---

## 4. Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## What does this PR do?
<!-- Clear 1-2 sentence description -->

## Type of change
- [ ] feat: New feature
- [ ] fix: Bug fix
- [ ] refactor: Code restructure (no feature/fix)
- [ ] chore: Dependencies, config, tooling
- [ ] docs: Documentation only
- [ ] test: Tests only

## Related Issue
Closes #<!-- issue number -->

## Screenshots / Demo
<!-- For UI changes, add before/after screenshots -->

## Testing done
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manually tested in browser
- [ ] Tested on mobile viewport

## Checklist
- [ ] Code follows the project style guidelines
- [ ] Self-reviewed my own code
- [ ] No `console.log` statements left in production code
- [ ] No hardcoded secrets or credentials
- [ ] TypeScript types are correct (no `any` shortcuts)
- [ ] Database migrations are backward-compatible
- [ ] README updated if feature is user-facing
```

---

## 5. GitHub Secrets Setup

Secrets are encrypted environment variables used by GitHub Actions. **Never commit these.**

Go to: **Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets

| Secret Name | Value | Used In |
|---|---|---|
| `SONAR_TOKEN` | From sonarcloud.io project settings | SonarQube job |
| `SONAR_HOST_URL` | `https://sonarcloud.io` (or self-hosted URL) | SonarQube job |
| `STAGING_URL` | Your staging server URL | Smoke tests |
| `PRODUCTION_URL` | Your production URL | Smoke tests |

### Environment-Specific Secrets

Go to: **Settings → Environments → New environment**

Create environments: `development`, `staging`, `production`

For each environment, add:

| Secret Name | Description |
|---|---|
| `DB_HOST` | Database host for that environment |
| `DB_PASSWORD` | Database password |
| `JWT_ACCESS_SECRET` | Unique secret per environment (NEVER share with dev) |
| `JWT_REFRESH_SECRET` | Unique secret per environment |
| `REDIS_PASSWORD` | Redis password |

**Production environment:** Add **Required reviewers** — select 2 senior team members who must manually approve production deployments.

---

## 6. SonarQube Setup

### Option A: SonarCloud (Free, hosted)

1. Go to [sonarcloud.io](https://sonarcloud.io)
2. Sign in with GitHub
3. **+** → Analyze new project → Select your repository
4. Follow setup wizard — choose "With GitHub Actions"
5. Copy the `SONAR_TOKEN` they provide
6. Add `SONAR_TOKEN` and `SONAR_HOST_URL=https://sonarcloud.io` to GitHub Secrets
7. The `sonar-project.properties` file in this repo is pre-configured

### Option B: Self-hosted SonarQube (Docker)

```bash
# Add to docker-compose.yml services section for local dev:
sonarqube:
  image: sonarqube:community
  ports:
    - "9000:9000"
  volumes:
    - sonarqube_data:/opt/sonarqube/data
    - sonarqube_logs:/opt/sonarqube/logs
  environment:
    SONAR_ES_BOOTSTRAP_CHECKS_DISABLE: "true"
```

Then:
1. Visit `http://localhost:9000`
2. Default login: `admin` / `admin` (change immediately)
3. Create project → get token → add to GitHub Secrets
4. Set `SONAR_HOST_URL=http://your-server-ip:9000`

### Configure Quality Gate (SonarQube UI)

Go to **Quality Gates** → **Create** → Name: `MERN Intern Gate`

Add these conditions:

| Metric | Operator | Value |
|---|---|---|
| Coverage on New Code | is less than | 80% |
| Duplicated Lines on New Code | is greater than | 3% |
| Maintainability Rating on New Code | is worse than | A |
| Reliability Rating on New Code | is worse than | A |
| Security Rating on New Code | is worse than | A |
| Security Hotspots Reviewed on New Code | is less than | 100% |

Assign this gate to your project.

---

## 7. Additional Recommended Pipelines

### 7.1 — Dependency Update Automation (Dependabot)

Create `.github/dependabot.yml`:

```yaml
# ============================================================
# Dependabot — Automated Dependency Updates
# ============================================================
# WHY: Manually checking for dependency updates is time-consuming
#      and often skipped. Dependabot opens PRs automatically when
#      new versions are available. Combined with CI, you can merge
#      updates with confidence that nothing broke.
# ============================================================

version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "backend"
    # Group all non-major updates into one PR per week
    groups:
      backend-minor-patch:
        update-types:
          - "minor"
          - "patch"

  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "frontend"
    groups:
      frontend-minor-patch:
        update-types:
          - "minor"
          - "patch"

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "monthly"
    labels:
      - "dependencies"
      - "docker"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
    labels:
      - "dependencies"
      - "ci"
```

### 7.2 — PR Size Check

Create `.github/workflows/pr-size.yml`:

```yaml
# WHY: Large PRs are hard to review — reviewers lose focus after ~400 lines.
# This warns (but doesn't block) when a PR is too large.
name: PR Size Check

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  size-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check PR size
        uses: CodelyTV/pr-size-labeler@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          xs_label: 'size/XS'
          xs_max_size: 10
          s_label: 'size/S'
          s_max_size: 100
          m_label: 'size/M'
          m_max_size: 300
          l_label: 'size/L'
          l_max_size: 500
          xl_label: 'size/XL'
          fail_if_xl: false  # Warn but don't block
          message_if_xl: >
            This PR is very large. Please consider breaking it into smaller PRs.
            Large PRs are harder to review and more likely to introduce bugs.
```

### 7.3 — Stale Issue/PR Cleanup

Create `.github/workflows/stale.yml`:

```yaml
# Automatically marks stale PRs and closes them if no activity
name: Stale

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9am UTC

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v9
        with:
          stale-pr-message: 'This PR has had no activity in 14 days. It will be closed in 7 days unless updated.'
          close-pr-message: 'This PR was closed due to inactivity. Reopen if still needed.'
          days-before-pr-stale: 14
          days-before-pr-close: 7
          exempt-pr-labels: 'WIP,do-not-close,blocked'
```

---

## 8. Daily Git Workflow for Interns

### Starting a new feature

```bash
# 1. Always start from the latest dev branch
git checkout dev
git pull origin dev

# 2. Create your feature branch
git checkout -b feature/day-41-auth-login
# Branch naming: feature/<day>-<short-description>
# Examples:
#   feature/day-41-auth-login
#   feature/day-42-product-listing
#   fix/day-43-cart-quantity-bug

# 3. Do your work, commit often
git add .
git commit -m "feat(auth): add login form with validation"
# Husky will check your commit message format automatically

# 4. Push your branch
git push -u origin feature/day-41-auth-login

# 5. Open a Pull Request on GitHub
# Base branch: dev
# Fill in the PR template
# Request review from your mentor
```

### Keeping your branch up to date

```bash
# When dev has new changes (teammate merged a PR):
git fetch origin
git rebase origin/dev

# If you get conflicts:
# 1. Open the conflicted file(s)
# 2. Resolve the conflict markers (<<< === >>>)
# 3. git add <resolved-file>
# 4. git rebase --continue
```

### Merge flow

```
feature/day-41-auth-login
         ↓ PR (1 approval required)
        dev
         ↓ PR (1 approval + CI required)
       staging
         ↓ PR (2 approvals + manual deploy approval)
        main (Production)
```

---

## 9. Commit Message Quick Reference

```bash
# Feature
git commit -m "feat(auth): add JWT refresh token rotation"
git commit -m "feat(cart): implement add to cart with quantity check"
git commit -m "feat(products): add infinite scroll with cursor pagination"

# Bug fix
git commit -m "fix(auth): prevent refresh token reuse after logout"
git commit -m "fix(cart): reset quantity to 1 when product re-added"

# Refactor (no feature/fix change)
git commit -m "refactor(auth): extract token generation to utility function"

# Tests
git commit -m "test(auth): add unit tests for JWT verification utility"
git commit -m "test(products): add integration tests for product CRUD endpoints"

# Chore (deps, config, tooling)
git commit -m "chore(deps): upgrade helmet to v7.1.0"
git commit -m "chore(docker): optimize backend image size with multi-stage build"

# Documentation
git commit -m "docs(readme): add Day 42 implementation steps"

# CI/CD
git commit -m "ci: add SonarQube quality gate to CI pipeline"

# Performance
git commit -m "perf(products): add Redis caching for product list endpoint"
```

---

## 10. GitHub Labels Setup

Run this script to create consistent labels for your repository:

```bash
# Install gh CLI: https://cli.github.com/
gh auth login

# Create labels
gh label create "size/XS" --color "3CBF00" --description "< 10 lines changed"
gh label create "size/S" --color "5D9801" --description "10-100 lines"
gh label create "size/M" --color "7F7203" --description "100-300 lines"
gh label create "size/L" --color "A14C05" --description "300-500 lines"
gh label create "size/XL" --color "C32607" --description "> 500 lines — consider splitting"

gh label create "type/feat" --color "0075CA" --description "New feature"
gh label create "type/fix" --color "D73A4A" --description "Bug fix"
gh label create "type/refactor" --color "E4E669" --description "Code refactor"
gh label create "type/test" --color "BFD4F2" --description "Tests only"
gh label create "type/docs" --color "0075CA" --description "Documentation"
gh label create "type/chore" --color "E4E669" --description "Maintenance"

gh label create "status/needs-review" --color "FBCA04" --description "Waiting for review"
gh label create "status/changes-requested" --color "E11D48" --description "Review requested changes"
gh label create "status/approved" --color "22C55E" --description "Approved, ready to merge"
gh label create "status/WIP" --color "CCCCCC" --description "Work in progress, not ready"
gh label create "status/blocked" --color "B60205" --description "Blocked by another issue/PR"

gh label create "priority/critical" --color "B60205" --description "Must fix immediately"
gh label create "priority/high" --color "E4E669" --description "Fix in current sprint"
gh label create "priority/low" --color "0E8A16" --description "Nice to have"

gh label create "dependencies" --color "0366D6" --description "Dependency update"
```

---

> **Questions?** Ask your mentor, or check the main `README.md` for implementation details.
