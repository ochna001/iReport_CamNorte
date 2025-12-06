import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  hasBlur?: boolean;
}

interface ReportDraft {
  agency: 'PNP' | 'BFP' | 'PDRRMO' | null;
  media: MediaItem[];
  latitude: number | null;
  longitude: number | null;
  name: string;
  age: string;
  phone: string;
  description: string;
  createdAt: number;
}

export interface SavedDraft extends ReportDraft {
  id: string;
  savedAt: number;
  address?: string;
}

interface ReportDraftContextType {
  draft: ReportDraft;
  savedDrafts: SavedDraft[];
  setAgency: (agency: 'PNP' | 'BFP' | 'PDRRMO') => void;
  setMedia: (media: MediaItem[]) => void;
  addMedia: (items: MediaItem[]) => void;
  removeMedia: (index: number) => void;
  updateMedia: (index: number, item: MediaItem) => void;
  setLocation: (latitude: number, longitude: number) => void;
  setName: (name: string) => void;
  setAge: (age: string) => void;
  setPhone: (phone: string) => void;
  setDescription: (description: string) => void;
  clearDraft: () => void;
  saveDraftToList: (address?: string) => Promise<string>;
  loadDraftFromList: (id: string) => void;
  deleteSavedDraft: (id: string) => Promise<void>;
  hasDraft: boolean;
}

const DRAFT_STORAGE_KEY = '@report_draft';
const SAVED_DRAFTS_KEY = '@saved_drafts';

const emptyDraft: ReportDraft = {
  agency: null,
  media: [],
  latitude: null,
  longitude: null,
  name: '',
  age: '',
  phone: '',
  description: '',
  createdAt: 0,
};

const ReportDraftContext = createContext<ReportDraftContextType>({
  draft: emptyDraft,
  savedDrafts: [],
  setAgency: () => {},
  setMedia: () => {},
  addMedia: () => {},
  removeMedia: () => {},
  updateMedia: () => {},
  setLocation: () => {},
  setName: () => {},
  setAge: () => {},
  setPhone: () => {},
  setDescription: () => {},
  clearDraft: () => {},
  saveDraftToList: async () => '',
  loadDraftFromList: () => {},
  deleteSavedDraft: async () => {},
  hasDraft: false,
});

export const useReportDraft = () => useContext(ReportDraftContext);

export const ReportDraftProvider = ({ children }: { children: React.ReactNode }) => {
  const [draft, setDraft] = useState<ReportDraft>(emptyDraft);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load draft and saved drafts from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load current draft
        const stored = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as ReportDraft;
          // Only restore if draft is less than 24 hours old
          const hoursSinceCreated = (Date.now() - parsed.createdAt) / (1000 * 60 * 60);
          if (hoursSinceCreated < 24) {
            setDraft(parsed);
          } else {
            // Clear old draft
            await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
          }
        }
        
        // Load saved drafts
        const savedDraftsStored = await AsyncStorage.getItem(SAVED_DRAFTS_KEY);
        if (savedDraftsStored) {
          const parsedDrafts = JSON.parse(savedDraftsStored) as SavedDraft[];
          // Filter out drafts older than 7 days
          const validDrafts = parsedDrafts.filter(d => {
            const daysSinceSaved = (Date.now() - d.savedAt) / (1000 * 60 * 60 * 24);
            return daysSinceSaved < 7;
          });
          setSavedDrafts(validDrafts);
          // Update storage if we filtered any out
          if (validDrafts.length !== parsedDrafts.length) {
            await AsyncStorage.setItem(SAVED_DRAFTS_KEY, JSON.stringify(validDrafts));
          }
        }
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
      setInitialized(true);
    };
    loadData();
  }, []);

  // Save draft to storage whenever it changes
  useEffect(() => {
    if (!initialized) return;
    
    const saveDraft = async () => {
      try {
        if (draft.agency || draft.media.length > 0 || draft.description) {
          await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        }
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    };
    saveDraft();
  }, [draft, initialized]);

  const setAgency = (agency: 'PNP' | 'BFP' | 'PDRRMO') => {
    setDraft(prev => ({
      ...prev,
      agency,
      createdAt: prev.createdAt || Date.now(),
    }));
  };

  const setMedia = (media: MediaItem[]) => {
    setDraft(prev => ({
      ...prev,
      media,
      createdAt: prev.createdAt || Date.now(),
    }));
  };

  const addMedia = (items: MediaItem[]) => {
    setDraft(prev => ({
      ...prev,
      media: [...prev.media, ...items],
      createdAt: prev.createdAt || Date.now(),
    }));
  };

  const removeMedia = (index: number) => {
    setDraft(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const updateMedia = (index: number, item: MediaItem) => {
    setDraft(prev => ({
      ...prev,
      media: prev.media.map((m, i) => i === index ? item : m),
    }));
  };

  const setLocation = (latitude: number, longitude: number) => {
    setDraft(prev => ({
      ...prev,
      latitude,
      longitude,
      createdAt: prev.createdAt || Date.now(),
    }));
  };

  const setName = (name: string) => {
    setDraft(prev => ({ ...prev, name }));
  };

  const setAge = (age: string) => {
    setDraft(prev => ({ ...prev, age }));
  };

  const setPhone = (phone: string) => {
    setDraft(prev => ({ ...prev, phone }));
  };

  const setDescription = (description: string) => {
    setDraft(prev => ({ ...prev, description }));
  };

  const clearDraft = async () => {
    setDraft(emptyDraft);
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  // Save current draft to the saved drafts list
  const saveDraftToList = async (address?: string): Promise<string> => {
    const id = `draft_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const savedDraft: SavedDraft = {
      ...draft,
      id,
      savedAt: Date.now(),
      address,
    };
    
    const newSavedDrafts = [savedDraft, ...savedDrafts];
    setSavedDrafts(newSavedDrafts);
    
    try {
      await AsyncStorage.setItem(SAVED_DRAFTS_KEY, JSON.stringify(newSavedDrafts));
      // Clear the current draft after saving
      await clearDraft();
    } catch (error) {
      console.error('Error saving draft to list:', error);
    }
    
    return id;
  };

  // Load a saved draft into the current draft
  const loadDraftFromList = (id: string) => {
    const savedDraft = savedDrafts.find(d => d.id === id);
    if (savedDraft) {
      const { id: _, savedAt: __, address: ___, ...draftData } = savedDraft;
      setDraft(draftData);
    }
  };

  // Delete a saved draft
  const deleteSavedDraft = async (id: string) => {
    const newSavedDrafts = savedDrafts.filter(d => d.id !== id);
    setSavedDrafts(newSavedDrafts);
    
    try {
      await AsyncStorage.setItem(SAVED_DRAFTS_KEY, JSON.stringify(newSavedDrafts));
    } catch (error) {
      console.error('Error deleting saved draft:', error);
    }
  };

  const hasDraft = !!(draft.agency || draft.media.length > 0 || draft.description);

  return (
    <ReportDraftContext.Provider
      value={{
        draft,
        savedDrafts,
        setAgency,
        setMedia,
        addMedia,
        removeMedia,
        updateMedia,
        setLocation,
        setName,
        setAge,
        setPhone,
        setDescription,
        clearDraft,
        saveDraftToList,
        loadDraftFromList,
        deleteSavedDraft,
        hasDraft,
      }}
    >
      {children}
    </ReportDraftContext.Provider>
  );
};
