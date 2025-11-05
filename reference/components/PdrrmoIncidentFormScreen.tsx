import { ArrowLeft, Calendar, User, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useState } from "react";

interface PdrrmoIncidentFormScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  photoData?: string;
  incidentData?: any;
}

export function PdrrmoIncidentFormScreen({ onNavigate, photoData, incidentData }: PdrrmoIncidentFormScreenProps) {
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Patient Information
  const [patientName, setPatientName] = useState<string>("");
  const [patientAge, setPatientAge] = useState<string>("");
  const [patientGender, setPatientGender] = useState<string>("");
  const [chiefComplaint, setChiefComplaint] = useState<string>("");
  const [signsSymptoms, setSignsSymptoms] = useState<string>("");
  const [natureOfIllness, setNatureOfIllness] = useState<string>("");
  
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
        id: "PDRRMO-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        type: "Vehicular Accident",
        unit: "PDRRMO",
        description: description,
        photo: photoData,
        location: "Downtown Area",
        coordinates: "14.5995° N, 120.9842° E",
        timestamp: new Date().toISOString(),
        date: currentDate,
        time: currentTime,
        status: "Pending",
        patientInfo: {
          name: patientName,
          age: patientAge,
          gender: patientGender,
          chiefComplaint: chiefComplaint,
          signsSymptoms: signsSymptoms,
          natureOfIllness: natureOfIllness
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
        <h1 className="flex-1">PDRRMO Incident Report Form</h1>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Incident Information */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h2>Incident Information</h2>
          
          <div>
            <label className="text-sm text-gray-500">Incident Type</label>
            <p className="mt-1">Vehicular Accident</p>
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
              placeholder="Describe the incident..."
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

        {/* Patient Information */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h2>Patient Information</h2>

          <div>
            <label className="block mb-2">Full Name</label>
            <Input
              placeholder="Enter full name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">Age</label>
            <Select value={patientAge} onValueChange={setPatientAge}>
              <SelectTrigger>
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-10">0-10 years</SelectItem>
                <SelectItem value="11-20">11-20 years</SelectItem>
                <SelectItem value="21-30">21-30 years</SelectItem>
                <SelectItem value="31-40">31-40 years</SelectItem>
                <SelectItem value="41-50">41-50 years</SelectItem>
                <SelectItem value="51-60">51-60 years</SelectItem>
                <SelectItem value="60+">60+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2">Gender</label>
            <Select value={patientGender} onValueChange={setPatientGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2">Chief Complaint</label>
            <Input
              placeholder="Main complaint"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">Signs and Symptoms</label>
            <Input
              placeholder="Observable signs and symptoms"
              value={signsSymptoms}
              onChange={(e) => setSignsSymptoms(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">Nature of Illness</label>
            <Input
              placeholder="Nature of illness or injury"
              value={natureOfIllness}
              onChange={(e) => setNatureOfIllness(e.target.value)}
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
