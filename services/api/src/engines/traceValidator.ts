import { TraceEvent } from '@paradox/shared';

export interface TraceValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateTraceSequence(events: TraceEvent[]): TraceValidationResult {
  const errors: string[] = [];

  if (!events || events.length === 0) {
    return { isValid: false, errors: ['Trace is empty'] };
  }

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (!ev.id || !ev.stage || !ev.timestamp) {
      errors.push(`Event at index ${i} missing required id, stage, or timestamp`);
    }

    if (i > 0) {
      const prevTime = new Date(events[i - 1].timestamp).getTime();
      const currTime = new Date(ev.timestamp).getTime();
      if (currTime < prevTime) {
        errors.push(`Temporal sequence violation at index ${i}: event timestamp precedes previous event`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
