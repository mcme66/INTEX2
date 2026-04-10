import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiDeleteAccount,
  apiDisableMfa,
  apiEnableMfa,
  apiGetMe,
  apiLogin,
  apiRegister,
  apiRegenerateRecoveryCodes,
  apiSetupMfa,
  apiUpdateProfile,
  apiVerifyMfaLogin,
  type UserDto,
} from "@/utils/api";

type LoginResult =
  | { status: "authenticated"; user: UserDto }
  | { status: "mfa_required"; mfaToken: string };

type AuthState = {
  user: UserDto | null;
  token: string | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  verifyMfaLogin: (mfaToken: string, code: string) => Promise<UserDto>;
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
  setupMfa: (currentPassword: string) => Promise<{ manualEntryKey: string; otpAuthUri: string }>;
  enableMfa: (currentPassword: string, code: string) => Promise<string[]>;
  disableMfa: (currentPassword: string, code: string) => Promise<UserDto>;
  regenerateRecoveryCodes: (currentPassword: string, code: string) => Promise<string[]>;
  deleteAccount: (currentPassword: string, code?: string) => Promise<void>;
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
    if (res.requiresMfa) {
      if (!res.mfaToken) throw new Error("MFA challenge token missing");
      return { status: "mfa_required", mfaToken: res.mfaToken } satisfies LoginResult;
    }

    if (!res.auth) throw new Error("Authentication response missing");
    persist(res.auth.token, res.auth.user);
    return { status: "authenticated", user: res.auth.user } satisfies LoginResult;
  }

  async function verifyMfaLogin(mfaToken: string, code: string) {
    const res = await apiVerifyMfaLogin({ mfaToken, code });
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

  async function setupMfa(currentPassword: string) {
    if (!token) throw new Error("Not authenticated");
    return apiSetupMfa(token, { currentPassword });
  }

  async function enableMfa(currentPassword: string, code: string) {
    if (!token) throw new Error("Not authenticated");
    const res = await apiEnableMfa(token, { currentPassword, code });
    await refreshMe();
    return res.recoveryCodes;
  }

  async function disableMfa(currentPassword: string, code: string) {
    if (!token) throw new Error("Not authenticated");
    const res = await apiDisableMfa(token, { currentPassword, code });
    persist(res.token, res.user);
    return res.user;
  }

  async function regenerateRecoveryCodes(currentPassword: string, code: string) {
    if (!token) throw new Error("Not authenticated");
    const res = await apiRegenerateRecoveryCodes(token, { currentPassword, code });
    return res.recoveryCodes;
  }

  async function deleteAccount(currentPassword: string, code?: string) {
    if (!token) throw new Error("Not authenticated");
    await apiDeleteAccount(token, { currentPassword, code });
    persist(null, null);
    navigate("/", { replace: true });
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

  const value: AuthState = {
    user,
    token,
    login,
    verifyMfaLogin,
    register,
    logout,
    refreshMe,
    updateProfile,
    setupMfa,
    enableMfa,
    disableMfa,
    regenerateRecoveryCodes,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
