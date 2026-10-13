"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegistry } from "@/lib/hooks/entities/useRegistry";
import { formatDate } from "@/lib/utils/format";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewRegistryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: registry, isLoading, error } = useRegistry(id);

  if (isLoading) {
    return <DetailPageSkeleton />
  }
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
