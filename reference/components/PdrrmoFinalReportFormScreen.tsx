import { ArrowLeft, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

interface PdrrmoFinalReportFormScreenProps {
  onNavigate: (screen: string) => void;
  reportData?: any;
}

export function PdrrmoFinalReportFormScreen({ onNavigate, reportData }: PdrrmoFinalReportFormScreenProps) {
  const [incidentType, setIncidentType] = useState(reportData?.type || "Vehicle Accident");
  const [caseNumber, setCaseNumber] = useState(reportData?.id || "");
  const [dateOccurred, setDateOccurred] = useState(reportData?.date?.split(' ')[0] || "");
  const [timeOccurred, setTimeOccurred] = useState("");
  const [location, setLocation] = useState(reportData?.location || "");
  const [description, setDescription] = useState(reportData?.description || "");
  const [affectedAreas, setAffectedAreas] = useState("");
  const [casualties, setCasualties] = useState("");
  const [injuries, setInjuries] = useState("");
  const [missing, setMissing] = useState("");
  const [displaced, setDisplaced] = useState("");
  const [vehiclesInvolved, setVehiclesInvolved] = useState("");
  const [propertyDamage, setPropertyDamage] = useState("");
  const [damageEstimate, setDamageEstimate] = useState(reportData?.damageEstimate || "");
  const [responseActions, setResponseActions] = useState("");
  const [unitsDeployed, setUnitsDeployed] = useState("");
  const [evacuationCenters, setEvacuationCenters] = useState("");
  const [assistanceProvided, setAssistanceProvided] = useState("");
  const [outcome, setOutcome] = useState(reportData?.outcome || reportData?.status || "");
  const [recommendations, setRecommendations] = useState("");
  const [officerName, setOfficerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onNavigate('pdrrmoFinalReports');
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
            onClick={() => onNavigate('pdrrmoFinalReports')}
            className="mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="flex-1">PDRRMO Final Report Form</h1>
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
                <SelectItem value="Vehicle Accident">Vehicle Accident</SelectItem>
                <SelectItem value="Natural Disaster">Natural Disaster</SelectItem>
                <SelectItem value="Medical Emergency">Medical Emergency</SelectItem>
                <SelectItem value="Flooding">Flooding</SelectItem>
                <SelectItem value="Landslide">Landslide</SelectItem>
                <SelectItem value="Typhoon">Typhoon</SelectItem>
                <SelectItem value="Earthquake">Earthquake</SelectItem>
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

          <div>
            <label className="block mb-2 text-sm text-gray-500">Affected Areas/Barangays</label>
            <Textarea
              placeholder="List all affected areas"
              value={affectedAreas}
              onChange={(e) => setAffectedAreas(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
        </div>

        {/* Impact Assessment */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2>Impact Assessment</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Fatalities</label>
              <Input
                type="number"
                placeholder="0"
                value={casualties}
                onChange={(e) => setCasualties(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">Injuries</label>
              <Input
                type="number"
                placeholder="0"
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Missing</label>
              <Input
                type="number"
                placeholder="0"
                value={missing}
                onChange={(e) => setMissing(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">Displaced Persons</label>
              <Input
                type="number"
                placeholder="0"
                value={displaced}
                onChange={(e) => setDisplaced(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Vehicles Involved (if applicable)</label>
            <Input
              placeholder="Number and type of vehicles"
              value={vehiclesInvolved}
              onChange={(e) => setVehiclesInvolved(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Property Damage</label>
            <Textarea
              placeholder="Describe damaged properties, houses, infrastructure"
              value={propertyDamage}
              onChange={(e) => setPropertyDamage(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Estimated Damage Cost (₱)</label>
            <Input
              type="number"
              placeholder="Enter amount in pesos"
              value={damageEstimate}
              onChange={(e) => setDamageEstimate(e.target.value)}
            />
          </div>
        </div>

        {/* Response Operations */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2>Response Operations</h2>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Response Actions Taken</label>
            <Textarea
              placeholder="Describe rescue operations, medical response, evacuations"
              value={responseActions}
              onChange={(e) => setResponseActions(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Units/Teams Deployed</label>
            <Input
              placeholder="List responding units and personnel"
              value={unitsDeployed}
              onChange={(e) => setUnitsDeployed(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Evacuation Centers Used</label>
            <Textarea
              placeholder="List evacuation centers and number of evacuees"
              value={evacuationCenters}
              onChange={(e) => setEvacuationCenters(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Assistance Provided</label>
            <Textarea
              placeholder="Relief goods, medical aid, temporary shelter, etc."
              value={assistanceProvided}
              onChange={(e) => setAssistanceProvided(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Current Status</label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resolved">Incident Resolved</SelectItem>
                <SelectItem value="ongoing">Response Ongoing</SelectItem>
                <SelectItem value="monitoring">Post-Incident Monitoring</SelectItem>
                <SelectItem value="recovery">Recovery Phase</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Recommendations</label>
            <Textarea
              placeholder="Recommendations for disaster preparedness and mitigation"
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
            <label className="block mb-2 text-sm text-gray-500">PDRRMO Officer Name & ID</label>
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
          className="w-full h-12 bg-red-600 hover:bg-red-700"
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
