import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}
export function AuthLayout({
  children,
  title,
  subtitle
}: AuthLayoutProps) {
  return <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="bg-teal-600 p-2 rounded-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            BLEPP Review
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-center text-sm text-slate-600">{subtitle}</p>}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          {children}
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Psychology Board Review SaaS. All
            rights reserved.
          </p>
        </div>
      </div>
    </div>;
}