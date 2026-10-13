import { blogPosts } from "@/lib/data/blog-posts";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareButtons } from "./share-buttons";

// Pre-generate all blog slugs at build time
export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — SocietySphere Blog`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-emerald-600"
          >
            SocietySphere
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Back Link */}
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-emerald-600 transition hover:text-emerald-700 hover:underline"
        >
          &larr; Back to Blog
        </Link>
      </div>

      {/* Hero Gradient */}
      <div className="mx-auto mt-6 max-w-4xl px-6">
        <div
          className={`flex h-64 items-end rounded-2xl bg-gradient-to-br ${post.gradient} p-8 sm:h-80`}
        >
          <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
            {post.category}
          </span>
        </div>
      </div>

      {/* Article Content */}
      <article className="mx-auto max-w-3xl px-6 py-10">
        {/* Meta */}
        <div className="mb-4 flex items-center gap-3 text-sm text-slate-500">
          <span>{post.date}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{post.readTime} read</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>

        {/* Author */}
        <div className="mt-6 flex items-center gap-4 border-b border-slate-100 pb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
            {post.author.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {post.author.name}
            </p>
            <p className="text-xs text-slate-500">{post.author.role}</p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-6">
          {post.content.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              className="text-base leading-relaxed text-slate-700"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Share Buttons (Client Component) */}
        <ShareButtons title={post.title} />

        {/* Related Posts */}
        <div className="mt-16">
          <h2 className="mb-6 font-serif text-2xl font-bold text-slate-900">
            Related Posts
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-200 transition hover:shadow-md"
              >
                <div
                  className={`flex h-32 items-end bg-gradient-to-br ${related.gradient} p-4`}
                >
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                    {related.category}
                  </span>
                </div>
                <div className="p-4">
                  <p className="mb-1 text-xs text-slate-500">
                    {related.date} &middot; {related.readTime} read
                  </p>
                  <h3 className="text-sm font-semibold leading-snug text-slate-900 transition group-hover:text-emerald-600">
                    {related.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-center sm:p-10">
          <h2 className="font-serif text-2xl font-bold text-white">
            Try SocietySphere Free
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-emerald-100">
            Join hundreds of housing societies across Pakistan that are
            transforming their management with SocietySphere. Start with our
            free Starter plan today.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Get Started Free
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; 2026 SocietySphere. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="text-sm text-slate-600 hover:text-emerald-600"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-600 hover:text-emerald-600"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-slate-600 hover:text-emerald-600"
            >
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
