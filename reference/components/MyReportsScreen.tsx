import { ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface MyReportsScreenProps {
  onNavigate: (screen: string) => void;
}

const mockReports = [
  {
    id: "IR-ABC123",
    type: "Crime",
    status: "Pending",
    date: "2024-01-15",
    location: "Downtown Area"
  },
  {
    id: "IR-DEF456",
    type: "Fire",
    status: "In Progress",
    date: "2024-01-14",
    location: "Residential Block"
  },
  {
    id: "IR-GHI789",
    type: "Disaster",
    status: "Resolved",
    date: "2024-01-13",
    location: "Coastal Road"
  }
];

export function MyReportsScreen({ onNavigate }: MyReportsScreenProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "In Progress":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "Resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('home')}
          className="mr-2"
          aria-label="Go back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="flex-1">My Reports</h1>
      </div>

      {/* Reports List */}
      <div className="flex-1 p-4">
        {mockReports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No reports submitted yet</p>
            <Button onClick={() => onNavigate('home')}>
              Submit Your First Report
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {mockReports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">#{report.id}</h3>
                    <p className="text-sm text-gray-500">{report.type}</p>
                  </div>
                  <Badge className={getStatusColor(report.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(report.status)}
                      {report.status}
                    </div>
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span>{report.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span>{report.location}</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}