import { JarvisIntent, AnalysisResult, VerdictType } from '@paradox/shared';

export interface VerifyRequest {
  text: string;
  url?: string;
  options?: {
    allowTemporalReasoning?: boolean;
    includeSituation?: boolean;
    includeDecision?: boolean;
  };
}

export interface VerifyResponse {
  success: boolean;
  analysis: AnalysisResult;
}

export interface ResearchRequest {
  query: string;
  maxSources?: number;
}

export interface SituationRequest {
  topic: string;
  context?: string;
}

export interface DecisionRequest {
  query: string;
  options?: string[];
}

export interface MultimodalExtractRequest {
  modality: 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'URL';
  contentUrl?: string;
  base64Data?: string;
  mimeType?: string;
}

export interface MultimodalAnalyzeRequest {
  modality: 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'URL';
  contentUrl?: string;
  base64Data?: string;
  mimeType?: string;
}

export interface JarvisVoiceRequest {
  audioBase64?: string;
  textQuery?: string;
}

export interface ReliabilityRequest {
  analysisId: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  providers: Record<string, 'CONFIGURED' | 'NOT_CONFIGURED' | 'ERROR'>;
}
