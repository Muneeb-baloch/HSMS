"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegistry } from "@/lib/hooks/entities/useRegistry";
import { formatDate } from "@/lib/utils/format";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

const VERIFICATION_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Verified: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

export default function ViewRegistryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: registry, isLoading } = useRegistry(id);

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!registry) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Registry Not Found</CardTitle>
            <CardDescription>
              The requested registry entry does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/registry")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Registry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const member = typeof registry.memId === "object" ? registry.memId : null;
  const plot = typeof registry.plotId === "object" ? registry.plotId : null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => router.push(`/registry/edit/${id}`)}>
          Edit Registry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-mono">{registry.registryNo}</CardTitle>
              <CardDescription className="mt-2">
                Mutation No: {registry.mutationNo}
              </CardDescription>
            </div>
            <Badge className={VERIFICATION_COLORS[registry.verificationStatus] || "bg-gray-100 text-gray-800"}>
              {registry.verificationStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Member</p>
              <p className="font-medium">{member?.memName || "—"}</p>
              {member?.memNic && (
                <p className="text-sm text-gray-500">NIC: {member.memNic}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Plot</p>
              <p className="font-medium">{plot?.plotNo || "—"}</p>
              {plot?.projectId && typeof plot.projectId === "object" && (
                <p className="text-sm text-gray-500">{plot.projectId.projName}</p>
              )}
            </div>
            {registry.mozaVillage && (
              <div>
                <p className="text-sm text-gray-500">Moza/Village</p>
                <p className="font-medium">{registry.mozaVillage}</p>
              </div>
            )}
            {registry.mutationDate && (
              <div>
                <p className="text-sm text-gray-500">Mutation Date</p>
                <p className="font-medium">{formatDate(registry.mutationDate)}</p>
              </div>
            )}
            {registry.totalArea && (
              <div>
                <p className="text-sm text-gray-500">Area</p>
                <p className="font-medium">{registry.totalArea}</p>
              </div>
            )}
            {registry.subRegistrarName && (
              <div>
                <p className="text-sm text-gray-500">Sub Registrar</p>
                <p className="font-medium">{registry.subRegistrarName}</p>
              </div>
            )}
          </div>

          {(registry.khasraNo || registry.khewatNo) && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Land Record</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {registry.khasraNo && (
                  <div>
                    <span className="text-gray-500">Khasra: </span>
                    {registry.khasraNo}
                  </div>
                )}
                {registry.khewatNo && (
                  <div>
                    <span className="text-gray-500">Khewat: </span>
                    {registry.khewatNo}
                  </div>
                )}
              </div>
            </div>
          )}

          {registry.remarks && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Remarks</p>
              <p className="whitespace-pre-wrap">{registry.remarks}</p>
            </div>
          )}

          {(registry.scanCopyPath || registry.landOwnerPhoto) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
              {registry.scanCopyPath && (
                <div className="min-w-0">
                  <p className="text-sm font-medium mb-2">Scan Copy</p>
                  <a
                    href={registry.scanCopyPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {registry.scanCopyPath.match(/\.(pdf)$/i) ? (
                      <div className="w-full h-48 rounded-lg border bg-gray-50 flex items-center justify-center">
                        <span className="text-gray-500">PDF Document</span>
                      </div>
                    ) : (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-gray-50">
                        <Image
                          src={registry.scanCopyPath}
                          alt="Scan copy"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span className="text-sm text-blue-600 mt-1 inline-block">
                      View / Download
                    </span>
                  </a>
                </div>
              )}
              {registry.landOwnerPhoto && (
                <div className="min-w-0">
                  <p className="text-sm font-medium mb-2">Land Owner Photo</p>
                  <a
                    href={registry.landOwnerPhoto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-gray-50">
                      <Image
                        src={registry.landOwnerPhoto}
                        alt="Land owner"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm text-blue-600 mt-1 inline-block">
                      View full size
                    </span>
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
