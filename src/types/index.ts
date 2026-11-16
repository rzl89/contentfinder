// ============================================================================
// Fixprom — Type Definitions
// ============================================================================

// ---------------------------------------------------------------------------
// Core Enums / Union Types
// ---------------------------------------------------------------------------

export type EnvironmentType =
  | 'urban'
  | 'suburban'
  | 'rural'
  | 'public_space'
  | 'natural'
  | 'indoor'
  | 'historical'
  | 'fantasy'
  | 'futuristic'
  | 'mixed';

export type VisualStyle =
  | 'cinematic_realistic'
  | '3d_animation'
  | '2d_animation'
  | 'stickman'
  | 'anime'
  | 'stylized'
  | 'surreal_fantasy'
  | 'minimalist_faceless';

export type ContextProfilePreset =
  | 'indonesia_natural'
  | 'indonesia_urban'
  | 'indonesia_rural'
  | 'global_neutral'
  | 'southeast_asia'
  | 'fantasy_custom';

export type Platform =
  | 'tiktok'
  | 'instagram_reels'
  | 'youtube_shorts'
  | 'facebook_reels'
  | 'multi_platform'
  | 'custom';

export type DurationRange =
  | '10-15s'
  | '15-30s'
  | '30-60s'
  | '1-3min'
  | 'custom';

export type TrendApproach =
  | 'trend_first'       // Start from a trending format and adapt content to it
  | 'topic_first'       // Start from the topic and find a trending wrapper
  | 'evergreen'         // Ignore trends, focus on timeless content
  | 'hybrid';           // Blend trending format with evergreen substance

export type DialogLanguage =
  | 'indonesian'
  | 'javanese'
  | 'sundanese'
  | 'english'
  | 'malay'
  | 'none'             // No dialogue (text overlay / narration only)
  | 'mixed';           // Code-switching, e.g. Indonesian + English

// ---------------------------------------------------------------------------
// Context Profile
// ---------------------------------------------------------------------------

/** Localization hints embedded in a context profile. */
export interface ContextLocalization {
  /** Default region for location suggestions (e.g. "Indonesia", "Southeast Asia"). */
  region: string;
  /** Cultural notes the LLM should respect when generating ideas/scenes. */
  culturalNotes: string[];
  /** Names pool style — e.g. "indonesian_common", "global_neutral". */
  namingConvention: string;
  /** Currency symbol used in price/business scenarios. */
  currency: string;
  /** Landscape / nature descriptors typical for the region. */
  typicalLandscapes: string[];
}

export interface ContextProfile {
  id: string;
  name: string;
  targetMarket: string;
  environment: EnvironmentType;
  visualStyle: VisualStyle;
  dialogLanguage: DialogLanguage;
  captionLanguage: string;
  /** Prompt language is always English for maximum model compatibility. */
  promptLanguage: 'en';
  localization: ContextLocalization;
  preset: ContextProfilePreset;
  /** Optional per-project overrides that patch any field above. */
  overrides?: Partial<Omit<ContextProfile, 'id' | 'overrides'>>;
}

// ---------------------------------------------------------------------------
// Content Categories
// ---------------------------------------------------------------------------

export interface CategorySubcategory {
  id: string;
  name: string;
  description: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  description: string;
  /** Grouping label for the sidebar (e.g. "Emotional", "Educational"). */
  group: string;
  subcategories: CategorySubcategory[];
  /** High-level storytelling framework (e.g. "3-act micro-arc"). */
  creativeFramework: string;
  /** Recommended hook style (e.g. "question", "shock_statement", "visual_mystery"). */
  hookStyle: string;
  /** Visual direction notes for this category. */
  visualGuidance: string;
  /** Indonesia-specific creative guidance (optional). */
  indonesiaGuidance?: string;
  suggestedDuration: DurationRange[];
  exampleIdeas: string[];
  icon: string;
}

// ---------------------------------------------------------------------------
// Content Ideas
// ---------------------------------------------------------------------------

export interface ContentIdea {
  id: string;
  title: string;
  hook: string;
  premise: string;
  synopsis: string;
  storyBeats: string[];
  conflict: string;
  ending: string;
  estimatedDuration: DurationRange;
  visualStyle: VisualStyle;
  suggestedLocation: string;
  localizationNotes: string;
  creativeRationale: string;
  trendEvidence?: string;
  categoryId: string;
  subcategoryId?: string;
  saved: boolean;
  createdAt: string; // ISO-8601
}

export interface IdeaGenerationConfig {
  projectId?: string;
  categoryId: string;
  subcategoryId?: string;
  platform: Platform;
  duration: DurationRange;
  visualStyle: VisualStyle;
  contextProfile: ContextProfile;
  dialogLanguage: DialogLanguage;
  trendApproach: TrendApproach;
  additionalTheme?: string;
  targetAudience?: string;
  ideaCount: 5 | 10;
}

// ---------------------------------------------------------------------------
// Character & World Bibles
// ---------------------------------------------------------------------------

