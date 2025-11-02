# Branch Protection Configuration for Auto-Merge

This document outlines the branch protection rules required to enable auto-merge for this repository.

## Required Branch Protection Rules for `main` branch

To enable auto-merge, configure the following branch protection rules in GitHub:

### Settings → Branches → Branch protection rules → Add rule

**Branch name pattern:** `main`

### Protection Rules

- [x] **Require a pull request before merging**
  - [x] Require approvals: **1** (minimum)
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners (if applicable)
  - [x] Restrict who can dismiss pull request reviews

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - [x] Status checks found in the last week for this repository:
    - `build` (from CI Build workflow)
    - `copilot-review` (from Copilot PR Review workflow)

- [x] **Require branches to be up to date before merging**

- [x] **Include administrators**
  - [x] Enforce all configured restrictions for administrators

### Auto-Merge Settings

In the repository settings:

1. Go to **Settings** → **General**
2. Scroll to **Pull Requests**
3. Check **Allow auto-merge**
4. Select **Automatically merge pull requests** when requirements are met

## Auto-Merge Behavior

The auto-merge workflow will:

1. Monitor pull requests targeting the `main` branch
2. Skip draft pull requests
3. Automatically enable auto-merge for:
   - Dependabot pull requests
   - Renovate pull requests
   - Regular pull requests that pass all CI checks

## Manual Configuration Steps

If you prefer to configure this manually:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** for the `main` branch
4. Configure the rules as specified above
5. Enable auto-merge in repository settings

## Testing Auto-Merge

To test the auto-merge functionality:

1. Create a pull request with changes
2. Ensure all CI checks pass
3. The auto-merge workflow should automatically enable auto-merge
4. The PR should be merged automatically once branch protection requirements are satisfied

## Troubleshooting

- **Auto-merge not working**: Ensure branch protection rules are configured correctly
- **CI checks not recognized**: Make sure the workflow names match exactly
- **Permissions issues**: The `GITHUB_TOKEN` needs appropriate permissions for auto-merge
