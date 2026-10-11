export function getAvatarColor(alias: string | undefined | null): string {
  if (!alias) return 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white';
  
  // Vibrant Discord/Instagram style gradients
  const gradients = [
    'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white',
    'bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 text-white',
    'bg-gradient-to-tr from-pink-500 via-rose-500 to-yellow-400 text-white',
    'bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 text-white',
    'bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-white',
    'bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white',
    'bg-gradient-to-tr from-fuchsia-500 via-pink-500 to-rose-500 text-white',
  ];
  const hash = alias.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

export function getInitials(name: string | undefined | null): string {
  if (!name) return 'CC';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
