"use client";

import { useState } from "react";
import { User, Shield, CreditCard, Bell, Sparkles, Monitor } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Monitor },
    { id: "account", label: "Account", icon: User },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "ai", label: "AI Settings", icon: Sparkles },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64">
          <nav className="flex flex-row overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 lg:flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-rose-50 text-rose-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 rounded-xl border border-slate-200 bg-white p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900">General Preferences</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Language
                  </label>
                  <select className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Theme Preference
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="theme" defaultChecked className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-slate-600">Light</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="theme" className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-slate-600">Dark</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="theme" className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-slate-600">System</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-6">
               <h2 className="text-lg font-bold text-slate-900">AI Model Settings</h2>
               <div className="space-y-4">
                 <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                       Default Model
                    </label>
                    <select className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                       <option>GPT-4o (Recommended)</option>
                       <option>GPT-4 Turbo</option>
                       <option>GPT-3.5 Turbo (Faster)</option>
                    </select>
                 </div>
                 
                 <div>
                    <label className="flex items-center gap-2">
                       <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                       <span className="text-sm font-medium text-slate-700">Auto-generate speaker notes</span>
                    </label>
                 </div>
               </div>
            </div>
          )}
          
          {/* Other tabs placeholders */}
          {!["general", "ai"].includes(activeTab) && (
            <div className="flex h-64 items-center justify-center text-slate-400">
              <p>Settings for {activeTab} coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

