import { AtomicClaim, ClaimType } from '@paradox/shared';

export function extractClaims(text: string, preservedEntities: string[] = []): AtomicClaim[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return sentences.map((sentence, idx) => {
    let type: ClaimType = 'FACTUAL';
    const isQuestion = sentence.endsWith('?') || /^(who|what|where|when|why|how)\b/i.test(sentence);
    const hasNumbers = /\d+/.test(sentence);
    const isOpinion = /\b(i think|i believe|in my opinion|best|worst|greatest|terrible)\b/i.test(sentence);

    if (isQuestion) {
      type = 'QUESTION';
    } else if (isOpinion) {
      type = 'OPINION';
    } else if (hasNumbers) {
      type = 'QUANTITATIVE';
    } else {
      type = 'FACTUAL';
    }

    const isVerifiable = type === 'FACTUAL' || type === 'QUANTITATIVE';
    const sentenceEntities = preservedEntities.filter(e => sentence.includes(e));

    return {
      id: `claim_${Date.now()}_${idx}`,
      originalText: sentence,
      normalizedText: sentence,
      type,
      isVerifiable,
      entities: sentenceEntities,
      provenance: {
        sourceIndex: idx
      }
    };
  });
}
