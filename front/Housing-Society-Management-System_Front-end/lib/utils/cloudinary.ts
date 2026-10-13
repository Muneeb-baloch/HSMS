// lib/utils/cloudinary.ts
/**
 * Cloudinary utility functions for frontend
 */

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  // Note: API secret should NEVER be exposed in frontend
};

/**
 * Generate Cloudinary URL with transformations
 */
export function getCloudinaryUrl(
  publicId: string,
  transformations: string[] = [],
): string {
  const cloudName = CLOUDINARY_CONFIG.cloudName;
  if (!cloudName) {
    console.warn("Cloudinary cloud name not configured");
    return "";
  }

  const transformString =
    transformations.length > 0 ? transformations.join(",") + "/" : "";

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
}

/**
 * Common Cloudinary transformations
 */
export const CLOUDINARY_TRANSFORMATIONS = {
  thumbnail: "w_100,h_100,c_fill",
  small: "w_300,h_300,c_limit",
  medium: "w_600,h_600,c_limit",
  large: "w_1200,h_1200,c_limit",
  square: "w_400,h_400,c_fill",
  avatar: "w_150,h_150,c_fill,g_face",
  optimized: "q_auto,f_auto",
  webp: "f_webp",
  blurPlaceholder: "e_blur:1000,q_1",
};

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  const pattern = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * Check if URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("cloudinary.com");
}

/**
 * Generate responsive image srcset for Cloudinary
 */
export function generateSrcSet(
  publicId: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
): string {
  return widths
    .map((width) => {
      const url = getCloudinaryUrl(publicId, [
        `w_${width}`,
        "q_auto",
        "f_auto",
      ]);
      return `${url} ${width}w`;
    })
    .join(", ");
}
