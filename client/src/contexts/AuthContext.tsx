import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";
import { userService } from "../services";
import type { UserInsert } from "../types/database";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateUserProfile: (updates: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle user status updates
      if (event === "SIGNED_IN" && session?.user) {
        await userService.updateOnlineStatus(session.user.id, true);
      } else if (event === "SIGNED_OUT") {
        // User status will be updated in signOut function
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;

    // Create user profile in our database (insert, not update)
    if (data.user) {
      const userProfile: UserInsert = {
        id: data.user.id,
        email: data.user.email!,
        name: userData.name,
        phone: userData.phone || null,
        avatar: userData.avatar || null,
        initials:
          userData.initials ||
          userData.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase(),
        role: userData.role || null,
        location: userData.location || null,
        interests: userData.interests || [],
        tags: userData.tags || [],
        isOnline: true,
      };

      const created = await userService.createUser(userProfile);
      if (!created.success) {
        throw new Error(created.error || "Failed to create user profile");
      }
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Update user online status
    if (data.user) {
      await userService.updateOnlineStatus(data.user.id, true);
    }

    return data;
  };

  const signOut = async () => {
    // Update user offline status
    if (user) {
      await userService.updateOnlineStatus(user.id, false);
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  };

  const updateUserProfile = async (updates: any) => {
    if (!user) throw new Error("No user logged in");

    const updatedProfile = await userService.updateUser(user.id, updates);
    if (!updatedProfile) {
      throw new Error("Failed to update user profile");
    }

    return updatedProfile;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
