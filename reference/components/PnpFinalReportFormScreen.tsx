import { ArrowLeft, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

interface PnpFinalReportFormScreenProps {
  onNavigate: (screen: string) => void;
  reportData?: any;
}

export function PnpFinalReportFormScreen({ onNavigate, reportData }: PnpFinalReportFormScreenProps) {
  const [incidentType, setIncidentType] = useState(reportData?.type || "Crime");
  const [subtype, setSubtype] = useState("");
  const [caseNumber, setCaseNumber] = useState(reportData?.id || "");
  const [dateOccurred, setDateOccurred] = useState(reportData?.date?.split(' ')[0] || "");
  const [timeOccurred, setTimeOccurred] = useState("");
  const [location, setLocation] = useState(reportData?.location || "");
  const [description, setDescription] = useState(reportData?.description || "");
  const [suspectInfo, setSuspectInfo] = useState("");
  const [witnessInfo, setWitnessInfo] = useState("");
  const [evidenceCollected, setEvidenceCollected] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [outcome, setOutcome] = useState(reportData?.outcome || reportData?.status || "");
  const [recommendations, setRecommendations] = useState("");
  const [officerName, setOfficerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onNavigate('pnpFinalReports');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('pnpFinalReports')}
            className="mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="flex-1">PNP Final Report Form</h1>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Info Banner - Show when editing existing report */}
        {reportData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ℹ️ Editing report for case <span className="font-medium">{reportData.id}</span>. Some fields have been pre-filled from the incident report.
            </p>
          </div>
        )}
        {/* Incident Information */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2>Incident Information</h2>
          
          <div>
            <label className="block mb-2 text-sm text-gray-500">Incident Type</label>
            <Select value={incidentType} onValueChange={setIncidentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Crime">Crime</SelectItem>
                <SelectItem value="Theft">Theft</SelectItem>
                <SelectItem value="Robbery">Robbery</SelectItem>
                <SelectItem value="Assault">Assault</SelectItem>
                <SelectItem value="Vandalism">Vandalism</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Case Number</label>
            <Input
              placeholder="Enter case number"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Date Occurred</label>
              <Input
                type="date"
                value={dateOccurred}
                onChange={(e) => setDateOccurred(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">Time Occurred</label>
              <Input
                type="time"
                value={timeOccurred}
                onChange={(e) => setTimeOccurred(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Location</label>
            <Input
              placeholder="Enter incident location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Incident Description</label>
            <Textarea
              placeholder="Provide detailed description of the incident"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* Investigation Details */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2>Investigation Details</h2>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Suspect Information</label>
            <Textarea
              placeholder="Name, description, status (apprehended/at large)"
              value={suspectInfo}
              onChange={(e) => setSuspectInfo(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Witness Information</label>
            <Textarea
              placeholder="Names and contact information of witnesses"
              value={witnessInfo}
              onChange={(e) => setWitnessInfo(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Evidence Collected</label>
            <Textarea
              placeholder="List all evidence collected"
              value={evidenceCollected}
              onChange={(e) => setEvidenceCollected(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
        </div>

        {/* Response & Resolution */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2>Response & Resolution</h2>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Actions Taken</label>
            <Textarea
              placeholder="Describe actions taken by responding officers"
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Case Outcome</label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resolved">Resolved - Suspect Apprehended</SelectItem>
                <SelectItem value="resolved-cleared">Resolved - Case Cleared</SelectItem>
                <SelectItem value="under-investigation">Under Investigation</SelectItem>
                <SelectItem value="unfounded">Unfounded</SelectItem>
                <SelectItem value="transferred">Transferred to Higher Authority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Recommendations</label>
            <Textarea
              placeholder="Any recommendations or follow-up actions needed"
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
        </div>

        {/* Officer Details */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2>Reporting Officer</h2>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Officer Name & Badge Number</label>
            <Input
              placeholder="Enter your name and badge number"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
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
              Submitting Report...
            </div>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Submit Final Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
