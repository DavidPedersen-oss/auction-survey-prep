import { useCallback, useEffect, useState } from "react";
import {
  IconHome,
  IconLogout,
  IconSettings,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/wensity/button";
import { Card } from "@/components/wensity/card";
import { Spinner } from "@/components/wensity/spinner";
import { api, setUnauthorizedHandler, type User } from "@/lib/api";
import { useHashRoute, navigate } from "@/lib/useHashRoute";
import { Toaster } from "@/lib/toast";
import { LoginScreen } from "@/screens/Login";
import { ItemsListScreen } from "@/screens/ItemsList";
import { ItemFormScreen } from "@/screens/ItemForm";
import { AdminScreen } from "@/screens/Admin";

type AuthState =
  | { status: "loading" }
  | { status: "unauth"; setupRequired: boolean }
  | { status: "authed"; user: User };

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const route = useHashRoute();

  const checkAuth = useCallback(async () => {
    try {
      const { user, setupRequired } = await api.me();
      if (user) {
        setAuth({ status: "authed", user });
      } else {
        setAuth({ status: "unauth", setupRequired });
      }
    } catch {
      setAuth({ status: "unauth", setupRequired: false });
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuth({ status: "unauth", setupRequired: false });
      navigate("#/");
    });
    void checkAuth();
  }, [checkAuth]);

  const handleSignedIn = useCallback((user: User) => {
    setAuth({ status: "authed", user });
    navigate("#/");
  }, []);

  const handleLogout = useCallback(async () => {
    await api.logout().catch(() => {});
    setAuth({ status: "unauth", setupRequired: false });
    navigate("#/");
  }, []);

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (auth.status === "unauth") {
    return <LoginScreen setupRequired={auth.setupRequired} onSignedIn={handleSignedIn} />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Home"
            onClick={() => navigate("/")}
          >
            <IconHome className="size-5" />
          </Button>
          <span className="flex-1 text-sm font-semibold tracking-[-0.01em]">Auction Survey Prep</span>
          {auth.user.role === "admin" && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Admin"
              onClick={() => navigate("/admin")}
            >
              <IconSettings className="size-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<IconLogout className="size-4" />}
            onClick={() => void handleLogout()}
          >
            {auth.user.username}
          </Button>
        </div>
      </header>

      <main className="flex-1 px-3 pt-4">
        <div className="mx-auto w-full max-w-3xl">
          {route.name === "items" && <ItemsListScreen />}
          {route.name === "new" && <ItemFormScreen />}
          {route.name === "item" && <ItemFormScreen itemId={route.id} />}
          {route.name === "admin" &&
            (auth.user.role === "admin" ? (
              <AdminScreen me={auth.user} />
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                Admin access required.
              </Card>
            ))}
        </div>
      </main>

      <nav className="sticky bottom-0 z-20 border-t border-border bg-background/80 backdrop-blur-md sm:hidden">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-around px-3 py-2">
          <Button
            variant={route.name === "items" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => navigate("/")}
          >
            <IconHome className="size-4" />
            Items
          </Button>
          <Button
            variant={route.name === "new" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => navigate("/new")}
          >
            <IconPlus className="size-4" />
            New
          </Button>
          {auth.user.role === "admin" && (
            <Button
              variant={route.name === "admin" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => navigate("/admin")}
            >
              <IconSettings className="size-4" />
              Admin
            </Button>
          )}
        </div>
      </nav>

      <Toaster />
    </div>
  );
}
