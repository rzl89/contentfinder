/**
 * Serverless Duitku Webhook Callback Handler — Fixprom
 * Receives payment status from Duitku server, verifies HMAC-SHA256 signature,
 * and automatically upgrades the customer's subscription to Pro.
 * Documentation source: Context 7 (/websites/duitku_api_id)
 */

import crypto from 'crypto';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://uoxoljiucezwdpqfnuga.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveG9saml1Y2V6d2RwcWZudWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NTM4NzQsImV4cCI6MjExMDMyOTg3NH0.KR2gmO2jx0rQ4msUcFZmct9_eMzeLyqImUADqlnLWfo';

async function fetchDuitkuApiKeys() {
  const keys = new Set();
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_settings?key=eq.duitku_config&select=value`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows.length > 0 && rows[0].value) {
        const val = rows[0].value;
        if (val.apiKey) keys.add(val.apiKey.trim());
        if (val.sandboxApiKey) keys.add(val.sandboxApiKey.trim());
        if (val.prodApiKey) keys.add(val.prodApiKey.trim());
      }
    }
  } catch (err) {
    console.error('Failed to query duitku_config in webhook:', err);
  }

  // Also include environment variable fallbacks
  if (process.env.DUITKU_API_KEY) keys.add(process.env.DUITKU_API_KEY.trim());
  if (process.env.DUITKU_SANDBOX_API_KEY) keys.add(process.env.DUITKU_SANDBOX_API_KEY.trim());

  return Array.from(keys).filter(Boolean);
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // Duitku sends application/x-www-form-urlencoded or application/json
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        const params = new URLSearchParams(body);
        body = Object.fromEntries(params.entries());
      }
    }

    const {
      merchantCode,
      amount,
      merchantOrderId,
      paymentCode,
      resultCode,
      reference,
      signature,
    } = body || {};

    if (!merchantCode || !amount || !merchantOrderId || !signature) {
      console.warn('Duitku callback missing required fields:', body);
      return res.status(400).send('Bad Parameter');
    }

    // Retrieve possible API keys to validate against
    const candidateKeys = await fetchDuitkuApiKeys();

    if (candidateKeys.length === 0) {
      console.error('No Duitku API keys found to verify signature.');
      return res.status(500).send('API Key not configured');
    }

    // Check signature against candidates
    let isSignatureValid = false;
    const stringToSign = `${merchantCode}${amount}${merchantOrderId}`;

    for (const key of candidateKeys) {
      // 1. HMAC-SHA256 (Duitku standard)
      const hmacSha256 = crypto.createHmac('sha256', key).update(stringToSign).digest('hex');
      if (hmacSha256.toLowerCase() === signature.toLowerCase()) {
        isSignatureValid = true;
        break;
      }

      // 2. MD5 fallback (Older Duitku projects)
      const md5Hash = crypto.createHash('md5').update(`${merchantCode}${amount}${merchantOrderId}${key}`).digest('hex');
      if (md5Hash.toLowerCase() === signature.toLowerCase()) {
        isSignatureValid = true;
        break;
      }
    }

    if (!isSignatureValid) {
      console.error('Duitku callback signature mismatch:', {
        merchantCode,
        amount,
        merchantOrderId,
        receivedSignature: signature,
      });
      return res.status(400).send('Bad Signature');
    }

    console.info(`Duitku Webhook Verified: Order ${merchantOrderId}, ResultCode ${resultCode}, Reference ${reference}`);

    // If payment successful (resultCode '00')
    if (resultCode === '00') {
      const activateRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/activate_subscription_from_payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          p_invoice_number: merchantOrderId,
          p_duitku_reference: reference || null,
          p_amount: Math.round(Number(amount)),
          p_payment_code: paymentCode || 'duitku',
        }),
      });

      const activateData = await activateRes.json();
      console.info('Subscription activated via Duitku callback:', activateData);

      return res.status(200).json({
        status: 'SUCCESS',
        message: 'Payment verified and plan activated successfully.',
        orderId: merchantOrderId,
      });
    }

    // Non-success results (e.g. 01 = Failed / Expired)
    return res.status(200).json({
      status: 'RECEIVED',
      message: `Transaction reported with resultCode: ${resultCode}`,
      orderId: merchantOrderId,
    });
  } catch (err) {
    console.error('Unhandled error in Duitku callback:', err);
    return res.status(500).send('Internal Server Error');
  }
}
