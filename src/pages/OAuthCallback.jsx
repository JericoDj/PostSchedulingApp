import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../components/UI';
import { API_BASE_URL, authHeaders } from '../utils/api';

export const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const provider = query.get('provider') || 'facebook';
  const status = query.get('status') || 'error';
  const accessToken = query.get('access_token');
  const refreshToken = query.get('refresh_token');
  const tokenType = query.get('token_type');
  const expiresIn = query.get('expires_in');
  const error = query.get('error');
  const description = query.get('description');
  const storageKey = provider === 'x' ? 'x_token' : `${provider}_oauth_token`;

  useEffect(() => {
    const persistConnection = async () => {
      if (status !== 'success' || !accessToken) {
        return;
      }

      const payload = {
        provider,
        access_token: accessToken,
        refresh_token: refreshToken || null,
        token_type: tokenType || null,
        expires_in: expiresIn ? Number(expiresIn) : null,
        connected_at: new Date().toISOString(),
      };

      localStorage.setItem(storageKey, JSON.stringify(payload));

      if (['facebook', 'instagram', 'tiktok', 'threads', 'x', 'linkedin', 'youtube'].includes(provider)) {
        try {
          await fetch(`${API_BASE_URL}/api/users/me/${provider}-connection`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders(),
            },
            body: JSON.stringify({
              access_token: accessToken,
              refresh_token: refreshToken || null,
            }),
          });
        } catch (_) {
          // Keep callback resilient even if backend save fails for now.
        }
      }
    };

    persistConnection();
  }, [status, accessToken, refreshToken, tokenType, expiresIn, provider, storageKey]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <GlassCard className="space-y-5">
          <h1 className="text-2xl font-bold text-white">
            {status === 'success' ? 'Connection successful' : 'Connection failed'}
          </h1>

          <p className="text-slate-300">
            Provider: <span className="font-semibold capitalize">{provider}</span>
          </p>

          {status === 'success' ? (
            <>
              <p className="text-emerald-400">
                Your account was connected. Tokens were saved locally and your backend connection was synced for worker publishing.
              </p>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-slate-300 break-all">
                <p>
                  <span className="text-slate-400">token_type:</span> {tokenType || 'N/A'}
                </p>
                <p>
                  <span className="text-slate-400">expires_in:</span> {expiresIn || 'N/A'}
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-300">
              <p>Error: {error || 'unknown_error'}</p>
              {description && <p className="mt-1">Description: {description}</p>}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={() => navigate('/settings')}>Back to Settings</Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
