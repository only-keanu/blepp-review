import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock } from 'lucide-react';
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    try {
      await login(email);
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
          placeholder="••••••••" />


        {error &&
        <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
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
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />

            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-slate-900">

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
              <span className="bg-white px-2 text-slate-500">
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