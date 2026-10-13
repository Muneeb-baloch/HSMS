"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGoogleAuth } from "@/lib/hooks/useGoogleAuth";
import { useLogin } from "@/lib/hooks/useLogin";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconLock, IconMail } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AuthGlassCard, AuthInput, GradientButton, PasswordInput } from "./auth";
import { Checkbox } from "./ui/checkbox";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();
  const { initiateGoogleLogin, isLoading: googleLoading } = useGoogleAuth();
  const [formError, setFormError] = useState<string>("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setFormError("");
    login(data, {
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Login failed. Please check your credentials.";
        setFormError(errorMessage);
      },
    });
  };

  return (
    <AuthGlassCard>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Sign in to your society dashboard
        </p>
      </div>

      {formError && (
        <Alert
          variant="destructive"
          className="mb-4 text-sm"
        >
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {/* Google Login */}
      <button
        type="button"
        onClick={() => initiateGoogleLogin()}
        disabled={googleLoading}
        className="mb-4 flex w-full items-center justify-center gap-2 h-10 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      >
        {googleLoading ? (
          <span className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        ) : (
          <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Continue with Google
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-400">
            Or continue with email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5 text-xs font-medium text-slate-700 sm:text-sm">
                  <IconMail className="size-3.5 text-slate-400" />
                  Email
                </FormLabel>
                <FormControl>
                  <AuthInput
                    type="email"
                    placeholder="society@example.com"
                    error={!!form.formState.errors.email}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-1.5 text-xs font-medium text-slate-700 sm:text-sm">
                    <IconLock className="size-3.5 text-slate-400" />
                    Password
                  </FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline sm:text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder="Enter your password"
                    error={!!form.formState.errors.password}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-slate-300 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                  />
                </FormControl>
                <FormLabel className="cursor-pointer text-xs text-slate-500 font-normal sm:text-sm">
                  Remember me for 30 days
                </FormLabel>
              </FormItem>
            )}
          />

          <GradientButton isLoading={isPending}>Sign In</GradientButton>

          <p className="text-center text-xs text-slate-500 sm:text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </Form>
    </AuthGlassCard>
  );
}
