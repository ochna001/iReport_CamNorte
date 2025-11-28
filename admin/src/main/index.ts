import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { getDatabase, initDatabase } from './database';
import { SyncManager } from './sync';

let mainWindow: BrowserWindow | null = null;
let syncManager: SyncManager | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Initialize local database
  await initDatabase();
  
  // Initialize sync manager
  syncManager = new SyncManager();
  await syncManager.start();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for database operations
ipcMain.handle('db:getIncidents', async (_, filters) => {
  const db = getDatabase();
  let query = 'SELECT * FROM incidents WHERE 1=1';
  const params: any[] = [];

  if (filters?.agency) {
    query += ' AND agency_type = ?';
    params.push(filters.agency);
  }
  if (filters?.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  query += ' ORDER BY created_at DESC';
  
  if (filters?.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  return db.prepare(query).all(...params);
});

ipcMain.handle('db:getIncident', async (_, id) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);
});

ipcMain.handle('db:updateIncidentStatus', async (_, { id, status, notes, updatedBy }) => {
  const db = getDatabase();
  const now = new Date().toISOString();

  // Update incident
  db.prepare(`
    UPDATE incidents 
    SET status = ?, updated_at = ?, updated_by = ?
    WHERE id = ?
  `).run(status, now, updatedBy, id);

  // Add to status history (append-only for conflict resolution)
  db.prepare(`
    INSERT INTO status_history (incident_id, status, notes, changed_by, changed_at, synced)
    VALUES (?, ?, ?, ?, ?, 0)
  `).run(id, status, notes || '', updatedBy, now);

  // Add to sync queue
  db.prepare(`
    INSERT INTO sync_queue (table_name, record_id, action, created_at)
    VALUES ('incidents', ?, 'update', ?)
  `).run(id, now);

  // Trigger sync
  syncManager?.syncNow();

  return { success: true };
});

ipcMain.handle('db:getStats', async () => {
  const db = getDatabase();
  
  const total = db.prepare('SELECT COUNT(*) as count FROM incidents').get() as { count: number };
  const pending = db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status = 'pending'").get() as { count: number };
  const responding = db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status = 'responding'").get() as { count: number };
  const resolved = db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status = 'resolved'").get() as { count: number };
  
  const byAgency = db.prepare(`
    SELECT agency_type, COUNT(*) as count 
    FROM incidents 
    GROUP BY agency_type
  `).all();

  const recentActivity = db.prepare(`
    SELECT * FROM status_history 
    ORDER BY changed_at DESC 
    LIMIT 10
  `).all();

  return {
    total: total.count,
    pending: pending.count,
    responding: responding.count,
    resolved: resolved.count,
    byAgency,
    recentActivity,
  };
});

ipcMain.handle('db:getAuditLog', async (_, incidentId) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM status_history 
    WHERE incident_id = ? 
    ORDER BY changed_at DESC
  `).all(incidentId);
});

ipcMain.handle('sync:status', async () => {
  return syncManager?.getStatus() || { connected: false, lastSync: null, pending: 0 };
});

ipcMain.handle('sync:now', async () => {
  await syncManager?.syncNow();
  return { success: true };
});
