import { describe, it, expect, beforeEach } from 'vitest';
import { useSubscriptionStore, PRICING_PLANS } from '@/stores/subscription-store';

describe('TemporaForge AI — Subscription & Monetization System', () => {
  beforeEach(() => {
    // Reset store state
    useSubscriptionStore.setState({
      subscription: {
        tier: 'trial',
        status: 'trial',
        trialStartedAt: new Date().toISOString(),
        trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      orders: [],
      activeOrder: null,
    });
  });

  it('initializes 1-day free trial correctly with ~24 hours remaining', () => {
    const store = useSubscriptionStore.getState();
    const remaining = store.getRemainingTrialHours();
    expect(remaining).toBeGreaterThanOrEqual(23);
    expect(remaining).toBeLessThanOrEqual(24);
    expect(store.subscription.tier).toBe('trial');
  });

  it('creates order with valid invoice number, unique verification code, and exact total amount', () => {
    const store = useSubscriptionStore.getState();
    const order = store.createOrder('pro', 'monthly', 'bca');

    expect(order.invoiceNumber).toMatch(/^TF-INV-\d{8}-[A-Z0-9]{4}$/);
    expect(order.amount).toBe(PRICING_PLANS.pro.monthlyPrice);
    expect(order.amount).toBe(59000);
    expect(order.uniqueCode).toBeGreaterThanOrEqual(100);
    expect(order.uniqueCode).toBeLessThanOrEqual(999);
    expect(order.totalAmount).toBe(order.amount + order.uniqueCode);
    expect(order.paymentMethod).toBe('bca');
    expect(order.status).toBe('pending');
  });

  it('generates a pre-formatted WhatsApp confirmation link with invoice and transfer details', () => {
    const store = useSubscriptionStore.getState();
    const order = store.createOrder('pro', 'monthly', 'qris');
    const waLink = store.generateWhatsAppLink(order);

    expect(waLink).toContain('https://wa.me/');
    expect(waLink).toContain(order.invoiceNumber);
    expect(waLink).toContain(order.totalAmount.toLocaleString('id-ID'));
    expect(waLink).toContain(String(order.uniqueCode));
    expect(waLink).toContain('Creator%20Pro');
  });

  it('handles feature access control based on subscription tier', () => {
    const store = useSubscriptionStore.getState();

    // Trial tier
    expect(store.isFeatureAccessible('basic')).toBe(true);
    expect(store.isFeatureAccessible('pro')).toBe(true);
    expect(store.isFeatureAccessible('byok')).toBe(false);

    // Upgraded to Pro
    store.manualUpgradeTier('pro');
    expect(store.isFeatureAccessible('pro')).toBe(true);
    expect(store.isFeatureAccessible('byok')).toBe(false);

    // Upgraded to Studio
    store.manualUpgradeTier('studio');
    expect(store.isFeatureAccessible('byok')).toBe(true);
  });
});
