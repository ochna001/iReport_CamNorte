import { ArrowLeft, Calendar, User, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useState } from "react";

interface PnpIncidentFormScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  photoData?: string;
  incidentData?: any;
}

export function PnpIncidentFormScreen({ onNavigate, photoData, incidentData }: PnpIncidentFormScreenProps) {
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Victim's Data
  const [victimName, setVictimName] = useState<string>("");
  const [victimAddress, setVictimAddress] = useState<string>("");
  const [victimOccupation, setVictimOccupation] = useState<string>("");
  const [relationToSuspect, setRelationToSuspect] = useState<string>("");
  const [caseStatus, setCaseStatus] = useState<string>("");
  
  // Suspect's Data
  const [suspectName, setSuspectName] = useState<string>("");
  const [suspectAddress, setSuspectAddress] = useState<string>("");
  const [suspectOccupation, setSuspectOccupation] = useState<string>("");
  const [narrative, setNarrative] = useState<string>("");
  
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
        id: "PNP-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        type: "Crime",
        unit: "PNP",
        description: description,
        photo: photoData,
        location: "Downtown Area",
        coordinates: "14.5995° N, 120.9842° E",
        timestamp: new Date().toISOString(),
        date: currentDate,
        time: currentTime,
        status: "Pending",
        victimData: {
          name: victimName,
          address: victimAddress,
          occupation: victimOccupation,
          relationToSuspect: relationToSuspect,
          caseStatus: caseStatus
        },
        suspectData: {
          name: suspectName,
          address: suspectAddress,
          occupation: suspectOccupation,
          narrative: narrative
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
        <h1 className="flex-1">PNP Incident Report Form</h1>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Incident Information */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h2>Incident Information</h2>
          
          <div>
            <label className="text-sm text-gray-500">Incident Type</label>
            <p className="mt-1">Crime</p>
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
              placeholder="Describe the crime incident..."
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

        {/* Victim's Data */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h2>Victim's Data</h2>

          <div>
            <label className="block mb-2">Full Name</label>
            <Input
              placeholder="Enter victim's full name"
              value={victimName}
              onChange={(e) => setVictimName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">Current Address</label>
            <Input
              placeholder="Enter victim's address"
              value={victimAddress}
              onChange={(e) => setVictimAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">Occupation</label>
            <Input
              placeholder="Enter occupation"
              value={victimOccupation}
              onChange={(e) => setVictimOccupation(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">Relation to the Victim</label>
            <Select value={relationToSuspect} onValueChange={setRelationToSuspect}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family">Family Member</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="acquaintance">Acquaintance</SelectItem>
                <SelectItem value="stranger">Stranger</SelectItem>
                <SelectItem value="coworker">Co-worker</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2">Status of Case</label>
            <Select value={caseStatus} onValueChange={setCaseStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select case status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">Ongoing Investigation</SelectItem>
                <SelectItem value="arrested">Suspect Arrested</SelectItem>
                <SelectItem value="witness">Witness Statement Needed</SelectItem>
                <SelectItem value="evidence">Gathering Evidence</SelectItem>
                <SelectItem value="initial">Initial Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Suspect's Data */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h2>Suspect's Data</h2>

          <div>
            <label className="block mb-2">Full Name</label>
            <Input
              placeholder="Enter suspect's full name (if known)"
              value={suspectName}
              onChange={(e) => setSuspectName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">Current Address</label>
            <Input
              placeholder="Enter suspect's address (if known)"
              value={suspectAddress}
              onChange={(e) => setSuspectAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">Occupation</label>
            <Input
              placeholder="Enter occupation (if known)"
              value={suspectOccupation}
              onChange={(e) => setSuspectOccupation(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">Narrative of Incident</label>
            <Textarea
              placeholder="Provide a detailed narrative of what happened..."
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              className="min-h-[80px] resize-none"
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
