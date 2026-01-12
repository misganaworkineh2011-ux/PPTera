import { Cookie } from "lucide-react";

export function CookiesContent() {
  return (
    <>
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
                This Cookie Notice explains how PPT Master (&quot;PPT Master&quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;) uses cookies and other similar technologies on its website that links to this Cookie Notice (the &quot;Site&quot;), as well as in our emails, and your related choices in relation to the same.
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
                We may use any or all of the following &quot;technologies&quot; on our Site and in our emails:
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Cookies:</h3>
                  <p className="text-slate-700 leading-relaxed mb-3">
                    A cookie is a very small text file that may be placed on your browser or in the storage on your device. There are two types: &quot;session cookies&quot; and &quot;persistent cookies&quot;. Session cookies are cookies that disappear from your device or browser when you close your browser. Persistent cookies stay on your device even after you close your browser.
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    Please note that both PPT Master and third-party service providers may set cookies on our Site - these &apos;third-party cookies&apos; are set by domains other than those we control and may recognise your device across different websites.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Pixel tags:</h3>
                  <p className="text-slate-700 leading-relaxed mb-3">
                    A pixel tag is a single pixel, transparent GIF image with a unique identifier that can recognise certain types of data on your device. They are used to operate and improve the Site and our email practices, including to help deliver cookies, count visits and understand usage and email campaign effectiveness.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Other similar technologies:</h3>
                  <p className="text-slate-700 leading-relaxed">
                    We may also use other tracking technologies, such as mobile advertising IDs and tags, HTML5 local storage / local shared objects (which store relevant data locally on your device), for similar purposes as described in this Cookie Notice.
                  </p>
                </div>
              </div>
            </div>

            {/* For what reasons */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">For what reasons do we use cookies and similar technologies?</h2>
              <div className="space-y-4">
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Strictly necessary technologies:</h3>
                  <p className="text-slate-700 leading-relaxed mb-0">
                    These technologies are essential in order to enable our Site to provide the function you have requested.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Functionality technologies:</h3>
                  <p className="text-slate-700 leading-relaxed mb-0">
                    These technologies allow us to provide enhanced personalisation and functionality.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Analytics technologies:</h3>
                  <p className="text-slate-700 leading-relaxed mb-0">
                    These technologies collect information on how users interact with our Site.
                  </p>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="mb-12 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h2 className="text-3xl font-bold text-slate-900 mb-4 mt-0">Questions</h2>
              <p className="text-slate-700 leading-relaxed mb-0">
                If you have any questions about this Cookie Notice, please contact us by email at{" "}
                <a href="mailto:pptmaster.app@gmail.com" className="text-[#06b6d4] hover:underline font-semibold">
                  pptmaster.app@gmail.com
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
