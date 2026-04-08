import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { apiRegister } from "@/utils/api";

const Register = () => {
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password === confirmPassword;

  return (
    <Layout>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
            <div className="max-w-2xl">
              <h1 className="font-heading text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Create an account to get involved with North Star.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Sign up to track your giving history, manage your donation preferences, and
                see the direct impact your contributions are making for children in Colombia.
              </p>
            </div>

            <Card className="border-border/80 bg-card/90 shadow-none">
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>All accounts receive donor access by default.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-5"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setError(null);
                    setLoading(true);

                    try {
                      if (password.length < 14) {
                        throw new Error("Password must be at least 14 characters.");
                      }

                      if (!passwordsMatch) {
                        throw new Error("Passwords do not match.");
                      }

                      if (hasCode && adminCode.trim().length === 0) {
                        throw new Error("Please enter your registration code.");
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

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="new-password">
                        Password
                      </label>
                      {/* Password policy: minimum 14 characters, no complexity requirements */}
                      <p className="text-xs text-muted-foreground">Must be at least 14 characters.</p>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          minLength={14}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                          className="pr-10"
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="confirm-password">
                        Verify Password
                      </label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          minLength={14}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="text-xs text-destructive">Passwords do not match.</p>
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
                      Do you have a registration code?
                    </label>

                    {hasCode && (
                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="adminCode">
                          Registration code
                        </label>
                        <Input
                          id="adminCode"
                          value={adminCode}
                          onChange={(event) => setAdminCode(event.target.value)}
                          placeholder="Enter your code"
                          autoFocus
                        />
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
