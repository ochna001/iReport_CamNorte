import { WifiOff, ArrowLeft, RefreshCw, Save } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface NoInternetScreenProps {
  onNavigate: (screen: string) => void;
  reportData?: any;
}

export function NoInternetScreen({ onNavigate, reportData }: NoInternetScreenProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    
    // Simulate retry attempt
    setTimeout(() => {
      setIsRetrying(false);
      // Simulate successful connection
      if (Math.random() > 0.5) {
        onNavigate('confirmation', reportData);
      }
    }, 2000);
  };

  const handleSaveOffline = () => {
    // Simulate saving offline
    onNavigate('home');
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
        <h1 className="flex-1">Connection Issue</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-center">
        <div className="text-center mb-8">
          <WifiOff className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-orange-600 mb-2">No Internet Connection</h2>
          <p className="text-gray-600 mb-4">
            Unable to submit your report right now. Your report has been saved locally 
            and will be submitted automatically when connection is restored.
          </p>
        </div>

        {/* Report Preview */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Save className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Report Saved Locally</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Type:</span>
              <span className="capitalize">{reportData?.type || "Crime"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Photo:</span>
              <span>Attached</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Location:</span>
              <span>GPS Recorded</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            {isRetrying ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Retrying...
              </div>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </>
            )}
          </Button>

          <Button
            onClick={handleSaveOffline}
            variant="outline"
            className="w-full h-12"
          >
            Continue Offline
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 text-center">
            💡 Your report will sync automatically when internet is available
          </p>
        </div>
      </div>
    </div>
  );
}