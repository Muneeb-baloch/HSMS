"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Lightbulb, Eye, Shield, Users } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "500+", label: "Societies" },
  { value: "50,000+", label: "Plots Managed" },
  { value: "10,000+", label: "Active Members" },
  { value: "98%", label: "Satisfaction Rate" },
];

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We build cutting-edge tools that solve real problems for housing societies across Pakistan.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "Every transaction, decision, and record is visible to the right stakeholders at the right time.",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Bank-grade encryption and compliance standards protect your society's sensitive data.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We believe strong societies are built on trust, communication, and collective participation.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold text-emerald-600">SocietySphere</Link>
        <div className="flex gap-4">
          <Link href="/login"><Button variant="ghost">Login</Button></Link>
          <Link href="/signup"><Button className="bg-emerald-600 hover:bg-emerald-700">Sign Up</Button></Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <Link href="/" className="text-emerald-600 hover:underline text-sm flex items-center gap-1 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 mb-6">About SocietySphere</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            We&apos;re on a mission to digitize and streamline housing society management across Pakistan,
            making operations transparent, efficient, and accessible to everyone.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-20">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-emerald-50">
              <p className="text-3xl font-serif font-bold text-emerald-600">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Our Story */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6 text-center">Our Story</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Housing societies in Pakistan have long struggled with outdated management practices &mdash;
              paper-based records, opaque financial reporting, and fragmented communication between
              committees and residents.
            </p>
            <p>
              SocietySphere was born from the frustration of seeing societies like DHA, Bahria Town,
              and countless smaller communities lose time and trust to inefficient processes. We set out
              to build a platform that brings modern technology to society management without the
              complexity.
            </p>
            <p>
              Today, we serve over 500 societies across Pakistan, helping them manage plots, finances,
              security, and community engagement from a single, intuitive platform. Our team combines
              deep domain expertise in Pakistani real estate with world-class engineering to deliver
              solutions that truly work.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-12 text-center">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-emerald-50 rounded-2xl p-12">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Ready to Get Started?</h2>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto">
            Join hundreds of societies already using SocietySphere to transform their operations.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3">Start Free Trial</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="px-8 py-3">Contact Us</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
