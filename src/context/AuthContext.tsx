import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import { postLoginApi, postRegisterApi } from "../components/Api/postapi";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    role: "user" | "venue_owner"
  ) => Promise<boolean>;
  isAuthenticated: boolean;
  token?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    try {
      const response = await postLoginApi({ email, password });
      if (response.status === 200) {
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        return user; // Return user or null
      }
      return null;
    } catch {
      return null;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    role: "user" | "venue_owner"
  ): Promise<boolean> => {
    try {
      const response = await postRegisterApi({
        name,
        email,
        password,
        confirmPassword,
        role,
      });
      if (response.status === 201) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated: !!token,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
