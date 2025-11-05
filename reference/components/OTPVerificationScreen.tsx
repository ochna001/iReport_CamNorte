import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface OTPVerificationScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  email?: string;
  signupData?: any;
}

export function OTPVerificationScreen({ onNavigate, email, signupData }: OTPVerificationScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate OTP verification
    setTimeout(() => {
      // Mock OTP validation - in real app this would call an API
      const validOTPs = ['123456', '000000', '111111']; // Demo OTPs
      
      if (validOTPs.includes(otpString)) {
        // Success - account is now verified
        onNavigate('otpSuccess', { email, signupData });
      } else {
        setError("Invalid OTP. Please check and try again.");
        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
      
      setIsLoading(false);
    }, 2000);
  };

  const handleResendOTP = async () => {
    if (!canResend || resendCooldown > 0) return;

    setIsResending(true);
    setError("");

    // Simulate resending OTP
    setTimeout(() => {
      // Reset timer and cooldown
      setTimeLeft(300);
      setCanResend(false);
      setResendCooldown(60); // 1 minute cooldown before next resend
      setIsResending(false);
      
      // Clear current OTP
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }, 1500);
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('signUp')}
          className="mr-2"
          aria-label="Go back to sign up"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="flex-1">Verify Your Email</h1>
      </div>

      {/* OTP Verification Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="mb-2">Enter Verification Code</h2>
              <p className="text-sm text-gray-600 mb-2">
                We've sent a 6-digit code to:
              </p>
              <p className="text-sm text-blue-600 mb-4">{email}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            {/* OTP Input Fields */}
            <div className="space-y-4">
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-medium border-2 focus:border-blue-500"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-600">
                    Code expires in <span className="font-medium text-orange-600">{formatTime(timeLeft)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600">Code has expired. Please request a new one.</p>
                )}
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerifyOTP}
                disabled={!isOtpComplete || isLoading || timeLeft === 0}
                className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify Code"
                )}
              </Button>

              {/* Resend Code */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                <Button
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={!canResend || resendCooldown > 0 || isResending}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto disabled:text-gray-400"
                >
                  {isResending ? (
                    <div className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Sending...
                    </div>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${formatTime(resendCooldown)}`
                  ) : (
                    "Resend Code"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 mb-1">Demo OTP Codes:</p>
            <p className="text-xs text-blue-700">
              Use 123456, 000000, or 111111 for testing
            </p>
          </div>

          {/* Troubleshooting */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800 mb-1">Not receiving codes?</p>
            <p className="text-xs text-yellow-700">
              Check your spam folder or contact support if issues persist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}