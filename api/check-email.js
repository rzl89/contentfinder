/**
 * Serverless Anti-Abuse Email Check — Fixprom
 * Validates whether an email domain belongs to any of the 108,000+ known
 * disposable, burner, or temporary email providers.
 */

import fs from 'fs';
import path from 'path';

let cachedDomainsSet = null;

function getDomainsSet() {
  if (cachedDomainsSet) return cachedDomainsSet;
  try {
    const jsonPath = path.join(process.cwd(), 'api', 'disposable-domains.json');
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf8');
      const list = JSON.parse(raw);
      cachedDomainsSet = new Set(list);
      return cachedDomainsSet;
    }
  } catch (e) {
    console.warn('Failed to load full disposable-domains.json', e);
  }
  return new Set();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const email = (req.query?.email || req.body?.email || '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return res.status(400).json({
      valid: false,
      disposable: false,
      message: 'Format email tidak valid.',
    });
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return res.status(400).json({
      valid: false,
      disposable: false,
      message: 'Format email tidak valid.',
    });
  }

  const domain = parts[1];
  const domainsSet = getDomainsSet();

  // 1. Direct match in 108,000+ domain database (includes chuwel.com)
  const isMatch = domainsSet.has(domain);

  // 2. Pattern check
  const isPatternMatch =
    /temp-?mail|disposable|throwaway|trash-?mail|10minute|burner|guerrilla|mailinator|yopmail|sharklaser|chuwel/i.test(
      domain
    );

  if (isMatch || isPatternMatch) {
    return res.status(200).json({
      valid: true,
      disposable: true,
      domain,
      message:
        'Penyedia email sementara (disposable/temp email) tidak diizinkan. Silakan gunakan penyedia email resmi (Gmail, Yahoo, Outlook, iCloud, atau email kantor) untuk mengklaim Free Trial.',
      messageEn:
        'Disposable or temporary email services are not permitted. Please use a verified standard email provider (Gmail, Yahoo, Outlook, iCloud, or company email) to claim your Free Trial.',
    });
  }

  return res.status(200).json({
    valid: true,
    disposable: false,
    domain,
  });
}
