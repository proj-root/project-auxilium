
# Project Auxilium Constitution


## Core Principles

### I. Modular Monorepo
All features and packages must be developed as independently testable modules within the monorepo. Shared code is published as internal packages. No feature may introduce hidden dependencies or break encapsulation.

### II. Type Safety & Modern Tooling
TypeScript is mandatory for all code. All modules must pass strict type checks. Use modern tooling (e.g., Biome, Prettier, ESLint, Drizzle ORM) to enforce code quality and consistency.

### III. Test-First Development (NON-NEGOTIABLE)
All new features and bug fixes require tests before implementation. Red-Green-Refactor cycle is enforced. No code is merged without passing tests and review.

### IV. Observability & Logging
All services must provide structured logging and health endpoints. Errors must be handled gracefully and logged. Debuggability is a first-class concern.

### V. Simplicity & Explicitness
Favor simple, explicit solutions over clever or implicit ones. Avoid premature optimization. All code and configuration must be documented and justified.


## Technology & Security Constraints

- All code must be written in TypeScript (Node.js for backend, React for frontend).
- Use Drizzle ORM for database access; raw SQL only with justification.
- TailwindCSS is the default styling framework.
- All secrets and credentials must be managed via environment variables or secure vaults.
- All dependencies must be reviewed for security and license compliance.


## Development Workflow & Quality Gates

- All changes must be made via pull requests and require at least one review.
- PRs must include tests for new/changed logic and pass all CI checks.
- Code must be formatted and linted before merge.
- Deployment to production requires passing all tests and explicit approval.


## Governance

This constitution supersedes all other development practices. Amendments require documentation, team approval, and a migration plan if breaking. All PRs and reviews must verify compliance with these principles. Any complexity or deviation must be justified in writing. Use the README and internal docs for runtime guidance.

**Version**: 1.0.0 | **Ratified**: 2026-04-03 | **Last Amended**: 2026-04-03
<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Added sections: All (initial constitution)
- Modified principles: None (initial)
- Removed sections: None
- Templates requiring updates: None (all templates already generic)
- Follow-up TODOs: None
-->
