import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/toast';
import { AppLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuthStore } from '@/stores/auth-store';

// Public pages
import { LandingPage } from '@/pages/landing-page';
import { LoginPage } from '@/pages/login-page';
import { SignupPage } from '@/pages/signup-page';
import { EmailConfirmPage } from '@/pages/email-confirm-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { PricingPage } from '@/pages/pricing-page';

// Protected studio pages
import { IdeaStudioPage } from '@/pages/idea-studio-page';
import { PromptDeskPage } from '@/pages/prompt-desk-page';
import { TrendRadarPage } from '@/pages/trend-radar-page';
import { ByokPage } from '@/pages/byok-page';
import { ProjectsPage } from '@/pages/projects-page';
import { SettingsPage } from '@/pages/settings-page';

// Admin
import { AdminPanelPage } from '@/pages/admin-panel-page';

// Secret admin path — not linked anywhere in the UI
const ADMIN_SECRET_PATH = 'mstr-ype9-91ek';

export function App() {
  const { initialize } = useAuthStore();

  // Initialize Supabase auth session on app mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* ── Public Routes ──────────────────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo" element={<LandingPage scrollToSection="demo" />} />
          <Route path="/fitur" element={<LandingPage scrollToSection="fitur" />} />
          <Route path="/kategori" element={<LandingPage scrollToSection="kategori" />} />
          <Route path="/harga" element={<LandingPage scrollToSection="harga" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/confirm" element={<EmailConfirmPage />} />

          {/* Public pricing page (viewable without login) */}
          <Route path="/pricing" element={<PricingPage />} />

          {/* ── Secret Admin Route (outside AppLayout, no sidebar) ─────── */}
          <Route path={`/${ADMIN_SECRET_PATH}`} element={<AdminPanelPage />} />

          {/* ── Old /admin path → 404 (stealth) ───────────────────────── */}
          <Route path="/admin" element={<NotFoundPage />} />

          {/* ── Protected Studio Routes (login required) ───────────────── */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="studio" element={<IdeaStudioPage />} />
            <Route path="prompt-desk" element={<PromptDeskPage />} />
            <Route path="trends" element={<TrendRadarPage />} />
            <Route path="byok" element={<ByokPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Redirect legacy /index → /studio */}
            <Route path="index" element={<Navigate to="/studio" replace />} />
          </Route>

          {/* ── Catch-all 404 ──────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
