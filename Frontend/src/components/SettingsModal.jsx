import { useEffect, useState } from 'react';
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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AVATAR_PRESETS, getAvatarPreset } from '../data/avatarPresets';
import { Avatar } from './Avatar';
import { Button, Input, Label } from './ui';

export function SettingsModal({ isOpen, onClose, onUpdated }) {
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

  useEffect(() => {
    if (isOpen && user) {
      setSelectedAvatar(user.avatar || 'lion');
      setName(user.name || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

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

      const updatedUser = await updateProfile(payload);
      setSuccess('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (onUpdated) {
        onUpdated(updatedUser);
      }

      setTimeout(() => {
        onClose();
      }, 900);
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4">
      {/* Backdrop tap to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Container - Bottom sheet on mobile, modal on sm+ */}
      <div className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-line bg-panel shadow-2xl sm:max-h-[88vh] sm:max-w-xl sm:rounded-3xl">
        {/* Mobile drag handle */}
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/20 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">Profile & Settings</h2>
              <p className="text-xs text-white/50">Personalize your avatar and credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
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

          {/* Current Avatar Highlight Card */}
          <div className="flex items-center gap-4 rounded-3xl border border-line bg-panel2/80 p-4">
            <Avatar avatarId={selectedAvatar} size="xl" ring showBadge />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                {currentPreset.badge} Spirit
              </div>
              <div className="truncate text-lg font-black text-white">{currentPreset.name}</div>
              <div className="truncate text-xs text-white/50">{user?.email}</div>
              <div className="mt-1 text-[11px] text-white/40">Tap any animal below to switch</div>
            </div>
          </div>

          {/* Avatar Selection Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <Label>Select Animal Avatar</Label>
              <div className="text-[11px] text-white/45">No upload required</div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-xl px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                    filterCategory === cat
                      ? 'bg-accent text-black shadow-sm'
                      : 'border border-line bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="mt-2 grid grid-cols-4 gap-2.5 sm:grid-cols-4">
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
                      className={`mt-1.5 truncate text-[11px] font-medium leading-none ${
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

          {/* Username Section */}
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
            <p className="text-[11px] text-white/40">Visible to everyone on the walking leaderboard.</p>
          </div>

          {/* Password Change Section */}
          <div className="rounded-3xl border border-line bg-panel2/60 p-4 space-y-3.5">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/80">
                Change Password
              </span>
            </div>
            <p className="text-[11px] text-white/40">
              Leave these fields blank if you do not want to change your password.
            </p>

            <div className="space-y-2.5 pt-1">
              {/* Current Password */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-white/60">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
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
                <label className="mb-1 block text-[11px] font-medium text-white/60">
                  New Password (min 8 chars)
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
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
                <label className="mb-1 block text-[11px] font-medium text-white/60">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
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

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 py-3 text-xs"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 py-3 text-xs"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
