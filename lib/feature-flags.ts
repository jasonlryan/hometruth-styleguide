export function parseBoolean(value: string | undefined | null): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ["true", "1", "yes", "on"].includes(normalized);
}

export const CITATIONS_ENABLED = parseBoolean(
  (process.env.CITATIONS_ON ?? process.env.NEXT_PUBLIC_CITATIONS_ON) as
    | string
    | undefined,
);
