import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { Shield, Users, Smartphone, Zap } from "lucide-react";

interface LandingScreenProps {
  onNavigate: (screen: string) => void;
}

export function LandingScreen({ onNavigate }: LandingScreenProps) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-green-600 to-green-700 text-white">
      {/* Header with Logo */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-8">
          <Logo size="lg" variant="white" />
        </div>
        
        <h1 className="mb-4 max-w-sm">
          Your Safety, Our Priority
        </h1>
        
        <p className="text-green-100 mb-8 max-w-sm">
          Report incidents instantly with our camera-first approach. Get help from emergency responders in Camarines Norte.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Quick Reporting</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Shield className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Verified Response</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Smartphone className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Camera First</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Track Reports</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-8 space-y-3">
        <Button
          onClick={() => onNavigate('login')}
          className="w-full h-12 bg-white text-green-600 hover:bg-gray-100"
        >
          Get Started
        </Button>
        <Button
          onClick={() => onNavigate('signUp')}
          variant="outline"
          className="w-full h-12 bg-transparent border-2 border-white text-white hover:bg-white/10"
        >
          Create Account
        </Button>
      </div>

      {/* Footer */}
      <div className="pb-6 text-center">
        <p className="text-xs text-green-100">
          Emergency Hotline: 911
        </p>
      </div>
    </div>
  );
}
