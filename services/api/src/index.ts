import { HealthResponse } from '@paradox/api-contracts';

export function getHealthStatus(): HealthResponse {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    providers: {
      webSearch: process.env.WEB_SEARCH_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
      llm: process.env.OPENAI_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED'
    }
  };
}

console.log('PARADOX API Service Initialized:', getHealthStatus());
