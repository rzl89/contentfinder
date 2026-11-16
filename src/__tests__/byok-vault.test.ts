import { describe, it, expect } from 'vitest';
import {
  encryptApiKey,
  decryptApiKey,
  redactSecretHeaders,
  ALLOWED_PROVIDER_ORIGINS,
  LocalKMSAdapter,
} from '../../server/security/credential-vault';

describe('BYOK Security & Envelope Encryption Vault', () => {
  it('should prevent encryption when KMS is unconfigured', async () => {
    // Adapter without key
    const unconfiguredKms = new LocalKMSAdapter();
    expect(unconfiguredKms.isConfigured()).toBe(false);

    await expect(
      encryptApiKey('sk-sample-test-key-12345', 'runway', unconfiguredKms)
    ).rejects.toThrow('ENVELOPE_KMS_UNCONFIGURED');
  });

  it('should encrypt and decrypt using envelope pattern when KMS master key is present', async () => {
    process.env.KMS_MASTER_KEY = 'a'.repeat(32); // 32 byte master key for AES-256
    const configuredKms = new LocalKMSAdapter();
    expect(configuredKms.isConfigured()).toBe(true);

    const plainKey = 'sk-runway-live-key-secret-9988';
    const encryptedPayload = await encryptApiKey(plainKey, 'runway', configuredKms);

    expect(encryptedPayload.keyId).toBeDefined();
    expect(encryptedPayload.maskedSuffix).toBe('...9988');
    expect(encryptedPayload.encryptedData).not.toContain(plainKey);
    expect(encryptedPayload.encryptedDataKey).toBeDefined();

    // Decrypt in secure backend memory
    const decrypted = await decryptApiKey(encryptedPayload, configuredKms);
    expect(decrypted).toBe(plainKey);
  });

  it('should redact sensitive authorization headers from logs', () => {
    const rawHeaders = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer sk-super-secret-12345',
      'X-Api-Key': 'secret-key-abc',
      'User-Agent': 'Fixprom-Studio/1.0',
    };

    const redacted = redactSecretHeaders(rawHeaders);
    expect(redacted.Authorization).toBe('[REDACTED_BY_FIXPROM_VAULT]');
    expect(redacted['X-Api-Key']).toBe('[REDACTED_BY_FIXPROM_VAULT]');
    expect(redacted['Content-Type']).toBe('application/json');
  });

  it('should maintain strict allowlist origins to eliminate SSRF attack vectors', () => {
    expect(ALLOWED_PROVIDER_ORIGINS.openai).toContain('https://api.openai.com/v1/');
    expect(ALLOWED_PROVIDER_ORIGINS.google_veo).toContain('https://generativelanguage.googleapis.com/');
    expect(ALLOWED_PROVIDER_ORIGINS.runway).toContain('https://api.dev.runwayml.com/v1/');
    expect(ALLOWED_PROVIDER_ORIGINS.kling).toContain('https://api.klingai.com/v1/');
    expect(ALLOWED_PROVIDER_ORIGINS.luma).toContain('https://api.lumalabs.ai/dream-machine/v1/');
  });
});
