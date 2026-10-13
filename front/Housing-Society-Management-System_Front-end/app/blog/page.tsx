"use client";

import { blogPosts, categories } from "@/lib/data/blog-posts";
import Link from "next/link";
import { useState } from "react";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filteredPosts =
    activeCategory === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeCategory);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

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

      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-emerald-600 transition hover:text-emerald-700 hover:underline"
        >
          &larr; Back to Home
        </Link>

        {/* Header */}
        <div className="mt-4 mb-12">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            SocietySphere Blog
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            Insights, guides, and news for housing society management in
            Pakistan.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === cat
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-400 hover:text-emerald-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-lg"
            >
              {/* Gradient Image Placeholder */}
              <div
                className={`flex h-48 items-end bg-gradient-to-br ${post.gradient} p-6`}
              >
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
                  <span>{post.date}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{post.readTime} read</span>
                </div>

                <Link href={`/blog/${post.slug}`}>
                  <h2 className="mb-3 text-lg font-semibold leading-snug text-slate-900 transition group-hover:text-emerald-600">
                    {post.title}
                  </h2>
                </Link>

                <p className="mb-4 text-sm leading-relaxed text-slate-600 line-clamp-3">
                  {post.excerpt}
                </p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
                >
                  Read More &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-slate-500">
              No posts found in this category yet. Check back soon!
            </p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 sm:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
              Subscribe to Our Newsletter
            </h2>
            <p className="mt-3 text-emerald-100">
              Get the latest articles, management tips, and product updates
              delivered straight to your inbox. No spam, unsubscribe anytime.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full rounded-lg border-0 bg-white/10 px-5 py-3 text-sm text-white placeholder-emerald-200 backdrop-blur-sm transition focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 sm:max-w-sm"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:w-auto"
              >
                Subscribe
              </button>
            </form>

            {subscribed && (
              <p className="mt-4 text-sm font-medium text-emerald-100">
                Thank you for subscribing! Check your inbox to confirm.
              </p>
            )}
          </div>
        </div>
      </div>

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
