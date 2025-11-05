import { Home, FileText, User, ClipboardList, AlertCircle, LayoutDashboard } from "lucide-react";

interface BottomNavProps {
  userType: 'citizen' | 'deskOfficer' | 'fieldOfficer' | 'admin';
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export function BottomNav({ userType, currentScreen, onNavigate }: BottomNavProps) {
  const navItems = {
    citizen: [
      { screen: 'home', icon: Home, label: 'Home' },
      { screen: 'myReports', icon: FileText, label: 'My Reports' },
      { screen: 'profile', icon: User, label: 'Profile' }
    ],
    deskOfficer: [
      { screen: 'pendingIncidents', icon: AlertCircle, label: 'Pending' },
      { screen: 'finalReports', icon: FileText, label: 'Reports' },
      { screen: 'profile', icon: User, label: 'Profile' }
    ],
    fieldOfficer: [
      { screen: 'assignedIncidents', icon: ClipboardList, label: 'Assigned' },
      { screen: 'profile', icon: User, label: 'Profile' }
    ],
    admin: [
      { screen: 'adminDashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { screen: 'profile', icon: User, label: 'Profile' }
    ]
  };

  const items = navItems[userType];
  const gridCols = items.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className={`grid ${gridCols} h-16`}>
          {items.map((item) => {
            const Icon = item.icon;
            // Make "Reports" active for final reports screens
            let isActive = currentScreen === item.screen;
            if (item.screen === 'finalReports' && (
              currentScreen.includes('FinalReport') || 
              currentScreen.includes('finalReport')
            )) {
              isActive = true;
            }
            
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`flex flex-col items-center justify-center gap-1 ${
                  isActive ? 'text-green-600' : 'text-gray-500'
                }`}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
