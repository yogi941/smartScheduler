import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.api';
import { setAccessToken } from '../api/client';

const AuthContext = createContext(null);

/**
 * Wraps the whole app. On first mount, attempts a silent session restore:
 * calls /auth/refresh-token (which rides on the httpOnly cookie set by a
 * prior login) to obtain a fresh access token without requiring the user
 * to log in again after a page reload. If that fails (no valid cookie,
 * expired session), the user simply lands on the public/login screen —
 * this is expected, not an error state.
 */
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const { accessToken } = await authApi.refreshToken();
        setAccessToken(accessToken);
        const { user: currentUser } = await authApi.getMe();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (error) {
        setAccessToken(null);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser, accessToken } = await authApi.login(credentials);
    setAccessToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: newUser, accessToken } = await authApi.register(payload);
    setAccessToken(accessToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      register,
      logout,
    }),
    [user, isInitializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
