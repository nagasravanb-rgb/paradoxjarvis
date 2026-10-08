import { AtomicClaim, EvidenceItem, SourceMetadata } from '@paradox/shared';
import { ResearchRouter } from './router.js';

export interface ContradictionSearchResult {
  contradictoryEvidence: EvidenceItem[];
  supportCount: number;
  contradictCount: number;
  neutralCount: number;
  unusableCount: number;
  hasConflict: boolean;
}

export class ContradictionSearchEngine {
  constructor(private router: ResearchRouter) {}

  async searchContradictions(claims: AtomicClaim[], existingEvidence: EvidenceItem[]): Promise<ContradictionSearchResult> {
    const contradictTerms = ['false', 'debunked', 'denied', 'incorrect', 'refuted', 'fake', 'myth', 'misleading'];
    const newContradictoryEvidence: EvidenceItem[] = [];

    for (const claim of claims) {
      const antiQuery = `"${claim.normalizedText}" (${contradictTerms.join(' OR ')})`;
      const searchRes = await this.router.searchAll(antiQuery, 3);

      for (const source of searchRes.sources) {
        newContradictoryEvidence.push({
          id: `ev_contra_${Date.now()}_${newContradictoryEvidence.length}`,
          claimId: claim.id,
          sourceId: source.id,
          passage: `Falsification query match from source: ${source.title || source.url}`,
          relation: 'CONTRADICT',
          relevanceScore: 0.80,
          qualityScore: source.qualityScore ?? 0.75,
          isValidated: false,
          provenance: {
            sourceUrl: source.url,
            retrievedAt: source.retrievedAt
          }
        });
      }
    }

    const allEvidence = [...existingEvidence, ...newContradictoryEvidence];
    const supportCount = allEvidence.filter(e => e.relation === 'SUPPORT').length;
    const contradictCount = allEvidence.filter(e => e.relation === 'CONTRADICT').length;
    const neutralCount = allEvidence.filter(e => e.relation === 'NEUTRAL').length;
    const unusableCount = allEvidence.filter(e => e.relation === 'UNUSABLE' || !e.isValidated).length;

    const hasConflict = supportCount > 0 && contradictCount > 0;

    return {
      contradictoryEvidence: newContradictoryEvidence,
      supportCount,
      contradictCount,
      neutralCount,
      unusableCount,
      hasConflict
    };
  }
}
