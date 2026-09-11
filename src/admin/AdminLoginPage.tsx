import { FormEvent, useState } from 'react';
import { ArrowRight, PawPrint, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';

export function AdminLoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
    }
  };

  return (
    <div className="admin-login-page page-wrap">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <PawPrint aria-hidden="true" />
          <div>
            <span className="eyebrow">PALS ADMIN</span>
            <h1>Support Dashboard</h1>
          </div>
        </div>
        <p>Sign in to manage support tickets.</p>
        <form onSubmit={submit} className="admin-login-form" noValidate>
          <label>
            <span>Email address</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <div className="form-status error" role="alert">
              <ShieldCheck aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
          <button className="button button-blue submit-button" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
            <ArrowRight aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
