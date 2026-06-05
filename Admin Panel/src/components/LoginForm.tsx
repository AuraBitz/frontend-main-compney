"use client";

import { useState } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
    } catch (err) {
      const message =
        err instanceof Error && err.message.trim()
          ? err.message
          : "Invalid username/email or password.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative z-10 w-full max-w-[380px]">
      <header className="mb-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Welcome back
        </p>
        <h2 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Sign in
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your registered email or username
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-7" noValidate>
        {error ? (
          <div
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label
            htmlFor="username"
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
          >
            Email or username
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="super@admin.com"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError("");
            }}
            required
            autoComplete="username"
            aria-invalid={Boolean(error)}
            className="h-11 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-primary focus-visible:ring-0 dark:bg-transparent"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            required
            autoComplete="current-password"
            aria-invalid={Boolean(error)}
            className="h-11 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-primary focus-visible:ring-0 dark:bg-transparent"
          />
        </div>

        <Button
          type="submit"
          className="group h-11 w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>

      {process.env.NODE_ENV === "development" ? (
        <p className="mt-10 border-t border-border/60 pt-6 text-center text-xs leading-relaxed text-muted-foreground">
          Dev credentials
          <br />
          <span className="font-mono text-foreground/80">super@admin.com</span>
          {" · "}
          <span className="font-mono text-foreground/80">admin123</span>
        </p>
      ) : null}
    </div>
  );
}
