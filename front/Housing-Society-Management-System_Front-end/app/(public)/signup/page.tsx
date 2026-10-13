"use client";

import { SignupForm } from "@/components/signup-form";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";

export default function SignupPage() {
  return (
    <AuthPageLayout>
      <SignupForm />
    </AuthPageLayout>
  );
}
