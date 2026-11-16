import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/toast';
import { AppLayout } from '@/components/layout';
import { LandingPage } from '@/pages/landing-page';
import { IdeaStudioPage } from '@/pages/idea-studio-page';
import { PromptDeskPage } from '@/pages/prompt-desk-page';
import { TrendRadarPage } from '@/pages/trend-radar-page';
import { ByokPage } from '@/pages/byok-page';
import { ProjectsPage } from '@/pages/projects-page';
import { SettingsPage } from '@/pages/settings-page';
import { PricingPage } from '@/pages/pricing-page';
import { AdminPanelPage } from '@/pages/admin-panel-page';
import { NotFoundPage } from '@/pages/not-found-page';

// Secret admin path — not linked anywhere in the UI
const ADMIN_SECRET_PATH = 'mstr-ype9-91ek';

export function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* ── Landing Page (Public Hero, Showcase & Pricing) ──── */}
          <Route path="/" element={<LandingPage />} />

          {/* ── Secret Admin Route (outside AppLayout, no sidebar) ── */}
          <Route path={`/${ADMIN_SECRET_PATH}`} element={<AdminPanelPage />} />

          {/* ── Old /admin path → 404 (stealth) ─────────────────── */}
          <Route path="/admin" element={<NotFoundPage />} />

          {/* ── Main App Studio with sidebar layout ──────────────── */}
          <Route element={<AppLayout />}>
            <Route path="studio" element={<IdeaStudioPage />} />
            <Route path="prompt-desk" element={<PromptDeskPage />} />
            <Route path="trends" element={<TrendRadarPage />} />
            <Route path="byok" element={<ByokPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Redirect old direct /index access to /studio */}
            <Route path="index" element={<Navigate to="/studio" replace />} />
            {/* Any unknown sub-path → 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
