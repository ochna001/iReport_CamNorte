import { X, Check, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface CameraScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function CameraScreen({ onNavigate }: CameraScreenProps) {
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);

  const handleTakePhoto = () => {
    // Simulate taking a photo
    setPhotoTaken(true);
    setPhotoData("data:image/jpeg;base64,mockphotodata");
  };

  const handleConfirm = () => {
    onNavigate('incidentForm', { photo: photoData });
  };

  const handleCancel = () => {
    onNavigate('home');
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full"
          aria-label="Cancel"
        >
          <X className="w-6 h-6" />
        </Button>
        
        {photoTaken && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleConfirm}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full"
            aria-label="Confirm photo"
          >
            <Check className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        {!photoTaken ? (
          <div className="text-center">
            <Camera className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg">
              <p className="font-semibold">Take a photo of the incident</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-48 h-48 bg-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-400">Photo Preview</span>
              </div>
              <p>Photo captured successfully</p>
            </div>
          </div>
        )}
      </div>

      {/* Capture Button */}
      {!photoTaken && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={handleTakePhoto}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 border-4 border-white"
            size="icon"
            aria-label="Take photo"
          >
            <Camera className="w-8 h-8 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
}