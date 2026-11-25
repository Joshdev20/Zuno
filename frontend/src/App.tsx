import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProgressProvider } from './lib/progress';
import { AppShell } from './components/layout/AppShell';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { TrackPage } from './pages/TrackPage';
import { LessonPage } from './pages/LessonPage';
import { Achievements } from './pages/Achievements';
import { NotFound } from './pages/NotFound';

const Playground = lazy(() =>
  import('./pages/Playground').then((module) => ({ default: module.Playground })),
);

export default function App() {
  return (
    <BrowserRouter>
      <ProgressProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/learn/:trackId/:lessonId" element={<LessonPage />} />
          <Route element={<AppShell />}>
            <Route path="/learn" element={<Dashboard />} />
            <Route path="/learn/:trackId" element={<TrackPage />} />
            <Route
              path="/playground"
              element={
                <Suspense fallback={<div className="page-skeleton" aria-hidden="true" />}>
                  <Playground />
                </Suspense>
              }
            />
            <Route path="/achievements" element={<Achievements />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ProgressProvider>
    </BrowserRouter>
  );
}
