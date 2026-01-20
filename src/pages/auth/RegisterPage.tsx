import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, User, Calendar, Clock } from 'lucide-react';
export function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    targetExamDate: '',
    dailyStudyHours: 2
  });
  const [error, setError] = useState('');
  const {
    register,
    isLoading
  } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      await register({
        email: formData.email,
        fullName: formData.fullName,
        targetExamDate: formData.targetExamDate,
        dailyStudyHours: Number(formData.dailyStudyHours)
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    }
  };
  return <AuthLayout title="Create your account" subtitle="Start your journey to becoming a Registered Psychologist">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input label="Full Name" name="fullName" type="text" required value={formData.fullName} onChange={handleChange} icon={<User className="h-5 w-5" />} placeholder="Maria Santos" />

        <Input label="Email address" name="email" type="email" required value={formData.email} onChange={handleChange} icon={<Mail className="h-5 w-5" />} placeholder="you@example.com" />

        <Input label="Password" name="password" type="password" required value={formData.password} onChange={handleChange} icon={<Lock className="h-5 w-5" />} placeholder="Create a strong password" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input label="Target Exam Date" name="targetExamDate" type="date" required value={formData.targetExamDate} onChange={handleChange} icon={<Calendar className="h-5 w-5" />} />

          <Input label="Daily Study Hours" name="dailyStudyHours" type="number" min="1" max="12" required value={formData.dailyStudyHours} onChange={handleChange} icon={<Clock className="h-5 w-5" />} />
        </div>

        {error && <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>}

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Create Account
        </Button>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-500">Already have an account? </span>
          <Link to="/auth/login" className="font-medium text-teal-600 hover:text-teal-500">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>;
}