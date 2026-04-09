import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/state/auth";
import { useLanguage } from "@/state/language";

const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledUsername =
    typeof location.state === "object" && location.state && "username" in location.state
      ? String(location.state.username ?? "")
      : "";

  const [username, setUsername] = useState(prefilledUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsername(prefilledUsername);
  }, [prefilledUsername]);

  return (
    <Layout>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
            <div className="max-w-2xl">
              <h1 className="font-heading text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                {t("loginHeadline")}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {t("loginSub")}
              </p>
            </div>

            <Card className="border-border/80 bg-card/90 shadow-none">
              <CardHeader>
                <CardTitle>{t("loginSignIn")}</CardTitle>
                <CardDescription>{t("loginAccessTools")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-5"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setError(null);
                    setLoading(true);

                    try {
                      const user = await login(username, password);
                      navigate(user.isAdmin ? "/admin" : user.isDonor ? "/donor" : "/");
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Login failed");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="username">
                      {t("loginUsernameLabel")}
                    </label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="password">
                      {t("loginPasswordLabel")}
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        className="pr-10"
                        autoFocus={prefilledUsername.length > 0}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error ? (
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" className="sm:flex-1" disabled={loading}>
                      {loading ? t("loginSigningIn") : t("loginSignInBtn")}
                    </Button>
                    <Button type="button" variant="outline" asChild className="sm:flex-1">
                      <Link to="/register">{t("loginCreateAccount")}</Link>
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

export default Login;
