"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyFavorites } from "@/lib/hooks/entities/useMarketplace";
import { ArrowLeft, Eye, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORY_COLORS: Record<string, string> = {
  furniture: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  electronics: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  vehicles: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  household: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  services: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export default function FavoritesPage() {
  const router = useRouter();
  const { data, isLoading } = useMyFavorites();

  const items = Array.isArray(data) ? data : Array.isArray(data?.listings) ? data.listings : [];

  const formatPrice = (price: unknown) => {
    if (!price && price !== 0) return "Free";
    return `PKR ${Number(price).toLocaleString()}`;
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-foreground">My Favorites</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Listings you have favorited
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Heart className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No favorites yet.</p>
              <Button variant="outline" asChild>
                <Link href="/marketplace">Browse Marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((listing: Record<string, unknown>) => {
              const id = (listing._id ?? listing.id) as string;
              const cat = (listing.category ?? "") as string;

              return (
                <Link key={id} href={`/marketplace/view/${id}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                          {listing.title as string}
                        </h3>
                        <Heart className="size-4 fill-red-500 text-red-500 shrink-0" />
                      </div>

                      <p className="text-lg font-bold text-primary">
                        {formatPrice(listing.price)}
                      </p>

                      <Badge className={CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-800"} variant="outline">
                        {cat}
                      </Badge>

                      {listing.condition && (
                        <p className="text-xs text-muted-foreground">
                          Condition: {listing.condition as string}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                        <Eye className="size-3" />
                        <span>{(listing.viewCount as number) ?? 0} views</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
