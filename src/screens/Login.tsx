import { useState, type FormEvent } from "react";
import { MorphingShapeBackground } from "@/components/wensity/morphing-shape-background";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/wensity/card";
import { Input } from "@/components/wensity/input";
import { Button } from "@/components/wensity/button";
import { Alert, AlertDescription } from "@/components/wensity/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api, type User } from "@/lib/api";

export function LoginScreen({
  setupRequired,
  onSignedIn,
}: {
  setupRequired: boolean;
  onSignedIn: (user: User) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (setupRequired && password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setBusy(true);
    try {
      const res = setupRequired
        ? await api.setup(username, password)
        : await api.login(username, password);
      onSignedIn(res.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <MorphingShapeBackground />
      </div>
      <ThemeToggle
        variant="outline"
        withLabel
        className="absolute right-4 top-4 z-10 bg-surface/85 backdrop-blur-md"
      />
      <Card className="w-full max-w-sm backdrop-blur-md bg-surface/85">
        <CardHeader>
          <CardTitle>Auction Survey Prep</CardTitle>
          <CardDescription>
            {setupRequired
              ? "First-time setup — create the admin account."
              : "Lost & Found intake · sign in to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              required
              fullWidth
              inputSize="lg"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={setupRequired ? "new-password" : "current-password"}
              required
              fullWidth
              inputSize="lg"
            />
            {setupRequired && (
              <Input
                label="Confirm password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
                fullWidth
                inputSize="lg"
              />
            )}
            {error && (
              <Alert variant="error" density="compact">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" size="lg" loading={busy}>
              {setupRequired ? "Create admin account" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
