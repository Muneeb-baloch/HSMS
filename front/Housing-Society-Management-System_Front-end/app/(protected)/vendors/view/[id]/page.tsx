"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVendor } from "@/lib/hooks/entities/useVendor";
import { formatDate } from "@/lib/utils/format";
import { ArrowLeft, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "active":
      return "success";
    case "pending-verification":
      return "warning";
    case "suspended":
      return "destructive";
    case "blacklisted":
      return "destructive";
    default:
      return "secondary";
  }
};

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`h-4 w-4 ${
          i <= Math.round(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

export default function ViewVendorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: vendor, isLoading, error } = useVendor(id);

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error || !vendor) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Vendor not found.</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Vendors
      </Button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{vendor.vendorName}</h1>
          <p className="text-gray-500 mt-1">
            {vendor.companyName && `${vendor.companyName} - `}
            <span className="capitalize">
              {vendor.vendorType?.replace(/_/g, " ")}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusVariant(vendor.status)}>
            {vendor.status?.replace(/-/g, " ").toUpperCase()}
          </Badge>
          <Link href={`/vendors/edit/${id}`}>
            <Button>Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{vendor.email || "--"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{vendor.phone || "--"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{vendor.address || "--"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Vendor Type</p>
                <p className="font-medium capitalize">
                  {vendor.vendorType?.replace(/_/g, " ") || "--"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration Number</p>
                <p className="font-medium">
                  {vendor.registrationNumber || "--"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tax ID</p>
                <p className="font-medium">{vendor.taxId || "--"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Verification Date</p>
                <p className="font-medium">
                  {vendor.verificationDate
                    ? formatDate(vendor.verificationDate)
                    : "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating & Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(vendor.rating)}
                  <span className="font-medium">
                    {vendor.rating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({vendor.totalRatings} ratings)
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contracts</p>
                <p className="font-medium">
                  {vendor.completedContracts} / {vendor.totalContracts} completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {vendor.bankDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="font-medium">
                    {vendor.bankDetails.bankName || "--"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Title</p>
                  <p className="font-medium">
                    {vendor.bankDetails.accountTitle || "--"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="font-medium">
                    {vendor.bankDetails.accountNumber || "--"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Branch Code</p>
                  <p className="font-medium">
                    {vendor.bankDetails.branchCode || "--"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{formatDate(vendor.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p className="font-medium">{formatDate(vendor.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
