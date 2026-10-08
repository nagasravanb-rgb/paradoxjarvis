import { SourceMetadata } from '@paradox/shared';

export interface PassageValidationResult {
  isValidated: boolean;
  matchedContent?: string;
  confidenceScore: number;
}

export function validatePassage(passage: string, source: SourceMetadata, rawSourceContent?: string): PassageValidationResult {
  if (!passage || passage.trim().length === 0) {
    return { isValidated: false, confidenceScore: 0 };
  }

  if (!rawSourceContent) {
    return { isValidated: false, confidenceScore: 0 };
  }

  const cleanPassage = passage.toLowerCase().trim();
  const cleanContent = rawSourceContent.toLowerCase();

  const isExactMatch = cleanContent.includes(cleanPassage);
  if (isExactMatch) {
    return { isValidated: true, matchedContent: passage, confidenceScore: 1.0 };
  }

  const words = cleanPassage.split(/\s+/).filter(w => w.length > 3);
  if (words.length === 0) {
    return { isValidated: false, confidenceScore: 0 };
  }

  const matchedWords = words.filter(w => cleanContent.includes(w));
  const overlapRatio = matchedWords.length / words.length;

  if (overlapRatio >= 0.75) {
    return { isValidated: true, matchedContent: passage, confidenceScore: overlapRatio };
  }

  return { isValidated: false, confidenceScore: overlapRatio };
}
