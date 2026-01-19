/**
 * Layout Selection Debugger Component
 * 
 * Visual debugger for the smart layout selection system.
 * Shows score calculations, decision trees, and content analysis results.
 * 
 * This component is intended for development mode only.
 * 
 * Requirements: 10.5
 */

"use client";

import { useState } from "react";
import type { ContentLayoutCategory } from "~/lib/layouts/content";

/**
 * Debug data structure from the debug API
 */
interface DebugData {
  selection: {
    category: string;
    style: string;
    slideLayout: string;
    confidence: string;
    score: number;
    explanation: string;
    detailedExplanation: string;
    factors: string[];
    runnerUps: Array<{
      category: string;
      score: number;
      confidence: string;
    }>;
  };
  allScores: Array<{
    category: string;
    score: number;
    confidence: string;
    breakdown: Record<string, number>;
    rejected: boolean;
    rejectionReason?: string;
  }>;
  contentAnalysis: {
    pattern: string;
    semanticMarkers: string[];
    contentType: string;
    contentTypeConfidence: number;
    bulletCount: number;
    avgBulletLength: number;
    maxBulletLength: number;
    totalWordCount: number;
    hasSequence: boolean;
    hasDistinctConcepts: boolean;
    hasHierarchy: boolean;
  };
  metadata: {
    semanticIntent: string;
    visualStrategy: {
      primary: string;
      pattern: string;
      emphasis: string;
    };
    contentLayoutHint?: string;
    hasImage: boolean;
    imageOrientation?: string;
  };
  performanceMetrics?: {
    total: number;
    extraction: number;
    analysis: number;
    scoring: number;
    selection: number;
    styleSelection: number;
  };
  context: {
    slideIndex: number;
    totalSlides: number;
    slidePosition: string;
    previousLayouts: string[];
  };
}

/**
 * Props for LayoutSelectionDebugger
 */
interface LayoutSelectionDebuggerProps {
  /** Slide data to debug */
  slide: {
    type: "title" | "content";
    title: string;
    bulletPoints?: string[];
    sections?: Array<{ heading: string; description: string }>;
    semanticIntent?: string;
    visualStrategy?: {
      primary: string;
      pattern: string;
      emphasis: string;
    };
    contentLayoutHint?: string;
  };
  
  /** Context for layout selection */
  context?: {
    slideIndex: number;
    totalSlides: number;
    previousLayouts?: Array<{
      slideIndex: number;
      category: ContentLayoutCategory;
      style: string;
    }>;
  };
  
  /** Whether to show the debugger by default */
  defaultOpen?: boolean;
}

/**
 * Layout Selection Debugger Component
 * 
 * Provides a visual interface for debugging layout selection decisions.
 * Shows:
 * - Selected layout with score and confidence
 * - All layout scores with breakdowns
 * - Content analysis results
 * - Performance metrics
 * 
 * @example
 * ```tsx
 * <LayoutSelectionDebugger
 *   slide={{
 *     type: "content",
 *     title: "Key Features",
 *     bulletPoints: ["Feature 1", "Feature 2", "Feature 3"],
 *   }}
 *   context={{
 *     slideIndex: 2,
 *     totalSlides: 10,
 *   }}
 * />
 * ```
 */
