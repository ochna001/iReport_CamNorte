import { ArrowLeft, Grid } from "lucide-react";
import { Button } from "./ui/button";

interface ScreenNavigatorProps {
  onNavigate: (screen: string) => void;
}

export function ScreenNavigator({ onNavigate }: ScreenNavigatorProps) {
  const allScreens = [
    // Auth Screens
    { name: 'landing', label: 'Landing', category: 'Auth' },
    { name: 'login', label: 'Login', category: 'Auth' },
    { name: 'signUp', label: 'Sign Up', category: 'Auth' },
    { name: 'forgotPassword', label: 'Forgot Password', category: 'Auth' },
    { name: 'otpVerification', label: 'OTP Verification', category: 'Auth' },
    { name: 'otpSuccess', label: 'OTP Success', category: 'Auth' },
    
    // Citizen Screens
    { name: 'home', label: 'Home (Citizen)', category: 'Citizen' },
    { name: 'camera', label: 'Camera', category: 'Citizen' },
    { name: 'incidentForm', label: 'General Incident Form', category: 'Citizen' },
    { name: 'pnpForm', label: 'PNP Incident Form', category: 'Citizen' },
    { name: 'bfpForm', label: 'BFP Incident Form', category: 'Citizen' },
    { name: 'pdrrmoForm', label: 'PDRRMO Incident Form', category: 'Citizen' },
    { name: 'confirmation', label: 'Confirmation', category: 'Citizen' },
    { name: 'myReports', label: 'My Reports', category: 'Citizen' },
    { name: 'noGPS', label: 'No GPS', category: 'Citizen' },
    { name: 'noInternet', label: 'No Internet', category: 'Citizen' },
    
    // Desk Officer Screens
    { name: 'pendingIncidents', label: 'Pending Incidents', category: 'Desk Officer' },
    { name: 'callVerification', label: 'Call Verification', category: 'Desk Officer' },
    { name: 'deskOfficerForm', label: 'Process Incident', category: 'Desk Officer' },
    { name: 'pnpFinalReports', label: 'PNP Final Reports List', category: 'Desk Officer' },
    { name: 'bfpFinalReports', label: 'BFP Final Reports List', category: 'Desk Officer' },
    { name: 'pdrrmoFinalReports', label: 'PDRRMO Final Reports List', category: 'Desk Officer' },
    { name: 'pnpFinalReportForm', label: 'PNP Final Report Form', category: 'Desk Officer' },
    { name: 'bfpFinalReportForm', label: 'BFP Final Report Form', category: 'Desk Officer' },
    { name: 'pdrrmoFinalReportForm', label: 'PDRRMO Final Report Form', category: 'Desk Officer' },
    
    // Field Officer Screens
    { name: 'assignedIncidents', label: 'Assigned Incidents', category: 'Field Officer' },
    { name: 'responderIncidentDetails', label: 'Incident Details', category: 'Field Officer' },
    { name: 'pnpActiveIncident', label: 'PNP Active Incident', category: 'Field Officer' },
    { name: 'bfpActiveIncident', label: 'BFP Active Incident', category: 'Field Officer' },
    { name: 'pdrrmoActiveIncident', label: 'PDRRMO Active Incident', category: 'Field Officer' },
    
    // Admin Screens
    { name: 'adminDashboard', label: 'Admin Dashboard', category: 'Admin' },
    { name: 'adminIncidentDetails', label: 'Admin Incident Details', category: 'Admin' },
    
    // Common
    { name: 'profile', label: 'Profile', category: 'Common' },
  ];

  const categories = ['Auth', 'Citizen', 'Desk Officer', 'Field Officer', 'Admin', 'Common'];

  return (
    <div className="flex flex-col h-full bg-gray-100 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('profile')}
            aria-label="Back to profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5" />
            <h1>Screen Navigator</h1>
          </div>
        </div>
      </div>

      {/* Screen List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {categories.map((category) => {
          const categoryScreens = allScreens.filter(s => s.category === category);
          
          return (
            <div key={category} className="bg-white rounded-lg p-4">
              <h2 className="mb-3 text-gray-700">{category}</h2>
              <div className="grid grid-cols-1 gap-2">
                {categoryScreens.map((screen) => (
                  <Button
                    key={screen.name}
                    onClick={() => onNavigate(screen.name)}
                    variant="outline"
                    className="justify-start h-12"
                  >
                    {screen.label}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
