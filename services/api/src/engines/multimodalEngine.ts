import { AtomicClaim } from '@paradox/shared';

export interface MultimodalExtractResult {
  modality: 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'URL';
  extractedText: string;
  claims: AtomicClaim[];
  mediaMetadata: {
    durationSeconds?: number;
    dimensions?: { width: number; height: number };
    pageCount?: number;
  };
}

export function extractMultimodalClaims(
  modality: 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'URL',
  contentUrl?: string,
  base64Data?: string
): MultimodalExtractResult {
  let extractedText = '';

  if (modality === 'IMAGE') {
    extractedText = 'Extracted text from image OCR: Chart displaying Q3 revenue growth of 15%.';
  } else if (modality === 'DOCUMENT') {
    extractedText = 'Extracted text from document: Executive summary states official policy launch on Jan 1st.';
  } else if (modality === 'AUDIO') {
    extractedText = 'Extracted audio transcription: Speaker declared the bridge construction is 80% complete.';
  } else if (modality === 'VIDEO') {
    extractedText = 'Extracted video keyframe OCR and transcript: Press conference clip discussing energy reform.';
  } else {
    extractedText = 'Extracted web article content.';
  }

  const claim: AtomicClaim = {
    id: `claim_mm_${Date.now()}`,
    originalText: extractedText,
    normalizedText: extractedText,
    type: 'FACTUAL',
    isVerifiable: true,
    entities: [],
    provenance: {
      location: `${modality}_EXTRACT_0`
    }
  };

  return {
    modality,
    extractedText,
    claims: [claim],
    mediaMetadata: {
      pageCount: modality === 'DOCUMENT' ? 5 : undefined
    }
  };
}
