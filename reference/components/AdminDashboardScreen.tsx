import { Filter, Download, Search, Calendar, MapPin, BarChart3, PieChart } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useState } from "react";

interface AdminDashboardScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

const mockIncidents = [
  {
    id: "IR-ABC123",
    type: "Crime",
    status: "Pending",
    timestamp: "2024-01-15 14:30",
    location: "Downtown Area",
    reporter: "Juan Dela Cruz",
    priority: "High"
  },
  {
    id: "IR-DEF456",
    type: "Fire", 
    status: "In Progress",
    timestamp: "2024-01-15 13:45",
    location: "Residential Block",
    reporter: "Maria Santos",
    priority: "Critical"
  },
  {
    id: "IR-GHI789",
    type: "Disaster",
    status: "Resolved",
    timestamp: "2024-01-15 12:20", 
    location: "Coastal Road",
    reporter: "Pedro Garcia",
    priority: "Medium"
  },
  {
    id: "IR-JKL012",
    type: "Crime",
    status: "Assigned",
    timestamp: "2024-01-15 11:15",
    location: "Market Area",
    reporter: "Ana Rivera",
    priority: "Low"
  }
];

const incidentTypeData = [
  { type: "Crime", count: 12, color: "bg-red-500" },
  { type: "Fire", count: 8, color: "bg-orange-500" },
  { type: "Disaster", count: 5, color: "bg-yellow-500" },
  { type: "Other", count: 3, color: "bg-gray-500" }
];

const locationData = [
  { location: "Downtown", count: 15 },
  { location: "Residential", count: 8 },
  { location: "Industrial", count: 5 }
];

export function AdminDashboardScreen({ onNavigate }: AdminDashboardScreenProps) {
  const [dateRange, setDateRange] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Assigned":
        return "bg-orange-100 text-orange-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleExportReport = () => {
    console.log("Exporting PDF report...");
  };

  const handleIncidentDetails = (incident: any) => {
    onNavigate('adminIncidentDetails', { incident });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl">Admin Dashboard</h1>
          <Button onClick={handleExportReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-48">
              <MapPin className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="downtown">Downtown</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="coastal">Coastal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Incident Types Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-blue-600" />
              <h2>Incident Types</h2>
            </div>
            <div className="space-y-3">
              {incidentTypeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <span>{item.type}</span>
                  </div>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Distribution */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h2>Incidents by Location</h2>
            </div>
            <div className="space-y-3">
              {locationData.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span>{item.location}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(item.count / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2>Recent Incidents</h2>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockIncidents.map((incident) => (
                  <TableRow key={incident.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">#{incident.id}</TableCell>
                    <TableCell className="capitalize">{incident.type}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(incident.priority)}>
                        {incident.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{incident.location}</TableCell>
                    <TableCell>{incident.reporter}</TableCell>
                    <TableCell>{incident.timestamp}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIncidentDetails(incident)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}