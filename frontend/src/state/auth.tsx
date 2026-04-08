import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetMe, apiLogin, apiRegister, apiUpdateProfile, type UserDto } from "@/utils/api";

type AuthState = {
  user: UserDto | null;
  token: string | null;
  login: (username: string, password: string) => Promise<UserDto>;
  register: (
    firstName: string,
    email: string,
    username: string,
    password: string,
    isDonor: boolean,
    isAdmin: boolean,
    adminCode?: string,
  ) => Promise<UserDto>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  updateProfile: (input: {
    firstName: string;
    email: string;
    username: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<UserDto>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const LS_TOKEN = "intex.token";
const LS_USER = "intex.user";
const LEGACY_LS_TOKEN = "token";
const LEGACY_LS_USER = "user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(LS_TOKEN) ?? localStorage.getItem(LEGACY_LS_TOKEN),
  );
  const [user, setUser] = useState<UserDto | null>(() => {
    const raw = localStorage.getItem(LS_USER) ?? localStorage.getItem(LEGACY_LS_USER);
    return raw ? (JSON.parse(raw) as UserDto) : null;
  });

  function persist(nextToken: string | null, nextUser: UserDto | null) {
    setToken(nextToken);
    setUser(nextUser);

    if (nextToken) {
      localStorage.setItem(LS_TOKEN, nextToken);
      localStorage.setItem(LEGACY_LS_TOKEN, nextToken);
    } else {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LEGACY_LS_TOKEN);
    }

    if (nextUser) {
      localStorage.setItem(LS_USER, JSON.stringify(nextUser));
      localStorage.setItem(LEGACY_LS_USER, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(LS_USER);
      localStorage.removeItem(LEGACY_LS_USER);
    }
  }

  async function login(username: string, password: string) {
    const res = await apiLogin({ username, password });
    persist(res.token, res.user);
    return res.user;
  }

  async function register(
    firstName: string,
    email: string,
    username: string,
    password: string,
    isDonor: boolean,
    isAdmin: boolean,
    adminCode?: string,
  ) {
    const res = await apiRegister({
      firstName,
      email,
      username,
      password,
      isDonor,
      isAdmin,
      adminCode,
    });
    persist(res.token, res.user);
    return res.user;
  }

  function logout() {
    persist(null, null);
    navigate("/", { replace: true });
  }

  async function updateProfile(input: {
    firstName: string;
    email: string;
    username: string;
    currentPassword?: string;
    newPassword?: string;
  }) {
    if (!token) throw new Error("Not authenticated");
    const res = await apiUpdateProfile(token, input);
    persist(res.token, res.user);
    return res.user;
  }

  async function refreshMe() {
    if (!token) {
      if (user) {
        persist(null, null);
      }
      return;
    }

    try {
      const me = await apiGetMe(token);
      persist(token, me);
    } catch {
      persist(null, null);
    }
  }

  useEffect(() => {
    void refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value: AuthState = { user, token, login, register, logout, refreshMe, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
