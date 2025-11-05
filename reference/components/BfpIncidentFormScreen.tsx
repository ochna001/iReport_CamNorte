import { ArrowLeft, Calendar, User, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useState } from "react";

interface BfpIncidentFormScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  photoData?: string;
  incidentData?: any;
}

export function BfpIncidentFormScreen({ onNavigate, photoData, incidentData }: BfpIncidentFormScreenProps) {
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fire Details
  const [locationOfFire, setLocationOfFire] = useState<string>("");
  const [areaOwnership, setAreaOwnership] = useState<string>("");
  const [classOfFire, setClassOfFire] = useState<string>("");
  const [rootCause, setRootCause] = useState<string>("");
  const [peopleInjured, setPeopleInjured] = useState<string>("");
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const reportData = {
        id: "BFP-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        type: "Fire",
        unit: "BFP",
        description: description,
        photo: photoData,
        location: "Downtown Area",
        coordinates: "14.5995° N, 120.9842° E",
        timestamp: new Date().toISOString(),
        date: currentDate,
        time: currentTime,
        status: "Pending",
        fireDetails: {
          locationOfFire: locationOfFire,
          areaOwnership: areaOwnership,
          classOfFire: classOfFire,
          rootCause: rootCause,
          peopleInjured: peopleInjured
        }
      };
      
      setIsSubmitting(false);
      onNavigate('confirmation', { reportData });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('incidentForm')}
          className="mr-2"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="flex-1">BFP Incident Report Form</h1>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Incident Information */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h2>Incident Information</h2>
          
          <div>
            <label className="text-sm text-gray-500">Incident Type</label>
            <p className="mt-1">Fire</p>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-5 h-5 mt-1 text-gray-600" />
            <div className="flex-1">
              <label className="text-sm text-gray-500">Date & Time</label>
              <p className="mt-1">{currentDate}</p>
              <p className="text-sm text-gray-500">{currentTime}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User className="w-5 h-5 mt-1 text-gray-600" />
            <div className="flex-1">
              <label className="text-sm text-gray-500">Reported by</label>
              <p className="mt-1">Juan Dela Cruz</p>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-2">Description</label>
            <Textarea
              placeholder="Describe the fire incident..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[60px] resize-none bg-gray-50"
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <label>Location</label>
          </div>

          <div className="bg-gray-200 rounded-lg h-32 flex flex-col items-center justify-center">
            <MapPin className="w-6 h-6 text-red-500 mb-2" />
            <p className="text-sm text-gray-500">Map View</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Address</label>
            <p className="mt-1">Downtown Area</p>
            <p className="text-xs text-gray-400 mt-1">14.5995° N, 120.9842° E</p>
          </div>
        </div>

        {/* Fire Details */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h2>Details</h2>

          <div>
            <label className="block mb-2">Location of Fire</label>
            <Select value={locationOfFire} onValueChange={setLocationOfFire}>
              <SelectTrigger>
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="forest">Forest/Wildland</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2">Area Ownership</label>
            <Select value={areaOwnership} onValueChange={setAreaOwnership}>
              <SelectTrigger>
                <SelectValue placeholder="Select ownership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2">Class of Fire</label>
            <Select value={classOfFire} onValueChange={setClassOfFire}>
              <SelectTrigger>
                <SelectValue placeholder="Select fire class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classA">Class A - Ordinary Combustibles</SelectItem>
                <SelectItem value="classB">Class B - Flammable Liquids</SelectItem>
                <SelectItem value="classC">Class C - Electrical</SelectItem>
                <SelectItem value="classD">Class D - Combustible Metals</SelectItem>
                <SelectItem value="classK">Class K - Cooking Oils</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2">Root Cause of Fire</label>
            <Input
              placeholder="e.g., Electrical short circuit"
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">People Injured</label>
            <Input
              type="number"
              placeholder="Number of injured persons"
              value={peopleInjured}
              onChange={(e) => setPeopleInjured(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 bg-white border-t border-gray-200">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </div>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </div>
  );
}
