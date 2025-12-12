"use client";

import { useState } from "react";
import { User, Shield, CreditCard, Bell, Sparkles, Monitor, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Monitor, description: "Language, theme, and display" },
    { id: "account", label: "Account", icon: User, description: "Profile, email, and password" },
    { id: "billing", label: "Billing", icon: CreditCard, description: "Plans, payments, and history" },
    { id: "ai", label: "AI Settings", icon: Sparkles, description: "Model preferences and defaults" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Email and push alerts" },
    { id: "security", label: "Security", icon: Shield, description: "2FA and active sessions" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-[#1e3a8a]">Settings</h1>
        <p className="text-slate-500">
          Manage your workspace preferences and account details.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0">
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center justify-between rounded-xl border p-4 text-left transition-all hover:border-[#06b6d4]/30 hover:shadow-md hover:shadow-[#06b6d4]/5 ${
                  activeTab === tab.id
                    ? "border-[#06b6d4] bg-[#e0f2fe]/50 ring-1 ring-[#06b6d4]/20"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#06b6d4] text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-[#e0f2fe] group-hover:text-[#06b6d4]"
                    }`}
                  >
                    <tab.icon size={20} />
                  </div>
                  <div>
                    <span
                      className={`block text-sm font-bold transition-colors ${
                        activeTab === tab.id ? "text-[#1e3a8a]" : "text-slate-700 group-hover:text-[#1e3a8a]"
                      }`}
                    >
                      {tab.label}
                    </span>
                    <span className="text-xs text-slate-500">{tab.description}</span>
                  </div>
                </div>
                {activeTab === tab.id && <ChevronRight size={16} className="text-[#06b6d4]" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {activeTab === "general" && (
            <div className="max-w-2xl space-y-8">
              <div>
                <h2 className="text-xl font-bold text-[#1e3a8a]">General Preferences</h2>
                <p className="mt-1 text-sm text-slate-500">Customize your interface experience.</p>
              </div>
              
              <div className="space-y-6">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">Interface Language</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition-all focus:border-[#06b6d4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
                    <option>English (United States)</option>
                    <option>Spanish (Español)</option>
                    <option>French (Français)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Appearance</label>
                  <div className="grid grid-cols-3 gap-4">
                    {["Light", "Dark", "System"].map((theme) => (
                      <label key={theme} className="cursor-pointer group relative">
                        <input type="radio" name="theme" className="peer sr-only" defaultChecked={theme === "Light"} />
                        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-slate-200 p-4 transition-all hover:border-[#06b6d4]/50 peer-checked:border-[#06b6d4] peer-checked:bg-[#e0f2fe]/30">
                          <div className={`h-20 w-full rounded-lg ${theme === "Dark" ? "bg-slate-800" : "bg-slate-100 border border-slate-200"}`}></div>
                          <span className="text-sm font-medium text-slate-600 peer-checked:text-[#1e3a8a]">{theme}</span>
                        </div>
                        <div className="absolute top-3 right-3 hidden peer-checked:block">
                           <div className="h-2 w-2 rounded-full bg-[#06b6d4]"></div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="max-w-2xl space-y-8">
               <div>
                <h2 className="text-xl font-bold text-[#1e3a8a]">AI Configuration</h2>
                <p className="mt-1 text-sm text-slate-500">Manage how AI generates your content.</p>
              </div>

               <div className="space-y-6">
                 <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Primary AI Model</label>
                    <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition-all focus:border-[#06b6d4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">
                       <option>GPT-4o (Most Capable)</option>
                       <option>GPT-4 Turbo</option>
                       <option>GPT-3.5 Turbo (Fastest)</option>
                    </select>
                    <p className="text-xs text-slate-500">GPT-4o is recommended for complex presentations.</p>
                 </div>
                 
                 <div className="rounded-xl border border-slate-200 p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                       <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-[#06b6d4] focus:ring-[#1e3a8a]" />
                       <div>
                          <span className="block text-sm font-bold text-slate-700">Auto-generate speaker notes</span>
                          <span className="text-xs text-slate-500">Automatically creates detailed speaker notes for each slide.</span>
                       </div>
                    </label>
                 </div>
               </div>
            </div>
          )}
          
          {!["general", "ai"].includes(activeTab) && (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                 <Settings size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Coming Soon</h3>
              <p className="text-slate-500">The {tabs.find(t => t.id === activeTab)?.label} settings are under development.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
