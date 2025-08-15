import { useState, useEffect } from "react";

// Simple demo authentication - in a real app this would connect to your auth system
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for authentication - this is a demo implementation
    // In a real app, you'd check for valid JWT tokens, session cookies, etc.
    const checkAuth = () => {
      try {
        // Demo: Check for a demo auth token in localStorage
        const authToken = localStorage.getItem("kyn_auth_token");
        const demoUser = localStorage.getItem("kyn_user");

        if (authToken && demoUser) {
          setIsAuthenticated(true);
          setUser(JSON.parse(demoUser));
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: any, token: string) => {
    localStorage.setItem("kyn_auth_token", token);
    localStorage.setItem("kyn_user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("kyn_auth_token");
    localStorage.removeItem("kyn_user");
    setIsAuthenticated(false);
    setUser(null);
  };

  // Demo function to simulate login for testing
  const demoLogin = () => {
    const demoUser = {
      id: "demo-user-id",
      name: "Demo User",
      email: "demo@example.com",
      familyId: "demo-family-id",
    };
    login(demoUser, "demo-token-" + Date.now());
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    demoLogin,
  };
}
