/**
 * Device Fingerprint & Anti-Abuse Shield — Fixprom
 * Generates hardware-level entropy (Canvas, WebGL, AudioContext, Screen, CPU)
 * to prevent multi-accounting across browsers and Incognito sessions on the same physical machine.
 */

import { supabase, isSupabaseConfigured } from './supabase';

const FP_STORAGE_KEY = 'fixprom_device_hash';
const FP_COOKIE_KEY = '__fixprom_dev_id';
const HW_STORAGE_KEY = 'fixprom_hw_hash';
const HW_COOKIE_KEY = '__fixprom_hw_id';
const TRIAL_CLAIMED_STORAGE_KEY = 'fixprom_trial_claimed_devices';
const TRIAL_CLAIMED_COOKIE_KEY = '__fixprom_trial_claimed';

// In-memory store for test suites and resilient runtime fallback
const inMemoryClaimedDevices = new Set<string>();
let mockDeviceHash: string | null = null;
let mockHardwareHash: string | null = null;

export function clearInMemoryFingerprintCache(): void {
  inMemoryClaimedDevices.clear();
  mockDeviceHash = null;
  mockHardwareHash = null;
}

export function setMockDeviceFingerprint(devHash: string | null, hwHash: string | null = null): void {
  mockDeviceHash = devHash;
  mockHardwareHash = hwHash || devHash;
}

/**
 * Generates an audio fingerprint using Web Audio API OfflineAudioContext
 * Highly stable across browsers on the same machine.
 */
async function getAudioFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return 'server_audio';
  try {
    const AudioCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    if (!AudioCtx) return 'no_audio';
    const ctx = new AudioCtx(1, 44100, 44100);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(10000, ctx.currentTime);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-50, ctx.currentTime);
    comp.knee.setValueAtTime(40, ctx.currentTime);
    comp.ratio.setValueAtTime(12, ctx.currentTime);
    comp.attack.setValueAtTime(0, ctx.currentTime);
    comp.release.setValueAtTime(0.25, ctx.currentTime);
    osc.connect(comp);
    comp.connect(ctx.destination);
    osc.start(0);
    const rendered = await ctx.startRendering();
    const output = rendered.getChannelData(0);
    let sum = 0;
    for (let i = 4500; i < 5000; i++) {
      sum += Math.abs(output[i]);
    }
    return `audio_${sum.toFixed(6)}`;
  } catch {
    return 'audio_err';
  }
}

/**
 * Generates a deterministic canvas hash
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no_canvas_ctx';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('FixpromAI_AntiAbuse_2026', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('FixpromAI_AntiAbuse_2026', 4, 17);

    return canvas.toDataURL();
  } catch {
    return 'canvas_error';
  }
}

/**
 * Retrieves WebGL vendor & renderer info
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return 'no_webgl';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'no_debug_info';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    return `${vendor}~${renderer}`;
  } catch {
    return 'webgl_error';
  }
}

/**
 * Reads a specific cookie by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Sets a persistent cookie (1 year expiry)
 */
function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  const maxAge = 365 * 24 * 60 * 60; // 1 year
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

/**
 * SHA-256 hash using Web Cryptography API
 */
async function sha256(message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback djb2 hash if crypto.subtle is unavailable
  let hash = 5381;
  for (let i = 0; i < message.length; i++) {
    hash = (hash * 33) ^ message.charCodeAt(i);
  }
  return `hash_${(hash >>> 0).toString(16)}`;
}

