import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { generateStickersFromChat } from '../services/MemeApiService';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatStickerScreen'>;

export default function ChatStickerScreen({ navigation }: Props) {
  const [chatText, setChatText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stickerUrl, setStickerUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState('');

  async function onImportChat() {
    if (!chatText.trim()) {
      Alert.alert('Conversation requise', 'Collez ici un extrait de conversation WhatsApp.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateStickersFromChat({ chatText });
      setStickerUrl(result.stickerUrl);
      setSummary(result.summary);
      navigation.navigate('MemeResultScreen', { memeUrl: result.stickerUrl, source: 'whatsapp' });
    } catch (error) {
      console.warn('chat sticker error', error);
      Alert.alert('Échec', 'Impossible de générer le sticker à partir du chat.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.glow} />
      <Text style={styles.title}>Sticker WhatsApp</Text>
      <Text style={styles.subtitle}>Collez ici votre conversation WhatsApp pour générer un sticker de chat avec un style sombre.</Text>
      <ScrollView contentContainerStyle={styles.card} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.input}
          placeholder="Collez votre chat WhatsApp ici..."
          placeholderTextColor="#7fa8c9"
          multiline
          value={chatText}
          onChangeText={setChatText}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={onImportChat} disabled={isLoading}>
          <Text style={styles.primaryButtonText}>{isLoading ? 'Génération...' : 'Importer et générer'}</Text>
        </TouchableOpacity>
        {summary ? <Text style={styles.summary}>{summary}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0a0e1a' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,212,255,0.14)', top: -40, right: -20 },
  title: { fontSize: 26, fontWeight: '700', color: '#eaf6ff' },
  subtitle: { marginTop: 8, color: '#7fa8c9', fontSize: 15, lineHeight: 22 },
  card: { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderRadius: 18, padding: 18 },
  input: { minHeight: 180, color: '#eaf6ff', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', textAlignVertical: 'top' },
  primaryButton: { marginTop: 14, backgroundColor: '#00b8ff', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#07111d', fontWeight: '700' },
  summary: { marginTop: 16, color: '#d3e9ff', fontSize: 14, lineHeight: 20 },
});
