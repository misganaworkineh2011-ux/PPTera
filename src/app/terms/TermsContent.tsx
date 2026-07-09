import { Scale } from "lucide-react";

export function TermsContent() {
  const lastUpdated = "January 1, 2026";

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-40 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm">
            <Scale className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Legal
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-4">
            Terms of Use Agreement
          </h1>

          <p className="text-slate-600 mb-2">
            Effective Date: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-slate max-w-none">
            
            {/* Introduction */}
            <div className="mb-12 p-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <p className="text-sm leading-relaxed text-slate-700 mb-0">
                <strong>PLEASE READ THIS TERMS OF USE AGREEMENT.</strong> These Terms of Use (&quot;Terms&quot;) govern your use of the PPTera Tech, Inc. (&quot;PPTera&quot;, &quot;our&quot;, &quot;us&quot; and &quot;we&quot;) Site located at https://www.pptmaster.app (the &quot;Site&quot;) and online services available through the Site (collectively, the &quot;Services&quot;). BY ACCESSING OR USING THE SITE, YOU REPRESENT THAT (1) YOU HAVE READ AND AGREE TO BE BOUND BY THE TERMS, (2) YOU ARE OF LEGAL AGE TO FORM A BINDING CONTRACT, AND (3) YOU HAVE THE AUTHORITY TO ENTER INTO THESE TERMS.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                1. USE OF THE SERVICES
              </h2>
              
              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">1.1 License to the Services</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Subject to your compliance with this Agreement, PPTera grants you a limited, non-exclusive, non-transferable license to access and use the Services for your personal or internal business purposes.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">1.2 Use of AI</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our Services utilize artificial intelligence platforms and models (&quot;AI&quot;) to generate presentations, slides, and content (&quot;Results&quot;) based on your inputs. You acknowledge that Results are intended to assist in creating initial drafts and are provided &quot;as is&quot; without warranties of accuracy, completeness, or suitability.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">1.3 Restrictions</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>License, sell, rent, or commercially exploit the Services</li>
                <li>Modify, reverse engineer, or decompile any part of the Services</li>
                <li>Use automated tools to scrape or download data from the Services</li>
                <li>Use the Services for any unlawful purpose</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                2. REGISTRATION
              </h2>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                To access certain features, you must register an account (&quot;Account&quot;). You agree to provide accurate, current information and maintain its accuracy. You are responsible for all activities under your Account.
              </p>

              <p className="text-slate-700 leading-relaxed mb-4">
                You represent that you are at least 16 years old, of legal age to form a binding contract, and not barred from using the Services under applicable law.
              </p>
            </div>

            {/* Section 3 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                3. CONTENT AND OWNERSHIP
              </h2>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                You retain ownership of content you create using the Services (&quot;Your Content&quot;). However, you grant PPTera a license to use Your Content to operate and provide the Services.
              </p>

              <p className="text-slate-700 leading-relaxed mb-4">
                The Services, including all software, designs, text, graphics, and other content (excluding Your Content), are owned by PPTera and protected by intellectual property laws.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                4. FEES AND SUBSCRIPTIONS
              </h2>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                You agree to pay all fees for Services you purchase. Subscriptions automatically renew at the end of each billing period unless you cancel at least 30 days before renewal.
              </p>

              <p className="text-slate-700 leading-relaxed mb-4">
                All fees are non-refundable. If you cancel, you may use the Services until the end of your current billing period.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                5. DISCLAIMERS
              </h2>
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700 leading-relaxed mb-0">
                  <strong>THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND.</strong> PPTera disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                6. LIMITATION OF LIABILITY
              </h2>
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700 leading-relaxed mb-0">
                  <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, PPTERA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.</strong> Our total liability shall not exceed the greater of (a) the amount you paid us in the past month, or (b) $100.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                7. TERMINATION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                PPTera may suspend or terminate your access to the Services at any time for any reason. You may terminate by closing your account. Upon termination, your right to use the Services ceases immediately.
              </p>
            </div>

            {/* Section 8 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                8. DISPUTE RESOLUTION
              </h2>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms are governed by the laws of the State of California. Before filing any claim, you agree to attempt to resolve disputes informally by contacting us at support@pptmaster.app.
              </p>
            </div>

            {/* Section 9 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                9. CONTACT
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                For questions about these Terms, contact us at support@pptmaster.app.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-[#1e3a8a]/5 to-[#06b6d4]/5 border border-[#06b6d4]/20">
              <p className="text-sm text-slate-600 text-center">
                By using PPTera, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
