export interface NormalizedQuestion {
  originalText: string;
  normalizedQuestion: string;
  isQuestion: boolean;
  declarativeForm?: string;
}

export function normalizeQuestion(text: string): NormalizedQuestion {
  const trimmed = text.trim();
  const isQuestion = trimmed.endsWith('?') || /^(is|are|was|were|did|does|do|can|could|would|should|has|have|who|what|where|when|why|how)\b/i.test(trimmed);

  let declarativeForm = trimmed;
  if (isQuestion) {
    declarativeForm = trimmed
      .replace(/\?$/, '')
      .replace(/^(is|was|were|are)\s+(.+)\s+(a|an|the|founder|president|ceo|created|born)\b/i, '$2 is $3')
      .trim();
  }

  return {
    originalText: text,
    normalizedQuestion: trimmed,
    isQuestion,
    declarativeForm
  };
}
