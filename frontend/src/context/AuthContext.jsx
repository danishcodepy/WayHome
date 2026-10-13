import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/** Decode JWT exp (seconds) without a library — just base64 the payload. */
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds; Date.now() is ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return false; // If we can't parse it, let the backend decide
  }
}

function readStored() {
  try {
    const raw =
      sessionStorage.getItem('reh_user') ||
      localStorage.getItem('reh_user') ||
      'null';
    const user = JSON.parse(raw);
    // Discard on startup if the JWT is already expired
    if (user?.token && isTokenExpired(user.token)) {
      localStorage.removeItem('reh_user');
      sessionStorage.removeItem('reh_user');
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStored);
  const [remember, setRemember] = useState(() => {
    try {
      return !sessionStorage.getItem('reh_user');
    } catch {
      return true;
    }
  });

  // Persist user whenever it changes
  useEffect(() => {
    try {
      localStorage.removeItem('reh_user');
      sessionStorage.removeItem('reh_user');
      if (user) {
        (remember ? localStorage : sessionStorage).setItem(
          'reh_user',
          JSON.stringify(user)
        );
      }
    } catch {}
  }, [user, remember]);

  // Auto-logout on 401 OR 403 from the backend
  useEffect(() => {
    const expire = () => setUser(null);
    window.addEventListener('reh-auth-expired', expire);
    window.addEventListener('reh-auth-forbidden', expire);
    return () => {
      window.removeEventListener('reh-auth-expired', expire);
      window.removeEventListener('reh-auth-forbidden', expire);
    };
  }, []);

  const login = (next, options = {}) => {
    setRemember(options.remember ?? true);
    setUser(next);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateProfile: patch => setUser(u => ({ ...u, ...patch })) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