/**
 * Computes or retrieves persistent device fingerprint hash
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (mockDeviceHash) return mockDeviceHash;
  if (typeof window === 'undefined') return 'server_side_device';

  // 1. Check existing cookie or localStorage
  const existingCookie = getCookie(FP_COOKIE_KEY);
  if (existingCookie && existingCookie.length >= 16) {
    return existingCookie;
  }

  try {
    const existingStorage = localStorage.getItem(FP_STORAGE_KEY);
    if (existingStorage && existingStorage.length >= 16) {
      setCookie(FP_COOKIE_KEY, existingStorage);
      return existingStorage;
    }
  } catch {
    // ignore
  }

  // 2. Collect hardware & browser entropy
  const nav = navigator as any;
  const screen = window.screen;

  const entropyComponents = [
    nav.userAgent || '',
    nav.platform || '',
    nav.language || '',
    (nav.languages || []).join(','),
    screen ? `${screen.width}x${screen.height}x${screen.colorDepth}` : '',
    window.devicePixelRatio || 1,
    nav.hardwareConcurrency || 4,
    nav.deviceMemory || 8,
    nav.maxTouchPoints || 0,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    getCanvasFingerprint(),
    getWebGLFingerprint(),
  ];

  const rawEntropy = entropyComponents.join('||');
  const fingerprintHash = await sha256(rawEntropy);

  // Store in both persistent layers
  try {
    localStorage.setItem(FP_STORAGE_KEY, fingerprintHash);
  } catch { }
  setCookie(FP_COOKIE_KEY, fingerprintHash);

  return fingerprintHash;
}

/**
 * Generates an immutable hardware signature (GPU + Audio + Screen + Cores + RAM)
 * that stays consistent across browsers (Chrome, Edge, Brave, Incognito) on the same machine.
 */
export async function getHardwareFingerprint(): Promise<string> {
  if (mockHardwareHash) return mockHardwareHash;
  if (typeof window === 'undefined') return 'server_hardware_device';

  // 1. Check existing cookie or localStorage
  const existingCookie = getCookie(HW_COOKIE_KEY);
  if (existingCookie && existingCookie.length >= 16) {
    return existingCookie;
  }
  try {
    const existingStorage = localStorage.getItem(HW_STORAGE_KEY);
    if (existingStorage && existingStorage.length >= 16) {
      setCookie(HW_COOKIE_KEY, existingStorage);
      return existingStorage;
    }
  } catch { }

  const nav = navigator as any;
  const screen = window.screen;
  const audioFp = await getAudioFingerprint();
  const webglFp = getWebGLFingerprint();

  const hardwareComponents = [
    screen ? `${screen.width}x${screen.height}x${screen.colorDepth}` : '',
    screen ? `${screen.availWidth}x${screen.availHeight}` : '',
    nav.hardwareConcurrency || 4,
    nav.deviceMemory || 8,
    nav.maxTouchPoints || 0,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    webglFp,
    audioFp,
  ];

  const hwHash = await sha256(`HW::${hardwareComponents.join('||')}`);
  try {
    localStorage.setItem(HW_STORAGE_KEY, hwHash);
  } catch { }
  setCookie(HW_COOKIE_KEY, hwHash);

  return hwHash;
}

export interface TrialEligibilityResult {
  eligible: boolean;
  reason?: 'ALLOWED' | 'DEVICE_ALREADY_USED_TRIAL' | 'TRIAL_USED_COOKIE' | 'DATABASE_BLOCKED' | 'IP_NETWORK_ALREADY_USED_TRIAL';
  messageId: string;
  messageEn: string;
}

/**
 * Checks if the current physical device or browser is eligible to claim a free trial
 */
