import { AlertTriangle, ArrowLeft, MapPin, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

interface NoGPSScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function NoGPSScreen({ onNavigate }: NoGPSScreenProps) {
  const [manualLocation, setManualLocation] = useState("");

  const handleUseLocation = () => {
    if (manualLocation.trim()) {
      onNavigate('incidentForm', { location: manualLocation });
    }
  };

  const handleRetryGPS = () => {
    // Simulate GPS retry
    setTimeout(() => {
      onNavigate('incidentForm', { location: "14.5995° N, 120.9842° E" });
    }, 1000);
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
        <h1 className="flex-1">Location Required</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-center">
        <div className="text-center mb-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-red-600 mb-2">GPS Not Enabled</h2>
          <p className="text-gray-600 mb-4">
            Location access is required to submit incident reports. 
            Please enable GPS or enter your location manually.
          </p>
        </div>

        <div className="space-y-4">
          {/* Manual Location Input */}
          <div className="bg-white rounded-lg p-4">
            <label className="block mb-3">Enter Location Manually</label>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Street address, landmark, or description"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                className="h-12"
                aria-label="Manual location input"
              />
              <Button
                onClick={handleUseLocation}
                disabled={!manualLocation.trim()}
                className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use This Location
              </Button>
            </div>
          </div>

          {/* GPS Options */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="mb-3">Enable GPS</h3>
            <div className="space-y-2">
              <Button
                onClick={handleRetryGPS}
                variant="outline"
                className="w-full h-12"
              >
                <Settings className="w-4 h-4 mr-2" />
                Retry GPS Detection
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Go to Settings &gt; Privacy &gt; Location Services to enable GPS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}