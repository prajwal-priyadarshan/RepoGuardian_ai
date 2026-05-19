import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Made with Bob

export const getDisplayName = (repo: any) => {
  if (!repo) return 'Unnamed Repository';
  const name = repo.name || '';
  const url = (repo.url || repo.repo_url || '') as string;
  const uuidLike = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-/.test(name);
  if (!name || uuidLike) {
    if (url) {
      try {
        const cleaned = url.replace(/\/+$/, '');
        const withoutGit = cleaned.endsWith('.git') ? cleaned.slice(0, -4) : cleaned;
        const parts = withoutGit.split('/').filter(Boolean);
        if (parts.length) return parts[parts.length - 1];
      } catch (e) {
        return name || repo.id;
      }
    }
    return name || repo.id;
  }
  return name;
};
