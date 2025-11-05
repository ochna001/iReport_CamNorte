import { CheckCircle, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface ConfirmationScreenProps {
  onNavigate: (screen: string) => void;
  reportData?: {
    id: string;
    type: string;
    description?: string;
    location: string;
    timestamp: string;
    date: string;
    time: string;
    status: string;
  };
}

export function ConfirmationScreen({ onNavigate, reportData }: ConfirmationScreenProps) {
  return (
    <div className="flex flex-col h-full bg-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('home')}
          className="mr-2"
          aria-label="Go back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="flex-1">Report Submitted</h1>
      </div>

      {/* Success Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
          <h2 className="text-green-800 mb-2">Report Submitted!</h2>
          <p className="text-green-700">ID: #{reportData?.id}</p>
        </div>

        {/* Report Details */}
        <div className="bg-white rounded-lg p-4 w-full max-w-sm mb-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="capitalize">{reportData?.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date & Time</p>
              <p>{reportData?.date}</p>
              <p className="text-sm text-gray-600">{reportData?.time}</p>
            </div>
            {reportData?.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm">{reportData.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-orange-600">{reportData?.status}</p>
            </div>
          </div>
        </div>

        {/* Location Map Preview */}
        <div className="bg-white rounded-lg p-4 w-full max-w-sm mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Incident Location</span>
          </div>
          <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-6 h-6 text-red-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Map Preview</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{reportData?.location}</p>
        </div>

        {/* Track Status Button */}
        <Button
          onClick={() => onNavigate('myReports')}
          className="w-full max-w-sm h-12 bg-blue-600 hover:bg-blue-700"
        >
          Track Status
        </Button>
      </div>
    </div>
  );
}