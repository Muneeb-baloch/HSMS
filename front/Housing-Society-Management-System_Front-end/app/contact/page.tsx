"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Simple navbar */}
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

        <div className="grid md:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Get in Touch</h1>
            <p className="text-slate-600 mb-8">Have questions about SocietySphere? We&apos;d love to hear from you.</p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-600">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <input type="text" required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Ahmed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <input type="text" required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Khan" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input type="email" required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="ahmed@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Society Name (Optional)</label>
                  <input type="text" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="DHA Phase 5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea rows={5} required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none" placeholder="Tell us about your society and how we can help..." />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 text-lg">Send Message</Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8 pt-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <p className="text-slate-600">info@societysphere.com</p>
                    <p className="text-slate-600">support@societysphere.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Phone</p>
                    <p className="text-slate-600">+92 51 234 5678</p>
                    <p className="text-slate-600">+92 300 123 4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Office</p>
                    <p className="text-slate-600">Blue Area, Jinnah Avenue</p>
                    <p className="text-slate-600">Islamabad, Pakistan</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Schedule a Demo</h3>
              <p className="text-slate-600 mb-4">See SocietySphere in action. Book a 30-minute personalized demo with our team.</p>
              <Link href="/signup">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Book Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
