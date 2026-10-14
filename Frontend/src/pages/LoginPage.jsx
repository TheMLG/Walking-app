import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Label } from '../components/ui';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-8">
          <div className="text-3xl font-black">WalkWar</div>
          <p className="mt-2 text-sm text-white/60">Sign in to see your walking stats and the global leaderboard.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required />
          </div>
          <div>
            <Label>Password</Label>
            <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required />
          </div>
          {error ? <div className="text-sm text-red-400">{error}</div> : null}
          <Button className="w-full" type="submit" disabled={busy}>
            {busy ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <div className="mt-6 text-sm text-white/55">
          No account yet?{' '}
          <Link className="text-accent" to="/register">
            Create one
          </Link>
        </div>
      </Card>
    </div>
  );
}
