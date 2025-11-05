import { ArrowLeft, X, MapPin, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

interface IncidentFormScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  photoData?: string;
}

export function IncidentFormScreen({ onNavigate, photoData }: IncidentFormScreenProps) {
  const [incidentType, setIncidentType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    if (!incidentType) return;
    
    // Route to specialized form based on incident type
    switch(incidentType) {
      case 'crime':
        onNavigate('pnpForm', { photo: photoData });
        break;
      case 'fire':
        onNavigate('bfpForm', { photo: photoData });
        break;
      case 'disaster':
        onNavigate('pdrrmoForm', { photo: photoData });
        break;
      default:
        // Fallback to confirmation for other types
        setIsSubmitting(true);
        setTimeout(() => {
          const reportData = {
            id: "IR-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            type: incidentType,
            description: description,
            photo: photoData,
            location: "14.5995° N, 120.9842° E",
            timestamp: new Date().toISOString(),
            date: currentDate,
            time: currentTime,
            status: "Pending"
          };
          setIsSubmitting(false);
          onNavigate('confirmation', { reportData });
        }, 2000);
    }
  };

  const handleDeletePhoto = () => {
    onNavigate('camera');
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
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="flex-1">New Report</h1>
        <span className="text-sm text-gray-500">Step 1 of 1</span>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Photo Preview */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="mb-3">Incident Photo</h2>
          <div className="relative w-48 h-48 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
            <span className="text-gray-500">Photo Preview</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeletePhoto}
              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8"
              aria-label="Delete photo"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Incident Type */}
        <div className="bg-white rounded-lg p-4">
          <label className="block mb-3">Incident Type *</label>
          <Select value={incidentType} onValueChange={setIncidentType}>
            <SelectTrigger className="h-12" aria-label="Select incident type">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="crime">Crime (PNP)</SelectItem>
              <SelectItem value="fire">Fire (BFP)</SelectItem>
              <SelectItem value="disaster">Disaster/Accident (PDRRMO)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date and Time - Auto-populated */}
        <div className="bg-white rounded-lg p-4">
          <label className="block mb-3">Date & Time</label>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Auto-detected</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-800">{currentDate}</p>
            <p className="text-sm text-gray-600">{currentTime}</p>
          </div>
        </div>

        {/* Auto-populated Location */}
        <div className="bg-white rounded-lg p-4">
          <label className="block mb-3">Location</label>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Auto-detected</span>
          </div>
          <p className="text-sm text-gray-500">14.5995° N, 120.9842° E</p>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            After selecting the incident type, you'll be directed to a specialized form for that emergency unit.
          </p>
        </div>

        {/* Add some bottom padding for the fixed button */}
        <div className="h-20"></div>
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <Button
          onClick={handleSubmit}
          disabled={!incidentType}
          className="w-full h-14 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:text-gray-200 text-white shadow-md"
          aria-label="Continue to specialized incident form"
        >
          {isSubmitting ? 'Processing...' : 'Continue to Specialized Form'}
        </Button>
      </div>
    </div>
  );
}