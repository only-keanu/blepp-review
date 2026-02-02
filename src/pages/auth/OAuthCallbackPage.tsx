import React, { useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { provider } = useParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error') || searchParams.get('error_description');

    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'oauth',
          provider,
          code,
          state,
          error
        },
        window.location.origin
      );
    }

    window.close();
  }, [searchParams, provider]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <p className="text-slate-600 dark:text-slate-300 text-sm">
        Finishing authentication...
      </p>
    </div>
  );
}
