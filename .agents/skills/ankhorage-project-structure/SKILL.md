---
name: ankhorage-project-structure
description: Define, review, or implement the standard source structure of Ankhorage repositories.
---

# Ankhorage Project Structure

## Required skills

For structural work, read the repository `AGENTS.md`, inspect source and public exports, and load `.agents/skills/hexagonal-architecture/SKILL.md`.

## Architecture profile

Choose the smallest profile matching the package responsibility. Runtime-owning packages are feature-first: coherent capabilities belong under `src/features/<feature>/`; only deliberate public facades belong directly below `src/`. Do not create empty architectural layers.

## Dependency direction

Domain policy does not depend on adapters, composition, provider SDKs, frameworks, or infrastructure. Application code may depend inward on ports and domain policy, but never on concrete adapters. Adapters translate technology to an inward port. Composition is the only layer which selects concrete implementations.

## Type ownership

Keep a type used by one module private in that module. Group repository-local reusable types in `src/types/<topic>.ts`. Move serializable types to `@ankhorage/contracts` only when two demonstrated repositories require them; use published APIs and declared dependencies.

## Utilities

Before adding a generally reusable function, inspect the published `@ankhorage/utility` API. Keep one-module helpers private, feature helpers within their feature, and package-policy helpers in `src/utils/`.
