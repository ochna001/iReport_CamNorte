import { ArrowLeft, MapPin, Calendar, User, Camera, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useState } from "react";

interface ResponderIncidentDetailsScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  incidentData?: any;
}

export function ResponderIncidentDetailsScreen({ onNavigate, incidentData }: ResponderIncidentDetailsScreenProps) {
  const [newStatus, setNewStatus] = useState<string>(incidentData?.status || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleGoToUpdate = () => {
    // Route to unit-specific active incident screen
    // This will be handled by the navigation logic in App.tsx
    onNavigate('activeIncident', { incident });
  };

  const handleStatusUpdate = () => {
    if (!newStatus) return;
    
    setIsUpdating(true);
    
    // Simulate update
    setTimeout(() => {
      setIsUpdating(false);
      onNavigate('assignedIncidents');
    }, 1500);
  };

  const incident = incidentData || {
    id: "IR-ABC123",
    type: "Crime",
    status: "Pending",
    timestamp: "2024-01-15 14:30",
    date: "Monday, January 15, 2024",
    time: "2:30 PM",
    location: "14.5995° N, 120.9842° E",
    locationName: "Downtown Area",
    description: "Suspicious activity reported near the commercial district",
    reporterName: "Juan Dela Cruz",
    priority: "High"
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

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('assignedIncidents')}
          className="mr-2"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="flex-1">Incident Details</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Incident Header */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="mb-2">#{incident.id}</h2>
              <p className="text-gray-600 capitalize">{incident.type}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(incident.priority)}>
                {incident.priority}
              </Badge>
              <Badge className={getStatusColor(incident.status)}>
                {incident.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4" />
            <label>Incident Photo</label>
          </div>
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Photo Evidence</p>
            </div>
          </div>
        </div>

        {/* Incident Information */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="mb-3">Incident Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p>{incident.date}</p>
                <p className="text-sm text-gray-600">{incident.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Reported by</p>
                <p>{incident.reporterName}</p>
              </div>
            </div>

            {incident.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-sm bg-gray-50 p-3 rounded">{incident.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4" />
            <label>Location</label>
          </div>
          <div className="space-y-3">
            <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-6 h-6 text-red-500 mx-auto mb-1" />
                <p className="text-sm text-gray-500">Map View</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p>{incident.locationName}</p>
              <p className="text-xs text-gray-400">{incident.location}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <Button
            onClick={handleGoToUpdate}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Start Working on Incident
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Click above to update incident progress, add notes, and change status
          </p>
        </div>
      </div>
    </div>
  );
}