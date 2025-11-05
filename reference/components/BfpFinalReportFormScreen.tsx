import { ArrowLeft, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

interface BfpFinalReportFormScreenProps {
  onNavigate: (screen: string) => void;
  reportData?: any;
}

export function BfpFinalReportFormScreen({ onNavigate, reportData }: BfpFinalReportFormScreenProps) {
  const [incidentType, setIncidentType] = useState(reportData?.type || "Residential Fire");
  const [fireClass, setFireClass] = useState("");
  const [caseNumber, setCaseNumber] = useState(reportData?.id || "");
  const [dateOccurred, setDateOccurred] = useState(reportData?.date?.split(' ')[0] || "");
  const [timeOccurred, setTimeOccurred] = useState("");
  const [location, setLocation] = useState(reportData?.location || "");
  const [propertyType, setPropertyType] = useState("");
  const [description, setDescription] = useState(reportData?.description || "");
  const [fireCause, setFireCause] = useState("");
  const [originPoint, setOriginPoint] = useState("");
  const [damageEstimate, setDamageEstimate] = useState(reportData?.damageEstimate || "");
  const [casualties, setCasualties] = useState("");
  const [injuries, setInjuries] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [unitsResponded, setUnitsResponded] = useState("");
  const [waterUsed, setWaterUsed] = useState("");
  const [outcome, setOutcome] = useState(reportData?.outcome || reportData?.status || "");
  const [recommendations, setRecommendations] = useState("");
  const [officerName, setOfficerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onNavigate('bfpFinalReports');
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
            onClick={() => onNavigate('bfpFinalReports')}
            className="mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="flex-1">BFP Final Report Form</h1>
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
        {/* Fire Incident Information */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2>Fire Incident Information</h2>
          
          <div>
            <label className="block mb-2 text-sm text-gray-500">Incident Type</label>
            <Select value={incidentType} onValueChange={setIncidentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residential Fire">Residential Fire</SelectItem>
                <SelectItem value="Commercial Fire">Commercial Fire</SelectItem>
                <SelectItem value="Vehicle Fire">Vehicle Fire</SelectItem>
                <SelectItem value="Forest Fire">Forest Fire</SelectItem>
                <SelectItem value="Industrial Fire">Industrial Fire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Fire Classification</label>
            <Select value={fireClass} onValueChange={setFireClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select fire class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Class A">Class A - Ordinary Combustibles</SelectItem>
                <SelectItem value="Class B">Class B - Flammable Liquids</SelectItem>
                <SelectItem value="Class C">Class C - Electrical</SelectItem>
                <SelectItem value="Class D">Class D - Combustible Metals</SelectItem>
                <SelectItem value="Class K">Class K - Cooking Oils</SelectItem>
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
              placeholder="Enter fire location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Property Type</label>
            <Input
              placeholder="e.g., 2-story residential house, warehouse"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Fire Description</label>
            <Textarea
              placeholder="Describe the fire incident"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* Fire Investigation */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2>Fire Investigation</h2>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Probable Cause</label>
            <Textarea
              placeholder="Describe the probable cause of fire"
              value={fireCause}
              onChange={(e) => setFireCause(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Point of Origin</label>
            <Input
              placeholder="Where did the fire start?"
              value={originPoint}
              onChange={(e) => setOriginPoint(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Estimated Damage (₱)</label>
            <Input
              type="number"
              placeholder="Enter amount in pesos"
              value={damageEstimate}
              onChange={(e) => setDamageEstimate(e.target.value)}
            />
          </div>
        </div>

        {/* Casualties & Response */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2>Casualties & Response</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Fatalities</label>
              <Input
                type="number"
                placeholder="Number of deaths"
                value={casualties}
                onChange={(e) => setCasualties(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">Injuries</label>
              <Input
                type="number"
                placeholder="Number of injured"
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Fire Suppression Actions</label>
            <Textarea
              placeholder="Describe firefighting operations and tactics used"
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Units Responded</label>
            <Input
              placeholder="Fire trucks and personnel count"
              value={unitsResponded}
              onChange={(e) => setUnitsResponded(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Water Used (Gallons)</label>
            <Input
              type="number"
              placeholder="Approximate water usage"
              value={waterUsed}
              onChange={(e) => setWaterUsed(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Fire Status</label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extinguished">Fire Extinguished</SelectItem>
                <SelectItem value="controlled">Fire Under Control</SelectItem>
                <SelectItem value="under-investigation">Under Investigation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Recommendations</label>
            <Textarea
              placeholder="Fire safety recommendations and follow-up actions"
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
            <label className="block mb-2 text-sm text-gray-500">Fire Officer Name & ID</label>
            <Input
              placeholder="Enter your name and ID number"
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
          className="w-full h-12 bg-orange-600 hover:bg-orange-700"
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
