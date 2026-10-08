import { AtomicClaim, SourceMetadata, EvidenceItem, EvidenceRelation } from '@paradox/shared';
import { validatePassage } from '../evidence/passageValidation.js';

export function extractEvidenceFromSources(
  claims: AtomicClaim[],
  sources: SourceMetadata[],
  sourceContents: Record<string, string> = {}
): EvidenceItem[] {
  const evidenceItems: EvidenceItem[] = [];

  for (const claim of claims) {
    for (const source of sources) {
      const rawContent = sourceContents[source.id] || '';
      const claimText = claim.normalizedText.toLowerCase();
      const contentText = rawContent.toLowerCase();

      if (!contentText || contentText.length === 0) {
        continue;
      }

      let relation: EvidenceRelation = 'NEUTRAL';
      let passage = '';

      if (contentText.includes(claimText) || claim.entities.every(e => contentText.includes(e.toLowerCase()))) {
        relation = 'SUPPORT';
        passage = rawContent.substring(0, 300);
      } else if (contentText.includes('not ' + claimText) || contentText.includes('false') || contentText.includes('denied')) {
        relation = 'CONTRADICT';
        passage = rawContent.substring(0, 300);
      }

      if (relation !== 'NEUTRAL' && passage.length > 0) {
        const validation = validatePassage(passage, source, rawContent);

        evidenceItems.push({
          id: `ev_${Date.now()}_${evidenceItems.length}`,
          claimId: claim.id,
          sourceId: source.id,
          passage,
          relation,
          relevanceScore: 0.85,
          qualityScore: source.qualityScore ?? 0.80,
          isValidated: validation.isValidated,
          provenance: {
            sourceUrl: source.url,
            passageLocation: 'sourceContent:0-300',
            retrievedAt: source.retrievedAt
          }
        });
      }
    }
  }

  return evidenceItems;
}
