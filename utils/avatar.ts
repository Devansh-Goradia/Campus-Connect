export function getAvatarColor(alias: string | undefined | null): string {
  if (!alias) return 'bg-surface-muted';
  
  const hash = alias.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const colors = [
    'bg-violet-500', 
    'bg-emerald-500', 
    'bg-rose-500', 
    'bg-amber-500', 
    'bg-sky-500', 
    'bg-teal-500', 
    'bg-fuchsia-500', 
    'bg-orange-500',
    'bg-neon-cyan',
    'bg-neon-purple'
  ];
  return colors[hash % colors.length];
}

export function getInitials(name: string | undefined | null): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
