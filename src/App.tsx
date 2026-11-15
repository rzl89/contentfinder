import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/toast';
import { AppLayout } from '@/components/layout';
import { IdeaStudioPage } from '@/pages/idea-studio-page';
import { PromptDeskPage } from '@/pages/prompt-desk-page';
import { TrendRadarPage } from '@/pages/trend-radar-page';
import { ByokPage } from '@/pages/byok-page';
import { ProjectsPage } from '@/pages/projects-page';
import { SettingsPage } from '@/pages/settings-page';

export function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<IdeaStudioPage />} />
            <Route path="prompt-desk" element={<PromptDeskPage />} />
            <Route path="trends" element={<TrendRadarPage />} />
            <Route path="byok" element={<ByokPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
