import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | SocietySphere",
  description:
    "How SocietySphere collects, uses, and protects society and resident data.",
};

const glanceItems = [
  {
    icon: "\uD83D\uDD12",
    title: "Your Data, Your Rights",
    description:
      "Access, export, or delete your personal data at any time through our Privacy Dashboard.",
  },
  {
    icon: "\uD83D\uDEE1\uFE0F",
    title: "Enterprise-Grade Security",
    description:
      "AES-256 encryption at rest, TLS 1.3 in transit, and regular security audits protect your information.",
  },
  {
    icon: "\uD83D\uDEAB",
    title: "We Never Sell Your Data",
    description:
      "Your society data is never sold, rented, or traded to third parties for marketing purposes.",
  },
  {
    icon: "\uD83C\uDDF5\uD83C\uDDF0",
    title: "Data Stays in Pakistan",
    description:
      "All data is processed and stored within Pakistan on MongoDB Atlas servers. No international transfers.",
  },
];

const sections = [
  {
    number: 1,
    title: "Introduction",
    content: `SocietySphere Technologies (Private) Limited ("SocietySphere", "we", "us", or "our") is committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, store, share, and safeguard your data when you use our housing society management platform ("Service").

This Policy applies to all users of the Service, including society administrators, committee members, residents, staff, and visitors. By using the Service, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our data practices, please do not use the Service.

We have designed this Privacy Policy to be transparent, comprehensive, and aligned with international best practices for data protection, including principles inspired by the General Data Protection Regulation (GDPR) and Pakistan's emerging data protection framework.`,
  },
  {
    number: 2,
    title: "Information We Collect",
    content: `We collect the following categories of information:

Account Information: When you register for the Service, we collect your full name, email address, phone number, and — where required for identity verification or regulatory compliance — your Computerized National Identity Card (CNIC) number. Society administrators may also provide their designation, society name, and registration details.

Society Data: Information that societies and their administrators enter into the platform, including plot records, member directories, financial transactions, meeting minutes, complaints, maintenance requests, visitor logs, and facility bookings. This data is entered and managed by authorized society personnel.

Usage Data: We automatically collect technical information when you use the Service, including your IP address, browser type and version, device type and operating system, pages visited, features used, timestamps, and referring URLs. This data helps us understand how the Service is used and identify areas for improvement.

Location Data: With your explicit consent, we may collect location data for specific features such as geofenced guard patrol tracking and emergency SOS response. You can disable location sharing at any time through your device settings.

Payment Data: When you make payments through the Service, payment processing is handled by authorized third-party processors (JazzCash, Easypaisa, or bank transfer). We do not store your credit card numbers, debit card numbers, or bank account details. We retain only transaction references, amounts, dates, and payment status for our records.`,
  },
  {
    number: 3,
    title: "How We Use Your Data",
    content: `We use the information we collect for the following purposes:

\u2022 Provide and Maintain the Service: To create and manage your account, process society data, generate reports, and deliver the core functionality of the platform.
\u2022 Process Payments: To facilitate billing, dues collection, and payment reconciliation for your society.
\u2022 Send Notifications: To deliver system alerts, payment reminders, society announcements, and other communications that you have opted into.
\u2022 Generate AI Insights: To provide predictive analytics, financial forecasts, and management recommendations. AI analysis uses anonymized and aggregated data wherever possible.
\u2022 Ensure Regulatory Compliance: To generate reports and documentation required by PLRA, LDA, and other regulatory authorities as configured by your society administrator.
\u2022 Prevent Fraud and Ensure Security: To detect, prevent, and respond to fraudulent activity, unauthorized access, and other security threats.
\u2022 Provide Customer Support: To respond to your inquiries, troubleshoot issues, and provide technical assistance.
\u2022 Improve the Service: To analyze usage patterns, conduct research, and develop new features and improvements.`,
  },
  {
    number: 4,
    title: "Data Sharing",
    content: `SocietySphere does NOT sell, rent, or trade your personal data to third parties for their marketing or commercial purposes. We share your data only in the following limited circumstances:

Payment Processors: We share transaction data with JazzCash, Easypaisa, and banking partners solely to process payments. These processors are contractually obligated to protect your data and use it only for payment processing.

Cloud Infrastructure Providers: Your data is stored on MongoDB Atlas (database) and Cloudinary (media files). These providers operate under strict data processing agreements and maintain industry-leading security certifications.

AI Service Providers: Where AI-powered insights are generated, we share anonymized and aggregated data with AI processing services. No personally identifiable information is shared for AI analysis without your explicit consent.

Regulatory Authorities: We may share data with PLRA, LDA, FBR, or other regulatory authorities when required by law, court order, or regulatory directive. We will notify affected societies of such disclosures unless prohibited by law.

Within Your Society: Your information is shared with other members of your society as configured by your society's privacy settings. For example, your name and plot number may appear in the member directory if your society has enabled this feature. You can control your visibility through the Privacy Dashboard.`,
  },
  {
    number: 5,
    title: "Your Privacy Controls",
    content: `SocietySphere provides a comprehensive Privacy Dashboard that gives you direct control over your personal data:

\u2022 Profile Visibility Control: Choose whether your profile is visible to all society members, committee members only, or completely private.
\u2022 Contact Sharing Toggles: Control whether your phone number, email address, and other contact details are visible in the society directory.
\u2022 Directory Opt-Out: Remove yourself entirely from the society member directory while retaining full access to the platform.
\u2022 Anonymous Complaints: Submit complaints and feedback without revealing your identity to society administrators.
\u2022 Data Export: Download a complete copy of your personal data in JSON or PDF format at any time.
\u2022 Data Deletion Requests: Request deletion of your personal data. We will process deletion requests within 30 days, subject to any legal or regulatory retention requirements.
\u2022 Notification Preferences: Granular control over which types of notifications you receive and through which channels (email, SMS, WhatsApp, push).
\u2022 Consent Management: Review and modify your consent preferences at any time, including consent for location tracking, AI analysis, and optional data sharing.`,
  },
  {
    number: 6,
    title: "Data Security",
    content: `We implement comprehensive technical and organizational measures to protect your data:

\u2022 Encryption at Rest: All stored data is encrypted using AES-256 encryption, the same standard used by banks and government agencies worldwide.
\u2022 Encryption in Transit: All data transmitted between your device and our servers is protected by TLS 1.3 encryption, ensuring that your information cannot be intercepted during transmission.
\u2022 Password Security: User passwords are hashed using bcrypt with adaptive cost factors, making them computationally infeasible to reverse-engineer even in the event of a data breach.
\u2022 Token Security: JWT authentication tokens are rotated regularly and can be invalidated immediately if suspicious activity is detected.
\u2022 Rate Limiting: API rate limiting prevents brute-force attacks and protects against denial-of-service attempts.
\u2022 Web Application Firewall (WAF): Our WAF monitors and filters incoming traffic to block common attack vectors including SQL injection, cross-site scripting, and other OWASP Top 10 threats.
\u2022 Security Audits: We conduct regular internal security audits and engage independent third-party security firms for annual penetration testing and vulnerability assessments.
\u2022 Access Controls: Internal access to production data is restricted to authorized personnel using multi-factor authentication and is logged for audit purposes.`,
  },
  {
    number: 7,
    title: "Data Retention",
    content: `We retain your data only as long as necessary for the purposes described in this Policy:

\u2022 Active Account Data: Retained for the duration of your active account. When you use the Service, your data is maintained to provide you with continuous access to your records and history.
\u2022 Deleted Account Data: When you delete your account or request data deletion, your personal data is removed from our active systems within 30 days.
\u2022 Audit Logs: System audit logs, including login records, data modification logs, and administrative actions, are retained for 2 years to support security investigations and compliance requirements.
\u2022 Financial Records: Transaction records, billing history, and financial reports are retained for 7 years in accordance with regulatory requirements under Pakistani tax and financial record-keeping laws.
\u2022 Backups: Encrypted backups are maintained on a 90-day rolling basis. Data deleted from active systems will be purged from backups within 90 days.`,
  },
  {
    number: 8,
    title: "Children's Privacy",
    content: `The SocietySphere Service is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that a child under 18 has provided us with personal information, we will take steps to delete such information from our systems promptly.

If you are a parent or guardian and believe that your child has provided personal information to SocietySphere, please contact us at privacy@societysphere.com, and we will work with you to address the issue.`,
  },
  {
    number: 9,
    title: "International Data",
    content: `All data collected through the SocietySphere Service is processed and stored within Pakistan, utilizing MongoDB Atlas servers located in the Pakistan region. We do not transfer your personal data to servers or facilities outside of Pakistan unless specifically required to do so.

In the unlikely event that an international data transfer becomes necessary — for example, due to a regulatory requirement or a critical infrastructure need — we will notify affected users in advance and implement appropriate safeguards, including standard contractual clauses and encryption, to protect your data during transfer and processing.`,
  },
  {
    number: 10,
    title: "Cookies",
    content: `SocietySphere uses cookies and similar technologies to provide essential platform functionality and, with your consent, to analyze usage patterns. Essential cookies are required for login, session management, and security, and cannot be disabled. Optional analytics cookies help us understand how the Service is used so we can improve it.

For complete details about the cookies we use, their purposes, and how to manage your cookie preferences, please visit our Cookie Policy.`,
  },
  {
    number: 11,
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our data practices, legal requirements, or platform features. For material changes that affect how we collect, use, or share your personal data, we will provide at least 30 days advance notice via email to the address associated with your account.

The "Last Updated" date at the top of this Policy indicates when the most recent revision was published. We encourage you to review this Policy periodically to stay informed about how we are protecting your data.`,
  },
  {
    number: 12,
    title: "Contact Our Data Protection Officer",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Officer:

Data Protection Officer
SocietySphere Technologies (Private) Limited
Blue Area, Jinnah Avenue
Islamabad, 44000, Pakistan

Email: privacy@societysphere.com

We will respond to all privacy-related inquiries within 15 business days.`,
  },
  {
    number: 13,
    title: "Your Rights",
    content: `Regardless of your location, we provide all SocietySphere users with the following data protection rights:

\u2022 Right of Access: You have the right to request a copy of the personal data we hold about you.
\u2022 Right to Rectification: You have the right to request correction of any inaccurate or incomplete personal data.
\u2022 Right to Erasure: You have the right to request deletion of your personal data, subject to any legal or regulatory retention requirements.
\u2022 Right to Data Portability: You have the right to receive your personal data in a structured, commonly used, machine-readable format (JSON or CSV).
\u2022 Right to Object: You have the right to object to the processing of your personal data for specific purposes, including AI analysis and marketing communications.
\u2022 Right to Restriction: You have the right to request that we restrict the processing of your personal data under certain circumstances.

All of these rights can be exercised directly through the Privacy Dashboard in your account settings, or by contacting our Data Protection Officer at privacy@societysphere.com.`,
  },
];

export default function PrivacyPage() {
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

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-emerald-600 transition hover:text-emerald-700 hover:underline"
        >
          &larr; Back to Home
        </Link>

        <article className="mt-4">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Last updated: June 18, 2026
          </p>

          {/* Privacy at a Glance */}
          <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8">
            <h2 className="mb-6 font-serif text-lg font-semibold text-slate-900">
              Privacy at a Glance
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {glanceItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white bg-white p-5 shadow-sm"
                >
                  <div className="mb-2 text-2xl">{item.icon}</div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <section key={section.number}>
                <h2 className="flex items-baseline gap-3 border-l-4 border-emerald-500 pl-4 font-serif text-xl font-semibold text-slate-900">
                  <span className="text-emerald-600">{section.number}.</span>
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 pl-4">
                  {section.content.split("\n\n").map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-base leading-relaxed text-slate-700"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
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
