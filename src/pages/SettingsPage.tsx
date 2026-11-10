import React, { useState } from 'react';
import { Server, Key, Shield } from 'lucide-react';
import { apiService } from '../services/api';

interface SettingsPageProps {
  onRefresh: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onRefresh }) => {
  const [backendUrl, setBackendUrl] = useState(apiService.getBaseUrl());
  const [authToken, setAuthToken] = useState(apiService.getAuthToken());
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSaveUrl = () => {
    apiService.setBaseUrl(backendUrl);
    apiService.setAuthToken(authToken);
    setTestStatus('Settings saved to localStorage successfully.');
    onRefresh();
    setTimeout(() => setTestStatus(null), 3000);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword) return;
    setIsSigningIn(true);
    setTestStatus('Signing in to Supabase Admin Auth...');
    try {
      const result = await apiService.signInWithEmail(adminEmail, adminPassword);
      if (result.ok) {
        setAuthToken(apiService.getAuthToken());
        setAdminPassword('');
        setTestStatus('✅ Signed in successfully! Refreshing live admin data...');
        onRefresh();
      } else {
        setTestStatus(`❌ Sign-in failed: ${result.error}`);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestStatus('Connecting to backend endpoint...');
    try {
      const cleanBase = backendUrl.replace(/\/+$/, '');
      const rootBase = cleanBase.replace(/\/api\/v1$/, '');
      let res = await fetch(`${cleanBase}/health`, { method: 'GET' });
      if (!res.ok && rootBase !== cleanBase) {
        res = await fetch(`${rootBase}/health`, { method: 'GET' });
      }
      if (res.ok) {
        setTestStatus('✅ Connection successful! FastAPI backend is healthy and responding.');
      } else {
        setTestStatus(`⚠️ Server responded with HTTP status ${res.status}`);
      }
    } catch (err: any) {
      setTestStatus(`❌ Could not connect: ${err.message}. Backend might be offline or blocked by CORS.`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="content-panel" style={{ maxWidth: 800 }}>
        <div className="panel-header">
          <div className="panel-title-group">
            <h3>Console & Backend Connectivity Settings</h3>
            <p>Configure API gateway targets, admin authentication, and data synchronization</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Admin Sign-In */}
          <form
            onSubmit={handleAdminLogin}
            style={{
              backgroundColor: 'var(--bg-dark-700)',
              padding: 20,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--text-primary)' }}>
              <Shield size={16} color="var(--brand-primary)" />
              <span>Admin Sign-In (Supabase Auth)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input
                type="email"
                placeholder="admin@edigitalvisitingcard.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                style={{
                  backgroundColor: 'var(--bg-dark-800)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                style={{
                  backgroundColor: 'var(--bg-dark-800)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={isSigningIn}>
                <Key size={14} />
                {isSigningIn ? 'Signing in...' : 'Sign In as Admin'}
              </button>
              {authToken && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    apiService.clearAuthToken();
                    setAuthToken('');
                    setTestStatus('Signed out.');
                  }}
                >
                  Sign Out
                </button>
              )}
            </div>
          </form>

          {/* Backend API Configuration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                FastAPI Gateway Base URL
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="https://api.edigitalvisitingcard.com/api/v1"
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--bg-dark-700)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
                <button
                  className="btn btn-secondary"
                  onClick={testConnection}
                  disabled={isTesting}
                >
                  <Server size={14} />
                  {isTesting ? 'Pinging...' : 'Test Ping'}
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                Endpoint: <code>https://api.edigitalvisitingcard.com/api/v1</code>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Admin Bearer Authorization Token (Auto-populated on Sign In)
              </label>
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                style={{
                  width: '100%',
                  marginTop: 6,
                  backgroundColor: 'var(--bg-dark-700)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <button className="btn btn-primary" onClick={handleSaveUrl}>
                Save Settings
              </button>
            </div>

            {testStatus && (
              <div
                style={{
                  backgroundColor: 'var(--bg-dark-700)',
                  border: '1px solid var(--border-subtle)',
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                }}
              >
                {testStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
