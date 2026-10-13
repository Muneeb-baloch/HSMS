"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useListing,
  useToggleFavorite,
  useMarkAsSold,
} from "@/lib/hooks/entities/useMarketplace";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  ArrowLeft,
  Eye,
  Heart,
  Loader2,
  MapPin,
  ShoppingBag,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/shared/ConfirmDialog";

const CATEGORY_COLORS: Record<string, string> = {
  furniture: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  electronics: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  vehicles: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  household: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  services: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

const TYPE_COLORS: Record<string, string> = {
  sell: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  free: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  wanted: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  service: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

interface ListingViewProps {
  id: string;
}

export function ListingView({ id }: ListingViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const { data: listing, isLoading } = useListing(id);
  const favoriteMutation = useToggleFavorite();
  const markAsSoldMutation = useMarkAsSold();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Listing not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const cat = (listing.category ?? "") as string;
  const listingType = (listing.listingType ?? "") as string;
  const seller = listing.createdBy as Record<string, string> | null;
  const sellerName = seller
    ? seller.memName ?? seller.name ?? `${seller.firstName ?? ""} ${seller.lastName ?? ""}`.trim()
    : "Unknown";
  const sellerId = (seller?._id ?? seller?.id ?? listing.userId) as string | undefined;
  const isOwner = user && sellerId && ((user as Record<string, string>)?.id === sellerId || (user as Record<string, string>)?._id === sellerId);
  const isSold = listing.status === "sold";

  const formatPrice = (price: unknown) => {
    if (!price && price !== 0) return "Free";
    return `PKR ${Number(price).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Button>

      <Card className="max-w-3xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl">{listing.title as string}</CardTitle>
              <p className="text-2xl font-bold text-primary mt-2">
                {formatPrice(listing.price)}
                {listing.negotiable && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Negotiable)
                  </span>
                )}
              </p>
            </div>
            {isSold && (
              <Badge className="bg-red-100 text-red-800 text-sm" variant="outline">
                SOLD
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-800"} variant="outline">
              {cat}
            </Badge>
            <Badge className={TYPE_COLORS[listingType] ?? "bg-gray-100 text-gray-800"} variant="outline">
              {listingType}
            </Badge>
            {listing.condition && (
              <Badge variant="outline">
                {listing.condition as string}
              </Badge>
            )}
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {listing.description as string}
              </p>
            </div>
          )}

          <Separator />

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="size-4" />
              <span>Seller: <span className="text-foreground font-medium">{sellerName}</span></span>
            </div>
            {listing.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span>{listing.location as string}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="size-4" />
              <span>{(listing.viewCount as number) ?? 0} views</span>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => favoriteMutation.mutate(id)}
              disabled={favoriteMutation.isPending}
            >
              <Heart
                className={`mr-2 size-4 ${listing.isFavorited ? "fill-red-500 text-red-500" : ""}`}
              />
              {listing.isFavorited ? "Unfavorite" : "Favorite"}
            </Button>

            {isOwner && !isSold && (
              <Button
                variant="default"
                onClick={() => {
                  if (await confirm({ title: "Confirm", description: "Mark this listing as sold?" })) {
                    markAsSoldMutation.mutate(id);
                  }
                }}
                disabled={markAsSoldMutation.isPending}
              >
                <ShoppingBag className="mr-2 size-4" />
                Mark as Sold
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
