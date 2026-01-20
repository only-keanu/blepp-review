import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { useAuth } from './hooks/useAuth';
// Study Pages
import { TopicsPage } from './pages/study/TopicsPage';
import { PracticePage } from './pages/study/PracticePage';
import { FlashcardsPage } from './pages/study/FlashcardsPage';
import { MistakesPage } from './pages/study/MistakesPage';
// Question Pages
import { GeneratePage } from './pages/questions/GeneratePage';
import { BankPage } from './pages/questions/BankPage';
// Exam Pages
import { MockExamsPage } from './pages/exams/MockExamsPage';
import { TakeExamPage } from './pages/exams/TakeExamPage';
import { ExamResultsPage } from './pages/exams/ExamResultsPage';
// Progress Pages
import { AnalyticsPage } from './pages/progress/AnalyticsPage';
import { ReadinessPage } from './pages/progress/ReadinessPage';
// Settings Pages
import { ProfilePage } from './pages/settings/ProfilePage';
import { TopicsSettingsPage } from './pages/settings/TopicsPage';
// Protected Route Wrapper
function ProtectedRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    isLoading
  } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>;
  }
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  return <>{children}</>;
}
// Public Route Wrapper (redirects to dashboard if already logged in)
function PublicRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    isLoading
  } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>;
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
export function App() {
  return <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/auth/login" element={<PublicRoute>
              <LoginPage />
            </PublicRoute>} />

        <Route path="/auth/register" element={<PublicRoute>
              <RegisterPage />
            </PublicRoute>} />

        {/* Dashboard & Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>} />

        {/* Study Routes */}
        <Route path="/dashboard/study" element={<Navigate to="/dashboard/study/topics" replace />} />
        <Route path="/dashboard/study/topics" element={<ProtectedRoute>
              <TopicsPage />
            </ProtectedRoute>} />
        <Route path="/dashboard/study/practice" element={<ProtectedRoute>
              <PracticePage />
            </ProtectedRoute>} />
        <Route path="/dashboard/study/flashcards" element={<ProtectedRoute>
              <FlashcardsPage />
            </ProtectedRoute>} />
        <Route path="/dashboard/study/mistakes" element={<ProtectedRoute>
              <MistakesPage />
            </ProtectedRoute>} />

        {/* Question Routes */}
        <Route path="/dashboard/questions" element={<Navigate to="/dashboard/questions/bank" replace />} />
        <Route path="/dashboard/questions/generate" element={<ProtectedRoute>
              <GeneratePage />
            </ProtectedRoute>} />
        <Route path="/dashboard/questions/bank" element={<ProtectedRoute>
              <BankPage />
            </ProtectedRoute>} />

        {/* Exam Routes */}
        <Route path="/dashboard/exams" element={<Navigate to="/dashboard/exams/list" replace />} />
        <Route path="/dashboard/exams/list" element={<ProtectedRoute>
              <MockExamsPage />
            </ProtectedRoute>} />
        <Route path="/dashboard/exams/take/:id" element={<ProtectedRoute>
              <TakeExamPage />
            </ProtectedRoute>} />
        <Route path="/dashboard/exams/results/:id" element={<ProtectedRoute>
              <ExamResultsPage />
            </ProtectedRoute>} />
        {/* Redirect old /mocks path if needed */}
        <Route path="/dashboard/mocks" element={<Navigate to="/dashboard/exams/list" replace />} />

        {/* Progress Routes */}
        <Route path="/dashboard/progress" element={<ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>} />
        <Route path="/dashboard/progress/readiness" element={<ProtectedRoute>
              <ReadinessPage />
            </ProtectedRoute>} />

        {/* Settings Routes */}
        <Route path="/dashboard/settings" element={<ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>} />
        <Route path="/dashboard/settings/topics" element={<ProtectedRoute>
              <TopicsSettingsPage />
            </ProtectedRoute>} />

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>;
}