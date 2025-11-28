import { ChevronRight, Filter, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Incident {
  id: string;
  agency_type: string;
  reporter_name: string;
  description: string;
  status: string;
  location_address: string;
  created_at: string;
}

function Incidents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgency, setFilterAgency] = useState(searchParams.get('agency') || '');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadIncidents();

    // Listen for real-time updates
    window.api.onIncidentUpdated(() => {
      loadIncidents();
    });

    return () => {
      window.api.removeAllListeners('incident-updated');
    };
  }, [filterAgency, filterStatus]);

  const loadIncidents = async () => {
    try {
      const data = await window.api.getIncidents({
        agency: filterAgency || undefined,
        status: filterStatus || undefined,
      });
      setIncidents(data);
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      incident.description?.toLowerCase().includes(query) ||
      incident.reporter_name?.toLowerCase().includes(query) ||
      incident.location_address?.toLowerCase().includes(query) ||
      incident.id.toLowerCase().includes(query)
    );
  });

  const getAgencyBadgeClass = (agency: string) => {
    switch (agency.toLowerCase()) {
      case 'pnp': return 'bg-blue-600';
      case 'bfp': return 'bg-red-600';
      case 'pdrrmo': return 'bg-cyan-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'responding': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Incidents</h1>
        <span className="text-sm text-gray-500">
          {filteredIncidents.length} incidents
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Agency Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterAgency}
              onChange={(e) => setFilterAgency(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Agencies</option>
              <option value="pnp">PNP</option>
              <option value="bfp">BFP</option>
              <option value="pdrrmo">PDRRMO</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
            <option value="responding">Responding</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No incidents found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Agency</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Description</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Reporter</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredIncidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-600">
                      #{incident.id.substring(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getAgencyBadgeClass(incident.agency_type)}`}>
                      {incident.agency_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800 truncate max-w-xs">
                      {incident.description}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {incident.reporter_name || 'Anonymous'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(incident.status)}`}>
                      {incident.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {formatDate(incident.created_at)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ChevronRight size={20} className="text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Incidents;
