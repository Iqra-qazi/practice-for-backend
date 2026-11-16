import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getCurrentUser, login as loginRequest, logout as logoutRequest, register as registerRequest } from "../api/auth.js";
import { getApiError } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch((error) => {
        if (!active) return;
        if (![401, 403].includes(error.response?.status)) {
          toast.error(getApiError(error, "Could not connect to the account service."));
        }
        setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const clearSession = () => setUser(null);
    window.addEventListener("auth:unauthorized", clearSession);
    return () => window.removeEventListener("auth:unauthorized", clearSession);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await loginRequest(credentials);
    setUser(response.user);
    return response.user;
  }, []);

  const signup = useCallback(async (credentials) => {
    const response = await registerRequest(credentials);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
