"use client";

export function ShareButtons({ title }: { title: string }) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  };

  const handleShareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  };

  return (
    <div className="mt-12 border-t border-slate-100 pt-8">
      <p className="mb-4 text-sm font-semibold text-slate-900">
        Share this article
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCopyLink}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600"
        >
          Copy Link
        </button>
        <button
          type="button"
          onClick={handleShareTwitter}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600"
        >
          Twitter / X
        </button>
        <button
          type="button"
          onClick={handleShareLinkedIn}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600"
        >
          LinkedIn
        </button>
      </div>
    </div>
  );
}
