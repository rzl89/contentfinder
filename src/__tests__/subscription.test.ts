import { describe, it, expect, beforeEach } from 'vitest';
import { useSubscriptionStore, PRICING_PLANS, calculateActionCredits } from '@/stores/subscription-store';

describe('Fixprom â€” Subscription & Monetization System', () => {
  beforeEach(() => {
    // Reset store state
    useSubscriptionStore.setState({
      subscription: {
        tier: 'free',
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
    expect(store.subscription.tier).toBe('free');
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

    // Active Trial tier allows basic, but locks BYOK, limits to 3 categories and 3 storyboards
    expect(store.isFeatureAccessible('basic')).toBe(true);
    expect(store.isFeatureAccessible('byok')).toBe(false);
    expect(store.isByokAccessible()).toBe(false);
    expect(store.isCategoryAccessible('time-travel')).toBe(true);
    expect(store.isCategoryAccessible('stickman')).toBe(true);
    expect(store.isCategoryAccessible('pov-experience')).toBe(true);
    expect(store.isCategoryAccessible('microdrama')).toBe(false);

    // Storyboard quota check (3 max in trial)
    expect(store.canGenerateStoryboard()).toBe(true);
    store.incrementStoryboardCount(); // 1
    store.incrementStoryboardCount(); // 2
    store.incrementStoryboardCount(); // 3
    expect(store.canGenerateStoryboard()).toBe(false);

    // Upgraded to Pro gives full access to all categories, unlimited storyboards, and BYOK
    store.manualUpgradeTier('pro');
    expect(store.isFeatureAccessible('basic')).toBe(true);
    expect(store.isFeatureAccessible('pro')).toBe(true);
    expect(store.isFeatureAccessible('byok')).toBe(true);
    expect(store.isByokAccessible()).toBe(true);
    expect(store.isCategoryAccessible('microdrama')).toBe(true);
    expect(store.canGenerateStoryboard()).toBe(true);

    // Expired trial without active subscription restricts access
    useSubscriptionStore.setState({
      subscription: {
        tier: 'free',
        status: 'expired',
        trialStartedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        trialEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    expect(store.isFeatureAccessible('pro')).toBe(false);
  });

  it('manages AI credits correctly (deduction, sufficiency check, and top-up)', async () => {
    const store = useSubscriptionStore.getState();
    // Default trial has 20 credits
    useSubscriptionStore.setState({
      subscription: {
        tier: 'free',
        status: 'trial',
        trialStartedAt: new Date().toISOString(),
        trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        creditsBalance: 20,
      },
    });

    expect(store.hasSufficientCredits(1)).toBe(true);
    expect(store.hasSufficientCredits(3)).toBe(true);
    expect(store.hasSufficientCredits(25)).toBe(false);

    // Deduct 1 credit for idea generation with metadata
    const res1 = await store.deductCredits(1, 'generate_ideas', { wordCount: 50 });
    expect(res1.success).toBe(true);
    expect(res1.balance).toBe(19);
    expect(useSubscriptionStore.getState().subscription.creditsBalance).toBe(19);

    // Deduct 3 credits for storyboard generation
    const res2 = await store.deductCredits(3, 'generate_storyboard', { wordCount: 150 });
    expect(res2.success).toBe(true);
    expect(res2.balance).toBe(16);

    // Verify audit logs exist
    const logs = useSubscriptionStore.getState().auditLogs;
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs[0].actionName).toBe('generate_storyboard');

    // Try to deduct more than remaining balance
    const resFail = await store.deductCredits(50, 'test_overflow');
    expect(resFail.success).toBe(false);
    expect(resFail.error).toBe('INSUFFICIENT_CREDITS');
    expect(useSubscriptionStore.getState().subscription.creditsBalance).toBe(16);
  });

  it('calculates hybrid credits correctly based on word count', () => {
    // Normal input (< 1000 words) -> base cost
    const normalIdeas = calculateActionCredits('generate_ideas', 50);
    expect(normalIdeas.totalCost).toBe(1);
    expect(normalIdeas.isExtended).toBe(false);

    const normalStoryboard = calculateActionCredits('generate_storyboard', 200);
    expect(normalStoryboard.totalCost).toBe(3);
    expect(normalStoryboard.isExtended).toBe(false);

    // Extended input (1300 words: +1 credit extra)
    const extStoryboard = calculateActionCredits('generate_storyboard', 1300);
    expect(extStoryboard.baseCost).toBe(3);
    expect(extStoryboard.extraCredits).toBe(1);
    expect(extStoryboard.totalCost).toBe(4);
    expect(extStoryboard.isExtended).toBe(true);

    // Very large input (2100 words: (2100 - 1000)/500 = 1100/500 = 2.2 -> ceil 3 extra)
    const hugeStoryboard = calculateActionCredits('generate_storyboard', 2100);
    expect(hugeStoryboard.baseCost).toBe(3);
    expect(hugeStoryboard.extraCredits).toBe(3);
    expect(hugeStoryboard.totalCost).toBe(6);
    expect(hugeStoryboard.isExtended).toBe(true);
  });
});

