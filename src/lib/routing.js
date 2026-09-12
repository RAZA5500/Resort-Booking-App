import { createContext, useContext } from 'react';

// Non-component half of the hash router: context, hook and pure path helpers.
// Kept separate from router.jsx so that file only exports components.

export const RouterContext = createContext(null);

export const readHash = () => {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, search = ''] = raw.split('?');
  return {
    path: path.startsWith('/') ? path : `/${path}`,
    query: Object.fromEntries(new URLSearchParams(search)),
  };
};

export const buildHref = (path, query) => {
  const search = query ? new URLSearchParams(query).toString() : '';
  return `#${path}${search ? `?${search}` : ''}`;
};

export const useRouter = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used inside <RouterProvider>');
  return ctx;
};

// Matches "/listing/:id" against "/listing/3" and returns { id: '3' }, or null.
export const matchPath = (pattern, path) => {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const segment = patternParts[i];
    if (segment.startsWith(':')) {
      params[segment.slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (segment !== pathParts[i]) {
      return null;
    }
  }
  return params;
};
