import { DecisionResult, DecisionOption, DecisionFactor, SituationScenario } from '@paradox/shared';

export function analyzeDecision(query: string, rawOptions?: string[]): DecisionResult {
  const optionsList = rawOptions && rawOptions.length > 0 ? rawOptions : ['Option A (Maintain Status Quo)', 'Option B (Proactive Expansion)'];

  const options: DecisionOption[] = optionsList.map((opt, idx) => ({
    id: `opt_${idx}`,
    title: opt,
    description: `Evaluated option: ${opt}`,
    pros: ['Immediate alignment with baseline objectives', 'Minimal restructuring needed'],
    cons: ['Potential missed strategic upside', 'Requires continuous operational monitoring'],
    tradeOffs: ['Short-term cost control vs long-term growth opportunity']
  }));

  const factors: DecisionFactor[] = [
    {
      id: 'f_facts_1',
      category: 'FACTS',
      description: 'Verified historical performance data shows steady baseline retention.',
      evidenceIds: []
    },
    {
      id: 'f_assump_1',
      category: 'ASSUMPTIONS',
      description: 'Assumes demand remains stable over the next two quarters.',
      evidenceIds: []
    },
    {
      id: 'f_risks_1',
      category: 'RISKS',
      description: 'Market entry by new competitors could erode current margin advantages.',
      evidenceIds: []
    }
  ];

  const scenarios: SituationScenario[] = [
    {
      name: 'BASELINE',
      description: 'Expected operational outcome with low variance.',
      keyDrivers: ['Baseline adoption rate']
    },
    {
      name: 'UPSIDE',
      description: 'Accelerated market response to decision execution.',
      keyDrivers: ['Favorable macroeconomic shift']
    },
    {
      name: 'DOWNSIDE',
      description: 'Implementation friction causes project timeline slippage.',
      keyDrivers: ['Resource bottleneck']
    }
  ];

  return {
    options,
    factors,
    scenarios,
    recommendations: [
      'Prioritize Option A for immediate risk mitigation while preparing contingent infrastructure for Option B.',
      'Establish clear quantitative checkpoints before committing capital to long-term commitments.'
    ]
  };
}
