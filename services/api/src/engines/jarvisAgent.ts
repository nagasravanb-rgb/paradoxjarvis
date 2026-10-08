import { JarvisIntent, JarvisPresenceState, JarvisResponse, AnalysisResult, TraceEvent } from '@paradox/shared';
import { runNormalizationPipeline } from './orchestrator.js';
import { computeVerdict } from './verdictEngine.js';
import { generateExplanation } from './explanationEngine.js';

export interface JarvisContext {
  userId?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export function detectJarvisIntent(userQuery: string): JarvisIntent {
  const query = userQuery.toLowerCase().trim();

  if (query.startsWith('verify:') || query.includes('verify claim') || query.includes('is it true')) {
    return 'VERIFY';
  }
  if (query.startsWith('research:') || query.includes('search for') || query.includes('find evidence')) {
    return 'RESEARCH';
  }
  if (query.startsWith('situation:') || query.includes('analyze situation') || query.includes('what is the situation')) {
    return 'SITUATION';
  }
  if (query.startsWith('decision:') || query.includes('decision analysis') || query.includes('help me decide')) {
    return 'DECISION';
  }
  if (query.startsWith('case:') || query.includes('lookup case')) {
    return 'CASE_LOOKUP';
  }
  if (query.startsWith('trace:') || query.includes('lookup trace')) {
    return 'TRACE_LOOKUP';
  }
  if (query.includes('multimodal') || query.includes('analyze image') || query.includes('analyze document')) {
    return 'MULTIMODAL_VERIFY';
  }

  return 'CHAT';
}

export async function processJarvisRequest(
  userQuery: string,
  context?: JarvisContext
): Promise<JarvisResponse> {
  const intent = detectJarvisIntent(userQuery);

  if (intent === 'CHAT') {
    return {
      intent: 'CHAT',
      presence: 'SPEAKING',
      responseText: `JARVIS online. I am PARADOX's intelligence interface. How can I assist with evidence-grounded analysis?`,
      suggestedActions: ['Verify Claim', 'Analyze Situation', 'Evaluate Decision']
    };
  }

  const normResult = runNormalizationPipeline(userQuery);
  const trace: TraceEvent[] = [
    {
      id: `tr_${Date.now()}_1`,
      timestamp: new Date().toISOString(),
      stage: 'INPUT_NORMALIZATION',
      input: { rawQuery: userQuery },
      output: { normalizedText: normResult.normalizedInput, claimsExtracted: normResult.claims.length },
      status: 'SUCCESS' as const
    }
  ];

  const verdictRes = computeVerdict(normResult.claims, []);
  trace.push({
    id: `tr_${Date.now()}_2`,
    timestamp: new Date().toISOString(),
    stage: 'VERDICT_COMPUTATION',
    input: { claimsCount: normResult.claims.length, evidenceCount: 0 },
    output: { verdict: verdictRes.verdict },
    status: 'SUCCESS' as const
  });

  const explanation = generateExplanation(normResult.claims, [], verdictRes.verdict);

  const analysisResult: AnalysisResult = {
    id: `analysis_${Date.now()}`,
    timestamp: new Date().toISOString(),
    originalInput: userQuery,
    normalizedInput: normResult.normalizedInput,
    questionNormalized: normResult.questionNormalized,
    claims: normResult.claims,
    research: {
      sources: [],
      supportCount: 0,
      contradictCount: 0,
      neutralCount: 0,
      unusableCount: 0,
      hasConflict: false
    },
    evidence: [],
    verdict: verdictRes.verdict,
    verdictProbability: null,
    modelConfidence: null,
    explanation,
    selfVerification: {
      state: 'PASSED_WITH_WARNINGS',
      checks: [{ rule: 'EVIDENCE_GROUNDING', passed: true, details: 'No external sources configured' }],
      warnings: ['No external search provider configured; verdict defaults to UNVERIFIED.'],
      errors: []
    },
    reliability: {
      verdictStrength: 'UNVERIFIED',
      evidenceStrengthScore: null,
      evidenceCoverageScore: null,
      sourceQualityScore: null,
      modelConfidence: null,
      verdictProbability: null,
      calibrationQuality: 'UNVERIFIED',
      riskReductionNotes: []
    },
    trace
  };

  return {
    intent,
    presence: 'EXECUTING',
    responseText: `Processed request with verdict: ${verdictRes.verdict}. ${explanation.summary}`,
    analysisResult,
    suggestedActions: ['View Trace', 'Examine Claims', 'Search Sources']
  };
}

export async function processJarvisVoice(audioBase64?: string, textQuery?: string): Promise<JarvisResponse> {
  const query = textQuery || 'Voice input received';
  const response = await processJarvisRequest(query);
  response.audioUrl = `data:audio/wav;base64,mockAudioStreamData`;
  return response;
}
