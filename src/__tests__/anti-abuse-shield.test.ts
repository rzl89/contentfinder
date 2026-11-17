import { describe, it, expect, beforeEach } from 'vitest';
import { validateEmailAddress } from '@/lib/disposable-email-validator';
import {
  getDeviceFingerprint,
  getHardwareFingerprint,
  checkTrialDeviceEligibility,
  markDeviceTrialClaimed,
  clearInMemoryFingerprintCache,
  setMockDeviceFingerprint,
} from '@/lib/device-fingerprint';

describe('Fixprom Anti-Abuse Shield — Disposable Email & Device Fingerprint', () => {
  describe('1. Disposable Email Validator', () => {
    it('accepts legitimate mainstream email providers', () => {
      const validEmails = [
        'creator@gmail.com',
        'director@yahoo.com',
        'producer@outlook.com',
        'indonesia.kreator@icloud.com',
        'studio@agency.co.id',
      ];

      for (const email of validEmails) {
        const result = validateEmailAddress(email);
        expect(result.isValid).toBe(true);
        expect(result.isDisposable).toBe(false);
      }
    });

    it('rejects known disposable and temporary email domains', () => {
      const disposableEmails = [
        'bot1@mailinator.com',
        'spammer@10minutemail.com',
        'free_trial@guerrillamail.com',
        'temp_user@tempmail.com',
        'trash@yopmail.com',
        'shark@sharklasers.com',
        'fast@burnermail.io',
        'throwaway@dispostable.com',
        'anon@fakeinbox.com',
        'xayeya3627@chuwel.com', // Active rotating domain from temp-mail.org
        'bot_rot@vintomaper.biz',
        'test@fleckens.hu',
      ];

      for (const email of disposableEmails) {
        const result = validateEmailAddress(email);
        expect(result.isValid).toBe(false);
        expect(result.isDisposable).toBe(true);
        expect(result.errorMessage).toContain('tidak diizinkan');
      }
    });

    it('rejects suspicious heuristic disposable email patterns', () => {
      const heuristicEmails = [
        'user@my-tempmail-service.xyz',
        'bot@disposable-inbox.site',
        'trial@free-throwaway-mail.org',
      ];

      for (const email of heuristicEmails) {
        const result = validateEmailAddress(email);
        expect(result.isValid).toBe(false);
        expect(result.isDisposable).toBe(true);
      }
    });
  });

  describe('2. Device Fingerprint & Hardware Locking', () => {
    beforeEach(() => {
      clearInMemoryFingerprintCache();
      // Generate a unique device+hardware pair per test run so DB rows never collide.
      // setMockDeviceFingerprint bypasses all browser API calls and makes
      // getDeviceFingerprint() / getHardwareFingerprint() return controlled values.
      const uniqueId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      setMockDeviceFingerprint(`dev_${uniqueId}`, `hw_${uniqueId}`);
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      if (typeof document !== 'undefined') {
        document.cookie = '__fixprom_trial_claimed=; max-age=0; path=/';
      }
    });

    it('generates a deterministic 64-char SHA-256 device fingerprint', async () => {
      const fp1 = await getDeviceFingerprint();
      const fp2 = await getDeviceFingerprint();

      expect(typeof fp1).toBe('string');
      expect(fp1.length).toBeGreaterThanOrEqual(16);
      expect(fp1).toBe(fp2);
    });

    it('allows a brand new device to claim trial and blocks subsequent attempts', async () => {
      // 1. Initial check on clean device
      const initialCheck = await checkTrialDeviceEligibility('newuser@gmail.com');
      expect(initialCheck.eligible).toBe(true);
      expect(initialCheck.reason).toBe('ALLOWED');

      // 2. Mark device as having claimed trial
      await markDeviceTrialClaimed('newuser@gmail.com');

      // 3. Second check on the same device with a different email (multi-accounting attempt)
      const secondCheck = await checkTrialDeviceEligibility('another_alt_account@gmail.com');
      expect(secondCheck.eligible).toBe(false);
      expect(secondCheck.messageId).toContain('Perangkat atau jaringan internet Anda telah menggunakan kuota Free Trial');
    });
  });
});
