"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, MapPin, Clock } from "lucide-react";
import Link from "next/link";

const jobs = [
  {
    title: "Full Stack Developer",
    type: "Full-time",
    location: "Remote",
    description:
      "Build and maintain our Next.js frontend and Node.js backend services. You'll work on features like plot management, billing systems, and real-time dashboards used by hundreds of societies.",
  },
  {
    title: "UI/UX Designer",
    type: "Full-time",
    location: "Islamabad / Remote",
    description:
      "Design intuitive interfaces for complex society management workflows. You'll conduct user research with society administrators and create pixel-perfect designs in Figma.",
  },
  {
    title: "Sales Manager",
    type: "Full-time",
    location: "Lahore",
    description:
      "Drive growth by onboarding new housing societies to our platform. You'll build relationships with society committees, conduct demos, and close deals across Punjab.",
  },
];

export default function CareersPage() {
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
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 mb-6">Join Our Team</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            We&apos;re building the future of housing society management in Pakistan.
            Join a passionate team solving real problems for millions of residents.
          </p>
        </div>

        {/* Culture */}
        <div className="bg-emerald-50 rounded-2xl p-8 sm:p-12 mb-16 text-center">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Our Culture</h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            At SocietySphere, we value ownership, transparency, and impact. We work in small,
            autonomous teams that ship fast and iterate based on real user feedback. We offer
            competitive salaries, flexible remote work, and the opportunity to make a meaningful
            difference in how communities are managed across Pakistan.
          </p>
        </div>

        {/* Job Openings */}
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8">Open Positions</h2>
        <div className="space-y-6 mb-16">
          {jobs.map((job) => (
            <div
              key={job.title}
              className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-xl font-semibold text-slate-900">{job.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">{job.description}</p>
              <a href="mailto:careers@societysphere.com?subject=Application: {{job.title}}">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              </a>
            </div>
          ))}
        </div>

        {/* Open Application */}
        <div className="text-center bg-slate-50 rounded-2xl p-12">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Don&apos;t see a fit?</h2>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto">
            We&apos;re always looking for talented people. Send your resume and tell us how you can contribute.
          </p>
          <a href="mailto:careers@societysphere.com?subject=Open Application">
            <Button className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3">Send Your Resume</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
