import { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Sparkles,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AVATAR_PRESETS, getAvatarPreset } from '../data/avatarPresets';
import { Avatar } from '../components/Avatar';
import { Button, Card, Label } from '../components/ui';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'lion');
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentPreset = getAvatarPreset(selectedAvatar);
  const categories = ['All', 'Predator', 'Agility', 'Titan', 'Mystic'];
  const filteredPresets =
    filterCategory === 'All'
      ? AVATAR_PRESETS
      : AVATAR_PRESETS.filter((p) => p.category === filterCategory);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please provide a username.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }

    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        setError('Please enter your current password to set a new password.');
        return;
      }
      if (newPassword.length < 8) {
        setError('New password must be at least 8 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        avatar: selectedAvatar
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await updateProfile(payload);
      setSuccess('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update profile. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.25em] text-accent/70 font-semibold">Account settings</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Profile & Security</h1>
        <p className="mt-1 text-sm text-white/60">Customize your avatar, username, and secure your credentials.</p>
      </div>

      <Card className="p-5 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Alerts */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-accent/40 bg-accent/10 p-3.5 text-xs text-accent">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Current Avatar Card */}
          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-3xl border border-line bg-panel2/80 p-5">
            <Avatar avatarId={selectedAvatar} size="2xl" ring showBadge />
            <div className="min-w-0 text-center sm:text-left flex-1">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                {currentPreset.badge} Spirit Avatar
              </div>
              <div className="truncate text-xl font-black text-white">{currentPreset.name}</div>
              <div className="truncate text-xs text-white/50">{user?.email}</div>
              <p className="mt-2 text-xs text-white/40">
                Select your spirit animal below. This will be your identity on the leaderboard!
              </p>
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <Label>Select Animal Avatar</Label>
              <span className="text-xs text-white/40">16 unique styles</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    filterCategory === cat
                      ? 'bg-accent text-black shadow-sm'
                      : 'border border-line bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="mt-2.5 grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {filteredPresets.map((preset) => {
                const isSelected = selectedAvatar === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAvatar(preset.id)}
                    className={`group relative flex flex-col items-center justify-center rounded-2xl border p-2.5 transition-all active:scale-95 ${
                      isSelected
                        ? 'border-accent bg-accent/15 ring-2 ring-accent/60 shadow-glow'
                        : 'border-line bg-black/25 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-black shadow">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                    <span className="text-2xl transition-transform group-hover:scale-110 filter drop-shadow">
                      {preset.emoji}
                    </span>
                    <span
                      className={`mt-1.5 truncate text-[10px] font-medium leading-none ${
                        isSelected ? 'text-accent font-bold' : 'text-white/70'
                      }`}
                    >
                      {preset.name.split(' ')[1] || preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-1.5">
            <Label>Username / Display Name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your username"
                maxLength={80}
                className="w-full rounded-2xl border border-line bg-black/25 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          {/* Password Security Section */}
          <div className="rounded-3xl border border-line bg-panel2/60 p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/80">
                Security & Password
              </span>
            </div>
            <p className="text-xs text-white/40">
              Leave these fields blank if you do not want to change your password.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {/* Current Password */}
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full rounded-xl border border-line bg-black/30 px-3.5 py-2.5 pr-10 text-xs text-white placeholder:text-white/30 outline-none focus:border-accent/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showCurrentPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">New Password (8+ chars)</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full rounded-xl border border-line bg-black/30 px-3.5 py-2.5 pr-10 text-xs text-white placeholder:text-white/30 outline-none focus:border-accent/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showNewPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Confirm New</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new"
                    className="w-full rounded-xl border border-line bg-black/30 px-3.5 py-2.5 pr-10 text-xs text-white placeholder:text-white/30 outline-none focus:border-accent/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showConfirmPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
