import { useState } from "react";
import { ArrowLeft, Search, Upload, AlertCircle, WifiOff, CheckSquare, Square } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

interface DeskOfficerFormScreenProps {
  onNavigate: (screen: string) => void;
  incidentData?: any;
}

const mockOfficers = [
  { id: 'off001', name: 'John Doe', unit: 'Patrol Unit A', status: 'Available' },
  { id: 'off002', name: 'Jane Smith', unit: 'Desk Officer', status: 'Available' },
  { id: 'off003', name: 'Mike Johnson', unit: 'Traffic Division', status: 'On Duty' },
  { id: 'off004', name: 'Sarah Wilson', unit: 'Patrol Unit B', status: 'Available' },
  { id: 'off005', name: 'Robert Brown', unit: 'Investigation', status: 'Busy' }
];

const agencies = [
  { id: 'bfp', name: 'Bureau of Fire Protection (BFP)', category: 'Fire & Rescue' },
  { id: 'mdrrmo', name: 'Municipal DRRMO', category: 'Disaster Management' },
  { id: 'pdrrmo', name: 'Provincial DRRMO', category: 'Disaster Management' },
  { id: 'pnp', name: 'Philippine National Police', category: 'Law Enforcement' },
  { id: 'bjmp', name: 'Bureau of Jail Management', category: 'Corrections' },
  { id: 'pcg', name: 'Philippine Coast Guard', category: 'Maritime Safety' },
  { id: 'doh', name: 'Department of Health', category: 'Medical Response' }
];

const checklistItems = [
  { id: 'contact_made', label: 'Contact Made with Reporter' },
  { id: 'evidence_collected', label: 'Evidence Collected' },
  { id: 'location_verified', label: 'Location Verified' },
  { id: 'witnesses_identified', label: 'Witnesses Identified' },
  { id: 'initial_assessment', label: 'Initial Assessment Complete' }
];

