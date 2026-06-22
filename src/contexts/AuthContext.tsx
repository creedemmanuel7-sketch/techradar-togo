"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthUser {
  firebaseUser: User;
  role: "talent" | "recruiter" | null;
  uid: string;
}

interface AuthContextType {
  authUser: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const role = userDoc.exists() ? userDoc.data().role : null;
          setAuthUser({ firebaseUser, role, uid: firebaseUser.uid });
        } catch {
          setAuthUser({ firebaseUser, role: null, uid: firebaseUser.uid });
        }
      } else {
        setAuthUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
