import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';

const QUEUE_KEY = '@incident_queue';

export interface QueuedIncident {
  id: string;
  agency: string;
  name: string;
  age: string;
  description: string;
  latitude: string;
  longitude: string;
  reporterLatitude?: string;
  reporterLongitude?: string;
  address: string;
  mediaUris: string;
  timestamp: number;
  retryCount: number;
}

// Add incident to offline queue
export async function addToQueue(incident: Omit<QueuedIncident, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
  try {
    const queue = await getQueue();
    const newIncident: QueuedIncident = {
      ...incident,
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    queue.push(newIncident);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw error;
  }
}

// Get all queued incidents
export async function getQueue(): Promise<QueuedIncident[]> {
  try {
    const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error getting queue:', error);
    return [];
  }
}

// Remove incident from queue
export async function removeFromQueue(id: string): Promise<void> {
  try {
    const queue = await getQueue();
    const filtered = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from queue:', error);
  }
}

// Update retry count
export async function incrementRetryCount(id: string): Promise<void> {
  try {
    const queue = await getQueue();
    const updated = queue.map(item => 
      item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
    );
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating retry count:', error);
  }
}

// Clear entire queue
export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing queue:', error);
  }
}

// Check if online
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable === true;
}

// Process queue when back online
export async function processQueue(
  onProgress?: (current: number, total: number) => void,
  onSuccess?: (id: string) => void,
  onError?: (id: string, error: any) => void
): Promise<{ successful: number; failed: number }> {
  const queue = await getQueue();
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < queue.length; i++) {
    const incident = queue[i];
    onProgress?.(i + 1, queue.length);

    try {
      // Skip if too many retries
      if (incident.retryCount >= 3) {
        console.log(`Skipping incident ${incident.id} - max retries reached`);
        failed++;
        continue;
      }

      // Upload media
      const uploadedMediaUrls: string[] = [];
      const media = JSON.parse(incident.mediaUris);

      for (const mediaItem of media) {
        // Handle both string URIs and objects with uri/type
        const mediaUri = typeof mediaItem === 'string' ? mediaItem : mediaItem.uri;
        const mediaType = typeof mediaItem === 'string' ? 'image' : (mediaItem.type || 'image');
        
        // Get file extension, handling query params
        const uriWithoutParams = mediaUri.split('?')[0];
        let fileExt = uriWithoutParams.split('.').pop()?.toLowerCase() || 'jpg';
        
        // Determine content type based on media type
        let contentType: string;
        if (mediaType === 'video') {
          const videoMimeTypes: Record<string, string> = {
            'mp4': 'video/mp4',
            'mov': 'video/quicktime',
            'avi': 'video/x-msvideo',
            'webm': 'video/webm',
            '3gp': 'video/3gpp',
          };
          contentType = videoMimeTypes[fileExt] || 'video/mp4';
          if (!['mp4', 'mov', 'avi', 'webm', '3gp'].includes(fileExt)) {
            fileExt = 'mp4';
          }
        } else {
          const imageMimeTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
          };
          contentType = imageMimeTypes[fileExt] || 'image/jpeg';
          if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
            fileExt = 'jpg';
          }
        }
        
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `incidents/${fileName}`;

        const response = await fetch(mediaUri);
        const arrayBuffer = await response.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('incident-media')
          .upload(filePath, fileData, {
            contentType: contentType,
            cacheControl: '3600',
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('incident-media')
          .getPublicUrl(filePath);

        uploadedMediaUrls.push(urlData.publicUrl);
      }

      // Create incident record
      const { data: user } = await supabase.auth.getUser();
      const incidentData: any = {
        agency_type: incident.agency.toLowerCase(),
        reporter_id: user?.user?.id || null,
        reporter_name: incident.name,
        reporter_age: parseInt(incident.age),
        description: incident.description,
        latitude: parseFloat(incident.latitude),
        longitude: parseFloat(incident.longitude),
        location_address: incident.address,
        media_urls: uploadedMediaUrls,
        status: 'pending',
        created_at: new Date(incident.timestamp).toISOString(),
      };
      
      // Add reporter location if available
      if (incident.reporterLatitude && incident.reporterLongitude) {
        incidentData.reporter_latitude = parseFloat(incident.reporterLatitude);
        incidentData.reporter_longitude = parseFloat(incident.reporterLongitude);
      }
      
      const { data: createdIncident, error: incidentError } = await supabase
        .from('incidents')
        .insert(incidentData)
        .select()
        .single();

      if (incidentError) throw incidentError;

      // Auto-assign to nearest station
      try {
        const agencyIdMap: Record<string, number> = {
          'pnp': 1,
          'bfp': 2,
          'pdrrmo': 3,
        };
        const agencyId = agencyIdMap[incident.agency.toLowerCase()];
        
        if (agencyId && createdIncident) {
          const { data: nearestStation, error: stationError } = await supabase
            .rpc('find_nearest_station', {
              incident_lat: parseFloat(incident.latitude),
              incident_lon: parseFloat(incident.longitude),
              target_agency_id: agencyId,
            })
            .single<{ id: number; name: string; distance: number }>();

          if (!stationError && nearestStation) {
            await supabase
              .from('incidents')
              .update({ 
                assigned_station_id: nearestStation.id,
                status: 'assigned'
              })
              .eq('id', createdIncident.id);
            
            await supabase
              .from('incident_status_history')
              .insert({
                incident_id: createdIncident.id,
                status: 'assigned',
                notes: `Auto-assigned to ${nearestStation.name} (${nearestStation.distance?.toFixed(2)} km away)`,
                changed_by: 'System',
              });
            
            console.log(`Queued incident auto-assigned to: ${nearestStation.name}`);
          }
        }
      } catch (assignError) {
        console.warn('Auto-assignment failed for queued incident:', assignError);
      }

      // Success - remove from queue
      await removeFromQueue(incident.id);
      onSuccess?.(incident.id);
      successful++;

    } catch (error: any) {
      console.error(`Error processing incident ${incident.id}:`, error);
      await incrementRetryCount(incident.id);
      onError?.(incident.id, error);
      failed++;
    }
  }

  return { successful, failed };
}

// Get queue count
export async function getQueueCount(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}

// Setup network listener to auto-process queue
export function setupNetworkListener(
  onQueueProcessed?: (successful: number, failed: number) => void
): () => void {
  const unsubscribe = NetInfo.addEventListener(async state => {
    if (state.isConnected && state.isInternetReachable) {
      const count = await getQueueCount();
      if (count > 0) {
        console.log(`Network restored. Processing ${count} queued incidents...`);
        const result = await processQueue();
        onQueueProcessed?.(result.successful, result.failed);
      }
    }
  });

  return unsubscribe;
}
