import { getAvatarPreset } from '../data/avatarPresets';

const SIZES = {
  xs: 'w-7 h-7 text-xs rounded-xl border',
  sm: 'w-9 h-9 text-base rounded-2xl border',
  md: 'w-11 h-11 text-xl rounded-2xl border-[1.5px]',
  lg: 'w-14 h-14 text-2xl rounded-3xl border-2',
  xl: 'w-20 h-20 text-4xl rounded-3xl border-2',
  '2xl': 'w-24 h-24 text-5xl rounded-[2rem] border-2'
};

export function Avatar({
  avatarId,
  size = 'md',
  className = '',
  ring = false,
  showBadge = false,
  interactive = false,
  onClick
}) {
  const preset = getAvatarPreset(avatarId);
  const sizeClasses = SIZES[size] || SIZES.md;

  return (
    <div
      role={interactive || onClick ? 'button' : undefined}
      tabIndex={interactive || onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${preset.name} avatar`}
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden transition-all duration-200 bg-gradient-to-br ${preset.gradient} ${preset.border} ${sizeClasses} ${
        ring ? 'ring-2 ring-accent/60 shadow-lg' : ''
      } ${
        interactive || onClick
          ? 'cursor-pointer hover:scale-105 active:scale-95 hover:border-accent/80 hover:shadow-glow'
          : ''
      } ${className}`}
      style={{
        boxShadow: ring
          ? `0 0 16px ${preset.glow}, inset 0 0 12px ${preset.glow}`
          : `0 4px 12px rgba(0,0,0,0.3)`
      }}
    >
      {/* Dynamic backdrop ambient light */}
      <span className="absolute inset-0 bg-white/5 opacity-50 backdrop-blur-[1px]" />
      <span className="relative z-10 filter drop-shadow-md transition-transform duration-200">
        {preset.emoji}
      </span>

      {showBadge && (
        <span
          className={`absolute -bottom-1 -right-1 z-20 rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-black/80 border border-white/20 ${preset.text}`}
        >
          {preset.badge}
        </span>
      )}
    </div>
  );
}
