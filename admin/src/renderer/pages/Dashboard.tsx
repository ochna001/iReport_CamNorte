import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Flame,
    Shield,
    TrendingUp,
    Waves
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Stats {
  total: number;
  pending: number;
  responding: number;
  resolved: number;
  byAgency: Array<{ agency_type: string; count: number }>;
  recentActivity: Array<{
    incident_id: string;
    status: string;
    changed_by: string;
    changed_at: string;
  }>;
}

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();

    // Listen for real-time updates
    window.api.onIncidentUpdated(() => {
      loadStats();
    });

    return () => {
      window.api.removeAllListeners('incident-updated');
    };
  }, []);

  const loadStats = async () => {
    try {
      const data = await window.api.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAgencyCount = (agency: string) => {
    return stats?.byAgency.find(a => a.agency_type === agency)?.count || 0;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Incidents</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Responding</p>
              <p className="text-3xl font-bold text-orange-600">{stats?.responding || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-3xl font-bold text-green-600">{stats?.resolved || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Agency Breakdown */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div 
          className="bg-blue-600 rounded-xl p-6 text-white cursor-pointer hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/incidents?agency=pnp')}
        >
          <div className="flex items-center gap-4">
            <Shield size={32} />
            <div>
              <p className="text-blue-100">PNP Reports</p>
              <p className="text-3xl font-bold">{getAgencyCount('pnp')}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-red-600 rounded-xl p-6 text-white cursor-pointer hover:bg-red-700 transition-colors"
          onClick={() => navigate('/incidents?agency=bfp')}
        >
          <div className="flex items-center gap-4">
            <Flame size={32} />
            <div>
              <p className="text-red-100">BFP Reports</p>
              <p className="text-3xl font-bold">{getAgencyCount('bfp')}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-cyan-600 rounded-xl p-6 text-white cursor-pointer hover:bg-cyan-700 transition-colors"
          onClick={() => navigate('/incidents?agency=pdrrmo')}
        >
          <div className="flex items-center gap-4">
            <Waves size={32} />
            <div>
              <p className="text-cyan-100">PDRRMO Reports</p>
              <p className="text-3xl font-bold">{getAgencyCount('pdrrmo')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div 
                key={index} 
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/incidents/${activity.incident_id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium status-${activity.status}`}>
                      {activity.status.toUpperCase()}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      by {activity.changed_by}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {formatTime(activity.changed_at)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
