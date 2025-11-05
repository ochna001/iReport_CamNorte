import { MapPin, Clock, User, Phone, Navigation, Camera, FileText, Ambulance } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

interface PdrrmoActiveIncidentScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function PdrrmoActiveIncidentScreen({ onNavigate }: PdrrmoActiveIncidentScreenProps) {
  const [updateNote, setUpdateNote] = useState("");
  const [responseStatus, setResponseStatus] = useState("");
  const [casualties, setCasualties] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incident = {
    id: "PDRRMO-004",
    type: "Vehicular Accident",
    subtype: "Multi-Vehicle Collision",
    location: "National Highway KM 45",
    coordinates: "14.5995° N, 120.9842° E",
    reportedBy: "Motorist",
    reporterPhone: "+63 912 345 6789",
    timeReported: "4:00 PM",
    status: "In Progress",
    priority: "High",
    vehiclesInvolved: "3"
  };

  const handleSubmitUpdate = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setUpdateNote("");
      setResponseStatus("");
      setCasualties("");
      alert("Update submitted successfully!");
    }, 1500);
  };

  const handleMarkResolved = () => {
    onNavigate('assignedIncidents');
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 pb-16">
      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h1>Active Response</h1>
          <div className="bg-red-800 px-3 py-1 rounded-full text-sm animate-pulse">
            {incident.priority} Priority
          </div>
        </div>
        <p className="text-sm text-red-100">{incident.id}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Incident Info */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h2>Incident Details</h2>
          
          <div>
            <label className="text-sm text-gray-500">Type</label>
            <p className="font-medium">{incident.subtype}</p>
            <p className="text-sm text-gray-600">Vehicles Involved: {incident.vehiclesInvolved}</p>
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

          <Button className="w-full bg-red-600 hover:bg-red-700 mt-3">
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

        {/* Response Status Update */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h2>Response Update</h2>
          
          <div>
            <label className="block mb-2">Response Status</label>
            <Select value={responseStatus} onValueChange={setResponseStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select response status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="en-route">En Route</SelectItem>
                <SelectItem value="on-scene">On Scene</SelectItem>
                <SelectItem value="treating-patients">Treating Patients</SelectItem>
                <SelectItem value="transporting">Transporting to Hospital</SelectItem>
                <SelectItem value="clearing-scene">Clearing Scene</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2">Number of Casualties</label>
            <Input
              type="number"
              placeholder="Enter number of injured persons"
              value={casualties}
              onChange={(e) => setCasualties(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">Status Notes</label>
            <Textarea
              placeholder="Enter patient conditions, actions taken, hospital destination..."
              value={updateNote}
              onChange={(e) => setUpdateNote(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <Button
            onClick={handleSubmitUpdate}
            disabled={!updateNote || !responseStatus || isSubmitting}
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

        {/* Mark as Resolved */}
        <div className="bg-white rounded-lg p-4">
          <Button
            onClick={handleMarkResolved}
            variant="outline"
            className="w-full border-green-600 text-green-600 hover:bg-green-50"
          >
            <Ambulance className="w-4 h-4 mr-2" />
            Mark as Resolved
          </Button>
        </div>
      </div>
    </div>
  );
}
