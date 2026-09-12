import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './auth-context';
import { api, setAccessToken, setUnauthenticatedHandler } from '../api/client';
import { auth as authApi, favorites as favApi } from '../api/endpoints';
import { ROLES } from '../lib/constants';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [savedIds, setSavedIds] = useState([]);

  const loadFavorites = useCallback(async (forUser) => {
    if (!forUser || forUser.role !== ROLES.CUSTOMER) {
      setSavedIds([]);
      return;
    }
    try {
      const { hotelIds } = await favApi.list();
      setSavedIds(hotelIds);
    } catch {
      setSavedIds([]);
    }
  }, []);

  // On boot, trade the httpOnly refresh cookie for an access token. A 401 here
  // just means "not signed in" — it is the normal path for a new visitor.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { user: me } = await api.refresh();
        if (cancelled) return;
        setUser(me);
        await loadFavorites(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadFavorites]);

  // When a refresh finally fails mid-session, drop back to signed-out state.
  useEffect(() => {
    setUnauthenticatedHandler(() => {
      setUser(null);
      setSavedIds([]);
    });
    return () => setUnauthenticatedHandler(null);
  }, []);

  const adopt = useCallback(
    async (payload) => {
      setAccessToken(payload.accessToken);
      setUser(payload.user);
      await loadFavorites(payload.user);
      return payload.user;
    },
    [loadFavorites]
  );

  const value = useMemo(
    () => ({
      user,
      ready,
      savedIds,
      isAuthenticated: Boolean(user),
      is: (...roles) => Boolean(user) && roles.includes(user.role),

      login: async (credentials) => adopt(await authApi.login(credentials)),
      register: async (details) => adopt(await authApi.register(details)),

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          setAccessToken(null);
          setUser(null);
          setSavedIds([]);
        }
      },

      updateProfile: async (patch) => {
        const { user: updated } = await authApi.updateProfile(patch);
        setUser(updated);
        return updated;
      },

      changePassword: async (body) => {
        const result = await authApi.changePassword(body);
        if (result.accessToken) setAccessToken(result.accessToken);
        return result;
      },

      isSaved: (hotelId) => savedIds.includes(hotelId),

      toggleSaved: async (hotelId) => {
        const saved = savedIds.includes(hotelId);
        // Optimistic: the heart flips immediately and rolls back on failure.
        setSavedIds((ids) => (saved ? ids.filter((id) => id !== hotelId) : [...ids, hotelId]));
        try {
          if (saved) await favApi.remove(hotelId);
          else await favApi.add(hotelId);
          return !saved;
        } catch (err) {
          setSavedIds((ids) => (saved ? [...ids, hotelId] : ids.filter((id) => id !== hotelId)));
          throw err;
        }
      },
    }),
    [user, ready, savedIds, adopt]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
