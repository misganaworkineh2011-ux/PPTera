import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - PPT Master",
  description: "Read PPT Master's Privacy Policy to understand how we collect, use, and protect your personal information.",
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 86400; // Revalidate once per day

export default function PrivacyPage() {
  const lastUpdated = "January 1, 2026";

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm">
            <Shield className="h-4 w-4 text-[#06b6d4]" />
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
                This Privacy Policy describes how PPTMaster Tech, Inc. ("PPTMaster," "we," "us" or "our") processes personal information that we collect through our website, services, and platform that link to this Privacy Policy (collectively, the "Service").
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                PPTMaster provides an AI-powered platform that generates and optimizes presentations. This Privacy Policy explains how we collect, use, share, and protect your personal information.
              </p>
            </div>

            {/* Table of Contents */}
            <div className="mb-12 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Table of Contents</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li><a href="#collection" className="hover:text-[#06b6d4]">1. Personal Information We Collect</a></li>
                <li><a href="#use" className="hover:text-[#06b6d4]">2. How We Use Your Personal Information</a></li>
                <li><a href="#sharing" className="hover:text-[#06b6d4]">3. How We Share Your Personal Information</a></li>
                <li><a href="#choices" className="hover:text-[#06b6d4]">4. Your Choices</a></li>
                <li><a href="#security" className="hover:text-[#06b6d4]">5. Security</a></li>
                <li><a href="#international" className="hover:text-[#06b6d4]">6. International Data Transfers</a></li>
                <li><a href="#children" className="hover:text-[#06b6d4]">7. Children</a></li>
                <li><a href="#changes" className="hover:text-[#06b6d4]">8. Changes to This Privacy Policy</a></li>
                <li><a href="#contact" className="hover:text-[#06b6d4]">9. How to Contact Us</a></li>
              </ul>
            </div>

            {/* Section 1 */}
            <div id="collection" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                1. Personal Information We Collect
              </h2>
              
              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Information You Provide</h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                Personal information you may provide to us includes:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Contact data:</strong> Name, email address, phone number, and company name</li>
                <li><strong>Account data:</strong> Username, password, and profile information</li>
                <li><strong>Payment data:</strong> Billing address and payment card information (processed by our payment processors)</li>
                <li><strong>Communications:</strong> Messages, feedback, and support requests</li>
                <li><strong>User-generated content:</strong> Presentations, slides, text, images, and other content you create using the Service</li>
                <li><strong>Marketing data:</strong> Your preferences for receiving communications and engagement with them</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Information Collected Automatically</h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                We automatically collect certain information when you use the Service:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Device data:</strong> IP address, browser type, operating system, device identifiers, and general location</li>
                <li><strong>Usage data:</strong> Pages viewed, features used, time spent, navigation paths, and access times</li>
                <li><strong>Communication data:</strong> Whether you open emails or click links</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Information from Third Parties</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may receive information from third-party authentication services (like Google, Microsoft) when you sign in through them, and from payment processors, analytics providers, and marketing partners.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Cookies and Similar Technologies</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use cookies and similar technologies to collect information about your browsing activities. You can control cookies through your browser settings.
              </p>
            </div>

            {/* Section 2 */}
            <div id="use" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                2. How We Use Your Personal Information
              </h2>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                We use your personal information for the following purposes:
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Service Delivery</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Provide, operate, and improve the Service</li>
                <li>Create and manage your account</li>
                <li>Process payments and transactions</li>
                <li>Provide customer support</li>
                <li>Personalize your experience</li>
                <li>Send service-related communications</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Research and Development</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Analyze usage patterns and improve the Service</li>
                <li>Develop new features and products</li>
                <li>Train and improve our AI models (with appropriate controls for paid plans)</li>
                <li>Create aggregated, de-identified data for analytics</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Marketing</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Send promotional communications (with your consent where required)</li>
                <li>Administer events and contests</li>
                <li>Analyze marketing effectiveness</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Legal and Security</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Comply with legal obligations</li>
                <li>Protect our rights and property</li>
                <li>Prevent fraud and abuse</li>
                <li>Enforce our Terms of Service</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div id="sharing" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                3. How We Share Your Personal Information
              </h2>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                We may share your personal information with:
              </p>

              <ul className="list-disc pl-6 text-slate-700 space-y-3 mb-4">
                <li><strong>Service providers:</strong> Third parties that provide services on our behalf (hosting, analytics, customer support, email delivery, payment processing)</li>
                <li><strong>Payment processors:</strong> Polar, Stripe, and other payment processors handle payment information directly</li>
                <li><strong>Business partners:</strong> Co-sponsors of events and joint service providers</li>
                <li><strong>Professional advisors:</strong> Lawyers, auditors, and consultants</li>
                <li><strong>Legal authorities:</strong> Law enforcement and government authorities when required by law</li>
                <li><strong>Business transferees:</strong> In connection with mergers, acquisitions, or asset sales</li>
                <li><strong>Other users:</strong> When you choose to share content publicly or collaborate with others</li>
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
              
              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Marketing Communications</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You can opt out of marketing emails by clicking the unsubscribe link in any marketing email or by contacting us at privacy@pptmaster.app.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Cookies</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You can control cookies through your browser settings. Note that disabling cookies may affect Service functionality.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Account Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You can update your account information through your account settings. You can request account deletion by contacting us.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Your Rights</h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                Depending on your location, you may have rights to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your information</li>
                <li>Restrict or object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                To exercise these rights, contact us at privacy@pptmaster.app.
              </p>
            </div>

            {/* Section 5 */}
            <div id="security" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                5. Security
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement technical, organizational, and physical safeguards to protect your personal information. However, no system is completely secure, and we cannot guarantee absolute security.
              </p>
            </div>

            {/* Section 6 */}
            <div id="international" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                6. International Data Transfers
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We are based in the United States. Your personal information may be transferred to and processed in the United States or other countries where privacy laws may differ from your jurisdiction. By using the Service, you consent to such transfers.
              </p>
            </div>

            {/* Section 7 */}
            <div id="children" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                7. Children
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                The Service is not intended for children under 16. We do not knowingly collect personal information from children under 16. If you believe we have collected information from a child under 16, please contact us immediately.
              </p>
            </div>

            {/* Section 8 */}
            <div id="changes" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                8. Changes to This Privacy Policy
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on the Service and updating the "Effective Date." Your continued use of the Service after changes become effective constitutes acceptance of the updated policy.
              </p>
            </div>

            {/* Section 9 */}
            <div id="contact" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                9. How to Contact Us
              </h2>
              <p className="text-slate-700 leading-relaxed mb-2">
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 mt-4">
                <p className="text-slate-700 mb-2"><strong>Email:</strong> privacy@pptmaster.app</p>
                <p className="text-slate-700 mb-2"><strong>Support:</strong> support@pptmaster.app</p>
                <p className="text-slate-700"><strong>Website:</strong> <a href="/contact" className="text-[#06b6d4] hover:underline">Contact Form</a></p>
              </div>
            </div>

            {/* GDPR Notice */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                Notice to European Users
              </h2>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                If you are located in the European Economic Area (EEA) or United Kingdom, you have additional rights under the General Data Protection Regulation (GDPR):
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Legal Basis for Processing</h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                We process your personal information based on:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Contract performance:</strong> To provide the Service you requested</li>
                <li><strong>Legitimate interests:</strong> To improve our Service, prevent fraud, and market our services</li>
                <li><strong>Legal compliance:</strong> To comply with legal obligations</li>
                <li><strong>Consent:</strong> Where you have given explicit consent</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Your GDPR Rights</h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                Under GDPR, you have the right to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Erase your data ("right to be forgotten")</li>
                <li>Restrict processing</li>
                <li>Data portability</li>
                <li>Object to processing</li>
                <li>Withdraw consent</li>
                <li>Lodge a complaint with your supervisory authority</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">International Transfers</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                When we transfer your data outside the EEA/UK, we use appropriate safeguards such as standard contractual clauses approved by the European Commission.
              </p>
            </div>

            {/* California Privacy Rights */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200">
                California Privacy Rights
              </h2>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>

              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Right to know what personal information we collect, use, and share</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mb-4">
                To exercise these rights, contact us at privacy@pptmaster.app.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-[#1e3a8a]/5 to-[#06b6d4]/5 border border-[#06b6d4]/20">
              <p className="text-sm text-slate-600 text-center mb-4">
                We are committed to protecting your privacy and handling your personal information responsibly.
              </p>
              <p className="text-sm text-slate-600 text-center">
                Last updated: {lastUpdated}
              </p>
            </div>

          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
