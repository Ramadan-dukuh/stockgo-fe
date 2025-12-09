// hooks/useAuth.js
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            name: decoded.full_name || decoded.name || "User",
          });
        } catch (decodeError) {
          console.error("Token decode error:", decodeError);
          localStorage.removeItem("token");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    localStorage.setItem("token", token);
    checkAuth();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const hasPermission = (requiredRole) => {
    if (!user) return false;

    // Role hierarchy: admin > dispatcher > petugas_gudang
    const roleHierarchy = {
      admin: 3,
      dispatcher: 2,
      petugas_gudang: 1,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  return { user, loading, login, logout, hasPermission };
}
