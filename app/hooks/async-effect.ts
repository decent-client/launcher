import { type DependencyList, useEffect } from "react";

export function useAsyncEffect(effect: () => unknown, dependencies?: DependencyList) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    async function callback() {
      effect();
    }

    callback();
  }, dependencies);
}
