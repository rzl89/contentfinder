/**
 * Serverless Duitku Invoice Creation Endpoint — Fixprom
 * Handles secure communication with Duitku POP API (Sandbox & Production).
 * Documentation source: Context 7 (/websites/duitku_api_id)
 */

import crypto from 'crypto';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://uoxoljiucezwdpqfnuga.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveG9saml1Y2V6d2RwcWZudWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NTM4NzQsImV4cCI6MjExMDMyOTg3NH0.KR2gmO2jx0rQ4msUcFZmct9_eMzeLyqImUADqlnLWfo';

async function fetchDuitkuConfig() {
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
        return rows[0].value;
      }
    }
  } catch (err) {
    console.error('Failed to fetch duitku_config from Supabase:', err);
  }
  return null;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const {
      planTier = 'pro',
      billingCycle = 'monthly',
      amount = 59000,
      userEmail,
      userName = 'Pelanggan Fixprom',
      userId,
      phoneNumber = '081234567890',
    } = req.body || {};

    if (!userEmail || !userEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Alamat email pemesan wajib diisi untuk konfirmasi pembayaran.',
      });
    }

    const parsedAmount = Math.round(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nominal pembayaran tidak valid.',
      });
    }

    // Load configuration
    const config = (await fetchDuitkuConfig()) || {};

    const environment = config.environment === 'production' ? 'production' : 'sandbox';
    let merchantCode = '';
    let apiKey = '';

    if (environment === 'production') {
      merchantCode = config.prodMerchantCode || config.merchantCode || process.env.DUITKU_MERCHANT_CODE || '';
      apiKey = config.prodApiKey || config.apiKey || process.env.DUITKU_API_KEY || '';
    } else {
      merchantCode =
        config.sandboxMerchantCode ||
        config.merchantCode ||
        process.env.DUITKU_SANDBOX_MERCHANT_CODE ||
        process.env.DUITKU_MERCHANT_CODE ||
        '';
      apiKey =
        config.sandboxApiKey ||
        config.apiKey ||
        process.env.DUITKU_SANDBOX_API_KEY ||
        process.env.DUITKU_API_KEY ||
        '';
    }

    if (!merchantCode || !apiKey) {
      return res.status(400).json({
        success: false,
        message:
          'Kredensial Duitku (Merchant Code / API Key) belum diisi di Panel Admin. Silakan lengkapi pengaturan atau gunakan opsi transfer manual.',
      });
    }

    // Determine Base URL
    const duitkuUrl =
      environment === 'production'
        ? 'https://api-prod.duitku.com/api/merchant/createInvoice'
        : 'https://api-sandbox.duitku.com/api/merchant/createInvoice';

    // Unique Merchant Order ID
    const merchantOrderId = `FIXPROM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Record pending order in Supabase
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_duitku_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          p_invoice_number: merchantOrderId,
          p_user_id: userId || null,
          p_user_email: userEmail.toLowerCase().trim(),
          p_plan_tier: planTier,
          p_billing_cycle: billingCycle,
          p_amount: parsedAmount,
        }),
      });
    } catch (orderErr) {
      console.warn('Non-fatal: failed to pre-record order in database', orderErr);
    }

    // 2. Generate Duitku Signature
    // Context 7 Spec: SHA256(merchantCode + timestamp + apiKey)
    const timestamp = Date.now().toString();
    const stringToSign = `${merchantCode}${timestamp}${apiKey}`;
    const signature = crypto.createHash('sha256').update(stringToSign).digest('hex');

    const durationLabel = billingCycle === 'yearly' ? '1 Tahun' : '1 Bulan';
    const productTitle = `Fixprom Creator Pro (${durationLabel})`;

    const callbackUrl = 'https://www.fixprom.com/api/duitku-callback';
    const returnUrl = `https://www.fixprom.com/#/pricing?status=duitku_return&orderId=${merchantOrderId}`;

    const expiryPeriod = Number(config.expiryPeriod) > 0 ? Number(config.expiryPeriod) : 1440; // 24 hours in minutes

    const payload = {
      paymentAmount: parsedAmount,
      merchantOrderId,
      productDetails: productTitle,
      customerVaName: userName || 'Pelanggan Fixprom',
      email: userEmail.trim(),
      phoneNumber: phoneNumber || '081234567890',
      callbackUrl,
      returnUrl,
      expiryPeriod,
      itemDetails: [
        {
          name: productTitle,
          price: parsedAmount,
          quantity: 1,
        },
      ],
    };

    // 3. Send request to Duitku
    const duitkuRes = await fetch(duitkuUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-duitku-signature': signature,
        'x-duitku-timestamp': timestamp,
        'x-duitku-merchantcode': merchantCode,
      },
      body: JSON.stringify(payload),
    });

    const duitkuData = await duitkuRes.json();

    if (!duitkuRes.ok || duitkuData.statusCode !== '00') {
      console.error('Duitku API Error Response:', duitkuData);
      return res.status(400).json({
        success: false,
        statusCode: duitkuData.statusCode || '99',
        message: duitkuData.statusMessage || 'Gagal memproses transaksi dengan gateway Duitku.',
        details: duitkuData,
      });
    }

    // 4. Update order with payment reference & paymentUrl
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/update_duitku_order_reference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          p_invoice_number: merchantOrderId,
          p_reference: duitkuData.reference || null,
          p_payment_url: duitkuData.paymentUrl || null,
        }),
      });
    } catch (refErr) {
      console.warn('Non-fatal: failed to update order reference', refErr);
    }

    return res.status(200).json({
      success: true,
      statusCode: '00',
      merchantOrderId,
      reference: duitkuData.reference,
      paymentUrl: duitkuData.paymentUrl,
      environment,
    });
  } catch (error) {
    console.error('Unexpected Duitku Handler Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem internal saat memproses invoice pembayaran.',
      error: error.message,
    });
  }
}
