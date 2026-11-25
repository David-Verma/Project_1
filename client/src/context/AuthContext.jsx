import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { if (!localStorage.getItem('hashnode-token')) { setLoading(false); return; } api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('hashnode-token')).finally(() => setLoading(false)); }, []);
  const authenticate = data => { localStorage.setItem('hashnode-token', data.token); setUser(data.user); };
  const logout = () => { localStorage.removeItem('hashnode-token'); setUser(null); };
  const updateUser = next => setUser(next);
  return <AuthContext.Provider value={{ user, loading, authenticate, logout, updateUser }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
