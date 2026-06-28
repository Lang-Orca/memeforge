import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Share } from 'react-native';
import { MEME_CATEGORIES, MemeCategory } from '../constants/categories';
import { generateMeme } from '../services/MemeApiPlaceholder';
import { convertImageToSticker } from '../utils/stickerExport';

const FORBIDDEN_WORDS: string[] = ['badword1', 'badword2'];

function containsForbiddenWord(input: string): boolean {
  if (!input) return false;
  const lower = input.toLowerCase();
  return FORBIDDEN_WORDS.some((w) => lower.includes(w.toLowerCase()));
}

export default function MemeGeneratorScreen(): React.ReactElement {
  const [text, setText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(MEME_CATEGORIES[0].id);
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isStickerMode, setIsStickerMode] = useState<boolean>(false);
  const [sharingInProgress, setSharingInProgress] = useState<boolean>(false);

  async function onGenerate() {
    if (!text.trim()) {
      Alert.alert('Validation', 'Veuillez saisir le texte du mème.');
      return;
    }
    if (containsForbiddenWord(text)) {
      Alert.alert('Modération', 'Le texte contient des mots interdits.');
      return;
    }

    setLoading(true);
    try {
      const res = await generateMeme({ text, category: selectedCategory });
      setMemeUrl(res.memeUrl);
    } catch (err) {
      console.warn('generate error', err);
      Alert.alert('Erreur', 'Impossible de générer le mème pour l’instant.');
    } finally {
      setLoading(false);
    }
  }

  async function onShare() {
    if (!memeUrl) return Alert.alert('Aucun mème', 'Générez un mème avant de partager.');

    setSharingInProgress(true);
    try {
      if (!isStickerMode) {
        await Share.share({ message: 'Regarde ce mème créé avec Memeforge !', url: memeUrl });
      } else {
        const localPath = await convertImageToSticker(memeUrl);
        // React Native Share API accepts file:// URIs on Android/iOS
        await Share.share({ url: 'file://' + localPath, message: 'Sticker Memeforge' });
      }
    } catch (err) {
      // user cancelling usually resolves without throwing; any thrown error is logged
      console.warn('share error', err);
    } finally {
      setSharingInProgress(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <Text style={styles.title}>Créer un mème</Text>

      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MEME_CATEGORIES.map((c: MemeCategory) => {
            const active = c.id === selectedCategory;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCategory(c.id)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c.icon} {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Écris le texte du mème..."
        placeholderTextColor="#aaa"
        multiline
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity style={styles.generateButton} onPress={onGenerate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateText}>Générer le mème</Text>}
      </TouchableOpacity>

      {memeUrl && (
        <View style={styles.previewWrap}>
          <Image source={{ uri: memeUrl }} style={styles.previewImage} resizeMode="contain" />

          <View style={styles.stickerRow}>
            <Text style={styles.stickerLabel}>Mode sticker</Text>
            <Switch value={isStickerMode} onValueChange={setIsStickerMode} />
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={onShare} disabled={sharingInProgress}>
            {sharingInProgress ? <ActivityIndicator color="#fff" /> : <Text style={styles.shareText}>Partager</Text>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#1b0033' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  chipsWrap: { height: 48, marginBottom: 12 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2a1244',
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: '#ffd700' },
  chipText: { color: '#e9dff6', fontWeight: '600' },
  chipTextActive: { color: '#120b00' },
  input: {
    minHeight: 100,
    backgroundColor: '#2a1244',
    color: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3d1a56',
    marginBottom: 12,
  },
  generateButton: {
    backgroundColor: '#ffd700',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  generateText: { fontWeight: '700', color: '#120b00' },
  previewWrap: { marginTop: 12 },
  previewImage: { width: '100%', height: 320, borderRadius: 12, backgroundColor: '#0f001a' },
  stickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  stickerLabel: { color: '#fff' },
  shareButton: { backgroundColor: '#6b21a8', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  shareText: { color: '#fff', fontWeight: '700' },
});
