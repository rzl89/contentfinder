import crypto from 'crypto';

/**
 * ============================================================================
 * SECURE CREDENTIAL VAULT (ENVELOPE ENCRYPTION SPECIFICATION)
 * ============================================================================
 *
 * Implements AES-256-GCM Envelope Encryption for user BYOK API keys.
 * Master Key must reside in a managed Cloud KMS (Google Cloud KMS, AWS KMS, or Vault).
 *
 * Plaintext keys:
 * - NEVER stored in browser storage (localStorage, sessionStorage, IndexedDB).
 * - NEVER written to logs, exports, or error payloads.
 * - Stored in memory only briefly inside trusted backend during active provider dispatch.
 */

export interface EncryptedVaultPayload {
  keyId: string;
  provider: string;
  maskedSuffix: string;
  iv: string; // Hex
  authTag: string; // Hex
  encryptedData: string; // Hex
  encryptedDataKey: string; // Hex (encrypted with KMS master key)
  createdAt: string;
  lastUsedAt?: string;
}

export interface KMSAdapter {
  isConfigured: () => boolean;
  encryptDataKey: (plainDataKey: Buffer) => Promise<Buffer>;
  decryptDataKey: (encryptedDataKey: Buffer) => Promise<Buffer>;
}

// Allowlisted provider endpoints to eliminate SSRF attack vectors
export const ALLOWED_PROVIDER_ORIGINS: Record<string, string[]> = {
  openai: ['https://api.openai.com/v1/'],
  google_veo: ['https://generativelanguage.googleapis.com/', 'https://vertexai.googleapis.com/'],
  kling: ['https://api.klingai.com/v1/'],
  runway: ['https://api.dev.runwayml.com/v1/'],
  luma: ['https://api.lumalabs.ai/dream-machine/v1/'],
};

/**
 * Standard Mock KMS Adapter for local development / testing.
 * When KMS environment secret is not set, isConfigured() returns false.
 */
export class LocalKMSAdapter implements KMSAdapter {
  private masterKey: Buffer | null = null;

  constructor() {
    const secret = process.env.KMS_MASTER_KEY;
    if (secret && secret.length >= 32) {
      this.masterKey = Buffer.from(secret.slice(0, 32), 'utf-8');
    }
  }

  isConfigured(): boolean {
    return this.masterKey !== null;
  }

  async encryptDataKey(plainDataKey: Buffer): Promise<Buffer> {
    if (!this.masterKey) throw new Error('KMS not configured. Direct key storage disabled.');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);
    const encrypted = Buffer.concat([cipher.update(plainDataKey), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]);
  }

  async decryptDataKey(encryptedPayload: Buffer): Promise<Buffer> {
    if (!this.masterKey) throw new Error('KMS not configured.');
    const iv = encryptedPayload.subarray(0, 12);
    const tag = encryptedPayload.subarray(12, 28);
    const ciphertext = encryptedPayload.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  }
}

/**
 * Encrypts an API key using AES-256-GCM with a newly generated per-record Data Key (Envelope pattern).
 */
export async function encryptApiKey(
  plainApiKey: string,
  provider: string,
  kms: KMSAdapter
): Promise<EncryptedVaultPayload> {
  if (!kms.isConfigured()) {
    throw new Error('ENVELOPE_KMS_UNCONFIGURED: Master KMS key is not set. BYOK cannot be activated.');
  }

  // 1. Generate 256-bit ephemeral Data Key
  const dataKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  // 2. Encrypt plaintext key with Data Key
  const cipher = crypto.createCipheriv('aes-256-gcm', dataKey, iv);
  const encryptedData = Buffer.concat([cipher.update(plainApiKey, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // 3. Encrypt Data Key using KMS Master Key
  const encryptedDataKey = await kms.encryptDataKey(dataKey);

  // Mask key: show only last 4 chars
  const cleanKey = plainApiKey.trim();
  const maskedSuffix = cleanKey.length > 4 ? cleanKey.slice(-4) : '****';

  return {
    keyId: `vault_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    provider,
    maskedSuffix: `...${maskedSuffix}`,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encryptedData.toString('hex'),
    encryptedDataKey: encryptedDataKey.toString('hex'),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Decrypts an API key in secure backend memory immediately prior to upstream provider request.
 */
export async function decryptApiKey(
  payload: EncryptedVaultPayload,
  kms: KMSAdapter
): Promise<string> {
  if (!kms.isConfigured()) {
    throw new Error('ENVELOPE_KMS_UNCONFIGURED');
  }

  // 1. Decrypt Data Key via KMS
  const encryptedDataKeyBuf = Buffer.from(payload.encryptedDataKey, 'hex');
  const plainDataKey = await kms.decryptDataKey(encryptedDataKeyBuf);

  // 2. Decipher actual payload
  const iv = Buffer.from(payload.iv, 'hex');
  const tag = Buffer.from(payload.authTag, 'hex');
  const ciphertext = Buffer.from(payload.encryptedData, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', plainDataKey, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Redacts secrets from headers or logs before output.
 */
export function redactSecretHeaders(headers: Record<string, string>): Record<string, string> {
  const redacted = { ...headers };
  const sensitiveKeys = ['authorization', 'x-api-key', 'api-key', 'bearer'];

  for (const k of Object.keys(redacted)) {
    if (sensitiveKeys.includes(k.toLowerCase())) {
      redacted[k] = '[REDACTED_BY_FIXPROM_VAULT]';
    }
  }

  return redacted;
}
