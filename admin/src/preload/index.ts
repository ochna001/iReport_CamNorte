import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('api', {
  // Database operations
  getIncidents: (filters?: { agency?: string; status?: string; limit?: number }) => 
    ipcRenderer.invoke('db:getIncidents', filters),
  
  getIncident: (id: string) => 
    ipcRenderer.invoke('db:getIncident', id),
  
  updateIncidentStatus: (params: { id: string; status: string; notes?: string; updatedBy: string }) => 
    ipcRenderer.invoke('db:updateIncidentStatus', params),
  
  getStats: () => 
    ipcRenderer.invoke('db:getStats'),
  
  getAuditLog: (incidentId: string) => 
    ipcRenderer.invoke('db:getAuditLog', incidentId),

  // Sync operations
  getSyncStatus: () => 
    ipcRenderer.invoke('sync:status'),
  
  syncNow: () => 
    ipcRenderer.invoke('sync:now'),

  // Event listeners
  onSyncStatus: (callback: (status: any) => void) => {
    ipcRenderer.on('sync-status', (_, status) => callback(status));
  },
  
  onIncidentUpdated: (callback: (incident: any) => void) => {
    ipcRenderer.on('incident-updated', (_, incident) => callback(incident));
  },

  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Type definitions for renderer
export interface ElectronAPI {
  getIncidents: (filters?: { agency?: string; status?: string; limit?: number }) => Promise<any[]>;
  getIncident: (id: string) => Promise<any>;
  updateIncidentStatus: (params: { id: string; status: string; notes?: string; updatedBy: string }) => Promise<{ success: boolean }>;
  getStats: () => Promise<any>;
  getAuditLog: (incidentId: string) => Promise<any[]>;
  getSyncStatus: () => Promise<{ connected: boolean; lastSync: string | null; pending: number; syncing: boolean }>;
  syncNow: () => Promise<{ success: boolean }>;
  onSyncStatus: (callback: (status: any) => void) => void;
  onIncidentUpdated: (callback: (incident: any) => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
