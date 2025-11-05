import { RefreshCw, Phone, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface AssignedIncidentsScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

const mockAssignedIncidents = [
  {
    id: "IR-ABC123",
    type: "Crime",
    status: "Assigned",
    timestamp: "2024-01-15 14:30",
    location: "Downtown Area",
    priority: "High",
    assignedBy: "Desk Officer Cruz"
  },
  {
    id: "IR-DEF456", 
    type: "Fire",
    status: "In Progress",
    timestamp: "2024-01-15 13:45",
    location: "Residential Block",
    priority: "Critical",
    assignedBy: "Desk Officer Cruz"
  },
  {
    id: "IR-GHI789",
    type: "Disaster",
    status: "Assigned", 
    timestamp: "2024-01-15 12:20",
    location: "Coastal Road",
    priority: "Medium",
    assignedBy: "Admin User"
  }
];

export function AssignedIncidentsScreen({ onNavigate }: AssignedIncidentsScreenProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "In Progress":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "Assigned":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "Resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Assigned":
        return "bg-orange-100 text-orange-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
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
    console.log("Refreshing incidents...");
  };

  const handleCallVerification = (incident: any) => {
    onNavigate('callVerification', { incident });
  };

  const handleIncidentDetails = (incident: any) => {
    onNavigate('responderIncidentDetails', { incident });
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1>My Assigned Incidents</h1>
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

      {/* Incidents List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {mockAssignedIncidents.map((incident) => (
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
                  {getStatusIcon(incident.status)}
                  {incident.status}
                </div>
              </Badge>
            </div>
            
            <div className="text-sm text-gray-500 mb-3">
              <p>Reported: {incident.timestamp}</p>
              <p>Assigned by: {incident.assignedBy}</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleIncidentDetails(incident)}
                className="bg-green-600 hover:bg-green-700"
              >
                View Details
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