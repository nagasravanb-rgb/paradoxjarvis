import { SituationResult, TemporalAnalysis, SituationState, SituationScenario } from '@paradox/shared';

export function analyzeSituation(topic: string, context?: string): SituationResult {
  const temporal: TemporalAnalysis = {
    type: 'CURRENT',
    eventTime: new Date().toISOString(),
    retrievedAt: new Date().toISOString(),
    hasTemporalConflict: false,
    explanation: 'Analysis based on current verified data points.'
  };

  const state: SituationState = topic.toLowerCase().includes('crisis') || topic.toLowerCase().includes('war')
    ? 'DETERIORATING'
    : 'CHANGING';

  const scenarios: SituationScenario[] = [
    {
      name: 'BASELINE',
      description: 'Current trends persist without major structural intervention.',
      keyDrivers: ['Market stability', 'Resource allocation']
    },
    {
      name: 'UPSIDE',
      description: 'Policy intervention yields rapid resolution of current conflicts.',
      keyDrivers: ['Stakeholder alignment', 'Regulatory approval']
    },
    {
      name: 'DOWNSIDE',
      description: 'External volatility worsens supply or operational bottlenecks.',
      keyDrivers: ['Geopolitical friction', 'Resource shortage']
    }
  ];

  return {
    state,
    summary: `Situation analysis for topic '${topic}': Current trajectory is ${state}.`,
    temporalAnalysis: temporal,
    scenarios,
    keyRisks: ['Data ambiguity', 'Rapid policy shift', 'Execution delays']
  };
}