export function DeskOfficerFormScreen({ onNavigate, incidentData }: DeskOfficerFormScreenProps) {
  const [status, setStatus] = useState(incidentData?.status || "Received");
  const [assignedOfficers, setAssignedOfficers] = useState<string[]>([]);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [officerNotes, setOfficerNotes] = useState("");
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [officerSearch, setOfficerSearch] = useState("");
  const [error, setError] = useState("");

  const incident = incidentData || {
    id: "IR-ABC123",
    type: "Crime",
    status: "Received",
    timestamp: "2024-01-15 14:30",
    location: "Downtown Area",
    reporterName: "Juan Dela Cruz",
    description: "Suspicious activity reported near commercial area"
  };

  const filteredOfficers = mockOfficers.filter(officer =>
    officer.name.toLowerCase().includes(officerSearch.toLowerCase()) ||
    officer.unit.toLowerCase().includes(officerSearch.toLowerCase())
  );

  const availableOfficers = filteredOfficers.filter(officer => 
    officer.status === 'Available' || officer.status === 'On Duty'
  );

  const handleOfficerToggle = (officerId: string) => {
    setAssignedOfficers(prev => 
      prev.includes(officerId) 
        ? prev.filter(id => id !== officerId)
        : [...prev, officerId]
    );
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setError("");
    
    // Validation: Assigned status requires officer selection
    if (newStatus === "Assigned" && assignedOfficers.length === 0) {
      setError("Please select at least one officer before changing status to 'Assigned'");
    }
  };

  const handleAgencyToggle = (agencyId: string) => {
    setSelectedAgencies(prev => 
      prev.includes(agencyId) 
        ? prev.filter(id => id !== agencyId)
        : [...prev, agencyId]
    );
  };

  const handleChecklistToggle = (itemId: string) => {
    setCheckedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleFileAttachment = () => {
    // Simulate file picker
    const mockFiles = [
      "evidence_photo_1.jpg",
      "witness_statement.pdf",
      "location_map.png"
    ];
    
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    if (!attachedFiles.includes(randomFile)) {
      setAttachedFiles(prev => [...prev, randomFile]);
    }
  };

  const removeFile = (fileName: string) => {
    setAttachedFiles(prev => prev.filter(file => file !== fileName));
  };

  const validateForm = () => {
    if (status === "Assigned" && assignedOfficers.length === 0) {
      setError("Please select at least one officer when status is 'Assigned'");
      return false;
    }
    
    if (status === "Closed" && !officerNotes.trim()) {
      setError("Officer notes are required when closing an incident");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    // Simulate form submission
    setTimeout(() => {
      if (isOffline) {
        // Save locally when offline
        const formData = {
          incidentId: incident.id,
          status,
          assignedOfficers,
          selectedAgencies,
          officerNotes,
          checkedItems,
          attachedFiles,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`offline_form_${incident.id}`, JSON.stringify(formData));
        setError("Form saved locally. Will sync when online.");
      } else {
        // Normal submission
        onNavigate('assignedIncidents');
      }
      
      setIsSubmitting(false);
    }, 2000);
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
          aria-label="Go back to assigned incidents"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="flex-1">Desk Officer Form</h1>
        {isOffline && (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </Badge>
        )}
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-20">
        {/* Offline Warning */}
        {isOffline && (
          <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              Offline Mode. Form data will be saved locally and synced when online.
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {/* Incident ID */}
        <div className="bg-white rounded-lg p-4">
          <label className="block mb-2 text-gray-500">Incident ID</label>
          <div className="text-lg font-medium text-gray-400">#{incident.id}</div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg p-4">
          <label className="block mb-3">Status *</label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-12" aria-label="Select incident status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Received">Received</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assign Officers - Multi-Select */}
        <div className="bg-white rounded-lg p-4">
          <label className="block mb-3">Assign Officers (Multi-Select)</label>
          
          {/* Officer Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search officers..."
              value={officerSearch}
              onChange={(e) => setOfficerSearch(e.target.value)}
              className="pl-10 h-12"
              aria-label="Search officers"
            />
          </div>

          {/* Selected Officers Count */}
          {assignedOfficers.length > 0 && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                {assignedOfficers.length} officer(s) selected
              </p>
            </div>
          )}

          {/* Officer Multi-Selection */}
          {availableOfficers.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded p-2">
              {availableOfficers.map((officer) => (
                <div key={officer.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    id={`officer-${officer.id}`}
                    checked={assignedOfficers.includes(officer.id)}
                    onCheckedChange={() => handleOfficerToggle(officer.id)}
                  />
                  <label htmlFor={`officer-${officer.id}`} className="flex-1 text-sm cursor-pointer">
                    <div className="font-medium">{officer.name}</div>
                    <div className="text-xs text-gray-500">{officer.unit} • {officer.status}</div>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-red-600 p-3 bg-red-50 rounded border border-red-200">
              No officers available
            </div>
          )}
        </div>

        {/* Notify Agencies */}
        <div className="bg-white rounded-lg p-4">
          <label className="block mb-3">Notify Agencies</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {agencies.map((agency) => (
              <div key={agency.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <Checkbox
                  id={agency.id}
                  checked={selectedAgencies.includes(agency.id)}
                  onCheckedChange={() => handleAgencyToggle(agency.id)}
                />
                <label htmlFor={agency.id} className="flex-1 text-sm cursor-pointer">
                  <div>{agency.name}</div>
                  <div className="text-xs text-gray-500">{agency.category}</div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Officer Notes */}
        <div className="bg-white rounded-lg p-4">
          <label className="block mb-3">Officer Notes</label>
          <Textarea
            placeholder="Add notes about the incident processing..."
            value={officerNotes}
            onChange={(e) => setOfficerNotes(e.target.value)}
            className="min-h-[100px] resize-none"
            aria-label="Officer notes"
          />
        </div>

        {/* Structured Checklist */}
        <div className="bg-white rounded-lg p-4">
          <label className="block mb-3">Process Checklist</label>
          <div className="space-y-2">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <Checkbox
                  id={item.id}
                  checked={checkedItems.includes(item.id)}
                  onCheckedChange={() => handleChecklistToggle(item.id)}
                />
                <label htmlFor={item.id} className="text-sm cursor-pointer">
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Attachment */}
        <div className="bg-white rounded-lg p-4">
          <label className="block mb-3">Evidence</label>
          
          <Button
            onClick={handleFileAttachment}
            disabled={attachedFiles.length >= 5}
            className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 mb-3"
          >
            <Upload className="w-4 h-4 mr-2" />
            Attach Files ({attachedFiles.length}/5)
          </Button>

          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Attached Files:</p>
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                  <span className="text-sm text-blue-800">{file}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file)}
                    className="text-red-600 hover:text-red-700 h-auto p-1"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 bg-white border-t border-gray-200">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {isOffline ? "Saving Locally..." : "Updating Incident..."}
            </div>
          ) : (
            "Update Incident"
          )}
        </Button>
      </div>
    </div>
  );
}