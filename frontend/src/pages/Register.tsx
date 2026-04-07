import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/state/auth";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isDonor, setIsDonor] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <Layout>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                New Staff Account
              </p>
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Create access for the internal dashboards.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                This keeps the lovable public frontend intact while enabling donor and admin
                workflows behind authenticated routes.
              </p>
            </div>

            <Card className="border-border/80 bg-card/90 shadow-none">
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Assign donor, admin, or both roles.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-5"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setError(null);
                    setLoading(true);

                    try {
                      if (!isAdmin && !isDonor) {
                        throw new Error("Select at least one role (Donor and/or Admin).");
                      }

                      if (isAdmin && adminCode.trim().length === 0) {
                        throw new Error("Admin code is required to register as an admin.");
                      }

                      const user = await register(
                        firstName,
                        email,
                        username,
                        password,
                        isDonor,
                        isAdmin,
                        adminCode,
                      );

                      navigate(user.isAdmin ? "/admin" : user.isDonor ? "/donor" : "/");
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Registration failed");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="firstName">
                        First name
                      </label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="email">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="new-username">
                        Username
                      </label>
                      <Input
                        id="new-username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="new-password">
                        Password
                      </label>
                      <Input
                        id="new-password"
                        type="password"
                        minLength={6}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-background/70 p-4">
                    <p className="text-sm font-medium text-foreground">Roles</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="flex items-center gap-3 text-sm text-foreground">
                        <Checkbox
                          checked={isDonor}
                          onCheckedChange={(checked) => setIsDonor(checked === true)}
                        />
                        Donor dashboard access
                      </label>
                      <label className="flex items-center gap-3 text-sm text-foreground">
                        <Checkbox
                          checked={isAdmin}
                          onCheckedChange={(checked) => {
                            const next = checked === true;
                            setIsAdmin(next);
                            if (!next) setAdminCode("");
                          }}
                        />
                        Admin dashboard access
                      </label>
                    </div>

                    {isAdmin ? (
                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="adminCode">
                          Admin code
                        </label>
                        <Input
                          id="adminCode"
                          value={adminCode}
                          onChange={(event) => setAdminCode(event.target.value)}
                          required
                        />
                      </div>
                    ) : null}
                  </div>

                  {error ? (
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" className="sm:flex-1" disabled={loading}>
                      {loading ? "Creating..." : "Create account"}
                    </Button>
                    <Button type="button" variant="outline" asChild className="sm:flex-1">
                      <Link to="/login">Back to login</Link>
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
