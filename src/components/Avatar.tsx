import { useMemo } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  onClick?: () => void;
  title?: string;
}

function initialsOf(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join('') || '?';
}

function colorFromName(name?: string | null) {
  if (!name) return '#3b82f6';
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const palette = [
    '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6',
  ];
  return palette[h % palette.length];
}

export function Avatar({ src, name, size = 36, className = '', onClick, title }: AvatarProps) {
  const initials = useMemo(() => initialsOf(name), [name]);
  const bg = useMemo(() => colorFromName(name), [name]);
  const style: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    fontSize: Math.max(11, Math.floor(size / 2.6)),
    background: src ? '#1f2937' : bg,
  };
  const baseCls =
    'inline-flex items-center justify-center rounded-full text-white font-semibold overflow-hidden select-none ' +
    (onClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-400/60 transition ' : '');

  return (
    <span
      className={baseCls + className}
      style={style}
      onClick={onClick}
      title={title || name || ''}
    >
      {src ? (
        <img src={src} alt={name || 'avatar'} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  );
}
