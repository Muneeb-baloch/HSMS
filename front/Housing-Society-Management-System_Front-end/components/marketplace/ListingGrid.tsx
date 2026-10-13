"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListings } from "@/lib/hooks/entities/useMarketplace";
import { Eye, Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

export function ListingGrid() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [page, setPage] = useState(1);

  const params: Record<string, unknown> = { page, limit: 20 };
  if (search) params.search = search;
  if (category && category !== "all") params.category = category;
  if (sortBy === "newest") {
    params.sortBy = "createdAt";
    params.sortOrder = "desc";
  } else if (sortBy === "price_low") {
    params.sortBy = "price";
    params.sortOrder = "asc";
  } else if (sortBy === "price_high") {
    params.sortBy = "price";
    params.sortOrder = "desc";
  }

  const { data, isLoading } = useListings(params);
  const items = Array.isArray(data?.items) ? data.items : [];

  const formatPrice = (price: unknown) => {
    if (!price && price !== 0) return "Free";
    return `PKR ${Number(price).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse listings from your community
        </p>
      </div>

      <ActionBar
        left={
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 w-64"
              />
            </div>
            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger className="w-40 h-11 enhanced-input">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="vehicles">Vehicles</SelectItem>
                <SelectItem value="household">Household</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
              <SelectTrigger className="w-40 h-11 enhanced-input">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        right={
          <Button variant="primary" size="sm" asChild>
            <Link href="/marketplace/create">
              <Plus className="size-4" />
              Create Listing
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">No listings found.</p>
            <Button variant="outline" asChild>
              <Link href="/marketplace/create">Create a Listing</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((listing: Record<string, unknown>) => {
              const id = (listing._id ?? listing.id) as string;
              const cat = (listing.category ?? "") as string;
              const listingType = (listing.listingType ?? "") as string;

              return (
                <Link key={id} href={`/marketplace/view/${id}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                          {listing.title as string}
                        </h3>
                      </div>

                      <p className="text-lg font-bold text-primary">
                        {formatPrice(listing.price)}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        <Badge className={CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-800"} variant="outline">
                          {cat}
                        </Badge>
                        <Badge className={TYPE_COLORS[listingType] ?? "bg-gray-100 text-gray-800"} variant="outline">
                          {listingType}
                        </Badge>
                      </div>

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

          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
