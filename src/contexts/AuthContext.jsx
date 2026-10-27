import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { requestPasswordReset, signIn, signOutUser } from "../services/authService";
import { getUserProfile } from "../services/usersService";

const AuthContext = createContext(null);

const buildFallbackProfile = (firebaseUser) => ({
  id: firebaseUser.uid,
  uid: firebaseUser.uid,
  name: firebaseUser.displayName || firebaseUser.email || "Usuário",
  email: firebaseUser.email || "",
  role: "consulta",
  permissions: {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) {
        return;
      }

      setIsCheckingAuth(true);

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const storedProfile = await getUserProfile(firebaseUser.uid);

        if (!isMounted) {
          return;
        }

        setUser(firebaseUser);
        setProfile(storedProfile || buildFallbackProfile(firebaseUser));
      } catch {
        if (!isMounted) {
          return;
        }

        setUser(firebaseUser);
        setProfile(buildFallbackProfile(firebaseUser));
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback((credentials) => signIn(credentials), []);

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback((email) => requestPasswordReset(email), []);

  const hasRole = useCallback(
    (roles) => {
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      return allowedRoles.includes(profile?.role);
    },
    [profile?.role]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      isCheckingAuth,
      isAuthenticated: Boolean(user),
      login,
      logout,
      resetPassword,
      hasRole
    }),
    [hasRole, isCheckingAuth, login, logout, profile, resetPassword, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
};
