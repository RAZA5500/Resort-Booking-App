import { useCallback, useEffect, useState } from 'react';
import { RouterContext, buildHref, readHash } from './routing';

// A tiny hash router. Hash routing keeps the app deployable as static files
// (GitHub Pages, a plain file:// open) with no server rewrite rules.

export const RouterProvider = ({ children }) => {
  const [route, setRoute] = useState(readHash);

  useEffect(() => {
    const onChange = () => setRoute(readHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  // Every navigation starts the new screen at the top, like a real page load.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.path, route.query.id]);

  const navigate = useCallback((path, query) => {
    window.location.hash = buildHref(path, query).slice(1);
  }, []);

  return (
    <RouterContext.Provider value={{ ...route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const Link = ({ to, query, className = '', children, ...rest }) => (
  <a href={buildHref(to, query)} className={className} {...rest}>
    {children}
  </a>
);
