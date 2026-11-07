import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',
  docs: {
    title: '@ankhorage/graphdb',
    description: 'Provider-neutral persistence boundary for durable graph databases.',
  },
  package: {
    root: '.',
    entrypoints: ['src/graphdb.ts'],
  },
  output: { dir: './paradox' },
});
