/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{ts,d.ts,tsx,json}": ["biome check --write --no-errors-on-unmatched"],
  "*.rs": ["cargo fmt --"],
};