export function LayoutSelectionDebugger({
  slide,
  context = { slideIndex: 0, totalSlides: 1 },
  defaultOpen = false,
}: LayoutSelectionDebuggerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "scores" | "analysis" | "explanation">("overview");
  
  /**
   * Fetch debug data from the API
   */
  const fetchDebugData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/debug/layout-selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slide,
          context: {
            slideIndex: context.slideIndex,
            totalSlides: context.totalSlides,
            previousLayouts: context.previousLayouts ?? [],
            categoryUsage: {},
            styleUsage: {},
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setDebugData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Toggle debugger open/closed
   */
  const toggleDebugger = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // Fetch data when opening
    if (newIsOpen && !debugData) {
      void fetchDebugData();
    }
  };
  
  /**
   * Get color for confidence level
   */
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };
  
  /**
   * Get color for score
   */
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={toggleDebugger}
        className="rounded-lg bg-purple-600 px-4 py-2 text-white shadow-lg hover:bg-purple-700"
      >
        {isOpen ? "Close" : "Debug Layout Selection"}
      </button>
      
      {/* Debugger Panel */}
      {isOpen && (
        <div className="fixed inset-4 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">
                Layout Selection Debugger
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => void fetchDebugData()}
                  disabled={loading}
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
              {error && (
                <div className="m-4 rounded bg-red-50 p-4 text-red-800">
                  Error: {error}
                </div>
              )}
              
              {loading && (
                <div className="flex items-center justify-center p-12">
                  <div className="text-gray-600">Loading debug data...</div>
                </div>
              )}
              
              {debugData && !loading && (
                <>
                  {/* Tabs */}
                  <div className="border-b bg-gray-50 px-6">
                    <div className="flex gap-4">
                      {["overview", "scores", "analysis", "explanation"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as typeof activeTab)}
                          className={`border-b-2 px-4 py-3 text-sm font-medium ${
                            activeTab === tab
                              ? "border-purple-600 text-purple-600"
                              : "border-transparent text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === "overview" && (
                      <OverviewTab data={debugData} getConfidenceColor={getConfidenceColor} getScoreColor={getScoreColor} />
                    )}
                    
                    {activeTab === "scores" && (
                      <ScoresTab data={debugData} getConfidenceColor={getConfidenceColor} getScoreColor={getScoreColor} />
                    )}
                    
                    {activeTab === "analysis" && (
                      <AnalysisTab data={debugData} />
                    )}
                    
                    {activeTab === "explanation" && (
                      <ExplanationTab data={debugData} />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Overview Tab Component
 */
function OverviewTab({ 
  data, 
  getConfidenceColor, 
  getScoreColor 
}: { 
  data: DebugData; 
  getConfidenceColor: (c: string) => string;
  getScoreColor: (s: number) => string;
}) {
  return (
    <div className="space-y-6">
      {/* Selected Layout */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Selected Layout</h3>
        <div className="rounded-lg border bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{data.selection.category}</div>
              <div className="text-sm text-gray-600">{data.selection.style}</div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(data.selection.score)}`}>
                {data.selection.score}
              </div>
              <div className={`inline-block rounded px-2 py-1 text-xs font-medium ${getConfidenceColor(data.selection.confidence)}`}>
                {data.selection.confidence} confidence
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-700">
            {data.selection.explanation}
          </div>
        </div>
      </div>
      
      {/* Top Factors */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Top Contributing Factors</h3>
        <div className="space-y-2">
          {data.selection.factors.slice(0, 5).map((factor, index) => (
            <div key={factor} className="flex items-center gap-3 rounded bg-gray-50 px-4 py-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                {index + 1}
              </div>
              <div className="text-sm">{factor}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Runner-ups */}
      {data.selection.runnerUps.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Runner-ups</h3>
          <div className="space-y-2">
            {data.selection.runnerUps.map((runnerUp) => (
              <div key={runnerUp.category} className="flex items-center justify-between rounded border bg-white px-4 py-2">
                <div className="font-medium">{runnerUp.category}</div>
                <div className="flex items-center gap-3">
                  <div className={`text-lg font-bold ${getScoreColor(runnerUp.score)}`}>
                    {runnerUp.score}
                  </div>
                  <div className={`rounded px-2 py-1 text-xs ${getConfidenceColor(runnerUp.confidence)}`}>
                    {runnerUp.confidence}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Performance Metrics */}
      {data.performanceMetrics && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Performance</h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(data.performanceMetrics).map(([phase, time]) => (
              <div key={phase} className="rounded border bg-white px-3 py-2">
                <div className="text-xs text-gray-600">{phase}</div>
                <div className="text-lg font-bold">{time.toFixed(2)}ms</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Scores Tab Component
 */
function ScoresTab({ 
  data, 
  getConfidenceColor, 
  getScoreColor 
}: { 
  data: DebugData; 
  getConfidenceColor: (c: string) => string;
  getScoreColor: (s: number) => string;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">All Layout Scores</h3>
      {data.allScores.map((layout) => (
        <div key={layout.category} className="rounded-lg border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-bold">{layout.category}</div>
            <div className="flex items-center gap-3">
              <div className={`text-xl font-bold ${getScoreColor(layout.score)}`}>
                {layout.score}
              </div>
              <div className={`rounded px-2 py-1 text-xs ${getConfidenceColor(layout.confidence)}`}>
                {layout.confidence}
              </div>
            </div>
          </div>
          
          {layout.rejected && layout.rejectionReason && (
            <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-800">
              Rejected: {layout.rejectionReason}
            </div>
          )}
          
          {!layout.rejected && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(layout.breakdown).map(([factor, score]) => (
                <div key={factor} className="flex justify-between rounded bg-gray-50 px-3 py-1">
                  <span className="text-gray-600">{factor}:</span>
                  <span className={score > 0 ? "text-green-600" : score < 0 ? "text-red-600" : "text-gray-400"}>
                    {score > 0 ? "+" : ""}{score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Analysis Tab Component
 */
function AnalysisTab({ data }: { data: DebugData }) {
  return (
    <div className="space-y-6">
      {/* Content Analysis */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Content Analysis</h3>
        <div className="space-y-3 rounded-lg border bg-white p-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Content Type:</span>
            <span className="font-medium">
              {data.contentAnalysis.contentType} ({data.contentAnalysis.contentTypeConfidence}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pattern:</span>
            <span className="font-medium">{data.contentAnalysis.pattern}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bullet Count:</span>
            <span className="font-medium">{data.contentAnalysis.bulletCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avg Bullet Length:</span>
            <span className="font-medium">{data.contentAnalysis.avgBulletLength} words</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Max Bullet Length:</span>
            <span className="font-medium">{data.contentAnalysis.maxBulletLength} words</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Word Count:</span>
            <span className="font-medium">{data.contentAnalysis.totalWordCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Has Sequence:</span>
            <span className="font-medium">{data.contentAnalysis.hasSequence ? "Yes" : "No"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Has Distinct Concepts:</span>
            <span className="font-medium">{data.contentAnalysis.hasDistinctConcepts ? "Yes" : "No"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Has Hierarchy:</span>
            <span className="font-medium">{data.contentAnalysis.hasHierarchy ? "Yes" : "No"}</span>
          </div>
          {data.contentAnalysis.semanticMarkers.length > 0 && (
            <div>
              <div className="mb-2 text-gray-600">Semantic Markers:</div>
              <div className="flex flex-wrap gap-2">
                {data.contentAnalysis.semanticMarkers.map((marker) => (
                  <span key={marker} className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-800">
                    {marker}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Metadata */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Metadata</h3>
        <div className="space-y-3 rounded-lg border bg-white p-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Semantic Intent:</span>
            <span className="font-medium">{data.metadata.semanticIntent}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Visual Strategy (Primary):</span>
            <span className="font-medium">{data.metadata.visualStrategy.primary}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Visual Strategy (Pattern):</span>
            <span className="font-medium">{data.metadata.visualStrategy.pattern}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Visual Strategy (Emphasis):</span>
            <span className="font-medium">{data.metadata.visualStrategy.emphasis}</span>
          </div>
          {data.metadata.contentLayoutHint && (
            <div className="flex justify-between">
              <span className="text-gray-600">Content Layout Hint:</span>
              <span className="font-medium">{data.metadata.contentLayoutHint}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Has Image:</span>
            <span className="font-medium">{data.metadata.hasImage ? "Yes" : "No"}</span>
          </div>
          {data.metadata.imageOrientation && (
            <div className="flex justify-between">
              <span className="text-gray-600">Image Orientation:</span>
              <span className="font-medium">{data.metadata.imageOrientation}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Context */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Context</h3>
        <div className="space-y-3 rounded-lg border bg-white p-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Slide Index:</span>
            <span className="font-medium">{data.context.slideIndex}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Slides:</span>
            <span className="font-medium">{data.context.totalSlides}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Slide Position:</span>
            <span className="font-medium">{data.context.slidePosition}</span>
          </div>
          {data.context.previousLayouts.length > 0 && (
            <div>
              <div className="mb-2 text-gray-600">Previous Layouts:</div>
              <div className="flex flex-wrap gap-2">
                {data.context.previousLayouts.map((layout, index) => (
                  <span key={index} className="rounded bg-gray-100 px-2 py-1 text-xs">
                    {layout}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Explanation Tab Component
 */
function ExplanationTab({ data }: { data: DebugData }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Detailed Explanation</h3>
      <div className="whitespace-pre-wrap rounded-lg border bg-gray-50 p-4 font-mono text-sm">
        {data.selection.detailedExplanation}
      </div>
    </div>
  );
}
