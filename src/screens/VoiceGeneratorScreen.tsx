import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import CategorySelector from '../components/CategorySelector';
import { MEME_CATEGORIES } from '../constants/categories';
import { generateMemeFromVoice } from '../services/MemeApiService';

type Props = NativeStackScreenProps<RootStackParamList, 'VoiceGeneratorScreen'>;

export default function VoiceGeneratorScreen({ navigation }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(MEME_CATEGORIES[0]?.id ?? 'funny');
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = useMemo(() => MEME_CATEGORIES.find((item) => item.id === selectedCategoryId), [selectedCategoryId]);

  useEffect(() => {
    // Handle successful transcription
    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
      const result = event.value?.[0] ?? '';
      setTranscript(result);
      console.log('[VoiceGeneratorScreen] Transcription received:', result);
    };

    // Handle recognition errors
    Voice.onSpeechError = (event: any) => {
      console.error('[VoiceGeneratorScreen] Speech error:', event?.error);
      setIsListening(false);
      
      // Map common error codes to user-friendly messages
      const errorMap: Record<string, string> = {
        'no-match': 'Aucun son détecté. Parle plus fort.',
        'network': 'Erreur réseau. Vérifie ta connexion.',
        'permission': 'Permission micro refusée.',
        'aborted': 'Enregistrement annulé.',
      };
      
      const errorMessage = errorMap[event?.error] || 'Erreur micro. Réessaye.';
      Alert.alert('Micro', errorMessage);
    };

    // Handle when recognition starts
    Voice.onSpeechStart = () => {
      console.log('[VoiceGeneratorScreen] Speech recognition started');
    };

    // Handle when recognition ends
    Voice.onSpeechEnd = () => {
      console.log('[VoiceGeneratorScreen] Speech recognition ended');
      setIsListening(false);
    };

    return () => {
      Voice.destroy().catch(() => undefined);
    };
  }, []);

  async function toggleListening() {
    if (isListening) {
      try {
        await Voice.stop();
        setIsListening(false);
        console.log('[VoiceGeneratorScreen] Voice recording stopped');
      } catch (error) {
        console.error('[VoiceGeneratorScreen] Error stopping voice:', error);
        setIsListening(false);
      }
      return;
    }

    try {
      // Clear previous transcript when starting new recording
      setTranscript('');
      console.log('[VoiceGeneratorScreen] Starting voice recording...');
      await Voice.start('fr-FR');
      setIsListening(true);
    } catch (error: any) {
      console.error('[VoiceGeneratorScreen] Error starting voice:', error);
      setIsListening(false);
      
      // Handle specific error cases
      if (error?.message?.includes('permission')) {
        Alert.alert('Permission refusée', 'L\'app a besoin d\'accès au micro pour fonctionner.');
      } else if (error?.message?.includes('network')) {
        Alert.alert('Erreur réseau', 'La reconnaissance vocale nécessite une connexion Internet.');
      } else {
        Alert.alert('Erreur micro', 'Impossible de démarrer l\'enregistrement. Réessaye.');
      }
    }
  }

  async function onGenerate() {
    if (!transcript.trim()) {
      Alert.alert('Transcription requise', 'Parle d’abord pour obtenir un texte transcrit.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await generateMemeFromVoice({ transcript, category: selectedCategoryId });
      navigation.navigate('MemeResultScreen', { memeUrl: res.memeUrl, source: 'voice' });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer le mème.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.glow} />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Depuis la voix</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.subtitle}>Appuie et parle pour créer ton mème</Text>
      <View style={styles.centered}>
        <TouchableOpacity activeOpacity={0.9} onPress={toggleListening}>
          <View style={[styles.micButton, isListening && styles.micButtonListening]}>
            <Text style={styles.micEmoji}>🎙️</Text>
          </View>
        </TouchableOpacity>
      </View>
      <GlassCard style={styles.transcriptCard}>
        <Text style={styles.transcriptLabel}>Transcription</Text>
        {isListening ? (
          <Text style={styles.transcriptTextListening}>🎤 En écoute...</Text>
        ) : transcript ? (
          <Text style={styles.transcriptText}>{transcript}</Text>
        ) : (
          <Text style={styles.transcriptTextPlaceholder}>Parle maintenant…</Text>
        )}
      </GlassCard>
      <CategorySelector selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />
      {transcript ? <GradientButton title="Générer le mème" onPress={onGenerate} loading={isLoading} style={styles.generateButton} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0a0e1a' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,212,255,0.14)', top: 60, right: -20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backText: { color: '#00d4ff', fontSize: 24, fontWeight: '700' },
  headerTitle: { color: '#f7fbff', fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 6, color: '#8eaacc', fontSize: 15, lineHeight: 22, marginBottom: 18 },
  centered: { alignItems: 'center', marginBottom: 18 },
  micButton: { width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', justifyContent: 'center', alignItems: 'center' },
  micButtonListening: { backgroundColor: 'rgba(0, 212, 255, 0.2)', borderColor: '#00d4ff' },
  micEmoji: { fontSize: 54 },
  transcriptCard: { marginBottom: 14 },
  transcriptLabel: { color: '#dce8f8', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  transcriptText: { color: '#f7fbff', fontSize: 15, lineHeight: 21 },
  transcriptTextListening: { color: '#00d4ff', fontSize: 15, lineHeight: 21, fontStyle: 'italic' },
  transcriptTextPlaceholder: { color: '#8eaacc', fontSize: 15, lineHeight: 21, fontStyle: 'italic' },
  generateButton: { marginTop: 8 },
});
