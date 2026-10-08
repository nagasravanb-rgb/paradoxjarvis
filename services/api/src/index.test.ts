import { describe, it, expect } from 'vitest';
import { runNormalizationPipeline } from './engines/orchestrator.js';
import { computeVerdict } from './engines/verdictEngine.js';
import { processJarvisRequest } from './engines/jarvisAgent.js';
import { runSelfVerification } from './engines/selfVerification.js';

describe('PARADOX Verification Core', () => {
  it('preserves exact entity spellings without auto-correcting claims', () => {
    const res = runNormalizationPipeline('Elom Musk is founder of X');
    expect(res.claims[0].originalText).toContain('Elom Musk');
  });

  it('returns UNVERIFIED when no external sources are retrieved', () => {
    const verdictRes = computeVerdict([{ id: 'c1', originalText: 'test', normalizedText: 'test', type: 'FACTUAL', isVerifiable: true, entities: [] }], []);
    expect(verdictRes.verdict).toBe('UNVERIFIED');
    expect(verdictRes.verdictProbability).toBeNull();
    expect(verdictRes.modelConfidence).toBeNull();
  });

  it('executes JARVIS intent routing and self-verification safely', async () => {
    const jarvisRes = await processJarvisRequest('verify: Is Earth flat?');
    expect(jarvisRes.intent).toBe('VERIFY');
    expect(jarvisRes.analysisResult?.verdict).toBe('UNVERIFIED');

    const selfVer = runSelfVerification(jarvisRes.analysisResult!);
    expect(selfVer.state).toBe('PASSED');
  });
});
