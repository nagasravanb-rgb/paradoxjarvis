import { AtomicClaim, EvidenceItem, VerdictType } from '@paradox/shared';

export interface VerdictResult {
  verdict: VerdictType;
  verdictProbability: number | null;
  modelConfidence: number | null;
  reasoning: string;
}

export function computeVerdict(claims: AtomicClaim[], evidence: EvidenceItem[]): VerdictResult {
  if (!claims || claims.length === 0) {
    return {
      verdict: 'UNVERIFIED',
      verdictProbability: null,
      modelConfidence: null,
      reasoning: 'No claims extracted to verify.'
    };
  }

  const validEvidence = evidence.filter(e => e.isValidated);

  if (validEvidence.length === 0) {
    return {
      verdict: 'UNVERIFIED',
      verdictProbability: null,
      modelConfidence: null,
      reasoning: 'No validated external evidence was retrieved to ground a verdict.'
    };
  }

  const supportCount = validEvidence.filter(e => e.relation === 'SUPPORT').length;
  const contradictCount = validEvidence.filter(e => e.relation === 'CONTRADICT').length;

  if (supportCount > 0 && contradictCount > 0) {
    return {
      verdict: 'MIXED',
      verdictProbability: null,
      modelConfidence: null,
      reasoning: 'Validated evidence contains contradicting claims and support.'
    };
  }

  if (contradictCount > 0 && supportCount === 0) {
    return {
      verdict: 'FALSE',
      verdictProbability: null,
      modelConfidence: null,
      reasoning: 'Validated external evidence contradicts the claim.'
    };
  }

  if (supportCount > 0 && contradictCount === 0) {
    return {
      verdict: 'TRUE',
      verdictProbability: null,
      modelConfidence: null,
      reasoning: 'Validated external evidence directly supports the claim.'
    };
  }

  return {
    verdict: 'UNVERIFIED',
    verdictProbability: null,
    modelConfidence: null,
    reasoning: 'Retrieved content does not directly support or refute claims.'
  };
}
