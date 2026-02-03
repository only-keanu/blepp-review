import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { applyTheme, getStoredTheme } from '../../lib/theme';
import { apiFetch } from '../../lib/api';
export function ProfilePage() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(
    getStoredTheme() === 'dark'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    targetExamDate: user?.targetExamDate || '',
    dailyStudyHours: user?.dailyStudyHours || 2
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('');
    try {
      await apiFetch('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: formData.fullName,
          targetExamDate: formData.targetExamDate || null,
          dailyStudyHours: Number(formData.dailyStudyHours)
        })
      });
      setStatusMessage('Profile updated successfully.');
    } catch (error) {
      setStatusMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };
  const handleThemeToggle = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    applyTheme(next ? 'dark' : 'light');
  };
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profile Settings</h1>

        <Card title="Personal Information">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange} />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              helperText="Contact support to change email" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Exam Date"
                name="targetExamDate"
                type="date"
                value={formData.targetExamDate}
                onChange={handleChange} />

              <Input
                label="Daily Study Goal (Hours)"
                name="dailyStudyHours"
                type="number"
                min="1"
                max="12"
                value={formData.dailyStudyHours}
                onChange={handleChange} />

            </div>
            {statusMessage && (
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {statusMessage}
              </div>
            )}
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Appearance">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Night mode</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Toggle dark theme for late-night study sessions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleThemeToggle}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-teal-600' : 'bg-slate-300'
              }`}
              aria-pressed={isDarkMode}
              aria-label="Toggle night mode">

              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>

        <Card title="Account Security">
          <div className="space-y-4">
            <Button variant="outline">Change Password</Button>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Permanently delete your account and all data. This action cannot
                be undone.
              </p>
              <Button variant="danger">Delete Account</Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>);

}
