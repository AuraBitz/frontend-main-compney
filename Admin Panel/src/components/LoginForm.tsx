"use client";

import { useState } from "react";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
          : "Login failed";
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
        <CardDescription>
          Sign in with email or username
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Email or Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="kaushal@gmail.com or client1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        <div className="mt-6 rounded-lg bg-secondary p-3 text-xs text-secondary-foreground">
          <p className="font-medium mb-1">Test accounts (password: password)</p>
          <p>kaushal@gmail.com · kaushal · c1@test.com · client1</p>
        </div>
      </CardContent>
    </Card>
  );
}
