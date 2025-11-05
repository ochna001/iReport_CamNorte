import { useState } from "react";
import { Button } from "./components/ui/button";
import { HomeScreen } from "./components/HomeScreen";
import { CameraScreen } from "./components/CameraScreen";
import { IncidentFormScreen } from "./components/IncidentFormScreen";
import { ConfirmationScreen } from "./components/ConfirmationScreen";
import { NoGPSScreen } from "./components/NoGPSScreen";
import { NoInternetScreen } from "./components/NoInternetScreen";
import { MyReportsScreen } from "./components/MyReportsScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { PendingIncidentsScreen } from "./components/PendingIncidentsScreen";
import { AssignedIncidentsScreen } from "./components/AssignedIncidentsScreen";
import { ResponderIncidentDetailsScreen } from "./components/ResponderIncidentDetailsScreen";
import { CallVerificationScreen } from "./components/CallVerificationScreen";
import { AdminDashboardScreen } from "./components/AdminDashboardScreen";
import { AdminIncidentDetailsScreen } from "./components/AdminIncidentDetailsScreen";
import { LoginScreen } from "./components/LoginScreen";
import { ForgotPasswordScreen } from "./components/ForgotPasswordScreen";
import { SignUpScreen } from "./components/SignUpScreen";
import { OTPVerificationScreen } from "./components/OTPVerificationScreen";
import { OTPSuccessScreen } from "./components/OTPSuccessScreen";
import { DeskOfficerFormScreen } from "./components/DeskOfficerFormScreen";
import { LandingScreen } from "./components/LandingScreen";
import { PdrrmoIncidentFormScreen } from "./components/PdrrmoIncidentFormScreen";
import { BfpIncidentFormScreen } from "./components/BfpIncidentFormScreen";
import { PnpIncidentFormScreen } from "./components/PnpIncidentFormScreen";
import { BottomNav } from "./components/BottomNav";
import { PnpFinalReportScreen } from "./components/PnpFinalReportScreen";
import { BfpFinalReportScreen } from "./components/BfpFinalReportScreen";
import { PdrrmoFinalReportScreen } from "./components/PdrrmoFinalReportScreen";
import { PnpActiveIncidentScreen } from "./components/PnpActiveIncidentScreen";
import { BfpActiveIncidentScreen } from "./components/BfpActiveIncidentScreen";
import { PdrrmoActiveIncidentScreen } from "./components/PdrrmoActiveIncidentScreen";
import { ScreenNavigator } from "./components/ScreenNavigator";
import { PnpFinalReportFormScreen } from "./components/PnpFinalReportFormScreen";
import { BfpFinalReportFormScreen } from "./components/BfpFinalReportFormScreen";
import { PdrrmoFinalReportFormScreen } from "./components/PdrrmoFinalReportFormScreen";

type Screen = 
  | 'landing'
  | 'login'
  | 'forgotPassword'
  | 'signUp'
  | 'otpVerification'
  | 'otpSuccess'
  | 'home' 
  | 'camera' 
  | 'incidentForm'
  | 'pdrrmoForm'
  | 'bfpForm'
  | 'pnpForm'
  | 'confirmation' 
  | 'noGPS' 
  | 'noInternet'
  | 'myReports'
  | 'profile'
  | 'pendingIncidents'
  | 'assignedIncidents'
  | 'responderIncidentDetails'
  | 'callVerification'
  | 'deskOfficerForm'
  | 'adminDashboard'
  | 'adminIncidentDetails'
  | 'finalReports'
  | 'pnpFinalReports'
  | 'bfpFinalReports'
  | 'pdrrmoFinalReports'
  | 'activeIncident'
  | 'pnpActiveIncident'
  | 'bfpActiveIncident'
  | 'pdrrmoActiveIncident'
  | 'screenNavigator'
  | 'pnpFinalReportForm'
  | 'bfpFinalReportForm'
  | 'pdrrmoFinalReportForm';

