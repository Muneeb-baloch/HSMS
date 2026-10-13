"use client";

import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthGlassCard, AuthInput, GradientButton } from "@/components/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateSociety } from "@/lib/hooks/entities/useSociety";
import { useAuth } from "@/lib/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconBuilding,
  IconMail,
  IconPhone,
  IconMapPin,
  IconWorld,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const registerSocietySchema = z.object({
  societyName: z
    .string()
    .min(3, "Society name must be at least 3 characters")
    .max(200, "Society name cannot exceed 200 characters"),
  societyCode: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code cannot exceed 20 characters")
    .regex(
      /^[A-Za-z0-9-]+$/,
      "Only letters, numbers, and hyphens allowed"
    )
    .optional()
    .or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  zipCode: z.string().max(20).optional().or(z.literal("")),
  contactEmail: z.string().email("Please enter a valid email"),
  contactPhone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .max(20, "Phone number cannot exceed 20 characters"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type RegisterSocietyValues = z.infer<typeof registerSocietySchema>;

export default function RegisterSocietyPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const createSociety = useCreateSociety();
  const [formError, setFormError] = useState("");

  const form = useForm<RegisterSocietyValues>({
    resolver: zodResolver(registerSocietySchema),
    defaultValues: {
      societyName: "",
      societyCode: "",
      address: "",
      country: "Pakistan",
      zipCode: "",
      contactEmail: user?.email || "",
      contactPhone: "",
      website: "",
    },
  });

  const onSubmit = (data: RegisterSocietyValues) => {
    setFormError("");

    const payload = {
      societyName: data.societyName,
      ...(data.societyCode && { societyCode: data.societyCode }),
      ...(data.address && { address: data.address }),
      ...(data.country && { country: data.country }),
      ...(data.zipCode && { zipCode: data.zipCode }),
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      ...(data.website && { website: data.website }),
    };

    createSociety.mutate(payload, {
      onSuccess: () => {
        router.push("/dashboard");
      },
      onError: (error: Error) => {
        setFormError(error.message || "Failed to register society");
      },
    });
  };

  return (
    <AuthPageLayout>
      <AuthGlassCard>
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <IconBuilding className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Register Your Society
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Set up your housing society on SocietySphere
          </p>
        </div>

        {!isAuthenticated && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-sm">
            <AlertDescription className="text-amber-800">
              You need an account first.{" "}
              <Link href="/signup" className="font-semibold text-emerald-600 hover:underline">
                Sign up here
              </Link>
              , then come back to register your society.
            </AlertDescription>
          </Alert>
        )}

        {(formError || createSociety.isError) && (
          <Alert variant="destructive" className="mb-4 text-sm">
            <AlertDescription>
              {formError || createSociety.error?.message || "Registration failed"}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="societyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-xs font-medium text-slate-700 sm:text-sm">
                    <IconBuilding className="size-3.5 text-slate-400" />
                    Society Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <AuthInput
                      placeholder="e.g. DHA Phase 6, Bahria Town"
                      error={!!form.formState.errors.societyName}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="societyCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-slate-700 sm:text-sm">
                    Society Code <span className="text-slate-400">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <AuthInput
                      placeholder="e.g. DHA-6, BT-ISB"
                      error={!!form.formState.errors.societyCode}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-xs font-medium text-slate-700 sm:text-sm">
                      <IconMail className="size-3.5 text-slate-400" />
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <AuthInput
                        type="email"
                        placeholder="admin@society.com"
                        error={!!form.formState.errors.contactEmail}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-xs font-medium text-slate-700 sm:text-sm">
                      <IconPhone className="size-3.5 text-slate-400" />
                      Phone <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <AuthInput
                        type="tel"
                        placeholder="+92 300 1234567"
                        error={!!form.formState.errors.contactPhone}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-xs font-medium text-slate-700 sm:text-sm">
                    <IconMapPin className="size-3.5 text-slate-400" />
                    Address <span className="text-slate-400">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <AuthInput
                      placeholder="Full address of the society"
                      error={!!form.formState.errors.address}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-xs font-medium text-slate-700 sm:text-sm">
                      <IconWorld className="size-3.5 text-slate-400" />
                      Country
                    </FormLabel>
                    <FormControl>
                      <AuthInput
                        placeholder="Pakistan"
                        error={!!form.formState.errors.country}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-700 sm:text-sm">
                      Zip Code
                    </FormLabel>
                    <FormControl>
                      <AuthInput
                        placeholder="54000"
                        error={!!form.formState.errors.zipCode}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-slate-700 sm:text-sm">
                    Website <span className="text-slate-400">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <AuthInput
                      placeholder="https://yoursociety.com"
                      error={!!form.formState.errors.website}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <GradientButton
              isLoading={createSociety.isPending}
              disabled={!isAuthenticated}
            >
              Register Society
            </GradientButton>

            <p className="text-center text-xs text-slate-400 sm:text-sm">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </AuthGlassCard>
    </AuthPageLayout>
  );
}
