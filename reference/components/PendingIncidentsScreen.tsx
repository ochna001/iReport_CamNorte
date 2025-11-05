import { RefreshCw, Phone, Clock, AlertCircle, ArrowLeft, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface PendingIncidentsScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

const mockPendingIncidents = [
  {
    id: "IR-XYZ789",
    type: "Crime",
    status: "Received",
    timestamp: "2024-01-15 15:20",
    location: "Barangay San Juan",
    reporterName: "Maria Santos",
    priority: "High",
    description: "Robbery reported at convenience store"
  },
  {
    id: "IR-LMN456", 
    type: "Fire",
    status: "Received",
    timestamp: "2024-01-15 14:55",
    location: "Poblacion District",
    reporterName: "Pedro Reyes",
    priority: "Critical",
    description: "Small fire in residential area"
  },
  {
    id: "IR-OPQ123",
    type: "Disaster",
    status: "Received", 
    timestamp: "2024-01-15 14:10",
    location: "Coastal Barangay",
    reporterName: "Rosa Cruz",
    priority: "Medium",
    description: "Flooding due to heavy rain"
  },
  {
    id: "IR-RST890",
    type: "Crime",
    status: "Verified",
    timestamp: "2024-01-15 13:30",
    location: "Market Area",
    reporterName: "Jose Garcia",
    priority: "Low",
    description: "Suspicious person loitering"
  }
];

export function PendingIncidentsScreen({ onNavigate }: PendingIncidentsScreenProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Received":
        return "bg-orange-100 text-orange-800";
      case "Verified":
        return "bg-blue-100 text-blue-800";
      case "Assigned":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRefresh = () => {
    // Simulate refresh
    console.log("Refreshing pending incidents...");
  };

  const handleProcessIncident = (incident: any) => {
    onNavigate('deskOfficerForm', { incident });
  };

  const handleCallVerification = (incident: any) => {
    onNavigate('callVerification', { incident });
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1>Pending Incidents</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          aria-label="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Status Summary */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="text-xs text-orange-600 mb-1">Received</div>
            <div className="text-lg text-orange-900">3</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-blue-600 mb-1">Verified</div>
            <div className="text-lg text-blue-900">1</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="text-xs text-purple-600 mb-1">To Assign</div>
            <div className="text-lg text-purple-900">1</div>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {mockPendingIncidents.map((incident) => (
          <div key={incident.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">#{incident.id}</h3>
                  <Badge className={getPriorityColor(incident.priority)}>
                    {incident.priority}
                  </Badge>
                </div>
                <p className="text-gray-600 capitalize">{incident.type}</p>
                <p className="text-sm text-gray-500">{incident.location}</p>
              </div>
              <Badge className={getStatusColor(incident.status)}>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {incident.status}
                </div>
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600 mb-2">
              <p className="mb-1">{incident.description}</p>
            </div>

            <div className="text-sm text-gray-500 mb-3">
              <p>Reporter: {incident.reporterName}</p>
              <p>Reported: {incident.timestamp}</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleProcessIncident(incident)}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
              >
                <FileText className="w-4 h-4" />
                Process
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCallVerification(incident)}
                className="flex items-center gap-1"
              >
                <Phone className="w-4 h-4" />
                Call Reporter
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
