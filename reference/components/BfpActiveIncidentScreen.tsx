import { MapPin, Clock, User, Phone, Navigation, Camera, FileText, Flame } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

interface BfpActiveIncidentScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function BfpActiveIncidentScreen({ onNavigate }: BfpActiveIncidentScreenProps) {
  const [updateNote, setUpdateNote] = useState("");
  const [fireStatus, setFireStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incident = {
    id: "BFP-004",
    type: "Fire",
    subtype: "Residential Fire",
    location: "Apartment Complex Block A",
    coordinates: "14.5995° N, 120.9842° E",
    reportedBy: "Building Manager",
    reporterPhone: "+63 912 345 6789",
    timeReported: "3:15 PM",
    status: "In Progress",
    priority: "Critical",
    fireClass: "Class A"
  };

  const handleSubmitUpdate = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setUpdateNote("");
      setFireStatus("");
      alert("Update submitted successfully!");
    }, 1500);
  };

  const handleMarkExtinguished = () => {
    onNavigate('assignedIncidents');
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 pb-16">
      {/* Header */}
      <div className="bg-orange-600 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h1>Active Fire Incident</h1>
          <div className="bg-red-600 px-3 py-1 rounded-full text-sm animate-pulse">
            {incident.priority}
          </div>
        </div>
        <p className="text-sm text-orange-100">{incident.id}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Incident Info */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h2>Fire Details</h2>
          
          <div>
            <label className="text-sm text-gray-500">Type</label>
            <p className="font-medium">{incident.subtype}</p>
            <p className="text-sm text-gray-600">Fire Class: {incident.fireClass}</p>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 mt-1 text-red-600" />
            <div className="flex-1">
              <label className="text-sm text-gray-500">Location</label>
              <p>{incident.location}</p>
              <p className="text-xs text-gray-400">{incident.coordinates}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 mt-1 text-gray-600" />
            <div className="flex-1">
              <label className="text-sm text-gray-500">Time Reported</label>
              <p>{incident.timeReported}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User className="w-5 h-5 mt-1 text-gray-600" />
            <div className="flex-1">
              <label className="text-sm text-gray-500">Reported By</label>
              <p>{incident.reportedBy}</p>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-3 h-3" />
                <a href={`tel:${incident.reporterPhone}`} className="text-sm text-blue-600">
                  {incident.reporterPhone}
                </a>
              </div>
            </div>
          </div>

          <Button className="w-full bg-orange-600 hover:bg-orange-700 mt-3">
            <Navigation className="w-4 h-4 mr-2" />
            Navigate to Location
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h2>Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Camera className="w-5 h-5" />
              <span className="text-xs">Take Photo</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Phone className="w-5 h-5" />
              <span className="text-xs">Call Reporter</span>
            </Button>
          </div>
        </div>

        {/* Fire Status Update */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h2>Fire Status</h2>
          
          <div>
            <label className="block mb-2">Current Status</label>
            <Select value={fireStatus} onValueChange={setFireStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select fire status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-route">En Route</SelectItem>
                <SelectItem value="on-scene">On Scene</SelectItem>
                <SelectItem value="fire-controlled">Fire Controlled</SelectItem>
                <SelectItem value="fire-out">Fire Out</SelectItem>
                <SelectItem value="under-investigation">Under Investigation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2">Status Notes</label>
            <Textarea
              placeholder="Enter details about fire suppression, casualties, damage assessment..."
              value={updateNote}
              onChange={(e) => setUpdateNote(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <Button
            onClick={handleSubmitUpdate}
            disabled={!updateNote || !fireStatus || isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Submit Update
              </>
            )}
          </Button>
        </div>

        {/* Mark as Extinguished */}
        <div className="bg-white rounded-lg p-4">
          <Button
            onClick={handleMarkExtinguished}
            variant="outline"
            className="w-full border-green-600 text-green-600 hover:bg-green-50"
          >
            <Flame className="w-4 h-4 mr-2" />
            Mark as Extinguished
          </Button>
        </div>
      </div>
    </div>
  );
}
