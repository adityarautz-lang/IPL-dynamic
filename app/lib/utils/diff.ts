// utils/diff.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDiff(prev: any, next: any, path = ""): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diff: Record<string, any> = {};

  for (const key in next) {
    const newPath = path ? `${path}.${key}` : key;

    if (
      typeof next[key] === "object" &&
      next[key] !== null &&
      typeof prev?.[key] === "object"
    ) {
      Object.assign(diff, getDiff(prev[key], next[key], newPath));
    } else {
      if (prev?.[key] !== next[key]) {
        diff[newPath] = next[key];
      }
    }
  }

  return diff;
}
