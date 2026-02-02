export type OAuthProvider = 'google' | 'facebook';

type OAuthPopupResult = {
  code?: string;
  state?: string;
  error?: string;
};

export const buildGoogleAuthUrl = (clientId: string, redirectUri: string, state: string) => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const buildFacebookAuthUrl = (appId: string, redirectUri: string, state: string) => {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email,public_profile',
    state
  });
  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
};

export const openOAuthPopup = (url: string, name: string) =>
  new Promise<OAuthPopupResult>((resolve, reject) => {
    const width = 520;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      url,
      name,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      reject(new Error('Popup blocked'));
      return;
    }

    const timer = setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      reject(new Error('OAuth popup timed out'));
    }, 2 * 60 * 1000);

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data as { type?: string } & OAuthPopupResult;
      if (!payload || payload.type !== 'oauth') return;
      clearTimeout(timer);
      window.removeEventListener('message', handleMessage);
      resolve(payload);
    };

    window.addEventListener('message', handleMessage);
  });
