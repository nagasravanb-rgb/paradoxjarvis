import { normalizeInput } from './inputNormalization.js';
import { normalizeQuestion } from './questionNormalization.js';
import { extractClaims } from './claimExtraction.js';
import { AtomicClaim } from '@paradox/shared';

export interface PipelineNormalizationResult {
  raw: string;
  normalizedInput: string;
  questionNormalized?: string;
  claims: AtomicClaim[];
}

export function runNormalizationPipeline(input: string): PipelineNormalizationResult {
  const normInput = normalizeInput(input);
  const normQuestion = normalizeQuestion(normInput.normalizedText);

  const textToExtract = normQuestion.isQuestion && normQuestion.declarativeForm
    ? normQuestion.declarativeForm
    : normInput.normalizedText;

  const claims = extractClaims(textToExtract, normInput.preservedEntities);

  return {
    raw: input,
    normalizedInput: normInput.normalizedText,
    questionNormalized: normQuestion.isQuestion ? normQuestion.normalizedQuestion : undefined,
    claims
  };
}
