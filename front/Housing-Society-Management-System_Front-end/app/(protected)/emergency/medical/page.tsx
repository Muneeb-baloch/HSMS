"use client";

import { MedicalProfileForm } from "@/components/emergency/MedicalProfileForm";

export default function MedicalProfilePage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Medical Profile</h1>
        <p className="text-muted-foreground">
          Manage your medical information for emergencies
        </p>
      </div>
      <MedicalProfileForm />
    </div>
  );
}
