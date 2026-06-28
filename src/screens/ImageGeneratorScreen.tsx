import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import type { RootStackParamList } from '../navigation/AppNavigator';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import CategorySelector from '../components/CategorySelector';
import { MEME_CATEGORIES } from '../constants/categories';
import { generateMemeFromImage } from '../services/MemeApiService';

type Props = NativeStackScreenProps<RootStackParamList, 'ImageGeneratorScreen'>;

export default function ImageGeneratorScreen({ navigation }: Props) {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(MEME_CATEGORIES[0]?.id ?? 'funny');
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = useMemo(() => MEME_CATEGORIES.find((item) => item.id === selectedCategoryId), [selectedCategoryId]);

  async function onPickImage() {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, includeBase64: true });
      if (result.didCancel) return;
      if (result.assets?.[0]?.uri && result.assets?.[0]?.base64) {
        setSelectedImageUri(result.assets[0].uri);
        setSelectedImageBase64(result.assets[0].base64);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d’ouvrir la galerie.');
    }
  }

  async function onGenerate() {
    if (!selectedImageUri) {
      Alert.alert('Image requise', 'Choisis une image avant de générer le mème.');
      return;
    }

    if (!selectedImageBase64) {
      Alert.alert('Erreur', 'Impossible de traiter l\'image sélectionnée.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await generateMemeFromImage({ imageBase64: selectedImageBase64, caption, category: selectedCategoryId });
      navigation.navigate('MemeResultScreen', { memeUrl: res.memeUrl, source: 'image' });
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
        <Text style={styles.headerTitle}>Depuis une image</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.subtitle}>Choisis une image et ajoute une légende (optionnel)</Text>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity activeOpacity={0.9} onPress={onPickImage}>
          <GlassCard style={styles.imageCard}>
            {selectedImageUri ? (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} resizeMode="cover" />
                <View style={styles.overlayBadge}><Text style={styles.overlayText}>Changer</Text></View>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderIcon}>🖼️</Text>
                <Text style={styles.placeholderText}>Choisir une image depuis ta galerie</Text>
              </View>
            )}
          </GlassCard>
        </TouchableOpacity>
        <CategorySelector selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />
        <GlassCard style={styles.captionCard}>
          <TextInput
            style={styles.input}
            placeholder="Ajoute une légende..."
            placeholderTextColor="#8eaacc"
            multiline
            value={caption}
            onChangeText={setCaption}
          />
        </GlassCard>
        <Text style={styles.helperText}>Catégorie sélectionnée : {selectedCategory?.label ?? 'Drôle'}</Text>
        <GradientButton title="Générer le mème" onPress={onGenerate} loading={isLoading} disabled={!selectedImageUri} style={styles.generateButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0a0e1a' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(120,80,255,0.14)', bottom: -50, left: -50 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backText: { color: '#00d4ff', fontSize: 24, fontWeight: '700' },
  headerTitle: { color: '#f7fbff', fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 6, color: '#8eaacc', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  content: { paddingBottom: 24 },
  imageCard: { height: 220, justifyContent: 'center', marginBottom: 14 },
  imageWrapper: { flex: 1, position: 'relative' },
  imagePreview: { width: '100%', height: '100%', borderRadius: 14 },
  overlayBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(10,14,26,0.7)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  overlayText: { color: '#f7fbff', fontSize: 12, fontWeight: '700' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 40, marginBottom: 8 },
  placeholderText: { color: '#f7fbff', fontSize: 14, textAlign: 'center' },
  captionCard: { marginTop: 6 },
  input: { minHeight: 100, color: '#f7fbff', fontSize: 15, textAlignVertical: 'top' },
  helperText: { color: '#8eaacc', marginTop: 10, marginBottom: 12, fontSize: 13 },
  generateButton: { marginTop: 6 },
});
