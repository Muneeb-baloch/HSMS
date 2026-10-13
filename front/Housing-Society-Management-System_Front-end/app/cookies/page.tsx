"use client";

import Link from "next/link";
import { useState } from "react";

const cookieTable = [
  {
    name: "hsms_session",
    type: "Essential",
    purpose: "Login session management",
    duration: "Session",
  },
  {
    name: "hsms_token",
    type: "Essential",
    purpose: "JWT authentication token",
    duration: "7 days",
  },
  {
    name: "hsms_theme",
    type: "Functional",
    purpose: "Dark/light mode preference",
    duration: "1 year",
  },
  {
    name: "hsms_lang",
    type: "Functional",
    purpose: "Language preference",
    duration: "1 year",
  },
  {
    name: "hsms_consent",
    type: "Essential",
    purpose: "Cookie consent record",
    duration: "1 year",
  },
];

const browserInstructions = [
  {
    name: "Google Chrome",
    steps:
      'Go to Settings > Privacy and security > Cookies and other site data. Here you can block third-party cookies, clear cookies on exit, or block all cookies. To delete specific cookies, go to Settings > Privacy and security > Clear browsing data and select "Cookies and other site data".',
  },
  {
    name: "Mozilla Firefox",
    steps:
      'Go to Settings > Privacy & Security. Under "Cookies and Site Data", you can clear data, manage exceptions, or choose your cookie blocking level. Firefox Enhanced Tracking Protection provides additional control over third-party tracking cookies.',
  },
  {
    name: "Apple Safari",
    steps:
      'Go to Preferences > Privacy. You can "Prevent cross-site tracking" and "Block all cookies". To remove existing cookies, click "Manage Website Data" and remove cookies for specific sites or all sites.',
  },
  {
    name: "Microsoft Edge",
    steps:
      "Go to Settings > Cookies and site permissions > Manage and delete cookies and site data. You can block third-party cookies, clear cookies when you close the browser, or add specific sites to block or allow lists.",
  },
];

