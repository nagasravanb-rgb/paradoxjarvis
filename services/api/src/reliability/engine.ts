import { AnalysisResult, ReliabilityAssessment } from '@paradox/shared';

export function computeReliabilityAssessment(analysis: AnalysisResult): ReliabilityAssessment {
  const validatedEv = analysis.evidence.filter(e => e.isValidated);

  if (analysis.verdict === 'UNVERIFIED' || validatedEv.length === 0) {
    return {
      verdictStrength: 'UNVERIFIED',
      evidenceStrengthScore: null,
      evidenceCoverageScore: null,
      sourceQualityScore: null,
      modelConfidence: null,
      verdictProbability: null,
      calibrationQuality: 'UNVERIFIED',
      riskReductionNotes: ['No verified external evidence available to measure risk reduction.']
    };
  }

  const avgQuality = validatedEv.reduce((acc, curr) => acc + curr.qualityScore, 0) / validatedEv.length;

  return {
    verdictStrength: avgQuality > 0.8 ? 'HIGH' : 'MODERATE',
    evidenceStrengthScore: Number(avgQuality.toFixed(2)),
    evidenceCoverageScore: Number((validatedEv.length / (analysis.claims.length || 1)).toFixed(2)),
    sourceQualityScore: Number(avgQuality.toFixed(2)),
    modelConfidence: null,
    verdictProbability: null,
    calibrationQuality: 'EMPIRICALLY_GROUNDED',
    riskReductionNotes: ['Grounded in validated external sources.']
  };
}
