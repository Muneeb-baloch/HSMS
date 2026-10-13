// lib/utils/file.utils.ts

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) +
    " " +
    sizes[i]
  );
}

export function getFileIcon(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const pdfExts = ["pdf"];
  const docExts = ["doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"];

  if (imageExts.includes(ext)) return "image";
  if (pdfExts.includes(ext)) return "pdf";
  if (docExts.includes(ext)) return "document";
  return "file";
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export function isPdfFile(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

export function canPreviewFile(mimeType: string): boolean {
  return isImageFile(mimeType) || isPdfFile(mimeType);
}

export function downloadFile(url: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.split("/").pop() || "download";
  } catch {
    return "download";
  }
}