interface AppData {
  photo?: string;
  reportData?: any;
  location?: string;
  incident?: any;
}

interface UserData {
  email: string;
  name: string;
  userType: 'citizen' | 'deskOfficer' | 'fieldOfficer' | 'admin';
  unit?: string; // PNP, PDRRMO, BFP, or CITIZEN
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userType, setUserType] = useState<'citizen' | 'deskOfficer' | 'fieldOfficer' | 'admin'>('citizen');
  const [appData, setAppData] = useState<AppData>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Simulate random connectivity and GPS issues for demonstration
  const simulateConnectivityIssues = () => {
    const random = Math.random();
    if (random < 0.1) return 'noInternet'; // 10% chance
    if (random < 0.2) return 'noGPS'; // 10% chance  
    return null;
  };

  const handleLogin = (userType: 'citizen' | 'deskOfficer' | 'fieldOfficer' | 'admin', userData: UserData) => {
    setIsAuthenticated(true);
    setUserData(userData);
    setUserType(userType);
    
    // Route to appropriate home screen based on user type
    switch (userType) {
      case 'citizen':
        setCurrentScreen('home');
        break;
      case 'deskOfficer':
        setCurrentScreen('pendingIncidents');
        break;
      case 'fieldOfficer':
        setCurrentScreen('assignedIncidents');
        break;
      case 'admin':
        setCurrentScreen('adminDashboard');
        break;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    setCurrentScreen('landing');
    setAppData({});
  };

  const handleNavigate = (screen: Screen, data?: any) => {
    // Handle special navigation logic
    if (screen === 'incidentForm' && data?.photo) {
      // Check for connectivity issues when navigating to form
      const issue = simulateConnectivityIssues();
      if (issue) {
        setCurrentScreen(issue as Screen);
        setAppData({ ...appData, ...data, reportData: data });
        return;
      }
    }
    
    // Route to unit-specific screens based on user's unit
    if (screen === 'finalReports' && userData?.unit) {
      const unitScreen = `${userData.unit.toLowerCase()}FinalReports` as Screen;
      setCurrentScreen(unitScreen);
      return;
    }
    
    if (screen === 'activeIncident' && userData?.unit) {
      const unitScreen = `${userData.unit.toLowerCase()}ActiveIncident` as Screen;
      setCurrentScreen(unitScreen);
      return;
    }
    
    if (data) {
      setAppData({ ...appData, ...data });
    }
    
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingScreen onNavigate={handleNavigate} />;
      
      case 'login':
        return (
          <LoginScreen 
            onNavigate={handleNavigate} 
            onLogin={handleLogin}
          />
        );
      
      case 'forgotPassword':
        return <ForgotPasswordScreen onNavigate={handleNavigate} />;
      
      case 'signUp':
        return <SignUpScreen onNavigate={handleNavigate} />;
      
      case 'otpVerification':
        return (
          <OTPVerificationScreen 
            onNavigate={handleNavigate}
            email={appData.email}
            signupData={appData.signupData}
          />
        );
      
      case 'otpSuccess':
        return (
          <OTPSuccessScreen 
            onNavigate={handleNavigate}
            email={appData.email}
            signupData={appData.signupData}
          />
        );
      
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      
      case 'camera':
        return <CameraScreen onNavigate={handleNavigate} />;
      
      case 'incidentForm':
        return (
          <IncidentFormScreen 
            onNavigate={handleNavigate} 
            photoData={appData.photo}
          />
        );
      
      case 'pdrrmoForm':
        return (
          <PdrrmoIncidentFormScreen 
            onNavigate={handleNavigate} 
            photoData={appData.photo}
          />
        );
      
      case 'bfpForm':
        return (
          <BfpIncidentFormScreen 
            onNavigate={handleNavigate} 
            photoData={appData.photo}
          />
        );
      
      case 'pnpForm':
        return (
          <PnpIncidentFormScreen 
            onNavigate={handleNavigate} 
            photoData={appData.photo}
          />
        );
      
      case 'confirmation':
        return (
          <ConfirmationScreen 
            onNavigate={handleNavigate}
            reportData={appData.reportData}
          />
        );
      
      case 'noGPS':
        return <NoGPSScreen onNavigate={handleNavigate} />;
      
      case 'noInternet':
        return (
          <NoInternetScreen 
            onNavigate={handleNavigate}
            reportData={appData.reportData}
          />
        );
      
      case 'myReports':
        return <MyReportsScreen onNavigate={handleNavigate} />;
      
      case 'profile':
        return (
          <ProfileScreen 
            onNavigate={handleNavigate} 
            onLogout={handleLogout}
            userData={userData || undefined}
          />
        );
      
      case 'pendingIncidents':
        return <PendingIncidentsScreen onNavigate={handleNavigate} />;
      
      case 'assignedIncidents':
        return <AssignedIncidentsScreen onNavigate={handleNavigate} />;
      
      case 'responderIncidentDetails':
        return (
          <ResponderIncidentDetailsScreen 
            onNavigate={handleNavigate}
            incidentData={appData.incident}
          />
        );
      
      case 'callVerification':
        return (
          <CallVerificationScreen 
            onNavigate={handleNavigate}
            incidentData={appData.incident}
          />
        );
      
      case 'deskOfficerForm':
        return (
          <DeskOfficerFormScreen 
            onNavigate={handleNavigate}
            incidentData={appData.incident}
          />
        );
      
      case 'adminDashboard':
        return <AdminDashboardScreen onNavigate={handleNavigate} />;
      
      case 'adminIncidentDetails':
        return (
          <AdminIncidentDetailsScreen 
            onNavigate={handleNavigate}
            incidentData={appData.incident}
          />
        );
      
      case 'pnpFinalReports':
        return <PnpFinalReportScreen onNavigate={handleNavigate} />;
      
      case 'bfpFinalReports':
        return <BfpFinalReportScreen onNavigate={handleNavigate} />;
      
      case 'pdrrmoFinalReports':
        return <PdrrmoFinalReportScreen onNavigate={handleNavigate} />;
      
      case 'pnpActiveIncident':
        return <PnpActiveIncidentScreen onNavigate={handleNavigate} />;
      
      case 'bfpActiveIncident':
        return <BfpActiveIncidentScreen onNavigate={handleNavigate} />;
      
      case 'pdrrmoActiveIncident':
        return <PdrrmoActiveIncidentScreen onNavigate={handleNavigate} />;
      
      case 'screenNavigator':
        return <ScreenNavigator onNavigate={handleNavigate} />;
      
      case 'pnpFinalReportForm':
        return <PnpFinalReportFormScreen onNavigate={handleNavigate} reportData={appData.reportData} />;
      
      case 'bfpFinalReportForm':
        return <BfpFinalReportFormScreen onNavigate={handleNavigate} reportData={appData.reportData} />;
      
      case 'pdrrmoFinalReportForm':
        return <PdrrmoFinalReportFormScreen onNavigate={handleNavigate} reportData={appData.reportData} />;
      
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  const isAuthScreen = ['landing', 'login', 'forgotPassword', 'signUp', 'otpVerification', 'otpSuccess'].includes(currentScreen);
  const isAdminScreen = currentScreen.includes('admin');
  const isMobileScreen = !isAdminScreen;
  const showBottomNav = isAuthenticated && !isAuthScreen && isMobileScreen;

  return (
    <div className="h-screen bg-gray-100 relative overflow-hidden">
      {/* Container - Mobile for citizen/responder, full width for admin */}
      <div className={`h-full flex flex-col ${
        isMobileScreen ? 'max-w-md mx-auto' : 'max-w-6xl mx-auto'
      }`}>
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && userType && (
        <BottomNav
          userType={userType}
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}