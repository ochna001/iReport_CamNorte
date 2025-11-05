import { Search, FileText, Clock, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState } from "react";

interface PnpFinalReportScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function PnpFinalReportScreen({ onNavigate }: PnpFinalReportScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const reports = [
    {
      id: "PNP-001",
      type: "Robbery",
      location: "Downtown Area",
      date: "Oct 15, 2025",
      status: "Closed - Resolved",
      reportedBy: "Juan Dela Cruz",
      resolvedBy: "PNP Field Officer Santos",
      outcome: "Suspect apprehended"
    },
    {
      id: "PNP-002",
      type: "Theft",
      location: "Market Area",
      date: "Oct 14, 2025",
      status: "Closed - Resolved",
      reportedBy: "Maria Garcia",
      resolvedBy: "PNP Field Officer Santos",
      outcome: "Property recovered"
    },
    {
      id: "PNP-003",
      type: "Assault",
      location: "Residential Zone",
      date: "Oct 13, 2025",
      status: "Closed - Unfounded",
      reportedBy: "Pedro Reyes",
      resolvedBy: "PNP Field Officer Santos",
      outcome: "No evidence found"
    }
  ];

  const getStatusColor = (status: string) => {
    if (status.includes('Resolved')) return 'bg-green-100 text-green-800 border-green-300';
    if (status.includes('Unfounded')) return 'bg-gray-100 text-gray-800 border-gray-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="flex-1">PNP Final Reports</h1>
          <Button
            onClick={() => onNavigate('pnpFinalReportForm')}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Report
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Hint */}
        <div className="mt-2 text-xs text-gray-500">
          💡 Click any report to view or complete final documentation
        </div>
      </div>

      {/* Reports List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            onClick={() => onNavigate('pnpFinalReportForm', { reportData: report })}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{report.id}</span>
                </div>
                <p className="text-sm text-gray-600">{report.type}</p>
              </div>
              <Badge className={`${getStatusColor(report.status)} text-xs`}>
                {report.status}
              </Badge>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-3 h-3" />
                <span>{report.date}</span>
              </div>
              <p className="text-gray-700">Location: {report.location}</p>
              <p className="text-gray-600">Outcome: {report.outcome}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
