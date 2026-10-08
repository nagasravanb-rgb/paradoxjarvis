export type VerdictType = 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'MIXED' | 'TIME_DEPENDENT' | 'UNVERIFIED';

type NullableNumber = number | null;

export type ClaimType = 'FACTUAL' | 'NON_FACTUAL' | 'QUESTION' | 'QUANTITATIVE' | 'OPINION' | 'PREDICTION';

export interface AtomicClaim {
  id: string;
  originalText: string;
  normalizedText: string;
  type: ClaimType;
  isVerifiable: boolean;
  entities: string[];
  provenance?: {
    location?: string;
    sourceIndex?: number;
  };
}

export type EvidenceRelation = 'SUPPORT' | 'CONTRADICT' | 'NEUTRAL' | 'UNUSABLE';

export interface SourceMetadata {
  id: string;
  url?: string;
  title?: string;
  domain?: string;
  publishedAt?: string;
  updatedAt?: string;
  retrievedAt: string;
  isCandidateOnly: boolean;
  qualityScore?: number;
  credibilityTier?: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}

export interface EvidenceItem {
  id: string;
  claimId: string;
  sourceId: string;
  passage: string;
  relation: EvidenceRelation;
  relevanceScore: number;
  qualityScore: number;
  isValidated: boolean;
  eventTime?: string;
  provenance: {
    sourceUrl?: string;
    passageLocation?: string;
    retrievedAt: string;
  };
}

export type ProviderFailureReason =
  | 'PROVIDER_NOT_CONFIGURED'
  | 'PROVIDER_TIMEOUT'
  | 'NO_SOURCES_FOUND'
  | 'RETRIEVAL_FAILED'
  | 'PROVIDER_ERROR';

export interface ResearchResult {
  sources: SourceMetadata[];
  failureReason?: ProviderFailureReason;
  providerLogs?: string[];
  supportCount: number;
  contradictCount: number;
  neutralCount: number;
  unusableCount: number;
  hasConflict: boolean;
}

export type TemporalType = 'PAST' | 'CURRENT' | 'FUTURE' | 'TIME_RANGE' | 'RECURRING' | 'TIME_UNKNOWN';

export interface TemporalAnalysis {
  type: TemporalType;
  eventTime?: string;
  sourcePublishedAt?: string;
  sourceUpdatedAt?: string;
  retrievedAt: string;
  hasTemporalConflict: boolean;
  explanation?: string;
}

export type SituationState = 'STABLE' | 'CHANGING' | 'IMPROVING' | 'DETERIORATING' | 'UNCERTAIN' | 'CONTESTED' | 'INSUFFICIENT_DATA';

export interface SituationScenario {
  name: 'BASELINE' | 'UPSIDE' | 'DOWNSIDE';
  description: string;
  keyDrivers: string[];
}

export interface SituationResult {
  state: SituationState;
  summary: string;
  temporalAnalysis: TemporalAnalysis;
  scenarios: SituationScenario[];
  keyRisks: string[];
}

export interface DecisionFactor {
  id: string;
  category: 'FACTS' | 'ASSUMPTIONS' | 'INFERENCES' | 'RISKS';
  description: string;
  evidenceIds: string[];
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  tradeOffs: string[];
}

export interface DecisionResult {
  options: DecisionOption[];
  factors: DecisionFactor[];
  scenarios: SituationScenario[];
  recommendations: string[];
}

export interface VerificationExplanation {
  summary: string;
  claimSummaries: Array<{
    claimId: string;
    text: string;
    verdict: VerdictType;
    supportingEvidenceIds: string[];
    contradictingEvidenceIds: string[];
  }>;
  uncertaintyNotes: string[];
  coverageAssessment: string;
}

export type SelfVerificationQualityState = 'PASSED' | 'PASSED_WITH_WARNINGS' | 'FAILED' | 'UNAVAILABLE';

export interface SelfVerificationResult {
  state: SelfVerificationQualityState;
  checks: Array<{
    rule: string;
    passed: boolean;
    details?: string;
  }>;
  warnings: string[];
  errors: string[];
}

export interface ReliabilityAssessment {
  verdictStrength: 'HIGH' | 'MODERATE' | 'LOW' | 'UNVERIFIED';
  evidenceStrengthScore: NullableNumber;
  evidenceCoverageScore: NullableNumber;
  sourceQualityScore: NullableNumber;
  modelConfidence: NullableNumber;
  verdictProbability: NullableNumber;
  calibrationQuality: string;
  riskReductionNotes: string[];
}

export interface TraceEvent {
  id: string;
  timestamp: string;
  stage: string;
  input: any;
  output: any;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details?: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  originalInput: string;
  normalizedInput: string;
  questionNormalized?: string;
  claims: AtomicClaim[];
  research: ResearchResult;
  evidence: EvidenceItem[];
  verdict: VerdictType;
  verdictProbability: NullableNumber;
  modelConfidence: NullableNumber;
  explanation: VerificationExplanation;
  situation?: SituationResult;
  decision?: DecisionResult;
  selfVerification: SelfVerificationResult;
  reliability: ReliabilityAssessment;
  trace: TraceEvent[];
}

export type JarvisIntent =
  | 'CHAT'
  | 'VERIFY'
  | 'TEXT_VERIFY'
  | 'RESEARCH'
  | 'SITUATION'
  | 'DECISION'
  | 'CASE_LOOKUP'
  | 'TRACE_LOOKUP'
  | 'GRAPH_LOOKUP'
  | 'MULTIMODAL_VERIFY';

export type JarvisPresenceState =
  | 'STANDBY'
  | 'LISTENING'
  | 'THINKING'
  | 'RESEARCHING'
  | 'EXECUTING'
  | 'SPEAKING'
  | 'ERROR';

export interface JarvisResponse {
  intent: JarvisIntent;
  presence: JarvisPresenceState;
  responseText: string;
  analysisResult?: AnalysisResult;
  audioUrl?: string;
  suggestedActions?: string[];
}
