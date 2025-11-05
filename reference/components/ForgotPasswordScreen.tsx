import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ForgotPasswordScreenProps {
  onNavigate: (screen: string) => void;
}

export function ForgotPasswordScreen({ onNavigate }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) validateEmail(value);
  };

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      // Mock database check - simulate that some emails exist
      const existingEmails = [
        'citizen@test.com',
        'officer@camarinesnorte.gov.ph',
        'admin@lgucamarinesnorte.gov.ph',
        'test@example.com',
        'user@camarinesnorte.com'
      ];

      const emailExists = existingEmails.includes(email.toLowerCase());

      if (emailExists) {
        setIsSuccess(true);
      } else {
        setError("No account found with this email address.");
      }

      setIsLoading(false);
    }, 2000);
  };

  const handleBackToLogin = () => {
    onNavigate('login');
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col h-full bg-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToLogin}
            className="mr-2"
            aria-label="Go back to login"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="flex-1">Reset Password</h1>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-green-800 mb-2">Email Sent!</h2>
                <p className="text-gray-600">
                  A password reset link has been sent to:
                </p>
                <p className="text-green-700 mt-2">{email}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Check your email and click the reset link to create a new password.
                  </p>
                </div>

                <Button
                  onClick={handleBackToLogin}
                  className="w-full h-12 bg-green-600 hover:bg-green-700"
                >
                  Back to Login
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  className="w-full h-12"
                >
                  Send Another Email
                </Button>
              </div>
            </div>

            {/* Additional Help */}
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800 mb-1">Didn't receive the email?</p>
              <p className="text-xs text-yellow-700">
                Check your spam folder or contact support if the issue persists.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToLogin}
          className="mr-2"
          aria-label="Go back to login"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="flex-1">Reset Password</h1>
      </div>

      {/* Reset Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <h2 className="mb-2">Forgot Your Password?</h2>
              <p className="text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="reset-email" className="block mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`pl-10 h-12 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                    aria-label="Email address for password reset"
                    aria-describedby={emailError ? "email-error" : "email-help"}
                  />
                </div>
                {emailError && (
                  <p id="email-error" className="text-sm text-red-600 mt-1" role="alert">
                    {emailError}
                  </p>
                )}
                {!emailError && (
                  <p id="email-help" className="text-xs text-gray-500 mt-1">
                    Enter the email address associated with your account
                  </p>
                )}
              </div>

              {/* Reset Button */}
              <Button
                onClick={handleResetPassword}
                disabled={!email || !!emailError || isLoading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Reset Link...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>

              {/* Back to Login */}
              <div className="text-center pt-2">
                <Button
                  variant="link"
                  onClick={handleBackToLogin}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 mb-1">Need help?</p>
            <p className="text-xs text-blue-700">
              Contact LGU Camarines Norte support if you're having trouble accessing your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}