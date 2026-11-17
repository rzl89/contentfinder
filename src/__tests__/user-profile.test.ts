import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';

describe('Fixprom User Profile System', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      profile: null,
      loading: false,
      initialized: true,
    });
  });

  it('rejects display name update when user is unauthenticated', async () => {
    const { updateDisplayName } = useAuthStore.getState();
    const res = await updateDisplayName('New Name');
    expect(res.error).toBeDefined();
    expect(res.error?.message).toContain('tidak terautentikasi');
  });

  it('rejects empty or whitespace-only display name', async () => {
    useAuthStore.setState({
      user: { id: 'test-user-id', email: 'test@example.com' } as any,
    });
    const { updateDisplayName } = useAuthStore.getState();
    const res = await updateDisplayName('   ');
    expect(res.error).toBeDefined();
    expect(res.error?.message).toContain('tidak boleh kosong');
  });

  it('rejects password updates shorter than 6 characters', async () => {
    const { updatePassword } = useAuthStore.getState();
    const res = await updatePassword('123');
    expect(res.error).toBeDefined();
    expect(res.error?.message).toContain('minimal 6 karakter');
  });
});
