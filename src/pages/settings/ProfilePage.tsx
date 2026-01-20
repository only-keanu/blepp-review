import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
export function ProfilePage() {
  const {
    user
  } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    targetExamDate: user?.targetExamDate || '',
    dailyStudyHours: user?.dailyStudyHours || 2
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };
  return <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>

        <Card title="Personal Information">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
            <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} disabled helperText="Contact support to change email" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Target Exam Date" name="targetExamDate" type="date" value={formData.targetExamDate} onChange={handleChange} />
              <Input label="Daily Study Goal (Hours)" name="dailyStudyHours" type="number" min="1" max="12" value={formData.dailyStudyHours} onChange={handleChange} />
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Card>

        <Card title="Account Security">
          <div className="space-y-4">
            <Button variant="outline">Change Password</Button>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-4">
                Permanently delete your account and all data. This action cannot
                be undone.
              </p>
              <Button variant="danger">Delete Account</Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>;
}