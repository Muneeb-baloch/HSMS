// src/lib/constants/announcementCategoryForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { AnnouncementCategoryFormData, UpdateAnnouncementCategoryFormData } from "@/lib/schemas/announcementCategory.schema";

export const announcementCategoryFormFields: FieldConfig<AnnouncementCategoryFormData>[] =
  [
    {
      name: "categoryName",
      label: "Category Name",
      type: "text",
      required: true,
      placeholder: "e.g. Maintenance",
      description: "Unique name for the announcement category",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: false,
      placeholder: "Brief description of this category",
      rows: 3,
    },
    {
      name: "icon",
      label: "Icon (Lucide name)",
      type: "text",
      required: false,
      placeholder: "e.g. tools, calendar-event",
      description: "Lucide icon name",
    },
    {
      name: "color",
      label: "Color",
      type: "color",
      required: false,
      placeholder: "#3B82F6",
      description: "Hex color for the category badge",
    },
    {
      name: "isActive",
      label: "Active",
      type: "switch",
      required: false,
      description: "Whether this category is visible to users",
    },
    {
      name: "priority",
      label: "Priority",
      type: "number",
      required: false,
      placeholder: "0",
      description: "Higher number = higher in lists (0-1000)",
      min: 0,
      max: 1000,
    },
  ];

export const updateAnnouncementCategoryFormFields: FieldConfig<UpdateAnnouncementCategoryFormData>[] =
  announcementCategoryFormFields.map((field) => ({
    ...field,
    required: false,
  }));
