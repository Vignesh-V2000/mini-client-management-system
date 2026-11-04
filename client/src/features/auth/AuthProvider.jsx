import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createSession, deleteSession, getSession } from './authApi.js';
import { api } from '../../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const restoreSession = useCallback(async (signal) => {
    setStatus('loading');
    try {
      const sessionUser = await getSession(signal);
      if (signal?.aborted) return;
      setUser(sessionUser);
      setStatus('ready');
    } catch (error) {
      if (signal?.aborted) return;
      setUser(null);
      setStatus(error.response?.status === 401 ? 'ready' : 'error');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void restoreSession(controller.signal);
    return () => controller.abort();
  }, [restoreSession]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(undefined, (error) => {
      if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
        setUser(null);
      }
      return Promise.reject(error);
    });
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  async function signIn(credentials) {
    setUser(await createSession(credentials));
  }

  async function signOut() {
    try {
      await deleteSession();
    } catch (error) {
      if (error.response?.status !== 401) throw error;
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, status, restoreSession, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
