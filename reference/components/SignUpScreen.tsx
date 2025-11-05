import { useState } from "react";
import { ArrowLeft, User, Phone, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SignUpScreenProps {
  onNavigate: (screen: string) => void;
}

export function SignUpScreen({ onNavigate }: SignUpScreenProps) {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = "Full name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else {
          delete newErrors.name;
        }
        break;

      case 'contact':
        const phoneRegex = /^(\+63|0)[0-9]{10}$/;
        if (!value) {
          newErrors.contact = "Contact number is required";
        } else if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          newErrors.contact = "Please enter a valid Philippine phone number";
        } else {
          delete newErrors.contact;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = "Email is required";
        } else if (!emailRegex.test(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = "Password must contain at least one uppercase, lowercase, and number";
        } else {
          delete newErrors.password;
        }

        // Re-validate confirm password if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        } else if (formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate on blur or if there's already an error
    if (errors[field]) {
      validateField(field, value);
    }
  };

  const handleInputBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as Philippine number
    if (digits.startsWith('63')) {
      return '+' + digits;
    } else if (digits.startsWith('0')) {
      return digits;
    } else if (digits.length <= 10) {
      return '0' + digits;
    }
    
    return value;
  };

  const handleContactChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('contact', formatted);
  };

  const validateAllFields = () => {
    const fields = ['name', 'contact', 'email', 'password', 'confirmPassword'];
    let isValid = true;

    fields.forEach(field => {
      const fieldValue = formData[field as keyof typeof formData];
      if (!validateField(field, fieldValue)) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateAllFields()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Mock account creation
      const existingEmails = ['citizen@test.com', 'admin@lgucamarinesnorte.gov.ph'];
      
      if (existingEmails.includes(formData.email.toLowerCase())) {
        setErrors({ email: "An account with this email already exists" });
        setIsLoading(false);
        return;
      }

      // Success - navigate to OTP verification
      onNavigate('otpVerification', { 
        email: formData.email, 
        signupData: formData 
      });
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
          <h1 className="flex-1">Account Created</h1>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-green-800 mb-2">Welcome to iReport!</h2>
                <p className="text-gray-600">
                  Your account has been successfully created.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2">Account Details:</p>
                  <div className="text-xs text-green-700 space-y-1">
                    <p>Name: {formData.name}</p>
                    <p>Email: {formData.email}</p>
                    <p>Contact: {formData.contact}</p>
                  </div>
                </div>

                <Button
                  onClick={handleBackToLogin}
                  className="w-full h-12 bg-green-600 hover:bg-green-700"
                >
                  Continue to Login
                </Button>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800 mb-1">Next Steps:</p>
              <p className="text-xs text-blue-700">
                Log in to start reporting incidents and help make Camarines Norte safer.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFormValid = Object.keys(errors).length === 0 && 
    Object.values(formData).every(value => value.trim() !== '');

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
        <h1 className="flex-1">Create Account</h1>
      </div>

      {/* Sign Up Form */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <h2 className="mb-2">Join iReport</h2>
              <p className="text-sm text-gray-600">
                Create your account to start reporting incidents
              </p>
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={(e) => handleInputBlur('name', e.target.value)}
                    className={`pl-10 h-12 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                    aria-label="Full name input field"
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                </div>
                {errors.name && (
                  <p id="name-error" className="text-sm text-red-600 mt-1" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Contact Field */}
              <div>
                <label htmlFor="contact" className="block mb-2">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="contact"
                    type="tel"
                    placeholder="09XX XXX XXXX"
                    value={formData.contact}
                    onChange={(e) => handleContactChange(e.target.value)}
                    onBlur={(e) => handleInputBlur('contact', e.target.value)}
                    className={`pl-10 h-12 ${errors.contact ? 'border-red-500 focus:border-red-500' : ''}`}
                    aria-label="Contact number input field"
                    aria-describedby={errors.contact ? "contact-error" : undefined}
                  />
                </div>
                {errors.contact && (
                  <p id="contact-error" className="text-sm text-red-600 mt-1" role="alert">
                    {errors.contact}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => handleInputBlur('email', e.target.value)}
                    className={`pl-10 h-12 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    aria-label="Email address input field"
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600 mt-1" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={(e) => handleInputBlur('password', e.target.value)}
                    className={`pl-10 pr-10 h-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    aria-label="Password input field"
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-600 mt-1" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={(e) => handleInputBlur('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 h-12 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                    aria-label="Confirm password input field"
                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="text-sm text-red-600 mt-1" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Sign Up Button */}
              <Button
                onClick={handleSignUp}
                disabled={!isFormValid || isLoading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Back to Login */}
              <div className="text-center pt-2">
                <span className="text-sm text-gray-600">Already have an account? </span>
                <Button
                  variant="link"
                  onClick={handleBackToLogin}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              By creating an account, you agree to iReport's terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}