import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import CategorySelector from '../components/CategorySelector';
import { MEME_CATEGORIES } from '../constants/categories';
import { generateMemeFromText } from '../services/MemeApiService';

type Props = NativeStackScreenProps<RootStackParamList, 'TextGeneratorScreen'>;

const FORBIDDEN_WORDS = ['spam', 'violence', 'arnaque'];

export default function TextGeneratorScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(MEME_CATEGORIES[0]?.id ?? 'funny');
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = useMemo(() => MEME_CATEGORIES.find((item) => item.id === selectedCategoryId), [selectedCategoryId]);

  async function onGenerate() {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert('Texte requis', 'Écris un texte avant de générer le mème.');
      return;
    }

    const normalized = trimmed.toLowerCase();
    const foundForbidden = FORBIDDEN_WORDS.find((word) => normalized.includes(word));
    if (foundForbidden) {
      Alert.alert('Contenu bloqué', 'Ce texte contient un mot interdit.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await generateMemeFromText({ text: trimmed, category: selectedCategoryId });
      navigation.navigate('MemeResultScreen', { memeUrl: res.memeUrl, source: 'text' });
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
        <Text style={styles.headerTitle}>Depuis un texte</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.subtitle}>Rédige ta légende et choisis une ambiance</Text>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <CategorySelector selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />
        <GlassCard style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="Écris ton texte ici..."
            placeholderTextColor="#8eaacc"
            multiline
            value={text}
            onChangeText={setText}
          />
        </GlassCard>
        <Text style={styles.helperText}>Catégorie sélectionnée : {selectedCategory?.label ?? 'Drôle'}</Text>
        <GradientButton title="Générer le mème" onPress={onGenerate} loading={isLoading} style={styles.generateButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0a0e1a' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,212,255,0.14)', top: -40, right: -40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backText: { color: '#00d4ff', fontSize: 24, fontWeight: '700' },
  headerTitle: { color: '#f7fbff', fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 6, color: '#8eaacc', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  content: { paddingBottom: 24 },
  inputCard: { marginTop: 8 },
  input: { minHeight: 160, color: '#f7fbff', fontSize: 15, textAlignVertical: 'top' },
  helperText: { color: '#8eaacc', marginTop: 10, marginBottom: 12, fontSize: 13 },
  generateButton: { marginTop: 6 },
});
