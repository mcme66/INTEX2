import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/state/auth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <Layout>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Staff Access
              </p>
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Sign in to the North Star internal workspace.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Use your existing credentials to review donor records, operational updates, and
                impact reporting without changing the public-facing design of the site.
              </p>
            </div>

            <Card className="border-border/80 bg-card/90 shadow-none">
              <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription>Access donor and admin tools.</CardDescription>
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
                      Username
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
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>

                  {error ? (
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" className="sm:flex-1" disabled={loading}>
                      {loading ? "Signing in..." : "Sign in"}
                    </Button>
                    <Button type="button" variant="outline" asChild className="sm:flex-1">
                      <Link to="/register">Create account</Link>
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
