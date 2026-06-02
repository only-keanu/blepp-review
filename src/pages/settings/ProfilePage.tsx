import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { applyTheme, getStoredTheme } from '../../lib/theme';
import { apiFetch } from '../../lib/api';
import { formatDateTime } from '../../components/access/AccessStatusCard';
const SETTINGS_FIELD_CLASS =
  'border border-slate-400 dark:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/30 disabled:border-slate-300 dark:disabled:border-slate-700';

export function ProfilePage() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(
    getStoredTheme() === 'dark'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [passwordStatusMessage, setPasswordStatusMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    targetExamDate: user?.targetExamDate || '',
    dailyStudyHours: user?.dailyStudyHours || 2
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  useEffect(() => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      targetExamDate: user?.targetExamDate || '',
      dailyStudyHours: user?.dailyStudyHours || 2
    });
  }, [user]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
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
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatusMessage('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordStatusMessage('All password fields are required.');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordStatusMessage('New password must be at least 8 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatusMessage('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiFetch('/api/me/password', {
        method: 'PATCH',
        body: JSON.stringify(passwordData)
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStatusMessage('Password updated successfully.');
    } catch (error) {
      setPasswordStatusMessage('Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profile Settings</h1>

        {user?.admin && user.access && (
          <Card title="Admin diagnostics">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <Diagnostic label="Email" value={user.email} />
              <Diagnostic label="Role" value={user.access.role} />
              <Diagnostic label="Admin" value={user.admin ? 'Yes' : 'No'} />
              <Diagnostic label="Status" value={user.access.accessStatus} />
              <Diagnostic label="Study access" value={user.hasStudyAccess ? 'Yes' : 'No'} />
              <Diagnostic label="AI access" value={user.hasAiAccess ? 'Yes' : 'No'} />
              <Diagnostic label="Trial ends" value={formatDateTime(user.access.trialEndsAt)} />
              <Diagnostic label="Paid until" value={formatDateTime(user.access.paidUntil)} />
            </div>
          </Card>
        )}

        <Card title="Personal Information">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="fullName"
              className={SETTINGS_FIELD_CLASS}
              value={formData.fullName}
              onChange={handleChange} />

            <Input
              label="Email Address"
              name="email"
              type="email"
              className={SETTINGS_FIELD_CLASS}
              value={formData.email}
              onChange={handleChange}
              disabled
              helperText="Contact support to change email" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Exam Date"
                name="targetExamDate"
                type="date"
                className={SETTINGS_FIELD_CLASS}
                value={formData.targetExamDate}
                onChange={handleChange} />

              <Input
                label="Daily Study Goal (Hours)"
                name="dailyStudyHours"
                type="number"
                min="1"
                max="12"
                className={SETTINGS_FIELD_CLASS}
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
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  className={SETTINGS_FIELD_CLASS}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange} />

                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  className={SETTINGS_FIELD_CLASS}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  helperText="Use at least 8 characters." />

                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={SETTINGS_FIELD_CLASS}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange} />
              </div>
              {passwordStatusMessage && (
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {passwordStatusMessage}
                </div>
              )}
              <div className="flex justify-end">
                <Button type="submit" variant="outline" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Updating...' : 'Change Password'}
                </Button>
              </div>
            </form>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Permanently delete your account and all data. This action cannot
                be undone.
              </p>
              <Button type="button" variant="danger">Delete Account</Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>);

}

function Diagnostic({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
      <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 break-words font-medium text-slate-900 dark:text-slate-100">{value || 'not set'}</p>
    </div>
  );
}
