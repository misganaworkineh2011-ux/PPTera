import { BarChart, PieChart, LineChart, Table, Plus, Filter, Sparkles } from "lucide-react";

export default function ChartsPage() {
  const chartTypes = [
    { id: "bar", name: "Bar Charts", icon: BarChart },
    { id: "pie", name: "Pie Charts", icon: PieChart },
    { id: "line", name: "Line Charts", icon: LineChart },
    { id: "table", name: "Tables", icon: Table },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Charts & Graphs</h1>
          <p className="text-sm text-slate-500">
            Visualize your data with professional charts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100">
            <Sparkles size={16} /> AI Generate
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
            <Plus size={16} /> Create Chart
          </button>
        </div>
      </div>

      {/* Chart Types Navigation */}
      <div className="flex gap-4 border-b border-slate-200 pb-2 overflow-x-auto">
        {chartTypes.map((type) => (
          <button
            key={type.id}
            className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <type.icon size={18} />
            {type.name}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder Charts */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-48 items-center justify-center bg-slate-50 p-6">
              {/* Fake Chart Visualization */}
              <div className="flex items-end gap-2">
                <div className="h-16 w-8 rounded-t bg-blue-300"></div>
                <div className="h-24 w-8 rounded-t bg-blue-500"></div>
                <div className="h-12 w-8 rounded-t bg-blue-400"></div>
                <div className="h-20 w-8 rounded-t bg-purple-500"></div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Bar Chart
                </span>
                <button className="text-slate-400 hover:text-slate-600">
                  ...
                </button>
              </div>
              <h3 className="font-semibold text-slate-900">Q4 Revenue Growth</h3>
              <p className="mt-1 text-xs text-slate-500">Updated 2 days ago</p>
              
              <button className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                Use in Presentation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

