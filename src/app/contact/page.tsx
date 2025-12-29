"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import { Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { LoadingButton } from "~/components/LoadingButton";
import { toast } from "sonner";

export default function ContactPage() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      toast.success(data.message || "Message sent! We'll get back to you soon.", {
        duration: 5000,
        position: "top-center",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: t.email || "Email",
      value: "support@pptmaster.com",
      description: t.emailDesc || "We'll respond within 24 hours",
      color: "from-[#1e3a8a] to-[#06b6d4]",
    },
    {
      icon: MessageCircle,
      title: t.liveChat || "Live Chat",
      value: t.available247 || "Available 24/7",
      description: t.liveChatDesc || "Get instant help from our team",
      color: "from-[#1e3a8a] to-[#06b6d4]",
    },
  ];

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <MessageCircle className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.contactUs || "Contact Us"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
            {t.getInTouch || "Get in touch"}
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            {t.contactDesc || "Have a question about PPT Master or our AI PowerPoint generator? We'd love to hear from you."}
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="relative px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-2xl transition-all duration-300 text-center animate-fade-in-up"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className={`mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                  <method.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-lg font-semibold text-[#06b6d4] mb-2">
                  {method.value}
                </p>
                <p className="text-sm text-slate-600">
                  {method.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">
              {t.sendMessage || "Send us a message"}
            </h2>
            <p className="text-slate-600 mb-8 text-center">
              {t.sendMessageDesc || "Fill out the form below and we'll get back to you as soon as possible"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    {t.name || "Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
                    placeholder={t.yourName || "Your name"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    {t.email || "Email"} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
                    placeholder={t.yourEmail || "your@email.com"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  {t.subject || "Subject"} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
                  placeholder={t.messageSubject || "What's this about?"}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  {t.message || "Message"} *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 resize-none"
                  placeholder={t.yourMessage || "Tell us more..."}
                />
              </div>

              <LoadingButton
                type="submit"
                isLoading={isLoading}
                loadingText={t.sending || "Sending..."}
                variant="primary"
                className="w-full"
              >
                <>
                  <span>{t.sendMessage || "Send Message"}</span>
                </>
              </LoadingButton>

            </form>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
