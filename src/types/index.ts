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
  | 'anime_ghibli'
  | '3d_animation'
  | '2d_cartoon'
  | '2d_animation'
  | 'anime'
  | 'claymation'
  | '3d_product_commercial'
  | 'vintage_35mm'
  | 'neon_music_video'
  | 'documentary_realism'
  | 'stickman'
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
  | '5s'
  | '10s'
  | '15s'
  | '30s'
  | '60s'
  | '90s'
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
  nameEn?: string;
  description: string;
  descriptionEn?: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  /** Grouping label for the sidebar (e.g. "Emotional", "Educational"). */
  group: string;
  groupEn?: string;
  subcategories: CategorySubcategory[];
  /** High-level storytelling framework (e.g. "3-act micro-arc"). */
  creativeFramework: string;
  creativeFrameworkEn?: string;
  /** Recommended hook style (e.g. "question", "shock_statement", "visual_mystery"). */
  hookStyle: string;
  hookStyleEn?: string;
  /** Visual direction notes for this category. */
  visualGuidance: string;
  visualGuidanceEn?: string;
  /** Global mixed cultural and architectural guidance. */
  globalGuidance?: string;
  globalGuidanceEn?: string;
  suggestedDuration: DurationRange[];
  exampleIdeas: string[];
  exampleIdeasEn?: string[];
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
  storyboardType?: 'clip' | 'ad';
  categoryId: string;
  subcategoryId?: string;
  saved: boolean;
  creativeFramework?: string;
  hookStyle?: string;
  globalGuidance?: string;
  productReferenceImages?: string[];
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
  ideaCount: number;
  storyboardType?: 'clip' | 'ad';
  ideaMode?: 'ai_generate' | 'manual_input';
  productBrandName?: string;
  targetModel?: string;
  creativeFramework?: string;
  hookStyle?: string;
  globalGuidance?: string;
  productReferenceImages?: string[];
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
  action?: string;
  reaction?: string;
  keyObject?: string;
  emotion?: string;
  voiceoverLine?: string;
  timeHint?: string;
}

// ---------------------------------------------------------------------------
// Storyboard Master Prompt Types (FlowStoryboard-Pro)
// ---------------------------------------------------------------------------

export interface StoryboardPanelItem {
  panel: number;
  beat: string;
  shot_type: string;
  camera: string;
  description: string;
  action?: string;
  reaction?: string;
  time_hint?: string;
  key_object?: string;
  emotion?: string;
  voiceover?: string;
}

export interface StoryboardOnScreenPlacement {
  panel?: number;
  appears_at?: string;
  text: string;
  style?: string;
  animation?: string;
}

export interface StoryboardIngredientRef {
  id: string;
  description: string;
  used_in_panels?: number[];
}

export interface StoryboardImagePromptJSON {
  task: string;
  style: string;
  aspect_ratio: string;
  header?: {
    video_title?: string;
    total_video_time?: string;
    shots_count?: number;
    keywords?: string[];
    legend_icons?: string[];
  };
  grid_layout: {
    total_panels: number;
    rows: number;
    columns: number;
    reading_order: string;
    panel_borders: string;
    panel_numbers: string;
  };
  global_consistency: {
    anchor_description: string;
    color_palette: string;
    lighting: string;
    environment: string;
  };
  on_screen_text: {
    rule: string;
    placements: StoryboardOnScreenPlacement[];
  };
  ingredients_references: StoryboardIngredientRef[];
  panels: StoryboardPanelItem[];
  negative_prompt: string;
}

export interface StoryboardTimelineEntry {
  frame_ref: string;
  time: string;
  action: string;
  camera_move: string;
  motion_intensity: string;
  transition_to_next: string;
  audio: string;
}

export interface StoryboardVideoPromptJSON {
  task: string;
  source_image: string;
  style: string;
  aspect_ratio: string;
  duration_seconds: number;
  ingredients_references: string[];
  on_screen_text: {
    rule: string;
    placements: StoryboardOnScreenPlacement[];
  };
  timeline: StoryboardTimelineEntry[];
  audio_design: {
    music_mood: string;
    sfx_layers: string;
    voiceover: {
      coverage_rule: string;
      voice_match_rule: string;
      lines: Array<{ time: string; line: string }>;
      total_word_limit: string;
    };
    dialogue_for_cinematic?: string;
  };
  consistency_lock: string;
  negative_prompt: string;
}

export interface StoryboardValidationReport {
  timingTotal10s: boolean;
  anchorConsistent: boolean;
  ingredientRefsMatch: boolean;
  styleAspectIdentical: boolean;
  onScreenTextRuleCompliant: boolean;
  voiceoverRuleCompliant: boolean;
  timestamp: string;
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
  creativeFramework?: string;
  hookStyle?: string;
  globalGuidance?: string;
  productReferenceImages?: string[];
  masterStoryboardImagePrompt?: StoryboardImagePromptJSON | string;
  masterStoryboardVideoPrompt?: StoryboardVideoPromptJSON | string;
  storyboardPlanSummary?: string[];
  storyboardValidationReport?: StoryboardValidationReport;
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
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  platform: Platform;
  region: string;
  regionEn?: string;
  observedAt: string; // ISO-8601
  sourceUrl: string;
  format: string;
  formatEn?: string;
  evidence: string;
  evidenceEn?: string;
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
export type PaymentMethodType =
  | 'bca'
  | 'mandiri'
  | 'bri'
  | 'bni'
  | 'bsi'
  | 'cimb'
  | 'qris'
  | 'gopay'
  | 'dana'
  | 'ovo'
  | 'shopeepay'
  | (string & {});

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
