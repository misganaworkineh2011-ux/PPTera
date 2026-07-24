import { Shield } from "lucide-react";

export function PrivacyContent() {
  const lastUpdated = "January 1, 2026";

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-40 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm">
            <Shield className="h-4 w-4 text-[#14b8a6]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Privacy
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-4">
            Privacy Policy
          </h1>

          <p className="text-slate-600 mb-2">
            Effective Date: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-slate max-w-none">
            
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-slate-700 leading-relaxed mb-4">
                This Privacy Policy describes how PPTera Tech, Inc. (&quot;PPTera,&quot; &quot;we,&quot; &quot;us&quot; or &quot;our&quot;) processes personal information that we collect through our website, services, and platform that link to this Privacy Policy (collectively, the &quot;Service&quot;).
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                PPTera provides an AI-powered platform that generates and optimizes presentations. This Privacy Policy explains how we collect, use, share, and protect your personal information.
              </p>
            </div>

            {/* Table of Contents */}
            <div className="mb-12 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Table of Contents</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li><a href="#collection" className="hover:text-[#14b8a6]">1. Personal Information We Collect</a></li>
                <li><a href="#use" className="hover:text-[#14b8a6]">2. How We Use Your Personal Information</a></li>
                <li><a href="#sharing" className="hover:text-[#14b8a6]">3. How We Share Your Personal Information</a></li>
                <li><a href="#choices" className="hover:text-[#14b8a6]">4. Your Choices</a></li>
                <li><a href="#security" className="hover:text-[#14b8a6]">5. Security</a></li>
                <li><a href="#contact" className="hover:text-[#14b8a6]">6. How to Contact Us</a></li>
              </ul>
            </div>

            {/* Section 1 */}
            <div id="collection" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                1. Personal Information We Collect
              </h2>
              
              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Information You Provide</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Contact data:</strong> Name, email address, phone number, and company name</li>
                <li><strong>Account data:</strong> Username, password, and profile information</li>
                <li><strong>Payment data:</strong> Billing address and payment card information (processed by our payment processors)</li>
                <li><strong>User-generated content:</strong> Presentations, slides, text, images, and other content you create</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Information Collected Automatically</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Device data:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Usage data:</strong> Pages viewed, features used, time spent, navigation paths</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div id="use" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                2. How We Use Your Personal Information
              </h2>
              
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Provide, operate, and improve the Service</li>
                <li>Create and manage your account</li>
                <li>Process payments and transactions</li>
                <li>Provide customer support</li>
                <li>Send service-related communications</li>
                <li>Analyze usage patterns and improve the Service</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div id="sharing" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                3. How We Share Your Personal Information
              </h2>
              
              <ul className="list-disc pl-6 text-slate-700 space-y-3 mb-4">
                <li><strong>Service providers:</strong> Third parties that provide services on our behalf</li>
                <li><strong>Payment processors:</strong> Polar, Stripe, and other payment processors</li>
                <li><strong>Legal authorities:</strong> When required by law</li>
                <li><strong>Business transferees:</strong> In connection with mergers or acquisitions</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mb-4">
                We do not sell your personal information to third parties.
              </p>
            </div>

            {/* Section 4 */}
            <div id="choices" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                4. Your Choices
              </h2>
              
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Opt out of marketing emails via unsubscribe link</li>
                <li>Control cookies through browser settings</li>
                <li>Update account information in settings</li>
                <li>Request account deletion by contacting us</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div id="security" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                5. Security
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement technical, organizational, and physical safeguards to protect your personal information. However, no system is completely secure.
              </p>
            </div>

            {/* Section 6 */}
            <div id="contact" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                6. How to Contact Us
              </h2>
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 mt-4">
                <p className="text-slate-700 mb-2"><strong>Email:</strong> privacy@pptmaster.app</p>
                <p className="text-slate-700 mb-2"><strong>Support:</strong> support@pptmaster.app</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-[#0f766e]/5 to-[#14b8a6]/5 border border-[#14b8a6]/20">
              <p className="text-sm text-slate-600 text-center">
                Last updated: {lastUpdated}
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
