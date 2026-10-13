"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCustomForm } from "@/lib/hooks/entities/useCustomForm";
import { formatDate } from "@/lib/utils/format";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewCustomFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: field, isLoading, error } = useCustomForm(id);

  if (isLoading) {
    return <DetailPageSkeleton />
  }
              {field.placeholder && (
                <div>
                  <p className="text-sm text-gray-500">Placeholder</p>
                  <p className="font-medium">{field.placeholder}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(field.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated</p>
                <p className="font-medium">{formatDate(field.updatedAt)}</p>
              </div>
            </div>

            {field.helpText && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Help Text</p>
                <p className="whitespace-pre-wrap">{field.helpText}</p>
              </div>
            )}

            {field.options && field.options.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Options</p>
                <div className="flex flex-wrap gap-2">
                  {field.options.map((opt, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="font-normal"
                    >
                      {opt.label} ({opt.value})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {field.validationRules &&
              Object.keys(field.validationRules).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Validation Rules
                  </p>
                  <pre className="bg-gray-50 p-3 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(field.validationRules, null, 2)}
                  </pre>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
