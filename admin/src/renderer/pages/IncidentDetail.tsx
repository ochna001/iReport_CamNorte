import {
    ArrowLeft,
    Clock,
    History,
    Image as ImageIcon,
    MapPin,
    Send,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Incident {
  id: string;
  agency_type: string;
  reporter_name: string;
  reporter_age: number;
  description: string;
  status: string;
  location_lat: number;
  location_lng: number;
  location_address: string;
  media_urls: string;
  created_at: string;
  updated_at: string;
}

interface StatusHistoryEntry {
  id: number;
  status: string;
  notes: string;
  changed_by: string;
  changed_at: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'received', label: 'Received', color: 'bg-blue-500' },
  { value: 'responding', label: 'Responding', color: 'bg-orange-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-500' },
];

function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadIncident();
      loadHistory();
    }
  }, [id]);

  const loadIncident = async () => {
    try {
      const data = await window.api.getIncident(id!);
      setIncident(data);
      setNewStatus(data?.status || '');
    } catch (error) {
      console.error('Failed to load incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await window.api.getAuditLog(id!);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === incident?.status) return;

    setUpdating(true);
    try {
      await window.api.updateIncidentStatus({
        id: id!,
        status: newStatus,
        notes: notes,
        updatedBy: 'Admin', // TODO: Get from auth
      });

      // Reload data
      await loadIncident();
      await loadHistory();
      setNotes('');
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAgencyName = (agency: string) => {
    switch (agency?.toLowerCase()) {
      case 'pnp': return 'Philippine National Police';
      case 'bfp': return 'Bureau of Fire Protection';
      case 'pdrrmo': return 'Provincial Disaster Risk Reduction Management Office';
      default: return agency;
    }
  };

  const getMediaUrls = (): string[] => {
    if (!incident?.media_urls) return [];
    try {
      return JSON.parse(incident.media_urls);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-500 mb-4">Incident not found</p>
        <button
          onClick={() => navigate('/incidents')}
          className="text-blue-600 hover:underline"
        >
          Back to Incidents
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/incidents')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Incident #{incident.id.substring(0, 8).toUpperCase()}
          </h1>
          <p className="text-gray-500">{getAgencyName(incident.agency_type)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{incident.description}</p>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Location
            </h2>
            <p className="text-gray-700 mb-4">{incident.location_address || 'Address not available'}</p>
            {incident.location_lat && incident.location_lng && (
              <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
                Coordinates: {incident.location_lat.toFixed(6)}, {incident.location_lng.toFixed(6)}
              </div>
            )}
          </div>

          {/* Media */}
          {getMediaUrls().length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                Media ({getMediaUrls().length})
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {getMediaUrls().map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Status History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <History size={20} />
              Status History
            </h2>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((entry) => (
                  <div key={entry.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">
                          Status changed to <span className="uppercase">{entry.status}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(entry.changed_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">by {entry.changed_by}</p>
                      {entry.notes && (
                        <p className="text-sm text-gray-500 mt-1 italic">"{entry.notes}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No status changes recorded</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reporter Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} />
              Reporter
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{incident.reporter_name || 'Anonymous'}</p>
              </div>
              {incident.reporter_age && (
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{incident.reporter_age} years old</p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={20} />
              Timeline
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Reported</p>
                <p className="font-medium">{formatDate(incident.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(incident.updated_at || incident.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this status change..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating || newStatus === incident.status}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentDetail;