export default function CookiesPage() {
  const [functionalEnabled, setFunctionalEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
            Cookie Policy
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Last updated: June 18, 2026
          </p>

          {/* Section 1: What Are Cookies */}
          <div className="mt-10 space-y-10">
            <section>
              <h2 className="border-l-4 border-emerald-500 pl-4 font-serif text-xl font-semibold text-slate-900">
                What Are Cookies
              </h2>
              <div className="mt-4 space-y-4 pl-4">
                <p className="text-base leading-relaxed text-slate-700">
                  Cookies are small text files that are stored on your device
                  (computer, tablet, or smartphone) when you visit a website.
                  They are widely used to make websites work more efficiently,
                  provide a better user experience, and give website operators
                  information about how their site is being used.
                </p>
                <p className="text-base leading-relaxed text-slate-700">
                  SocietySphere uses a minimal number of cookies that are
                  essential for the platform to function correctly and, with your
                  consent, optional cookies that help us understand usage
                  patterns and improve our service. We do not use marketing or
                  advertising cookies.
                </p>
              </div>
            </section>

            {/* Section 2: How We Use Cookies - Table */}
            <section>
              <h2 className="border-l-4 border-emerald-500 pl-4 font-serif text-xl font-semibold text-slate-900">
                How We Use Cookies
              </h2>
              <div className="mt-4 pl-4">
                <p className="mb-6 text-base leading-relaxed text-slate-700">
                  The following table details every cookie used by the
                  SocietySphere platform:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b-2 border-emerald-200 bg-emerald-50">
                        <th className="px-4 py-3 text-left font-semibold text-slate-900">
                          Cookie Name
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-900">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-900">
                          Purpose
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-900">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cookieTable.map((cookie) => (
                        <tr
                          key={cookie.name}
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 font-mono text-sm text-emerald-700">
                            {cookie.name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                cookie.type === "Essential"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {cookie.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {cookie.purpose}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {cookie.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 3: Cookie Categories */}
            <section>
              <h2 className="border-l-4 border-emerald-500 pl-4 font-serif text-xl font-semibold text-slate-900">
                Cookie Categories
              </h2>
              <div className="mt-4 space-y-6 pl-4">
                <div className="rounded-lg border border-slate-200 p-5">
                  <h3 className="text-base font-semibold text-slate-900">
                    Essential Cookies
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      Always Active
                    </span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    These cookies are strictly necessary for the platform to
                    function. They enable core functionality such as user
                    authentication, session management, and security features.
                    Without these cookies, you would not be able to log in or use
                    the Service. Essential cookies cannot be disabled.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-5">
                  <h3 className="text-base font-semibold text-slate-900">
                    Functional Cookies
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      Optional
                    </span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Functional cookies remember your preferences and settings,
                    such as your chosen theme (dark or light mode) and language
                    preference. Disabling these cookies means you may need to
                    re-select your preferences each time you visit the platform,
                    but the core functionality will not be affected.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-5">
                  <h3 className="text-base font-semibold text-slate-900">
                    Analytics Cookies
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      Optional
                    </span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Analytics cookies help us understand how users interact with
                    the platform by collecting information about pages visited,
                    features used, and time spent on the Service. This data is
                    anonymized and aggregated, and is used solely to improve the
                    platform experience. We do not use analytics data to identify
                    individual users.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Interactive Cookie Preferences */}
            <section>
              <h2 className="border-l-4 border-emerald-500 pl-4 font-serif text-xl font-semibold text-slate-900">
                Manage Your Cookie Preferences
              </h2>
              <div className="mt-4 pl-4">
                <div className="rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-sm">
                  <p className="mb-6 text-sm leading-relaxed text-slate-600">
                    Use the toggles below to manage your cookie preferences. Your
                    selection will be saved and applied to your current browser.
                  </p>

                  {/* Essential Toggle */}
                  <div className="flex items-center justify-between border-b border-slate-100 py-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Essential Cookies
                      </h4>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Required for login, security, and basic functionality
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-emerald-600">
                        Always On
                      </span>
                      <div className="relative h-6 w-11 cursor-not-allowed rounded-full bg-emerald-500 opacity-60">
                        <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                      </div>
                    </div>
                  </div>

                  {/* Functional Toggle */}
                  <div className="flex items-center justify-between border-b border-slate-100 py-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Functional Cookies
                      </h4>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Theme, language, and UI preferences
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFunctionalEnabled(!functionalEnabled)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        functionalEnabled ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                      aria-label="Toggle functional cookies"
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          functionalEnabled
                            ? "translate-x-5"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Analytics Toggle */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Analytics Cookies
                      </h4>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Usage patterns to improve the platform
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        analyticsEnabled ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                      aria-label="Toggle analytics cookies"
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          analyticsEnabled
                            ? "translate-x-5"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Save Button */}
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                    >
                      Save Preferences
                    </button>
                    {saved && (
                      <span className="text-sm font-medium text-emerald-600">
                        Preferences saved successfully!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Managing Cookies in Your Browser */}
            <section>
              <h2 className="border-l-4 border-emerald-500 pl-4 font-serif text-xl font-semibold text-slate-900">
                Managing Cookies in Your Browser
              </h2>
              <div className="mt-4 space-y-4 pl-4">
                <p className="text-base leading-relaxed text-slate-700">
                  In addition to the preferences panel above, you can manage
                  cookies directly through your web browser. Most browsers allow
                  you to view, delete, and block cookies. Please note that
                  blocking essential cookies will prevent you from using the
                  SocietySphere platform.
                </p>
                <div className="space-y-4">
                  {browserInstructions.map((browser) => (
                    <div
                      key={browser.name}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <h4 className="text-sm font-semibold text-slate-900">
                        {browser.name}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {browser.steps}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 6: Contact */}
            <section>
              <h2 className="border-l-4 border-emerald-500 pl-4 font-serif text-xl font-semibold text-slate-900">
                Contact Us
              </h2>
              <div className="mt-4 space-y-4 pl-4">
                <p className="text-base leading-relaxed text-slate-700">
                  If you have any questions about our use of cookies or this
                  Cookie Policy, please contact us at:
                </p>
                <p className="text-base leading-relaxed text-slate-700">
                  Email:{" "}
                  <a
                    href="mailto:cookies@societysphere.com"
                    className="text-emerald-600 hover:underline"
                  >
                    cookies@societysphere.com
                  </a>
                </p>
                <p className="text-base leading-relaxed text-slate-700">
                  SocietySphere Technologies (Private) Limited
                  <br />
                  Blue Area, Jinnah Avenue
                  <br />
                  Islamabad, 44000, Pakistan
                </p>
              </div>
            </section>
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
