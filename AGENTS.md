# AGENTS.md

## Repository

Package: `@ankhorage/graphdb`

Provider-neutral persistence boundary for durable graph databases. Generic in-memory graph values and algorithms belong in `@ankhorage/graph`; provider adapters belong in their own packages.

## Current architecture only

Use only the current Ankhorage architecture. Do not add compatibility aliases, shims, dual paths, historical fallbacks, sibling-source imports, or provider-specific dependencies. This package remains independently installable and consumable through declared published dependencies.

## Required repository instructions

Before changing a file, read this file and inspect `.agents/skills/`. Load the repository-local coding rules and project structure skills for every change, and load the local hexagonal architecture skill for structural work.

## Scope

This package owns portable graph database operations and ports only. It must not contain database clients, provider configuration, AWS, Neptune, Gremlin, openCypher, RDF, SPARQL, UI, or application concepts.

## Documentation

`README.md` and `paradox/` are generated release artifacts. Do not edit them manually. Update owning source comments and examples; generate documentation only to validate the tooling and do not commit ordinary feature-generated output.
