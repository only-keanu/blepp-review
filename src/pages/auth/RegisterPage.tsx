import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, User, Calendar, Clock } from 'lucide-react';
import { buildFacebookAuthUrl, buildGoogleAuthUrl, openOAuthPopup } from '../../lib/oauth';

const GoogleLogo = () => (
  <svg viewBox="0 0 533.5 544.3" className="h-5 w-5" aria-hidden="true">
    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.4h146.9c-6.3 34.2-25 63.2-53.5 82.6v68h86.5c50.6-46.6 81.6-115.4 81.6-195.6z"/>
    <path fill="#34A853" d="M272 544.3c72.6 0 133.6-24.1 178.1-65.4l-86.5-68c-24.1 16.2-55 25.8-91.6 25.8-70.4 0-130.1-47.5-151.5-111.1H32.1v69.8C76.7 475.2 168.2 544.3 272 544.3z"/>
    <path fill="#FBBC05" d="M120.5 325.6c-10.1-30.2-10.1-63 0-93.2v-69.8H32.1c-39.4 78.7-39.4 171.1 0 249.8l88.4-69.8z"/>
    <path fill="#EA4335" d="M272 107.7c39.5-.6 77.4 14 106.3 40.9l79.2-79.2C403.5 24.7 338.6-1.2 272 0 168.2 0 76.7 69.1 32.1 169.2l88.4 69.8C141.9 155.2 201.6 107.7 272 107.7z"/>
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#1877F2"
      d="M24 12.1c0-6.7-5.4-12.1-12.1-12.1C5.2 0 0 5.4 0 12.1c0 6 4.3 11 10 12v-8.5H7.1V12h2.9V9.4c0-2.9 1.7-4.5 4.4-4.5 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-2 1-2 1.9V12h3.4l-.5 3.6h-2.9V24c5.7-1 10-6 10-11.9z"
    />
  </svg>
);
export function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    targetExamDate: '',
    dailyStudyHours: 2
  });
  const [error, setError] = useState('');
  const { register, isLoading, oauthLogin } = useAuth();
  const navigate = useNavigate();
  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setError('');
    const origin = window.location.origin;
    const redirectUri = `${origin}/auth/${provider}/callback`;
    const state = `${provider}-${Math.random().toString(36).slice(2)}`;

    const clientId =
      provider === 'google'
        ? import.meta.env.VITE_GOOGLE_CLIENT_ID
        : import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!clientId) {
      setError(`Missing ${provider === 'google' ? 'Google' : 'Facebook'} client ID.`);
      return;
    }

    const authUrl =
      provider === 'google'
        ? buildGoogleAuthUrl(clientId, redirectUri, state)
        : buildFacebookAuthUrl(clientId, redirectUri, state);

    try {
      const result = await openOAuthPopup(authUrl, `${provider}-oauth`);
      if (result.error) {
        setError('Authentication was cancelled.');
        return;
      }
      if (!result.code) {
        setError('No authorization code received.');
        return;
      }
      if (result.state !== state) {
        setError('OAuth state mismatch. Please try again.');
        return;
      }
      await oauthLogin(provider, result.code, redirectUri);
      navigate('/dashboard');
    } catch (err) {
      setError('Social sign up failed. Please try again.');
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
        password: formData.password,
        fullName: formData.fullName,
        targetExamDate: formData.targetExamDate,
        dailyStudyHours: Number(formData.dailyStudyHours)
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    }
  };
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your journey to becoming a Registered Psychologist">

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth('google')}
            leftIcon={<GoogleLogo />}
          >
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth('facebook')}
            leftIcon={<FacebookLogo />}
          >
            Continue with Facebook
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
              Or sign up with email
            </span>
          </div>
        </div>

        <Input
          label="Full Name"
          name="fullName"
          type="text"
          required
          value={formData.fullName}
          onChange={handleChange}
          icon={<User className="h-5 w-5" />}
          placeholder="Maria Santos" />


        <Input
          label="Email address"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          icon={<Mail className="h-5 w-5" />}
          placeholder="you@example.com" />


        <Input
          label="Password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          icon={<Lock className="h-5 w-5" />}
          placeholder="Create a strong password" />


        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="Target Exam Date"
            name="targetExamDate"
            type="date"
            required
            value={formData.targetExamDate}
            onChange={handleChange}
            icon={<Calendar className="h-5 w-5" />} />


          <Input
            label="Daily Study Hours"
            name="dailyStudyHours"
            type="number"
            min="1"
            max="12"
            required
            value={formData.dailyStudyHours}
            onChange={handleChange}
            icon={<Clock className="h-5 w-5" />} />

        </div>

        {error &&
        <div className="rounded-md bg-red-50 dark:bg-red-950/40 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              </div>
            </div>
          </div>
        }

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Create Account
        </Button>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
          <Link
            to="/auth/login"
            className="font-medium text-teal-600 hover:text-teal-500">

            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>);

}
