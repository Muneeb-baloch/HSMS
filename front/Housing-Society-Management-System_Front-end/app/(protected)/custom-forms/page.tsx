"use client";

import { CustomFormList } from "@/components/custom-form/CustomFormList";

export default function CustomFormsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <CustomFormList />
    </div>
  );
}