export async function checkTrialDeviceEligibility(email?: string): Promise<TrialEligibilityResult> {
  const allowedResult: TrialEligibilityResult = {
    eligible: true,
    reason: 'ALLOWED',
    messageId: 'Perangkat memenuhi syarat untuk Free Trial.',
    messageEn: 'Device is eligible for Free Trial.',
  };

  const blockedMessage = {
    messageId: 'Perangkat atau jaringan internet Anda telah menggunakan kuota Free Trial. Silakan upgrade ke Creator Pro untuk melanjutkan.',
    messageEn: 'Your device or internet network has already used the Free Trial quota. Please upgrade to Creator Pro to continue.',
  };

  const deviceHash = await getDeviceFingerprint();
  const hardwareHash = await getHardwareFingerprint();

  // 1. In-memory check (fastest, supports test suites & runtime fallback)
  if (inMemoryClaimedDevices.has(deviceHash) || inMemoryClaimedDevices.has(hardwareHash)) {
    return {
      eligible: false,
      reason: 'DEVICE_ALREADY_USED_TRIAL',
      ...blockedMessage,
    };
  }

  // 2. Cookie mark check
  const cookieTrialUsed = getCookie(TRIAL_CLAIMED_COOKIE_KEY);
  if (cookieTrialUsed === '1') {
    return {
      eligible: false,
      reason: 'TRIAL_USED_COOKIE',
      ...blockedMessage,
    };
  }

  // 3. localStorage list check
  try {
    const claimedListRaw = localStorage.getItem(TRIAL_CLAIMED_STORAGE_KEY);
    if (claimedListRaw) {
      const list: string[] = JSON.parse(claimedListRaw);
      if (Array.isArray(list) && (list.includes(deviceHash) || list.includes(hardwareHash))) {
        return {
          eligible: false,
          reason: 'DEVICE_ALREADY_USED_TRIAL',
          ...blockedMessage,
        };
      }
    }
  } catch { }

  // 4. Server-Side Edge Check (IP + Hardware Signature via /api/check-device)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(
      `/api/check-device?deviceHash=${encodeURIComponent(deviceHash)}&hardwareHash=${encodeURIComponent(hardwareHash)}&email=${encodeURIComponent(email || '')}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const edgeData = await res.json();
      if (edgeData.eligible === false) {
        markDeviceTrialClaimedLocally(deviceHash);
        markDeviceTrialClaimedLocally(hardwareHash);
        return {
          eligible: false,
          reason: edgeData.reason || 'DATABASE_BLOCKED',
          messageId: edgeData.messageId || blockedMessage.messageId,
          messageEn: edgeData.messageEn || blockedMessage.messageEn,
        };
      }
    }
  } catch {
    // If edge check fails, fallback to direct Supabase RPC
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('check_or_register_trial_device', {
          p_device_hash: deviceHash,
          p_email: email || null,
          p_ip: null,
          p_hardware_hash: hardwareHash,
        });

        if (!error && data && data.allowed === false) {
          markDeviceTrialClaimedLocally(deviceHash);
          markDeviceTrialClaimedLocally(hardwareHash);
          return {
            eligible: false,
            reason: 'DATABASE_BLOCKED',
            ...blockedMessage,
          };
        }
      } catch (e) {
        console.warn('Device verification RPC fallback', e);
      }
    }
  }

  return allowedResult;
}

/**
 * Marks the device as having claimed the Free Trial
 */
export async function markDeviceTrialClaimed(email?: string): Promise<void> {
  const deviceHash = await getDeviceFingerprint();
  const hardwareHash = await getHardwareFingerprint();
  markDeviceTrialClaimedLocally(deviceHash);
  markDeviceTrialClaimedLocally(hardwareHash);

  // Sync to Supabase table
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('device_trial_fingerprints').upsert(
        {
          device_hash: deviceHash,
          hardware_hash: hardwareHash,
          first_email: email || null,
          trial_claimed_at: new Date().toISOString(),
        },
        { onConflict: 'device_hash' }
      );
    } catch { }
  }
}

function markDeviceTrialClaimedLocally(deviceHash: string): void {
  // 1. In-memory mark
  inMemoryClaimedDevices.add(deviceHash);

  // 2. Set 1-year cookie
  setCookie(TRIAL_CLAIMED_COOKIE_KEY, '1');

  // 3. Set localStorage
  try {
    const claimedListRaw = localStorage.getItem(TRIAL_CLAIMED_STORAGE_KEY);
    let list: string[] = [];
    if (claimedListRaw) {
      list = JSON.parse(claimedListRaw);
      if (!Array.isArray(list)) list = [];
    }
    if (!list.includes(deviceHash)) {
      list.push(deviceHash);
      localStorage.setItem(TRIAL_CLAIMED_STORAGE_KEY, JSON.stringify(list));
    }
  } catch { }
}
