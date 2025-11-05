import { ArrowLeft, User, MapPin, Bell, Shield, LogOut, Grid } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
  onLogout?: () => void;
  userData?: {
    name: string;
    email: string;
    userType: 'citizen' | 'deskOfficer' | 'fieldOfficer' | 'admin';
  };
}

export function ProfileScreen({ onNavigate, onLogout, userData }: ProfileScreenProps) {
  const displayName = userData?.name || 'Juan Dela Cruz';
  const displayEmail = userData?.email || 'citizen@test.com';
  const userTypeLabel = userData?.userType === 'admin' ? 'Administrator' : 
                       userData?.userType === 'deskOfficer' ? 'Desk Officer' :
                       userData?.userType === 'fieldOfficer' ? 'Field Officer' : 
                       'Verified Resident';
  
  const isAdmin = userData?.userType === 'admin';
  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('home')}
          className="mr-2"
          aria-label="Go back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="flex-1">Profile</h1>
      </div>

      {/* Profile Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* User Info */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h2>{displayName}</h2>
              <p className="text-sm text-gray-500">{userTypeLabel}</p>
              <p className="text-xs text-gray-400">{displayEmail}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Edit Profile
          </Button>
        </div>

        {/* Location Settings */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-detect location</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Share precise location</span>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Report status updates</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Emergency alerts</span>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Admin Tools - Only for admins */}
        {isAdmin && (
          <div className="bg-white rounded-lg p-4">
            <h3 className="mb-3 flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Developer Tools
            </h3>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onNavigate('screenNavigator')}
            >
              <Grid className="w-4 h-4 mr-2" />
              Screen Navigator
            </Button>
          </div>
        )}

        {/* Security */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security & Privacy
          </h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start h-auto p-2">
              <span className="text-sm">Change Password</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start h-auto p-2">
              <span className="text-sm">Privacy Policy</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start h-auto p-2">
              <span className="text-sm">Terms of Service</span>
            </Button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-lg p-4">
          <Button 
            variant="ghost" 
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}