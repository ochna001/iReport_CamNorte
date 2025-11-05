import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

interface CallVerificationScreenProps {
  onNavigate: (screen: string) => void;
  incidentData?: any;
}

export function CallVerificationScreen({ onNavigate, incidentData }: CallVerificationScreenProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);

  const incident = incidentData || {
    id: "IR-ABC123",
    reporterName: "Juan Dela Cruz",
    reporterPhone: "+63 912 345 6789",
    type: "Crime"
  };

  useEffect(() => {
    // Simulate connection attempt
    const connectTimer = setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConnected) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setIsConnected(false);
    onNavigate('assignedIncidents');
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  if (isConnecting) {
    return (
      <div className="flex flex-col h-full bg-gray-900">
        {/* Header */}
        <div className="bg-black/50 p-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('assignedIncidents')}
            className="mr-2 text-white hover:bg-white/20"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-white">Connecting...</h1>
        </div>

        {/* Connecting Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <Phone className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-white mb-2">Calling {incident.reporterName}</h2>
          <p className="text-gray-300 mb-6">{incident.reporterPhone}</p>
          
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300">Connecting via WebRTC...</p>
          
          <div className="mt-8">
            <Button
              onClick={() => onNavigate('assignedIncidents')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full"
            >
              Cancel Call
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="bg-black/50 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEndCall}
            className="mr-2 text-white hover:bg-white/20"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-white">
            <h1>{incident.reporterName}</h1>
            <p className="text-sm text-gray-300">#{incident.id}</p>
          </div>
        </div>
        <div className="text-white text-right">
          <p className="text-lg">{formatDuration(callDuration)}</p>
          <p className="text-sm text-green-400">Connected</p>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          {isVideoOn ? (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Video className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-white">Video Call Active</p>
              <p className="text-gray-300 text-sm">Reporter: {incident.reporterName}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-white">Voice Call</p>
              <p className="text-gray-300 text-sm">Reporter: {incident.reporterName}</p>
            </div>
          )}
        </div>

        {/* Local Video Preview */}
        {isVideoOn && (
          <div className="absolute top-4 right-4 w-24 h-32 bg-gray-700 rounded-lg border-2 border-white flex items-center justify-center">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="bg-black/80 p-6">
        <div className="flex items-center justify-center gap-6">
          {/* Mute Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleMute}
            className={`w-14 h-14 rounded-full ${
              isMuted 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          {/* End Call Button */}
          <Button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white"
            aria-label="End call"
          >
            <PhoneOff className="w-8 h-8" />
          </Button>

          {/* Video Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleVideo}
            className={`w-14 h-14 rounded-full ${
              isVideoOn 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
            aria-label={isVideoOn ? "Turn off video" : "Turn on video"}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>
        </div>

        {/* Fallback Info */}
        <div className="mt-4 text-center">
          <p className="text-gray-300 text-sm">
            Fallback: Manual dial {incident.reporterPhone}
          </p>
        </div>
      </div>
    </div>
  );
}