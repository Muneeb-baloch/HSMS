// lib/types/marketplace.ts

export interface Listing {
  _id: string;
  title: string;
  description: string;
  societyId: string;
  sellerId: string;
  category: string;
  listingType: "sell" | "rent" | "free" | "wanted" | "service";
  price?: number;
  currency: string;
  negotiable: boolean;
  condition?: string;
  images: { url: string }[];
  contactPreference: string;
  location?: string;
  status: "active" | "sold" | "rented" | "expired" | "removed";
  viewCount: number;
  favoriteCount: number;
  expiresAt?: string;
  createdAt: string;
}

export interface CreateListingDto {
  title: string;
  description: string;
  societyId: string;
  category: string;
  listingType: string;
  price?: number;
  negotiable?: boolean;
  condition?: string;
  images?: { url: string }[];
  contactPreference?: string;
  location?: string;
}

export interface UpdateListingDto extends Partial<CreateListingDto> {}

export interface ListingQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  category?: string;
  listingType?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: string;
}
