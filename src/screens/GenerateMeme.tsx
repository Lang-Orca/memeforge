import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import Voice from '@react-native-voice/voice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Remplacez par l'URL réelle de votre backend
const BACKEND_URL = 'https://YOUR_API.example.com/generate-meme';

const BANNED_WORDS = [
  'motinterdit1',
  'motinterdit2',
  'fuck',
  'shit',
  'putain',
];

function containsBannedWords(text: string) {
  if (!text) return false;
  const normalized = text.toLowerCase();
  return BANNED_WORDS.some((w) => {
    const pattern = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
    return pattern.test(normalized);
  });
}

export default function GenerateMeme() {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [listening, setListening] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    Voice.onSpeechResults = (e: any) => {
      const results = e.value as string[] | undefined;
      if (results && results.length) {
        setText((prev) => (prev ? `${prev} ${results[0]}` : results[0]));
      }
    };

    Voice.onSpeechError = (e: any) => {
      console.warn('Voice error', e);
      Alert.alert('Erreur micro', 'La reconnaissance vocale a rencontré une erreur.');
      setListening(false);
    };

    return () => {
      Voice.destroy().catch(() => {});
      Voice.removeAllListeners();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const perms = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
      if (Platform.Version < 33) {
        perms.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE as any);
      }

      const granted = await PermissionsAndroid.requestMultiple(perms);
      const ok = Object.values(granted).every((v) => v === PermissionsAndroid.RESULTS.GRANTED);
      if (!ok) {
        Alert.alert('Permissions', 'Permissions requises non accordées.');
      }
      return ok;
    } catch (err) {
      console.warn('perm error', err);
      return false;
    }
  }

  async function startListening() {
    const ok = await requestPermissions();
    if (!ok) return;

    try {
      await Voice.start('fr-FR');
      setListening(true);
    } catch (err) {
      console.warn('start voice error', err);
      Alert.alert('Micro', 'Impossible de démarrer le micro.');
    }
  }

  async function stopListening() {
    try {
      await Voice.stop();
    } catch (err) {
      console.warn('stop voice error', err);
    } finally {
      setListening(false);
    }
  }

  async function generate() {
    if (!text.trim()) {
      Alert.alert('Validation', 'Veuillez saisir un texte pour le mème.');
      return;
    }

    if (containsBannedWords(text)) {
      Alert.alert('Modération', 'Texte contenant des mots non autorisés.');
      return;
    }

    setLoading(true);
    setImageUrl(null);

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000);
    // @ts-ignore
    timeoutRef.current = id;

    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      clearTimeout(id as any);

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || 'Erreur serveur');
      }

      const json = await res.json();
      const url = json.meme_url || json.imageUrl || json.image_url || null;
      if (!url) throw new Error('Réponse inattendue du backend');

      // Optionnel: validation du texte retourné si le backend renvoie du texte
      if (json.generated_text && containsBannedWords(json.generated_text)) {
        throw new Error('Le contenu généré contient des mots interdits.');
      }

      setImageUrl(url);
    } catch (err: any) {
      console.warn('generate error', err);
      if (err.name === 'AbortError') {
        Alert.alert('Délai dépassé', "La génération a pris trop de temps.");
      } else {
        Alert.alert('Erreur', err.message || 'Erreur de génération');
      }
    } finally {
      setLoading(false);
      // @ts-ignore
      timeoutRef.current = null;
    }
  }

  async function saveImage() {
    if (!imageUrl) return Alert.alert('Aucune image', "Aucune image à sauvegarder.");

    if (Platform.OS === 'android') {
      const ok = await requestPermissions();
      if (!ok) return;
    }

    try {
      const dest = `${RNFS.PicturesDirectoryPath}/memeforge-${Date.now()}.png`;
      const dl = RNFS.downloadFile({ fromUrl: imageUrl, toFile: dest });
      const res = await dl.promise;
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        Alert.alert('Enregistré', `Image sauvegardée : ${dest}`);
      } else {
        throw new Error(`Status ${res.statusCode}`);
      }
    } catch (err) {
      console.warn('save error', err);
      Alert.alert('Erreur', 'Impossible de sauvegarder l’image.');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top || 16 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Générateur de mème</Text>
        <Text style={styles.subtitle}>Écris ton texte, ou dicte-le avec le micro.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Texte du mème"
          placeholderTextColor="#999"
          multiline
          value={text}
          onChangeText={setText}
          editable={!loading}
        />

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, listening && styles.buttonActive]}
            onPress={() => (listening ? stopListening() : startListening())}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{listening ? 'Arrêter' : '🎤 Dicter'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={generate} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Générer</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.result}>
        {imageUrl ? (
          <>
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
            <View style={styles.row}>
              <Button title="Télécharger" onPress={saveImage} />
              <Button
                title="Partager URL"
                onPress={() => {
                  Alert.alert('URL du mème', imageUrl);
                }}
              />
            </View>
          </>
        ) : (
          <Text style={styles.hint}>Aucun mème généré</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13', padding: 16 },
  header: { marginBottom: 12 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#cfcfe0', marginTop: 4 },
  form: { backgroundColor: '#16161a', padding: 12, borderRadius: 12 },
  input: { minHeight: 100, color: '#fff', padding: 12, borderRadius: 8, backgroundColor: '#0e0e10' },
  row: { flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'space-between' },
  button: {
    flex: 1,
    backgroundColor: '#ffd700',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  buttonActive: { backgroundColor: '#ffb700' },
  buttonText: { color: '#120b00', fontWeight: '700' },
  result: { marginTop: 20 },
  image: { width: '100%', height: 320, borderRadius: 12, backgroundColor: '#050506' },
  hint: { color: '#cfcfe0' },
});
