import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Set the Authorization header synchronously at module load, so the very first
// requests (e.g. the cart fetch) already carry the token.
const readStoredToken = () => {
  try { return localStorage.getItem("token"); } catch { return null; }
};
const initialToken = readStoredToken();
if (initialToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(!!initialToken);

  const logout = useCallback(() => {
    try { localStorage.removeItem("token"); } catch {}
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    let cancelled = false;
    (async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/me`);
        if (!cancelled) setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, logout]);

  const applyAuth = useCallback((access_token, userData) => {
    try { localStorage.setItem("token", access_token); } catch {}
    axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    setUser(userData);
    setToken(access_token);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    applyAuth(access_token, userData);
    return userData;
  }, [applyAuth]);

  const register = useCallback(async (email, password, name) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, { email, password, name });
    const { access_token, user: userData } = response.data;
    applyAuth(access_token, userData);
    return userData;
  }, [applyAuth]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
