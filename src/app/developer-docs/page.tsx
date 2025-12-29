"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import { Code, Terminal, Zap, Lock, Globe, Database, Webhook, Key, Sparkles } from "lucide-react";
import { useState } from "react";

export default function DeveloperDocsPage() {
  const { t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");

  const quickStartSteps = [
    {
      title: "1. Get Your API Key",
      description: "Sign up for a PPTMaster account and navigate to Settings > API Keys. Generate a new API key and keep it secure.",
      code: "// Store your API key securely\nconst API_KEY = process.env.PPTMASTER_API_KEY;",
      icon: Key
    },
    {
      title: "2. Install SDK",
      description: "Install our official SDK for your preferred language. We support JavaScript, Python, Ruby, and Go.",
      code: "npm install @pptmaster/sdk\n# or\npip install pptmaster\n# or\ngem install pptmaster",
      icon: Terminal
    },
    {
      title: "3. Initialize Client",
      description: "Create a client instance with your API key to start making requests.",
      code: "import { PPTMaster } from '@pptmaster/sdk';\n\nconst client = new PPTMaster({\n  apiKey: API_KEY\n});",
      icon: Code
    },
    {
      title: "4. Create Presentation",
      description: "Use the client to generate presentations programmatically.",
      code: "const presentation = await client.presentations.create({\n  prompt: 'Create a pitch deck for a SaaS startup',\n  slides: 10,\n  theme: 'modern'\n});",
      icon: Sparkles
    }
  ];

  const apiEndpoints = [
    {
      method: "POST",
      endpoint: "/api/v1/presentations",
      description: "Create a new presentation",
      example: `{
  "prompt": "Create a marketing presentation",
  "slides": 10,
  "theme": "professional",
  "language": "en"
}`
    },
    {
      method: "GET",
      endpoint: "/api/v1/presentations/:id",
      description: "Retrieve a specific presentation",
      example: `{
  "id": "pres_abc123",
  "status": "completed",
  "url": "https://pptmaster.com/p/abc123"
}`
    },
    {
      method: "PUT",
      endpoint: "/api/v1/presentations/:id",
      description: "Update presentation content",
      example: `{
  "title": "Updated Title",
  "slides": [...],
  "theme": "modern"
}`
    },
    {
      method: "DELETE",
      endpoint: "/api/v1/presentations/:id",
      description: "Delete a presentation",
      example: `{
  "success": true,
  "message": "Presentation deleted"
}`
    },
    {
      method: "POST",
      endpoint: "/api/v1/presentations/:id/export",
      description: "Export presentation to various formats",
      example: `{
  "format": "pptx",
  "download_url": "https://cdn.pptmaster.com/..."
}`
    },
    {
      method: "GET",
      endpoint: "/api/v1/templates",
      description: "List available templates",
      example: `{
  "templates": [
    {"id": "tmp_001", "name": "Business Pitch"},
    {"id": "tmp_002", "name": "Marketing Plan"}
  ]
}`
    }
  ];

  const webhookEvents = [
    {
      event: "presentation.created",
      description: "Triggered when a new presentation is successfully created",
      payload: `{
  "event": "presentation.created",
  "data": {
    "id": "pres_abc123",
    "user_id": "user_xyz789",
    "created_at": "2025-01-15T10:30:00Z"
  }
}`
    },
    {
      event: "presentation.completed",
      description: "Triggered when AI generation is complete",
      payload: `{
  "event": "presentation.completed",
  "data": {
    "id": "pres_abc123",
    "status": "completed",
    "slides_count": 10
  }
}`
    },
    {
      event: "presentation.failed",
      description: "Triggered when presentation generation fails",
      payload: `{
  "event": "presentation.failed",
  "data": {
    "id": "pres_abc123",
    "error": "Invalid prompt format"
  }
}`
    },
    {
      event: "export.completed",
      description: "Triggered when export is ready for download",
      payload: `{
  "event": "export.completed",
  "data": {
    "presentation_id": "pres_abc123",
    "format": "pptx",
    "download_url": "https://..."
  }
}`
    }
  ];

  const sdkExamples = {
    JavaScript: `import { PPTMaster } from '@pptmaster/sdk';

const client = new PPTMaster({ apiKey: 'your_api_key' });

// Create presentation
const presentation = await client.presentations.create({
  prompt: 'Create a sales pitch for enterprise clients',
  slides: 12,
  theme: 'corporate'
});

// Export to PowerPoint
const exported = await client.presentations.export(
  presentation.id,
  { format: 'pptx' }
);

console.log('Download URL:', exported.download_url);`,
    Python: `from pptmaster import PPTMaster

client = PPTMaster(api_key='your_api_key')

# Create presentation
presentation = client.presentations.create(
    prompt='Create a sales pitch for enterprise clients',
    slides=12,
    theme='corporate'
)

# Export to PowerPoint
exported = client.presentations.export(
    presentation.id,
    format='pptx'
)

print(f'Download URL: {exported.download_url}')`,
    cURL: `# Create presentation
curl -X POST https://api.pptmaster.com/v1/presentations \\
  -H "Authorization: Bearer your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Create a sales pitch",
    "slides": 12,
    "theme": "corporate"
  }'

# Export presentation
curl -X POST https://api.pptmaster.com/v1/presentations/pres_abc123/export \\
  -H "Authorization: Bearer your_api_key" \\
  -d '{"format": "pptx"}'`
  };

  const rateLimits = [
    { plan: "Pro", requests: "10,000/day", concurrent: "5", burst: "100/min" },
    { plan: "Enterprise", requests: "Unlimited", concurrent: "50", burst: "1000/min" }
  ];

  const errorCodes = [
    { code: "400", name: "Bad Request", description: "Invalid request parameters or malformed JSON" },
    { code: "401", name: "Unauthorized", description: "Missing or invalid API key" },
    { code: "403", name: "Forbidden", description: "API key doesn't have required permissions" },
    { code: "404", name: "Not Found", description: "Requested resource doesn't exist" },
    { code: "429", name: "Rate Limit", description: "Too many requests, slow down" },
    { code: "500", name: "Server Error", description: "Internal server error, try again later" }
  ];

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden bg-gradient-to-br from-[#1e3a8a]/5 via-[#06b6d4]/5 to-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#06b6d4]/20 bg-[#06b6d4]/10 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Code className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-[#1e3a8a] uppercase tracking-wide">
              {t.developerDocs || "Developer Documentation"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
            Build with <span className="bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] bg-clip-text text-transparent">PPTMaster API</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8 animate-fade-in-up [animation-delay:200ms]">
            Integrate AI-powered presentation generation into your applications with our comprehensive API and SDKs.
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center animate-fade-in-up [animation-delay:300ms]">
            <a href="#quick-start" className="px-5 py-3 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white text-sm sm:text-base font-bold hover:shadow-xl transition-all hover:scale-105">
              Get Started
            </a>
            <a href="#api-reference" className="px-5 py-3 sm:px-8 sm:py-4 rounded-full border-2 border-[#06b6d4] text-[#06b6d4] text-sm sm:text-base font-bold hover:bg-[#06b6d4]/10 transition-all">
              API Reference
            </a>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quick-start" className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">Quick Start</h2>
              <p className="text-sm sm:text-base text-slate-600 hidden sm:block">Get up and running in minutes</p>
            </div>
          </div>
          
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
            {quickStartSteps.map((step, index) => (
              <div key={index} className="group rounded-xl sm:rounded-2xl border-2 border-[#06b6d4]/20 bg-gradient-to-br from-white to-[#06b6d4]/5 p-4 sm:p-6 hover:border-[#06b6d4] hover:shadow-xl transition-all overflow-hidden">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <step.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1 sm:mb-2">{step.title}</h3>
                    <p className="text-slate-600 text-xs sm:text-sm">{step.description}</p>
                  </div>
                </div>
                <div className="rounded-lg sm:rounded-xl bg-slate-900 p-3 sm:p-4 overflow-x-auto border border-[#06b6d4]/20">
                  <pre className="text-xs sm:text-sm text-[#06b6d4] font-mono whitespace-pre-wrap break-words">{step.code}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDK Examples with Tabs */}
      <section className="relative px-6 py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center shadow-lg flex-shrink-0">
              <Terminal className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">SDK Examples</h2>
              <p className="text-sm sm:text-base text-slate-600 hidden sm:block">Choose your preferred language</p>
            </div>
          </div>

          {/* Language Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
            {Object.keys(sdkExamples).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all ${
                  selectedLanguage === lang
                    ? "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white shadow-lg"
                    : "bg-white border-2 border-[#06b6d4]/20 text-slate-700 hover:border-[#06b6d4]"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Code Display */}
          <div className="rounded-xl sm:rounded-2xl border-2 border-[#06b6d4]/20 bg-white p-3 sm:p-6 shadow-xl">
            <div className="rounded-lg sm:rounded-xl bg-slate-900 p-3 sm:p-6 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-[#06b6d4] font-mono leading-relaxed">{sdkExamples[selectedLanguage as keyof typeof sdkExamples]}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section id="api-reference" className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center shadow-lg flex-shrink-0">
              <Globe className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">API Endpoints</h2>
              <p className="text-sm sm:text-base text-slate-600 hidden sm:block">RESTful API reference</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="group rounded-xl sm:rounded-2xl border-2 border-[#06b6d4]/20 bg-white p-4 sm:p-6 hover:border-[#06b6d4] hover:shadow-xl transition-all">
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm w-fit ${
                    endpoint.method === 'GET' ? 'bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/30' :
                    endpoint.method === 'POST' ? 'bg-[#1e3a8a]/10 text-[#1e3a8a] border border-[#1e3a8a]/30' :
                    endpoint.method === 'PUT' ? 'bg-cyan-100 text-cyan-700 border border-cyan-300' :
                    'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="flex-1 text-xs sm:text-sm font-mono text-slate-900 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-slate-200 break-all">
                    {endpoint.endpoint}
                  </code>
                </div>
                <p className="text-slate-600 text-sm sm:text-base mb-3 sm:mb-4">{endpoint.description}</p>
                <div className="rounded-lg sm:rounded-xl bg-slate-900 p-3 sm:p-4 overflow-x-auto border border-[#06b6d4]/20">
                  <pre className="text-xs text-[#06b6d4] font-mono leading-relaxed">{endpoint.example}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section className="relative px-6 py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center shadow-lg flex-shrink-0">
              <Webhook className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">Webhooks</h2>
              <p className="text-sm sm:text-base text-slate-600 hidden sm:block">Real-time event notifications</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {webhookEvents.map((webhook, index) => (
              <div key={index} className="rounded-xl sm:rounded-2xl border-2 border-[#06b6d4]/20 bg-white p-4 sm:p-6 hover:border-[#06b6d4] hover:shadow-xl transition-all">
                <div className="mb-3">
                  <code className="text-sm sm:text-base md:text-lg font-bold text-[#06b6d4] bg-[#06b6d4]/10 px-2 py-1 sm:px-3 sm:py-1 rounded-lg break-all">
                    {webhook.event}
                  </code>
                </div>
                <p className="text-slate-600 mb-3 sm:mb-4 text-xs sm:text-sm">{webhook.description}</p>
                <div className="rounded-lg sm:rounded-xl bg-slate-900 p-3 sm:p-4 overflow-x-auto border border-[#06b6d4]/20">
                  <pre className="text-xs text-[#06b6d4] font-mono leading-relaxed">{webhook.payload}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center shadow-lg flex-shrink-0">
              <Database className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">Rate Limits</h2>
              <p className="text-sm sm:text-base text-slate-600 hidden sm:block">API usage limits by plan</p>
            </div>
          </div>
          
          <div className="rounded-xl sm:rounded-2xl border-2 border-[#06b6d4]/20 bg-white overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4]">
                  <tr>
                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-bold text-white">Plan</th>
                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-bold text-white">Daily</th>
                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-bold text-white hidden sm:table-cell">Concurrent</th>
                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-bold text-white">Burst</th>
                  </tr>
                </thead>
                <tbody>
                  {rateLimits.map((limit, index) => (
                    <tr key={index} className="border-t border-[#06b6d4]/20 hover:bg-[#06b6d4]/5 transition-colors">
                      <td className="px-3 py-3 sm:px-6 sm:py-4 font-bold text-[#1e3a8a] text-xs sm:text-base">{limit.plan}</td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 text-slate-700 text-xs sm:text-base">{limit.requests}</td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 text-slate-700 text-xs sm:text-base hidden sm:table-cell">{limit.concurrent}</td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 text-slate-700 text-xs sm:text-base">{limit.burst}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Error Codes */}
      <section className="relative px-6 py-20 pb-32 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center shadow-lg flex-shrink-0">
              <Lock className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">Error Codes</h2>
              <p className="text-sm sm:text-base text-slate-600 hidden sm:block">HTTP status codes and meanings</p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {errorCodes.map((error, index) => (
              <div key={index} className="rounded-xl sm:rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-6 hover:border-[#06b6d4] hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-red-100 text-red-700 text-base sm:text-lg font-bold border border-red-200 flex-shrink-0">
                    {error.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{error.name}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{error.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
