import { ArrowLeft, MapPin, Calendar, User, Camera, Clock, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface AdminIncidentDetailsScreenProps {
  onNavigate: (screen: string) => void;
  incidentData?: any;
}

export function AdminIncidentDetailsScreen({ onNavigate, incidentData }: AdminIncidentDetailsScreenProps) {
  const incident = incidentData || {
    id: "IR-ABC123",
    type: "Crime",
    status: "In Progress",
    priority: "High",
    timestamp: "2024-01-15 14:30",
    date: "Monday, January 15, 2024",
    time: "2:30 PM",
    location: "14.5995° N, 120.9842° E",
    locationName: "Downtown Area, Commercial District",
    description: "Suspicious activity reported near the commercial district. Multiple individuals seen acting suspiciously around ATM machines.",
    reporterName: "Juan Dela Cruz",
    reporterPhone: "+63 912 345 6789",
    reporterEmail: "juan.delacruz@email.com",
    assignedOfficer: "Officer Maria Santos",
    responderUnit: "Unit Alpha-7"
  };

  const statusHistory = [
    {
      status: "Submitted",
      timestamp: "2024-01-15 14:30",
      user: "System",
      note: "Report automatically submitted"
    },
    {
      status: "Assigned",
      timestamp: "2024-01-15 14:35",
      user: "Dispatcher John Doe",
      note: "Assigned to Unit Alpha-7"
    },
    {
      status: "In Progress",
      timestamp: "2024-01-15 14:45",
      user: "Officer Maria Santos",
      note: "Responding to incident location"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
      case "Submitted":
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('adminDashboard')}
          className="mr-4"
          aria-label="Go back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl">Incident Details</h1>
          <p className="text-gray-600">#{incident.id}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={getPriorityColor(incident.priority)}>
            {incident.priority} Priority
          </Badge>
          <Badge className={getStatusColor(incident.status)}>
            {incident.status}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Incident Type</p>
                  <p className="font-medium capitalize">{incident.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Priority Level</p>
                  <Badge className={getPriorityColor(incident.priority)}>
                    {incident.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date Reported</p>
                  <p>{incident.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Time Reported</p>
                  <p>{incident.time}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{incident.description}</p>
            </div>

            {/* Photo Evidence */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5" />
                <h2>Photo Evidence</h2>
              </div>
              <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Incident Photo</p>
                  <p className="text-sm text-gray-400">Click to enlarge</p>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" />
                <h2>Location Details</h2>
              </div>
              <div className="space-y-4">
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-gray-500">Interactive Map</p>
                    <p className="text-sm text-gray-400">Zoom and pan available</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="font-medium">{incident.locationName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Coordinates</p>
                  <p className="text-sm text-gray-600">{incident.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5" />
                <h2>Reporter Information</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="font-medium">{incident.reporterName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p>{incident.reporterPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-sm">{incident.reporterEmail}</p>
                </div>
              </div>
            </div>

            {/* Response Team */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5" />
                <h2>Response Team</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Assigned Officer</p>
                  <p className="font-medium">{incident.assignedOfficer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Response Unit</p>
                  <p>{incident.responderUnit}</p>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  Contact Team
                </Button>
              </div>
            </div>

            {/* Status History */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" />
                <h2>Status History</h2>
              </div>
              <div className="space-y-4">
                {statusHistory.map((entry, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4 relative">
                    <div className="absolute -left-2 top-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">{entry.status}</p>
                      <p className="text-xs text-gray-500 mb-1">{entry.timestamp}</p>
                      <p className="text-xs text-gray-600">{entry.user}</p>
                      {entry.note && (
                        <p className="text-xs text-gray-500 mt-1">{entry.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}