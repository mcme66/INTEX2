import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { apiRegister } from "@/utils/api";
import { useLanguage } from "@/state/language";

const Register = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasCode, setHasCode] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  return (
    <Layout>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
            <div className="max-w-2xl">
              <h1 className="font-heading text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                {t("registerHeadline")}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {t("registerSub")}
              </p>
            </div>

            <Card className="border-border/80 bg-card/90 shadow-none">
              <CardHeader>
                <CardTitle>{t("registerCardTitle")}</CardTitle>
                <CardDescription>{t("registerAllAccounts")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-5"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setError(null);
                    setEmailError(null);
                    setLoading(true);

                    try {
                      if (!isValidEmail(email)) {
                        setEmailError("Please enter a valid email address (e.g. name@example.com).");
                        setLoading(false);
                        return;
                      }

                      if (password.length < 14) {
                        throw new Error(t("registerErrPwdShort"));
                      }

                      if (!passwordsMatch) {
                        throw new Error(t("registerErrPwdMismatch"));
                      }

                      if (hasCode && adminCode.trim().length === 0) {
                        throw new Error(t("registerErrEnterCode"));
                      }

                      const isAdmin = hasCode && adminCode.trim().length > 0;

                      await apiRegister({
                        firstName,
                        email,
                        username,
                        password,
                        isDonor: true,
                        isAdmin,
                        adminCode,
                      });

                      navigate("/login", { state: { username } });
                    } catch (err) {
                      setError(err instanceof Error ? err.message : t("registerErrFailed"));
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="firstName">
                        {t("registerFirstName")}
                      </label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        autoComplete="given-name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="email">
                        {t("registerEmail")}
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => { setEmail(event.target.value); setEmailError(null); }}
                        autoComplete="email"
                        required
                      />
                      {emailError && (
                        <p className="text-xs text-destructive">{emailError}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="new-username">
                      {t("registerUsername")}
                    </label>
                    <Input
                      id="new-username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="new-password">
                        {t("registerPassword")}
                      </label>
                      {/* Password policy: minimum 14 characters, no complexity requirements */}
                      <p className="text-xs text-muted-foreground">{t("registerPasswordMin")}</p>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          minLength={14}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          autoComplete="new-password"
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          aria-pressed={showPassword}
                          aria-controls="new-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="confirm-password">
                        {t("registerVerifyPassword")}
                      </label>
                      <p className="text-xs text-muted-foreground">{t("registerPasswordMin")}</p>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          minLength={14}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          autoComplete="new-password"
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                          aria-pressed={showConfirmPassword}
                          aria-controls="confirm-password"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="text-xs text-destructive">{t("registerPwdMismatchInline")}</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-background/70 p-4">
                    <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
                      <Checkbox
                        checked={hasCode}
                        onCheckedChange={(checked) => {
                          setHasCode(checked === true);
                          if (!checked) setAdminCode("");
                        }}
                      />
                      {t("registerHasCode")}
                    </label>

                    {hasCode && (
                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="adminCode">
                          {t("registerCodeLabel")}
                        </label>
                        <div className="relative">
                          <Input
                            id="adminCode"
                            type={showAdminCode ? "text" : "password"}
                            value={adminCode}
                            onChange={(event) => setAdminCode(event.target.value)}
                            placeholder={t("registerCodePlaceholder")}
                            autoFocus
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowAdminCode(p => !p)}
                            tabIndex={-1}
                          >
                            {showAdminCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {error ? (
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" className="sm:flex-1" disabled={loading || (confirmPassword.length > 0 && !passwordsMatch)}>
                      {loading ? t("registerCreating") : t("registerCreateAccount")}
                    </Button>
                    <Button type="button" variant="outline" asChild className="sm:flex-1">
                      <Link to="/login">{t("registerBackToLogin")}</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
