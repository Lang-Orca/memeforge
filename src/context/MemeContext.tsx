import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import RNFS from 'react-native-fs';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

type GenerationType = 'new' | 'update' | null;

interface MemeState {
  generationType: GenerationType;
  baseImage: string | null;
  context: string;
  userPrompt: string;
  temperature: number;
}

interface MemeContextType extends MemeState {
  setGenerationType: (type: GenerationType) => void;
  setBaseImage: (image: string | null) => void;
  setContext: (context: string) => void;
  setUserPrompt: (prompt: string) => void;
  setTemperature: (temp: number) => void;
  resetMemeState: () => void;
  transcribeAudioToText: (audioUri: string) => Promise<string>;
  convertImageToBase64: (imageUri: string) => Promise<string>;
}

const initialState: MemeState = {
  generationType: null,
  baseImage: null,
  context: '',
  userPrompt: '',
  temperature: 0.7,
};

const MemeContext = createContext<MemeContextType | undefined>(undefined);

export const MemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MemeState>(initialState);

  const setGenerationType = (generationType: GenerationType) => setState(prev => ({ ...prev, generationType }));
  const setBaseImage = (baseImage: string | null) => setState(prev => ({ ...prev, baseImage }));
  const setContext = (context: string) => setState(prev => ({ ...prev, context }));
  const setUserPrompt = (userPrompt: string) => setState(prev => ({ ...prev, userPrompt }));
  const setTemperature = (temperature: number) => setState(prev => ({ ...prev, temperature }));
  const resetMemeState = () => setState(initialState);

  // Note: @react-native-voice/voice ne supporte que la transcription en direct depuis le micro.
  // La transcription d'un fichier audio (audioUri) nécessite soit une API backend, 
  // soit un modèle natif (ex: whisper.rn), soit un module natif sur mesure.
  // Voici la base d'une implémentation pour la transcription (à adapter selon le besoin réel).
  const transcribeAudioToText = async (audioUri: string): Promise<string> => {
    console.warn('La transcription de fichier local n\'est pas supportée par @react-native-voice/voice. Il faut utiliser la dictée vocale en direct.');
    // Simulation pour le moment, car l'API native ne prend pas de fichier en entrée
    return Promise.resolve('[Audio Transcription Placeholder]');
  };

  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
    try {
      // Nettoyer l'URI (ex: enlever file:// sur certaines plateformes si besoin)
      const cleanUri = imageUri.startsWith('file://') ? imageUri.replace('file://', '') : imageUri;
      
      // Lecture du fichier en base64
      const base64String = await RNFS.readFile(cleanUri, 'base64');
      
      // Déduction du type mime (jpeg par défaut)
      const extension = cleanUri.split('.').pop()?.toLowerCase() || 'jpeg';
      const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
      
      return `data:${mimeType};base64,${base64String}`;
    } catch (error) {
      console.error('Erreur lors de la conversion de l\'image :', error);
      throw error;
    }
  };

  return (
    <MemeContext.Provider
      value={{
        ...state,
        setGenerationType,
        setBaseImage,
        setContext,
        setUserPrompt,
        setTemperature,
        resetMemeState,
        transcribeAudioToText,
        convertImageToBase64,
      }}
    >
      {children}
    </MemeContext.Provider>
  );
};

export const useMemeContext = (): MemeContextType => {
  const context = useContext(MemeContext);
  if (!context) {
    throw new Error('useMemeContext must be used within a MemeProvider');
  }
  return context;
};
