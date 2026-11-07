---
name: hexagonal-architecture
description: Ports and adapters boundaries and external dependency management.
---

# Hexagonal Architecture

Ports model capabilities, not technologies. Inner domain policy depends on no external mechanism. Application orchestration depends only on domain policy and required ports. Adapters implement ports at the edge, and explicit composition roots wire adapters to use cases. Do not create layers without a real responsibility.
