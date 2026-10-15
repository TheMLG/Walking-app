import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Label } from '../components/ui';

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', avatar: 'lion' });
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
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  const quickAvatars = ['lion', 'wolf', 'fox', 'tiger', 'eagle', 'dragon', 'bear', 'owl'];

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-5 sm:p-7">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.25em] text-accent/80 font-semibold">Get Started</div>
          <div className="mt-1 text-3xl font-black text-white">Join WalkWar</div>
          <p className="mt-1 text-xs sm:text-sm text-white/60">Choose your avatar and track every step on the treadmill.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Spirit Avatar Quick Picker */}
          <div>
            <Label>Choose Your Spirit Avatar</Label>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {quickAvatars.map((id) => {
                const isSelected = form.avatar === id;
                const emojiMap = {
                  lion: '🦁', wolf: '🐺', fox: '🦊', tiger: '🐯',
                  eagle: '🦅', dragon: '🐉', bear: '🐻', owl: '🦉'
                };
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setForm({ ...form, avatar: id })}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-2 text-xl transition-all active:scale-95 ${
                      isSelected
                        ? 'border-accent bg-accent/20 ring-2 ring-accent/60 shadow-glow'
                        : 'border-line bg-black/25 hover:border-white/20'
                    }`}
                  >
                    <span>{emojiMap[id]}</span>
                    <span className="text-[10px] mt-0.5 capitalize text-white/70">{id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Username / Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required />
          </div>
          <div>
            <Label>Password (min 8 chars)</Label>
            <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" minLength={8} required />
          </div>
          {error ? <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-2.5">{error}</div> : null}
          <Button className="w-full text-xs py-3" type="submit" disabled={busy}>
            {busy ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-6 text-sm text-white/55">
          Already have an account?{' '}
          <Link className="text-accent" to="/login">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
