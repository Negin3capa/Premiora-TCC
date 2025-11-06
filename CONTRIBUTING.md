# Contributing to Premiora-TCC

Thanks for your interest in contributing! This short guide explains how to contribute code, documentation, or tests to Premiora-TCC.

## License

This project is released under the MIT License. See the `LICENSE` file in the repository root for full terms.

## Code of Conduct

Please follow a respectful, constructive tone in issues and pull request discussions. Treat maintainers and contributors with courtesy.

## Getting started (development)

1. Fork the repository and clone your fork.
2. Create a feature branch from `main`:

   git checkout -b feature/your-feature

3. Install dependencies and run locally from the `premiora-web` folder:

   npm ci --prefix premiora-web
   npm run dev --prefix premiora-web

4. Make small, focused commits with clear messages.

## Branching and PRs

- Target branch: create branches from `main`.
- Branch naming: `feature/`, `fix/`, or `chore/` prefixes are preferred (e.g. `feature/authenticated-feed`).
- Open a Pull Request against `main` with a descriptive title and a short summary of changes.

PR checklist (suggested):

- [ ] The PR builds locally (`npm run build --prefix premiora-web`).
- [ ] Linting/formatting passes.
- [ ] Tests (if any) pass.

## CI and required checks

This repository uses GitHub Actions to run the build and checks on `main`. Pull requests must pass the CI `build` workflow before being merged. The CI build runs the install and build steps for the `premiora-web` app.

If a CI run fails with an error referencing a missing folder or file (for example `premiora-landing`), please verify the repository structure and update the workflow or documentation accordingly. We recently migrated the app folder to `premiora-web`.

## Tests & Quality

- Add tests alongside bug fixes and features when practical.
- Keep changes focused and add a short note in the PR description about how the change was tested.

## Style

- Follow existing coding patterns used in `premiora-web/src`.
- Use descriptive variable and function names. Keep UI text localized where applicable.

## License and attribution

By contributing, you agree that your contributions will be licensed under the project's MIT license (see `LICENSE`).

## Questions

If you're unsure how to proceed with a change, open an issue describing what you'd like to do and the maintainers will help coordinate.

Thank you for helping improve Premiora! 🎉
