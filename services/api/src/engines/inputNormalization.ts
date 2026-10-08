export interface NormalizedInput {
  raw: string;
  normalizedText: string;
  url?: string;
  isUrl: boolean;
  preservedEntities: string[];
}

export function normalizeInput(input: string): NormalizedInput {
  const trimmed = input.trim();
  let isUrl = false;
  let parsedUrl: string | undefined = undefined;

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const u = new URL(trimmed);
      isUrl = true;
      parsedUrl = u.toString();
    }
  } catch {
    isUrl = false;
  }

  const normalizedText = trimmed.replace(/\s+/g, ' ');
  const entityMatches = normalizedText.match(/\b[A-Z][a-z0-9_]+\b/g) || [];
  const preservedEntities = Array.from(new Set(entityMatches));

  return {
    raw: input,
    normalizedText,
    url: parsedUrl,
    isUrl,
    preservedEntities
  };
}
