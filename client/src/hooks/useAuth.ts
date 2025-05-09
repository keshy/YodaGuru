import { useState, useCallback, useEffect } from "react";
import { signInWithGoogle, logOut } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/session", {
        credentials: "include"
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { user: googleUser } = await signInWithGoogle();
      
      // Send Google user data to our backend
      const response = await apiRequest("POST", "/api/auth/google", {
        googleId: googleUser.uid,
        email: googleUser.email,
        username: googleUser.displayName || googleUser.email?.split('@')[0] || '',
        firstName: googleUser.displayName?.split(' ')[0] || '',
        lastName: googleUser.displayName?.split(' ').slice(1).join(' ') || '',
        profilePicture: googleUser.photoURL || ''
      });
      
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await logOut();
      setUser(null);
      queryClient.clear();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    loginWithGoogle,
    logout,
    checkSession
  };
}
