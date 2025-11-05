import { Search, FileText, Clock, Flame, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState } from "react";

interface BfpFinalReportScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function BfpFinalReportScreen({ onNavigate }: BfpFinalReportScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const reports = [
    {
      id: "BFP-001",
      type: "Residential Fire",
      location: "Poblacion Area",
      date: "Oct 15, 2025",
      status: "Closed - Extinguished",
      reportedBy: "Juan Dela Cruz",
      resolvedBy: "BFP Field Officer Torres",
      fireClass: "Class A",
      casualties: "None",
      damageEstimate: "₱150,000"
    },
    {
      id: "BFP-002",
      type: "Vehicle Fire",
      location: "Highway 54",
      date: "Oct 14, 2025",
      status: "Closed - Extinguished",
      reportedBy: "Maria Santos",
      resolvedBy: "BFP Field Officer Torres",
      fireClass: "Class B",
      casualties: "1 Minor Injury",
      damageEstimate: "₱80,000"
    },
    {
      id: "BFP-003",
      type: "Commercial Fire",
      location: "Market District",
      date: "Oct 13, 2025",
      status: "Closed - Extinguished",
      reportedBy: "Store Owner",
      resolvedBy: "BFP Field Officer Torres",
      fireClass: "Class A",
      casualties: "None",
      damageEstimate: "₱500,000"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-100 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="flex-1">BFP Final Reports</h1>
          <Button
            onClick={() => onNavigate('bfpFinalReportForm')}
            className="bg-orange-600 hover:bg-orange-700"
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
            onClick={() => onNavigate('bfpFinalReportForm', { reportData: report })}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">{report.id}</span>
                </div>
                <p className="text-sm text-gray-600">{report.type}</p>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                {report.status}
              </Badge>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-3 h-3" />
                <span>{report.date}</span>
              </div>
              <p className="text-gray-700">Location: {report.location}</p>
              <p className="text-gray-600">Class: {report.fireClass}</p>
              <p className="text-gray-600">Damage: {report.damageEstimate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
