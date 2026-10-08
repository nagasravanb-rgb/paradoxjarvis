import { SourceMetadata, ProviderFailureReason, ResearchResult } from '@paradox/shared';

export interface ResearchProvider {
  name: string;
  isConfigured(): boolean;
  search(query: string, maxResults?: number): Promise<{ sources: SourceMetadata[]; failureReason?: ProviderFailureReason }>;
}

export class ResearchRouter {
  private providers: ResearchProvider[] = [];

  registerProvider(provider: ResearchProvider): void {
    this.providers.push(provider);
  }

  async searchAll(query: string, maxResults = 5): Promise<ResearchResult> {
    const configuredProviders = this.providers.filter(p => p.isConfigured());

    if (configuredProviders.length === 0) {
      return {
        sources: [],
        failureReason: 'PROVIDER_NOT_CONFIGURED',
        providerLogs: ['No research providers configured'],
        supportCount: 0,
        contradictCount: 0,
        neutralCount: 0,
        unusableCount: 0,
        hasConflict: false
      };
    }

    const allSources: SourceMetadata[] = [];
    const logs: string[] = [];
    let lastFailure: ProviderFailureReason | undefined = undefined;

    for (const provider of configuredProviders) {
      try {
        logs.push(`Searching via provider ${provider.name}`);
        const res = await provider.search(query, maxResults);
        if (res.failureReason) {
          lastFailure = res.failureReason;
          logs.push(`Provider ${provider.name} failed with ${res.failureReason}`);
        } else {
          for (const src of res.sources) {
            src.isCandidateOnly = true;
            if (!allSources.some(s => s.url === src.url || s.id === src.id)) {
              allSources.push(src);
            }
          }
        }
      } catch (err: any) {
        lastFailure = 'PROVIDER_ERROR';
        logs.push(`Provider ${provider.name} threw error: ${err.message}`);
      }
    }

    if (allSources.length === 0) {
      return {
        sources: [],
        failureReason: lastFailure || 'NO_SOURCES_FOUND',
        providerLogs: logs,
        supportCount: 0,
        contradictCount: 0,
        neutralCount: 0,
        unusableCount: 0,
        hasConflict: false
      };
    }

    return {
      sources: allSources,
      providerLogs: logs,
      supportCount: 0,
      contradictCount: 0,
      neutralCount: 0,
      unusableCount: 0,
      hasConflict: false
    };
  }
}
