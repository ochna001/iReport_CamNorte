import { CheckCircle, User, Mail, Phone } from "lucide-react";
import { Button } from "./ui/button";

interface OTPSuccessScreenProps {
  onNavigate: (screen: string) => void;
  email?: string;
  signupData?: any;
}

export function OTPSuccessScreen({ onNavigate, email, signupData }: OTPSuccessScreenProps) {
  const handleContinueToLogin = () => {
    onNavigate('login');
  };

  return (
    <div className="flex flex-col h-full bg-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-center text-green-700">Account Verified!</h1>
      </div>

      {/* Success Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              <h2 className="text-green-800 mb-2">Welcome to iReport!</h2>
              <p className="text-green-700 mb-4">
                Your account has been successfully verified and activated.
              </p>
            </div>

            {/* Account Summary */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm text-green-800 mb-3">Account Details:</h3>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">{signupData?.name || 'User'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">{email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">{signupData?.contact || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinueToLogin}
              className="w-full h-12 bg-green-600 hover:bg-green-700"
            >
              Continue to Login
            </Button>
          </div>

          {/* What's Next */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm text-blue-800 mb-2">What's Next?</h3>
            <div className="text-xs text-blue-700 space-y-1 text-left">
              <p>• Log in to access the incident reporting system</p>
              <p>• Report incidents quickly with photo evidence</p>
              <p>• Track your report status in real-time</p>
              <p>• Help make Camarines Norte safer</p>
            </div>
          </div>

          {/* Support */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              Need help? Contact LGU Camarines Norte support for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}