"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDefaulter } from "@/lib/hooks/entities/useDefaulter";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewDefaulterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: defaulter, isLoading, error } = useDefaulter(id);

  if (isLoading) {
    return <DetailPageSkeleton />
  }
        </CardContent>
      </Card>
    </div>
  );
}
