import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { UpdateAnnouncementDto } from "@/lib/types/announcement";
import { EntityType } from "@/lib/types/upload.types";

type AnnouncementFormValues = {
  title: string;
  announcementDesc: string;
  shortDescription?: string;
  authorId: string;
  categoryId: string;
  targetType: "All" | "Block" | "Project" | "Individual";
  targetGroupId?: string;
  priorityLevel: "1" | "2" | "3";
  expiresAt?: string;
  attachmentURL?: string;
};

type RelationshipItem = {
  isDeleted?: boolean;
  isActive?: boolean;
};

export const announcementFormFields: FieldConfig<AnnouncementFormValues>[] = [
  {
    name: "title",
    label: "Title",
    type: "text",
    required: true,
    placeholder: "Announcement title",
  },
  {
    name: "announcementDesc",
    label: "Full Description",
    type: "textarea",
    required: true,
    rows: 6,
  },
  {
    name: "shortDescription",
    label: "Short Description",
    type: "textarea",
    required: false,
    rows: 3,
    placeholder: "Optional short preview (max 500 chars)",
  },
  {
    name: "authorId",
    label: "Author",
    type: "relationship",
    required: true,
    relationship: {
      endpoint: "/userstaff",
      labelField: "fullName",
      valueField: "_id",
      searchable: true,
      filter: (item: unknown) => {
        const candidate = item as RelationshipItem;
        return !candidate.isDeleted && candidate.isActive === true;
      },
    },
  },
  {
    name: "categoryId",
    label: "Category",
    type: "relationship",
    required: true,
    relationship: {
      endpoint: "/announcementcategory/active",
      labelField: "categoryName",
      valueField: "_id",
      searchable: true,
    },
  },
  {
    name: "targetType",
    label: "Target Audience",
    type: "select",
    required: true,
    options: [
      { label: "All Users", value: "All" },
      { label: "Specific Block", value: "Block" },
      { label: "Specific Project", value: "Project" },
      { label: "Specific Individual", value: "Individual" },
    ],
  },
  {
    name: "targetGroupId",
    label: "Target Group",
    type: "relationship",
    required: false,
    dependsOn: "targetType",
    relationship: {
      endpoint: (formValues: AnnouncementFormValues | Partial<UpdateAnnouncementDto>) => {
        const t = formValues.targetType;
        if (t === "Block") return "/plotblocks";
        if (t === "Project") return "/projects";
        if (t === "Individual") return "/userstaff";
        return "";
      },
      labelField: (formValues: AnnouncementFormValues | Partial<UpdateAnnouncementDto>) =>
        formValues.targetType === "Individual" ? "fullName" : "name",
      valueField: "_id",
      searchable: true,
    },
    placeholder: "Select target (if not All)",
  },
  {
    name: "priorityLevel",
    label: "Priority",
    type: "select",
    required: true,
    options: [
      { label: "Low", value: "1" },
      { label: "Medium", value: "2" },
      { label: "High / Urgent", value: "3" },
    ],
  },
  {
    name: "expiresAt",
    label: "Expiry Date",
    type: "date",
    required: false,
    description: "Optional — announcement will expire on this date",
  },
  {
    name: "attachmentURL",
    label: "Attachment / Image",
    type: "file-upload",
    required: false,
    uploadConfig: {
      entityType: EntityType.ANNOUNCEMENT,
      entityId: "temp-announcement", // will be replaced in form
      maxSize: 10 * 1024 * 1024,
      acceptedFileTypes: ["image/*", ".pdf", ".doc", ".docx"],
      allowMultipleTypes: false,
    },
  },
];

export const updateAnnouncementFormFields: FieldConfig<Partial<UpdateAnnouncementDto>>[] =
  announcementFormFields.map((f) => ({
    ...f,
    required: false,
  })) as FieldConfig<Partial<UpdateAnnouncementDto>>[];
