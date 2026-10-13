"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useMyListings,
  useDeleteListing,
  useMarkAsSold,
} from "@/lib/hooks/entities/useMarketplace";
import {
  ArrowLeft,
  Eye,
  Loader2,
  MoreVertical,
  Plus,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InlineSkeleton } from '@/components/shared/PageSkeleton'
import { useConfirm } from "@/components/shared/ConfirmDialog";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  sold: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  expired: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

export default function MyListingsPage() {
  const router = useRouter();
  const { confirm } = useConfirm();
  const { data, isLoading } = useMyListings();
  const deleteMutation = useDeleteListing();
  const markAsSoldMutation = useMarkAsSold();

  const items = Array.isArray(data) ? data : Array.isArray(data?.listings) ? data.listings : [];

  const formatPrice = (price: unknown) => {
    if (!price && price !== 0) return "Free";
    return `PKR ${Number(price).toLocaleString()}`;
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ title: "Delete", description: "Are you sure you want to delete this listing?", variant: "destructive" })) {
      deleteMutation.mutate(id);
    }
  };

  const handleMarkAsSold = async (id: string) => {
    if (await confirm({ title: "Confirm", description: "Mark this listing as sold?" })) {
      markAsSoldMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your marketplace listings
            </p>
          </div>
          <Button variant="primary" size="sm" asChild>
            <Link href="/marketplace/create">
              <Plus className="size-4" />
              New Listing
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader icon={ShoppingBag}>
            <CardTitle>Your Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
            <InlineSkeleton />
          ) : (
              <div className="overflow-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          You haven&apos;t created any listings yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((listing: Record<string, unknown>) => {
                        const id = (listing._id ?? listing.id) as string;
                        const status = (listing.status ?? "active") as string;

                        return (
                          <TableRow key={id}>
                            <TableCell className="font-medium">
                              <Link href={`/marketplace/view/${id}`} className="hover:underline">
                                {listing.title as string}
                              </Link>
                            </TableCell>
                            <TableCell>{formatPrice(listing.price)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{listing.category as string}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{listing.listingType as string}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Eye className="size-3 text-muted-foreground" />
                                {(listing.viewCount as number) ?? 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={STATUS_COLORS[status] ?? ""} variant="outline">
                                {status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-8">
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => router.push(`/marketplace/view/${id}`)}>
                                    View
                                  </DropdownMenuItem>
                                  {status !== "sold" && (
                                    <DropdownMenuItem onClick={() => handleMarkAsSold(id)}>
                                      Mark as Sold
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(id)}
                                    className="text-destructive"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