export interface CharacterBible {
  id: string;
  projectId: string;
  name: string;
  age?: number;
  gender?: string;
  appearance: string;
  clothing: string;
  personality: string;
  role: string;
  backstory?: string;
  voiceStyle?: string;
  photoReference?: string;
  /** Visual anchors that must stay consistent across scenes. */
  consistencyAnchors: string[];
}

export interface WorldBible {
  id: string;
  projectId: string;
  name: string;
  environmentType: EnvironmentType;
  description: string;
  timeOfDay: string;
  weather: string;
  props: string[];
  rules: string[];
  moodAndTone: string;
  colorPalette: string[];
}

// ---------------------------------------------------------------------------
// Scene System
// ---------------------------------------------------------------------------

export interface SceneLocation {
  environmentType: EnvironmentType;
  description: string;
  specificPlace?: string;
  region?: string;
  timeOfDay: string;
  weather: string;
}

export interface SceneCamera {
  shot: string;
  angle: string;
  movement: string;
  framing: string;
}

export interface Scene {
  id: string;
  projectId: string;
  sceneNumber: number;
  beatTitle: string;
  purpose: string;
  summary: string;
  location: SceneLocation;
  characterActions: string;
  props: string[];
  dialogue?: string;
  narration?: string;
  camera: SceneCamera;
  lighting: string;
  /** Cross-scene consistency references (e.g. "character wears same red scarf"). */
  continuityAnchors: string[];
  imagePrompt: string;
  videoPrompt: string;
  negativePrompt: string;
  locked: boolean;
}

// ---------------------------------------------------------------------------
// Model Capabilities
// ---------------------------------------------------------------------------

export interface ModelCapability {
  modelId: string;
  provider: string;
  displayName: string;
  supportedDurations: string[];
  aspectRatios: string[];
  resolutions: string[];
  audioMode: string;
  dialogueLipSync: boolean | 'unknown';
  inputTypes: string[];
  maxReferences: number | 'unknown';
  endpointAvailable: boolean;
  regions: string[];
  commercialUse: boolean | 'unknown';
  documentationUrl: string;
  lastVerifiedAt: string; // ISO-8601
  verificationStatus: 'verified' | 'unknown' | 'needs_verification';
}

// ---------------------------------------------------------------------------
// Quality Control
// ---------------------------------------------------------------------------

export type QCStatus = 'PASS' | 'REVIEW' | 'FAIL';

export interface QCIssue {
  field: string;
  severity: QCStatus;
  message: string;
  suggestion?: string;
}

export interface QCResult {
  overallStatus: QCStatus;
  issues: QCIssue[];
  checkedAt: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  categoryId: string;
  contextProfile: ContextProfile;
  selectedIdea?: ContentIdea;
  characters: CharacterBible[];
  worldBible?: WorldBible;
  scenes: Scene[];
  qcResult?: QCResult;
  targetModel?: string;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// Trends
// ---------------------------------------------------------------------------

export interface TrendObservation {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  region: string;
  observedAt: string; // ISO-8601
  sourceUrl: string;
  format: string;
  evidence: string;
  status: 'verified_trend' | 'trend_inspired' | 'evergreen' | 'unverified';
  categoryRelevance: string[];
}

// ---------------------------------------------------------------------------
// Provider Credentials
// ---------------------------------------------------------------------------

export interface ProviderCredential {
  id: string;
  provider: string;
  maskedKey: string;
  status: 'active' | 'inactive' | 'unconfigured';
  createdAt: string; // ISO-8601
  lastUsedAt?: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// Video Generation
// ---------------------------------------------------------------------------

export type VideoJobStatus =
  | 'queued'
  | 'submitted'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'expired';

export interface VideoGenerationJob {
  id: string;
  projectId: string;
  sceneNumber: number;
  modelId: string;
  status: VideoJobStatus;
  providerJobId?: string;
  outputUrl?: string;
  error?: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string | number;
}

// ---------------------------------------------------------------------------
// Subscription & Monetization
// ---------------------------------------------------------------------------

export type PlanTier = 'free' | 'pro' | 'studio';
export type BillingCycle = 'monthly' | 'yearly';
export type PaymentMethodType = 'bca' | 'mandiri' | 'bri' | 'qris' | 'gopay' | 'dana' | 'shopeepay';

export interface SubscriptionOrder {
  invoiceNumber: string;
  planTier: PlanTier;
  billingCycle: BillingCycle;
  amount: number;
  uniqueCode: number;
  totalAmount: number;
  paymentMethod: PaymentMethodType;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export interface UserSubscription {
  tier: PlanTier;
  billingCycle?: BillingCycle;
  status: 'active' | 'trial' | 'expired' | 'pending_verification';
  trialStartedAt: string;
  trialEndsAt: string;
  expiresAt?: string;
  creditsBalance?: number;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  balanceAfter: number;
  actionType: string;
  description?: string;
  createdAt: string;
}

export interface TopUpPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  description: string;
}
