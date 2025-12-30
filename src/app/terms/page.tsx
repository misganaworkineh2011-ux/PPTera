import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { Scale } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use - PPT Master",
  description: "Read PPT Master's Terms of Use Agreement to understand the rules and guidelines for using our AI-powered presentation platform.",
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 86400; // Revalidate once per day

export default function TermsPage() {
  const lastUpdated = "January 1, 2026";

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar />

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
                <strong>PLEASE READ THIS TERMS OF USE AGREEMENT.</strong> These Terms of Use ("Terms") govern your use of the PPTMaster Tech, Inc. ("PPTMaster", "our", "us" and "we") Site located at https://www.pptmaster.app (the "Site") and online services available through the Site (collectively, the "Services"). BY ACCESSING OR USING THE SITE, YOU REPRESENT THAT (1) YOU HAVE READ AND AGREE TO BE BOUND BY THE TERMS, (2) YOU ARE OF LEGAL AGE TO FORM A BINDING CONTRACT, AND (3) YOU HAVE THE AUTHORITY TO ENTER INTO THESE TERMS. IF YOU DO NOT AGREE, YOU MAY NOT ACCESS OR USE THE SERVICES.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                1. USE OF THE SERVICES
              </h2>
              
              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">1.1 License to the Services</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Subject to your compliance with this Agreement, PPTMaster grants you a limited, non-exclusive, non-transferable license to access and use the Services for your personal or internal business purposes. The Services consist of PPTMaster's AI-powered presentation generation platform and associated tools.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">1.2 Use of AI</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our Services utilize artificial intelligence platforms and models ("AI") to generate presentations, slides, and content ("Results") based on your inputs. You acknowledge that Results are intended to assist in creating initial drafts and are provided "as is" without warranties of accuracy, completeness, or suitability. PPTMaster has no control over AI outputs and makes no representations regarding Results.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">1.3 Updates</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                PPTMaster may update the Services at any time with or without notice. You may need to update third-party software to continue using the Services.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">1.4 Restrictions</h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                You shall not:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>License, sell, rent, or commercially exploit the Services</li>
                <li>Modify, reverse engineer, or decompile any part of the Services</li>
                <li>Use automated tools to scrape or download data from the Services</li>
                <li>Remove copyright notices or proprietary markings</li>
                <li>Use the Services for any unlawful purpose</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">1.5 Communications</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                By using the Services, you agree to receive communications from us via email, text message, and push notifications. You can opt out of promotional emails by following the unsubscribe link.
              </p>
            </div>

            {/* Section 2 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                2. REGISTRATION
              </h2>
              
              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">2.1 Account Registration</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                To access certain features, you must register an account ("Account"). You agree to provide accurate, current information and maintain its accuracy. You are responsible for all activities under your Account and must notify us immediately of any unauthorized use.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">2.2 Third-Party Authentication</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may sign in using third-party authentication services. By doing so, you grant us access to information from those services as permitted by their terms. Your relationship with third-party providers is governed solely by your agreements with them.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">2.3 Eligibility</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You represent that you are at least 16 years old, of legal age to form a binding contract, and not barred from using the Services under applicable law.
              </p>
            </div>

            {/* Section 3 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                3. CONTENT AND OWNERSHIP
              </h2>
              
              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">3.1 Your Content</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You retain ownership of content you create using the Services ("Your Content"). However, you grant PPTMaster a license to use Your Content to operate and provide the Services, including for product support and improvements.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">3.2 PPTMaster Property</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                The Services, including all software, designs, text, graphics, and other content (excluding Your Content), are owned by PPTMaster and protected by intellectual property laws. All trademarks and logos are property of PPTMaster.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">3.3 AI Training</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you are on a paid plan with privacy controls enabled, we do not use Your Content to train AI models. Otherwise, you grant us the right to use Your Content to train and improve our AI systems.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">3.4 Feedback</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Any feedback, suggestions, or ideas you provide to PPTMaster become our property, and we may use them without obligation or compensation to you.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                4. FEES AND SUBSCRIPTIONS
              </h2>
              
              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">4.1 Payment</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You agree to pay all fees for Services you purchase. We use third-party payment processors (Polar, Stripe) to handle payments. You must provide accurate payment information and authorize us to charge your payment method.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">4.2 Subscriptions and Auto-Renewal</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Subscriptions automatically renew at the end of each billing period at the then-current price unless you cancel at least 30 days before renewal. You can cancel by contacting support or through your account settings.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">4.3 No Refunds</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                All fees are non-refundable. If you cancel, you may use the Services until the end of your current billing period, but you will not receive a prorated refund.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">4.4 Free Trials</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Free trials automatically convert to paid subscriptions unless you cancel before the trial ends. You are responsible for payment if you do not cancel in time.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                5. USER CONDUCT
              </h2>
              <p className="text-slate-700 leading-relaxed mb-2">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Violate any laws or regulations</li>
                <li>Infringe intellectual property rights</li>
                <li>Upload harmful, offensive, or illegal content</li>
                <li>Impersonate others or provide false information</li>
                <li>Interfere with the Services or other users</li>
                <li>Introduce viruses or malicious code</li>
                <li>Use the Services for unauthorized commercial purposes</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                6. DISCLAIMERS
              </h2>
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700 leading-relaxed mb-4">
                  <strong>THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.</strong> PPTMaster disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.
                </p>
                <p className="text-slate-700 leading-relaxed mb-0">
                  PPTMaster does not warrant that the Services will be uninterrupted, error-free, or secure. You use the Services at your own risk.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                7. LIMITATION OF LIABILITY
              </h2>
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700 leading-relaxed mb-4">
                  <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, PPTMASTER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, OR DATA.</strong>
                </p>
                <p className="text-slate-700 leading-relaxed mb-0">
                  Our total liability shall not exceed the greater of (a) the amount you paid us in the past month, or (b) $100.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                8. INDEMNIFICATION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                You agree to indemnify and hold PPTMaster harmless from any claims, damages, or expenses arising from: (a) Your Content, (b) your use of the Services, (c) your violation of these Terms, or (d) your violation of any rights of others.
              </p>
            </div>

            {/* Section 9 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                9. TERMINATION
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                PPTMaster may suspend or terminate your access to the Services at any time for any reason. You may terminate by closing your account. Upon termination, your right to use the Services ceases immediately, and we may delete Your Content.
              </p>
            </div>

            {/* Section 10 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                10. DISPUTE RESOLUTION
              </h2>
              
              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">10.1 Governing Law</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms are governed by the laws of the State of California, without regard to conflict of law principles.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">10.2 Informal Resolution</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Before filing any claim, you agree to attempt to resolve disputes informally by contacting us at support@pptmaster.app.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">10.3 Arbitration</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Any disputes that cannot be resolved informally shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You waive your right to a jury trial and to participate in class actions.
              </p>
            </div>

            {/* Section 11 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                11. GENERAL PROVISIONS
              </h2>
              
              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">11.1 Changes to Terms</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may modify these Terms at any time. We will notify you of material changes via email or through the Services. Continued use after changes constitutes acceptance.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">11.2 Entire Agreement</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms constitute the entire agreement between you and PPTMaster regarding the Services.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">11.3 Severability</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If any provision is found unenforceable, the remaining provisions remain in effect.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">11.4 Contact</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                For questions about these Terms, contact us at support@pptmaster.app.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-[#1e3a8a]/5 to-[#06b6d4]/5 border border-[#06b6d4]/20">
              <p className="text-sm text-slate-600 text-center">
                By using PPTMaster, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
              </p>
            </div>

          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
