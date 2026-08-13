const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function buildGoogleUrl(appName: string, redirectUri: string) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  const state = btoa(JSON.stringify({ origin: window.location.origin, appName }));
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account&state=${encodeURIComponent(state)}`;
}

// Popup-based Google sign-in
export function signInWithGoogle(appName = 'this app') {
  const redirectUri = `${window.location.origin}/auth/google/popup`;
  const url = buildGoogleUrl(appName, redirectUri);
  
  if (!url) { 
    console.warn('[google-auth] Missing VITE_GOOGLE_CLIENT_ID'); 
    return; 
  }

  // Open popup
  const popup = window.open(
    url, 
    'google-auth', 
    isMobile() ? '' : 'width=500,height=600'
  );

  // If popup blocked, fallback to redirect
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    // Redirect flow
    const redirectUri2 = `${window.location.origin}/login`;
    const redirectUrl = buildGoogleUrl(appName, redirectUri2);
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }
}

// Handle redirect from Google OAuth (for redirect flow)
export async function handleGoogleRedirect(code: string) {
  try {
    const res = await fetch('/api/auth/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Google authentication failed');
    }
    
    return data;
  } catch (err) {
    console.error('[google-auth] Backend auth failed:', err);
    throw err;
  }
}

// Setup listener for popup-based auth flow
export function setupGooglePopupListener(
  onSuccess: (data: { token: string; user: any }) => void,
  onError: (err: Error) => void
) {
  const handler = async (event: MessageEvent) => {
    // Only accept messages from our origin
    if (event.origin !== window.location.origin) return;
    
    if (event.data?.type === 'google-auth-success') {
      window.removeEventListener('message', handler);
      
      if (event.data.token && event.data.user) {
        onSuccess({ token: event.data.token, user: event.data.user });
      } else {
        onError(new Error('Invalid auth response from popup'));
      }
    } else if (event.data?.type === 'google-auth-error') {
      window.removeEventListener('message', handler);
      onError(new Error(event.data.error || 'Google auth failed'));
    }
  };
  
  window.addEventListener('message', handler);
  
  // Return cleanup function
  return () => window.removeEventListener('message', handler);
}

// For the popup page (auth/google/popup) - this runs in the popup window
export async function handleGooglePopupCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  
  if (!code) {
    // Send error to parent
    window.opener?.postMessage({ type: 'google-auth-error', error: 'No auth code received' }, window.location.origin);
    window.close();
    return;
  }
  
  try {
    // Clean up URL
    window.history.replaceState({}, '', '/auth/google/popup');
    
    // Exchange code for token via backend
    const res = await fetch('/api/auth/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state })
    });
    
    const data = await res.json();
    
    if (res.ok && data.token && data.user) {
      // Send success to parent window
      window.opener?.postMessage({ 
        type: 'google-auth-success', 
        token: data.token, 
        user: data.user 
      }, window.location.origin);
    } else {
      window.opener?.postMessage({ 
        type: 'google-auth-error', 
        error: data.error || 'Authentication failed' 
      }, window.location.origin);
    }
  } catch (err) {
    window.opener?.postMessage({ 
      type: 'google-auth-error', 
      error: err instanceof Error ? err.message : 'Network error' 
    }, window.location.origin);
  } finally {
    window.close();
  }
}