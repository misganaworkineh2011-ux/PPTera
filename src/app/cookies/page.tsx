"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { Cookie } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm">
            <Cookie className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Cookie Notice
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            Cookie Notice
          </h1>

          <p className="text-lg text-slate-600 mb-4">
            Effective as of December 30, 2025
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-slate max-w-none">
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                This Cookie Notice explains how PPT Master ("PPT Master", "we", "us" or "our") uses cookies and other similar technologies on its website that links to this Cookie Notice (the "Site"), as well as in our emails, and your related choices in relation to the same.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Please refer to our <a href="/privacy" className="text-[#06b6d4] hover:underline font-semibold">Privacy Policy</a> for more information on our privacy practices.
              </p>
            </div>

            {/* Managing Preferences */}
            <div className="mb-12 p-6 bg-blue-50 border-l-4 border-[#06b6d4] rounded-r-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-0">Managing your preferences</h2>
              <p className="text-slate-700 leading-relaxed mb-0">
                Before we dive into the details - if you are just looking to manage your preferences on our Site relating to cookies and similar technologies (including opting-out), you can do so at any time through your browser settings.
              </p>
              <p className="text-slate-700 leading-relaxed mt-4 mb-0">
                If you do not accept our cookies, you may experience some inconvenience in your use of our Site. If you want to find out more about cookies and similar technologies on our Site and in our emails, please keep reading.
              </p>
            </div>

            {/* What types of technologies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">What types of technologies does PPT Master use?</h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                We may use any or all of the following "technologies" on our Site and in our emails:
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Cookies:</h3>
                  <p className="text-slate-700 leading-relaxed mb-3">
                    A cookie is a very small text file that may be placed on your browser or in the storage on your device. There are two types: "session cookies" and "persistent cookies". Session cookies are cookies that disappear from your device or browser when you close your browser. Persistent cookies stay on your device even after you close your browser.
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    Please note that both PPT Master and third-party service providers may set cookies on our Site - these 'third-party cookies' are set by domains other than those we control and may recognise your device across different websites.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Pixel tags:</h3>
                  <p className="text-slate-700 leading-relaxed mb-3">
                    A pixel tag is a single pixel, transparent GIF image with a unique identifier that can recognise certain types of data on your device. They are used to operate and improve the Site and our email practices, including to help deliver cookies, count visits and understand usage and email campaign effectiveness.
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    For example, we may put pixel tags in our emails to understand how you interact with that email – for example, whether you opened the email, whether you forwarded it, whether you clicked on a link in the email that directed you to our Site etc., – these pixels may collect the time, location and operating system of the device you use to read the email.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Other similar technologies:</h3>
                  <p className="text-slate-700 leading-relaxed">
                    We may also use other tracking technologies, such as mobile advertising IDs and tags, HTML5 local storage / local shared objects (which store relevant data locally on your device), for similar purposes as described in this Cookie Notice.
                  </p>
                  <p className="text-slate-700 leading-relaxed mt-3">
                    So, when we refer to cookies and "similar technologies" in this Cookie Notice, such reference includes reference to the pixel tags discussed above, HTML5 local storage / local shared objects and other equivalent tracking technologies.
                  </p>
                </div>
              </div>
            </div>

            {/* For what reasons */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">For what reasons do we use cookies and similar technologies?</h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                The purposes for which we use technologies may fall into one of the following categories:
              </p>

              <div className="space-y-4">
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Strictly necessary technologies:</h3>
                  <p className="text-slate-700 leading-relaxed mb-0">
                    These technologies are essential in order to enable our Site to provide the function you have requested, such as by helping to ensure that the content of a page loads quickly and effectively.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Functionality technologies:</h3>
                  <p className="text-slate-700 leading-relaxed mb-0">
                    These technologies allow us to provide enhanced personalisation and functionality, such as tailoring content to you, remembering your choices and preferences on the Site (e.g. language, text size, etc.) or remembering search parameters.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Analytics technologies:</h3>
                  <p className="text-slate-700 leading-relaxed mb-0">
                    These technologies collect information on how users interact with our Site and enable us to improve how it operates.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Targeting technologies:</h3>
                  <p className="text-slate-700 leading-relaxed mb-0">
                    These technologies collect information about your browsing habits in order to provide advertising which is more relevant to you and your interests – for example, they remember the websites you have visited and share that information with other parties such as advertising technology service providers.
                  </p>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed mt-6">
                A full list of the technologies we use can be found in the section titled: <span className="font-semibold">Details of Cookies and Similar Technologies</span>.
              </p>
            </div>

            {/* How can you manage */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">How can you manage your consent?</h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                You can control or limit how cookies and similar technologies are used by taking the following steps:
              </p>

              <ul className="space-y-3 text-slate-700 leading-relaxed list-disc pl-6 mb-6">
                <li>Managing your preferences on our Site (including by opting-out) at any time through your browser settings.</li>
                <li>Pixel tags in emails can typically be blocked by default if you configure your preferences in your email client to block external images or set it to show "plain text only" emails.</li>
                <li>Managing your browser or device settings to clear or decline cookies (for instance, by using a "private" or "incognito" mode). If you disable cookies, however, some of the features of our services may not function properly.</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mb-3">
                For more information about cookies, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-[#06b6d4] hover:underline font-semibold">www.allaboutcookies.org</a>.
              </p>

              <p className="text-slate-700 leading-relaxed mb-6">
                In particular, for more details about how Google uses data when in the context of Google Analytics, please see here: <a href="https://www.google.com/policies/privacy/partners" target="_blank" rel="noopener noreferrer" className="text-[#06b6d4] hover:underline font-semibold">www.google.com/policies/privacy/partners</a>.
              </p>

              <p className="text-slate-700 leading-relaxed">
                Finally, if you do not accept certain non-essential cookies and similar technologies, you may experience some inconvenience in your use of our Site. For example, we may not be able to recognise your device and you may need to log in every time you use our Site.
              </p>
            </div>

            {/* Details of cookies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Details of cookies and similar technologies</h2>
              <p className="text-slate-700 leading-relaxed">
                The specific cookies and other similar technologies that we use may include authentication cookies (Clerk), analytics cookies (Google Analytics), and functionality cookies for user preferences. The details of these technologies (including the cookies and other similar technologies shown) may change over time as we update our services.
              </p>
            </div>

            {/* Changes to this notice */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Changes to this Cookie Notice</h2>
              <p className="text-slate-700 leading-relaxed">
                Information about the cookies and similar technologies we use may be updated from time to time, so please check this Cookie Notice on a regular basis for any changes.
              </p>
            </div>

            {/* Questions */}
            <div className="mb-12 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h2 className="text-3xl font-bold text-slate-900 mb-4 mt-0">Questions</h2>
              <p className="text-slate-700 leading-relaxed mb-0">
                If you have any questions about this Cookie Notice, please contact us by email at{" "}
                <a href="mailto:privacy@pptmaster.com" className="text-[#06b6d4] hover:underline font-semibold">
                  privacy@pptmaster.com
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
