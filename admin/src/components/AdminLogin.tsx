import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  error?: string | null;
  onClearError?: () => void;
}

const mapAuthError = (code?: string): string => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection.';
    default:
      return 'Login failed. Please try again.';
  }
};

export default function AdminLogin({ error, onClearError }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setFormError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setFormError('');
    onClearError?.();
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      setFormError(mapAuthError(err?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117', padding: 20 }}>
      <form
        onSubmit={handleSubmit}
        style={{ width: '100%', maxWidth: 400, background: '#131a24', border: '1px solid rgba(56, 189, 248, 0.12)', borderRadius: 20, padding: 40, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
            <ShieldCheck size={26} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Sora', fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>Admin Login</h1>
            <p style={{ color: '#8B9BBE', fontSize: 13, marginTop: 4, fontFamily: 'Outfit' }}>Laptopkart Dashboard</p>
          </div>
        </div>

        {(error || formError) && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#F87171', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 16, fontFamily: 'Outfit' }}>
            {error || formError}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Outfit' }}>
            Email
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8B9BBE' }} />
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your mail id"
              style={{ paddingLeft: 42 }}
              autoComplete="email"
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Outfit' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8B9BBE' }} />
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              style={{ paddingLeft: 42 }}
              autoComplete="current-password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #3B82F6, #38BDF8)',
            color: '#0d1117',
            border: 'none',
            borderRadius: 12,
            padding: '14px 20px',
            fontSize: 14,
            fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Outfit',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
