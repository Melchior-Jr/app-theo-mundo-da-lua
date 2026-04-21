import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminService } from '../services/adminService';

interface AudioAsset {
  id: string;
  category: string;
  url: string;
  label: string;
  is_active: boolean;
  subject?: string | null;
}

interface AudioAssetsContextType {
  assets: AudioAsset[];
  getAsset: (category: string, subject?: string | null) => string | null;
  getRandomAsset: (category: string, subject?: string | null) => string | null;
  refreshAssets: () => Promise<void>;
  isLoading: boolean;
}

const AudioAssetsContext = createContext<AudioAssetsContextType | undefined>(undefined);

export const AudioAssetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<AudioAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await AdminService.getQuizAudioAssets();
      setAssets(data || []);
    } catch (error) {
      console.error('Erro ao carregar áudios do sistema:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAssets();
  }, [refreshAssets]);

  const getAsset = useCallback((category: string, subject?: string | null) => {
    const activeAssets = assets.filter(a => 
      a.category === category && 
      a.is_active && 
      (!a.subject || a.subject === subject)
    );
    if (activeAssets.length === 0) return null;
    return activeAssets[0].url;
  }, [assets]);

  const getRandomAsset = useCallback((category: string, subject?: string | null) => {
    const activeAssets = assets.filter(a => 
      a.category === category && 
      a.is_active && 
      (!a.subject || a.subject === subject)
    );
    if (activeAssets.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * activeAssets.length);
    return activeAssets[randomIndex].url;
  }, [assets]);


  return (
    <AudioAssetsContext.Provider value={{ assets, getAsset, getRandomAsset, refreshAssets, isLoading }}>
      {children}
    </AudioAssetsContext.Provider>
  );
};

export const useAudioAssets = () => {
  const context = useContext(AudioAssetsContext);
  if (!context) {
    throw new Error('useAudioAssets deve ser usado dentro de um AudioAssetsProvider');
  }
  return context;
};
