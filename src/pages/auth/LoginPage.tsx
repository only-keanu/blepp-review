import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock } from 'lucide-react';
import { buildFacebookAuthUrl, buildGoogleAuthUrl, openOAuthPopup } from '../../lib/oauth';
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, oauthLogin } = useAuth();
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
      setError('Social login failed. Please try again.');
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in. Please try again.');
    }
  };
  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Welcome back, future Psychologist!">

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth('google')}
          >
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth('facebook')}
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
              Or sign in with email
            </span>
          </div>
        </div>

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-5 w-5" />}
          placeholder="you@example.com" />


        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="h-5 w-5" />}
          placeholder="********" />


        {error &&
        <div className="rounded-md bg-red-50 dark:bg-red-950/40 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              </div>
            </div>
          </div>
        }

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500" />

            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-slate-900 dark:text-slate-100">

              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-teal-600 hover:text-teal-500">

              Forgot your password?
            </a>
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                Don't have an account?
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link to="/auth/register">
              <Button variant="outline" className="w-full">
                Create an account
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>);

}
