/**
 * Serverless Device & IP Eligibility Check — Fixprom Anti-Abuse Shield
 * Validates hardware fingerprint and client IP address to enforce:
 * Exactly 1 Free Trial account per physical machine and network.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://uoxoljiucezwdpqfnuga.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveG9saml1Y2V6d2RwcWZudWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NTM4NzQsImV4cCI6MjExMDMyOTg3NH0.KR2gmO2jx0rQ4msUcFZmct9_eMzeLyqImUADqlnLWfo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Extract Real Public IP from Vercel edge headers
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || '').trim();

  const deviceHash = (req.query?.deviceHash || req.body?.deviceHash || '').trim();
  const hardwareHash = (req.query?.hardwareHash || req.body?.hardwareHash || '').trim();
  const email = (req.query?.email || req.body?.email || '').trim().toLowerCase();

  if (!deviceHash || deviceHash.length < 16) {
    return res.status(400).json({
      eligible: false,
      reason: 'INVALID_DEVICE_FINGERPRINT',
      message: 'Sidik jari perangkat tidak valid.',
    });
  }

  try {
    const { data, error } = await supabase.rpc('check_or_register_trial_device', {
      p_device_hash: deviceHash,
      p_email: email || null,
      p_ip: clientIp || null,
      p_hardware_hash: hardwareHash || null,
    });

    if (error) {
      console.warn('RPC check_or_register_trial_device error', error);
      // Fail closed or open safely
      return res.status(200).json({
        eligible: true,
        reason: 'FALLBACK_ALLOWED',
        clientIp,
      });
    }

    if (data && data.allowed === false) {
      return res.status(200).json({
        eligible: false,
        reason: data.reason || 'DEVICE_ALREADY_USED_TRIAL',
        clientIp,
        messageId:
          'Perangkat atau jaringan internet Anda telah menggunakan kuota Free Trial. Silakan upgrade ke Creator Pro untuk melanjutkan.',
        messageEn:
          'Your device or internet network has already claimed a Free Trial. Please upgrade to Creator Pro to continue.',
      });
    }

    return res.status(200).json({
      eligible: true,
      reason: data?.reason || 'NEW_DEVICE_REGISTERED',
      clientIp,
    });
  } catch (err) {
    console.error('Error verifying device eligibility', err);
    return res.status(200).json({
      eligible: true,
      reason: 'RPC_ERROR_FALLBACK',
      clientIp,
    });
  }
}
