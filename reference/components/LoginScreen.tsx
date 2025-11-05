import { useState, useEffect } from "react";
import { Eye, EyeOff, Fingerprint, Mail, Lock, AlertCircle, Wifi, WifiOff, ArrowLeft, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface LoginScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onLogin: (userType: 'citizen' | 'deskOfficer' | 'fieldOfficer' | 'admin', userData: any) => void;
}

export function LoginScreen({ onNavigate, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<string>(""); // citizen or responder
  const [unit, setUnit] = useState<string>(""); // pnp, pdrrmo, bfp
  const [role, setRole] = useState<string>(""); // desk, field, chief
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [useBiometric, setUseBiometric] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [accountTypeError, setAccountTypeError] = useState("");

  // Simulate biometric availability
  const [biometricAvailable] = useState(true);

  useEffect(() => {
    // Load remembered email from localStorage
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Cooldown timer
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

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

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    // Removed minimum length requirement for demo purposes
    setPasswordError("");
    return true;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) validateEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) validatePassword(value);
  };

  const getUserTypeFromRole = (roleValue: string): 'citizen' | 'deskOfficer' | 'fieldOfficer' | 'admin' => {
    if (accountType === 'citizen') return 'citizen';
    if (roleValue === 'desk') return 'deskOfficer';
    if (roleValue === 'field') return 'fieldOfficer';
    if (roleValue === 'chief') return 'admin';
    return 'citizen';
  };

  const getUserName = (): string => {
    if (accountType === 'citizen') return 'Juan Dela Cruz';
    
    const unitNames: { [key: string]: string } = {
      'pnp': 'PNP',
      'pdrrmo': 'PDRRMO',
      'bfp': 'BFP'
    };
    
    const roleNames: { [key: string]: string } = {
      'desk': 'Desk Officer',
      'field': 'Field Officer',
      'chief': 'Chief'
    };
    
    const surnames: { [key: string]: { [key: string]: string } } = {
      'pnp': { 'desk': 'Cruz', 'field': 'Santos', 'chief': 'Reyes' },
      'pdrrmo': { 'desk': 'Villanueva', 'field': 'Garcia', 'chief': 'Aquino' },
      'bfp': { 'desk': 'Ramos', 'field': 'Torres', 'chief': 'Mendoza' }
    };
    
    return `${unitNames[unit]} ${roleNames[role]} ${surnames[unit]?.[role] || ''}`;
  };

  const handleLogin = async () => {
    if (!isOnline) {
      setError("No internet connection. Please check your network and try again.");
      return;
    }

    if (cooldownTime > 0) {
      setError(`Too many failed attempts. Please wait ${cooldownTime} seconds.`);
      return;
    }

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    // Validate account type selection
    if (!accountType) {
      setAccountTypeError("Please select an account type");
      return;
    }
    
    // Validate unit and role for responders
    if (accountType === 'responder' && (!unit || !role)) {
      setAccountTypeError("Please select your unit and role");
      return;
    }
    
    setAccountTypeError("");

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate login API call
    setTimeout(() => {
      // Mock authentication logic - simplified to just check password
      const validPassword = '123';

      const isValidLogin = password === validPassword;

      if (isValidLogin) {
        // Successful login
        const userType = getUserTypeFromRole(role);
        const userName = getUserName();
        
        const userData = {
          email,
          name: userName,
          userType,
          unit: accountType === 'citizen' ? 'CITIZEN' : unit.toUpperCase()
        };

        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Reset attempts on successful login
        setAttempts(0);
        onLogin(userType, userData);
      } else {
        // Failed login
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setCooldownTime(30);
          setError("Too many failed attempts. Please wait 30 seconds before trying again.");
        } else {
          setError("Invalid email or password. Please try again.");
        }
      }

      setIsLoading(false);
    }, 1500);
  };

  const handleBiometricLogin = () => {
    if (!biometricAvailable) {
      setError("Biometric authentication is not available on this device.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate biometric authentication
    setTimeout(() => {
      // Mock successful biometric login for demo
      const userData = {
        email: 'citizen@test.com',
        name: 'Juan Dela Cruz',
        userType: 'citizen' as const
      };
      
      onLogin('citizen', userData);
      setIsLoading(false);
    }, 2000);
  };

  const isFormValid = email && password && accountType && 
    (accountType === 'citizen' || (unit && role)) && 
    !emailError && !passwordError && !accountTypeError;
  const isSubmitDisabled = !isFormValid || isLoading || cooldownTime > 0 || !isOnline;

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="text-center">
          <h1 className="text-green-700 mb-1">iReport Camarines Norte</h1>
          <p className="text-sm text-gray-600">Public Safety Incident Reporting</p>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-center mb-6">Sign In</h2>

            {/* Offline Indicator */}
            {!isOnline && (
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mb-4 flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800">Offline Mode. Try Again Later</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="ml-auto text-orange-600 hover:text-orange-700"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Account Type Selection */}
              <div>
                <label htmlFor="accountType" className="block mb-2">I am a...</label>
                <Select value={accountType} onValueChange={(value) => {
                  setAccountType(value);
                  if (value === 'citizen') {
                    setUnit('');
                    setRole('');
                  }
                }}>
                  <SelectTrigger 
                    className={`h-12 ${accountTypeError ? 'border-red-500 focus:border-red-500' : ''}`}
                    aria-label="Select account type"
                  >
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">Citizen</SelectItem>
                    <SelectItem value="responder">Emergency Responder</SelectItem>
                  </SelectContent>
                </Select>
                {accountTypeError && (
                  <p className="text-sm text-red-600 mt-1" role="alert">
                    {accountTypeError}
                  </p>
                )}
              </div>

              {/* Unit and Role Selection - Only for Responders */}
              {accountType === 'responder' && (
                <>
                  <div>
                    <label htmlFor="unit" className="block mb-2">Emergency Unit</label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger className="h-12" aria-label="Select unit">
                        <SelectValue placeholder="Select your unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pnp">PNP (Philippine National Police)</SelectItem>
                        <SelectItem value="bfp">BFP (Bureau of Fire Protection)</SelectItem>
                        <SelectItem value="pdrrmo">PDRRMO (Disaster Management)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="role" className="block mb-2">Your Role</label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="h-12" aria-label="Select role">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desk">Desk Officer</SelectItem>
                        <SelectItem value="field">Field Officer</SelectItem>
                        <SelectItem value="chief">Chief/Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`pl-10 h-12 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                    aria-label="Email input field"
                    aria-describedby={emailError ? "email-error" : undefined}
                  />
                </div>
                {emailError && (
                  <p id="email-error" className="text-sm text-red-600 mt-1" role="alert">
                    {emailError}
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
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`pl-10 pr-10 h-12 ${passwordError ? 'border-red-500 focus:border-red-500' : ''}`}
                    aria-label="Password input field"
                    aria-describedby={passwordError ? "password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {passwordError && (
                  <p id="password-error" className="text-sm text-red-600 mt-1" role="alert">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Biometric Option */}
              {biometricAvailable && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-blue-600" />
                    <label htmlFor="biometric" className="text-sm">Use Biometric</label>
                  </div>
                  <Switch
                    id="biometric"
                    checked={useBiometric}
                    onCheckedChange={setUseBiometric}
                    aria-label="Enable biometric authentication"
                  />
                </div>
              )}

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Remember Me
                </label>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                disabled={isSubmitDisabled}
                className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  "Log In"
                )}
              </Button>

              {/* Biometric Login Button */}
              {useBiometric && biometricAvailable && (
                <Button
                  onClick={handleBiometricLogin}
                  disabled={isLoading || !isOnline}
                  variant="outline"
                  className="w-full h-12 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Fingerprint className="w-4 h-4 mr-2" />
                  {isLoading ? "Authenticating..." : "Login with Biometric"}
                </Button>
              )}

              {/* Bottom Links */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="link"
                  onClick={() => onNavigate('forgotPassword')}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  Forgot Password?
                </Button>
                <Button
                  variant="link"
                  onClick={() => onNavigate('signUp')}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 mb-2">Demo Login Instructions:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>1. Choose: Citizen or Emergency Responder</p>
              <p>2. If responder, select your unit and role</p>
              <p>3. Enter any email address</p>
              <p>4. Password: <span className="font-semibold">123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}