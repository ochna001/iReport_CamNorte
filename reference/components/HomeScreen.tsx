import { Camera, FileText, User, Plus } from "lucide-react";
import { Button } from "./ui/button";

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-center text-gray-800">iReport Camarines Norte</h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-600">
          <div className="mb-4">
            <Camera className="w-16 h-16 mx-auto text-gray-400" />
          </div>
          <p className="mb-2">Report incidents quickly</p>
          <p className="text-sm">Tap + to start reporting</p>
        </div>
      </div>

      {/* Bottom Navigation with Elevated FAB */}
      <div className="relative">
        {/* Floating Action Button */}
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            onClick={() => onNavigate('camera')}
            className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-xl border-4 border-white"
            size="icon"
            aria-label="Start new report"
          >
            <Plus className="w-6 h-6 text-white" />
          </Button>
        </div>
        
        {/* Navigation Bar with Notch */}
        <div className="bg-white rounded-t-3xl h-20 flex items-end justify-around pb-4 pt-8 shadow-lg relative">
          {/* Notch for FAB */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-white rounded-b-full"></div>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg px-4 py-2"
            onClick={() => onNavigate('myReports')}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">My Reports</span>
          </Button>
          
          <div className="w-14"></div> {/* Spacer for FAB */}
          
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg px-4 py-2"
            onClick={() => onNavigate('profile')}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}