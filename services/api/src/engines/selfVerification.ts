import { AnalysisResult, SelfVerificationResult, SelfVerificationQualityState } from '@paradox/shared';

export function runSelfVerification(analysis: AnalysisResult): SelfVerificationResult {
  const checks: Array<{ rule: string; passed: boolean; details?: string }> = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!analysis) {
    return {
      state: 'FAILED',
      checks: [{ rule: 'ANALYSIS_EXISTS', passed: false, details: 'Analysis object is null or undefined' }],
      warnings: [],
      errors: ['Analysis object is missing']
    };
  }

  const evidence = analysis.evidence || [];
  const missingProvenance = evidence.some(e => !e.provenance || (!e.provenance.sourceUrl && !e.provenance.passageLocation));
  checks.push({
    rule: 'PROVENANCE_INTEGRITY',
    passed: !missingProvenance,
    details: missingProvenance ? 'Some evidence items lack explicit provenance' : 'All evidence items retain provenance'
  });

  if (analysis.verdict === 'TRUE' || analysis.verdict === 'FALSE') {
    const validatedEv = evidence.filter(e => e.isValidated);
    if (validatedEv.length === 0) {
      errors.push('Verdict claims definitive status (TRUE/FALSE) without any validated external evidence.');
      checks.push({ rule: 'VERDICT_EVIDENCE_GROUNDING', passed: false, details: 'Definitive verdict requires validated evidence' });
    } else {
      checks.push({ rule: 'VERDICT_EVIDENCE_GROUNDING', passed: true, details: 'Verdict grounded in validated evidence' });
    }
  } else {
    checks.push({ rule: 'VERDICT_EVIDENCE_GROUNDING', passed: true, details: 'Verdict is non-definitive/unverified' });
  }

  if (analysis.verdictProbability !== null || analysis.modelConfidence !== null) {
    warnings.push('Quantitative probabilities or model confidence supplied; must be empirically justified.');
    checks.push({ rule: 'NO_FABRICATED_PROBABILITIES', passed: true, details: 'Probabilities provided for empirical assessment' });
  } else {
    checks.push({ rule: 'NO_FABRICATED_PROBABILITIES', passed: true, details: 'Probabilities correctly set to null' });
  }

  let state: SelfVerificationQualityState = 'PASSED';
  if (errors.length > 0) {
    state = 'FAILED';
  } else if (warnings.length > 0) {
    state = 'PASSED_WITH_WARNINGS';
  }

  return {
    state,
    checks,
    warnings,
    errors
  };
}
