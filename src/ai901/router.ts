import { useSyncExternalStore } from 'react';

// Hash-based routes under #/ai901 so lesson URLs are linkable and the browser back
// button works, without touching the existing app's /cinematic path handling.
export type Route =
  | { view: 'home' }
  | { view: 'prologue' }
  | { view: 'chapter'; id: string }
  | { view: 'lesson'; id: string }
  | { view: 'quiz'; id: string }
  | { view: 'practice' }
  | { view: 'final' }
  | { view: 'review' }
  | { view: 'notes'; q?: string }
  | { view: 'glossary' }
  | { view: 'guide' }
  | { view: 'progress' }
  | { view: 'lab' }
  | { view: 'complete' };

const PREFIX = '#/ai901';

export function parse(hash: string): Route {
  if (!hash.startsWith(PREFIX)) return { view: 'home' };
  const [path, query = ''] = hash.slice(PREFIX.length).split('?');
  const [, view, id] = path.split('/');
  switch (view) {
    case 'prologue': case 'practice': case 'final': case 'review': case 'glossary': case 'guide': case 'progress': case 'complete': case 'lab':
      return { view };
    case 'chapter': case 'lesson': case 'quiz':
      return id ? { view, id: decodeURIComponent(id) } : { view: 'home' };
    case 'notes':
      return { view: 'notes', q: new URLSearchParams(query).get('q') ?? undefined };
    default:
      return { view: 'home' };
  }
}

export function toHash(r: Route): string {
  switch (r.view) {
    case 'home': return PREFIX;
    case 'chapter': case 'lesson': case 'quiz': return `${PREFIX}/${r.view}/${encodeURIComponent(r.id)}`;
    case 'notes': return `${PREFIX}/notes${r.q ? `?q=${encodeURIComponent(r.q)}` : ''}`;
    default: return `${PREFIX}/${r.view}`;
  }
}

export function navigate(r: Route) {
  const h = toHash(r);
  if (window.location.hash !== h) window.location.hash = h;
  window.scrollTo({ top: 0 });
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  return parse(hash);
}
