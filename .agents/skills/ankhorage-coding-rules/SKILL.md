---
name: ankhorage-coding-rules
description: Implement, refactor, test, review, or hand off code changes in Ankhorage repositories.
---

# Ankhorage Coding Rules

Deliver focused changes that satisfy the repository's current canonical policy and are ready for review.

## Git and delivery

- Work on a fresh task branch from `origin/main`.
- Preserve unrelated work and deliver coding work through a pull request.
- Describe the architectural effect, validation, public API, changeset, documentation, and linked issue.

## Canonical lint compliance

- Keep one canonical implementation. Do not add compatibility aliases, dual paths, historical-state fallbacks, or sibling-source imports.
- Use immutable data and explicit side effects at system boundaries.
- Do not weaken lint rules or add suppressions to bypass validation.

## Documentation and testing

- Give each named production function under `src` a concise Paradox comment.
- Test observable behavior at the owning boundary with deterministic tests.
- Export public symbols deliberately from canonical entrypoints and exercise them in tests.

## Release quality

- Add a Changeset for a published package or public API change.
- Review the final diff and run applicable build, lint, test, typecheck, Knip, format, documentation, Changeset status, and packaging checks.
