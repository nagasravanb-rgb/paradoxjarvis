import { AtomicClaim, EvidenceItem, VerdictType, VerificationExplanation } from '@paradox/shared';

export function generateExplanation(
  claims: AtomicClaim[],
  evidence: EvidenceItem[],
  overallVerdict: VerdictType
): VerificationExplanation {
  const claimSummaries = claims.map(claim => {
    const relevantEv = evidence.filter(e => e.claimId === claim.id);
    const supporting = relevantEv.filter(e => e.relation === 'SUPPORT').map(e => e.id);
    const contradicting = relevantEv.filter(e => e.relation === 'CONTRADICT').map(e => e.id);

    let claimVerdict: VerdictType = 'UNVERIFIED';
    if (supporting.length > 0 && contradicting.length === 0) claimVerdict = 'TRUE';
    if (contradicting.length > 0 && supporting.length === 0) claimVerdict = 'FALSE';
    if (supporting.length > 0 && contradicting.length > 0) claimVerdict = 'MIXED';

    return {
      claimId: claim.id,
      text: claim.normalizedText,
      verdict: claimVerdict,
      supportingEvidenceIds: supporting,
      contradictingEvidenceIds: contradicting
    };
  });

  const uncertaintyNotes: string[] = [];
  if (overallVerdict === 'UNVERIFIED') {
    uncertaintyNotes.push('Insufficient validated external sources available to verify the claims.');
  }
  if (evidence.some(e => !e.isValidated)) {
    uncertaintyNotes.push('Some retrieved passages could not be fully validated against raw source text.');
  }

  const verifiedClaimsCount = claimSummaries.filter(c => c.verdict !== 'UNVERIFIED').length;
  const coverageAssessment = claims.length > 0
    ? `Verified ${verifiedClaimsCount} out of ${claims.length} claims (${Math.round((verifiedClaimsCount / claims.length) * 100)}% coverage).`
    : 'No claims available to assess coverage.';

  return {
    summary: `Overall analysis resulted in verdict: ${overallVerdict}.`,
    claimSummaries,
    uncertaintyNotes,
    coverageAssessment
  };
}
