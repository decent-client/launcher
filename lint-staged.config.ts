import type { Configuration } from "lint-staged";

export default {
  "*.{ts,d.ts,tsx,json}": ["biome check --write --no-errors-on-unmatched"],
  "*.rs": ["cargo fmt --"],
} satisfies Configuration;
