"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import { Code, Terminal, Book, Zap, Lock, Globe, Database, Webhook } from "lucide-react";

export default function DeveloperDocsPage() {
  const { t } = useLanguage();

  const quickStartSteps = [
    {
      title: "1. Get Your API Key",
      description: "Sign up for a PPTMaster account and navigate to Settings > API Keys. Generate a new API key and keep it secure.",
      code: "// Store your API key securely\nconst API_KEY = process.env.PPTMASTER_API_KEY;"
    },
    {
      title: "2. Install SDK",
      description: "Install our official SDK for your preferred language. We support JavaScript, Python, Ruby, and Go.",
      code: "npm install @pptmaster/sdk\n# or\npip install pptmaster\n# or\ngem install pptmaster"
    },
    {
      title: "3. Initialize Client",
      description: "Create a client instance with your API key to start making requests.",
      code: "import { PPTMaster } from '@pptmaster/sdk';\n\nconst client = new PPTMaster({\n  apiKey: API_KEY\n});"
    },
    {
      title: "4. Create Presentation",
      description: "Use the client to generate presentations programmatically.",
      code: "const presentation = await client.presentations.create({\n  prompt: 'Create a pitch deck for a SaaS startup',\n  slides: 10,\n  theme: 'modern'\n});"
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

  const sdkExamples = [
    {
      language: "JavaScript",
      icon: "JS",
      code: `import { PPTMaster } from '@pptmaster/sdk';

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

console.log('Download URL:', exported.download_url);`
    },
    {
      language: "Python",
      icon: "PY",
      code: `from pptmaster import PPTMaster

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

print(f'Download URL: {exported.download_url}')`
    },
    {
      language: "cURL",
      icon: "CLI",
      code: `# Create presentation
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
    }
  ];

  const rateLimits = [
    { plan: "Free", requests: "100/day", concurrent: "1", burst: "10/min" },
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
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Code className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.developerDocs || "Developer Documentation"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
            Build with <span className="bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] bg-clip-text text-transparent">PPTMaster API</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            Integrate AI-powered presentation generation into your applications with our comprehensive API and SDKs.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="relative px-6 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Quick Start</h2>
          </div>
          <div className="space-y-6">
            {quickStartSteps.map((step, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 mb-4">{step.description}</p>
                <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 font-mono">{step.code}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="relative px-6 pb-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">API Endpoints</h2>
          </div>
          <div className="space-y-4">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                    endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="flex-1 text-sm font-mono text-slate-900">{endpoint.endpoint}</code>
                </div>
                <p className="text-slate-600 mb-3">{endpoint.description}</p>
                <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono">{endpoint.example}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDK Examples */}
      <section className="relative px-6 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Terminal className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">SDK Examples</h2>
          </div>
          <div className="space-y-6">
            {sdkExamples.map((example, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center text-white text-xs font-bold">
                    {example.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{example.language}</h3>
                </div>
                <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 font-mono">{example.code}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section className="relative px-6 pb-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Webhook className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Webhooks</h2>
          </div>
          <p className="text-slate-600 mb-8">
            Subscribe to events and receive real-time notifications when presentations are created, completed, or exported.
          </p>
          <div className="space-y-4">
            {webhookEvents.map((webhook, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  <code className="text-[#06b6d4]">{webhook.event}</code>
                </h3>
                <p className="text-slate-600 mb-3">{webhook.description}</p>
                <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono">{webhook.payload}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="relative px-6 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Database className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Rate Limits</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Daily Requests</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Concurrent</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Burst Rate</th>
                </tr>
              </thead>
              <tbody>
                {rateLimits.map((limit, index) => (
                  <tr key={index} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{limit.plan}</td>
                    <td className="px-6 py-4 text-slate-600">{limit.requests}</td>
                    <td className="px-6 py-4 text-slate-600">{limit.concurrent}</td>
                    <td className="px-6 py-4 text-slate-600">{limit.burst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Error Codes */}
      <section className="relative px-6 pb-24 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Error Codes</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {errorCodes.map((error, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-sm font-bold">
                    {error.code}
                  </span>
                  <h3 className="font-bold text-slate-900">{error.name}</h3>
                </div>
                <p className="text-sm text-slate-600">{error.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
