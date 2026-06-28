import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Image, Share, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'MemeResultScreen'>;

export default function MemeResultScreen({ route, navigation }: Props) {
  const { memeUrl, source } = route.params ?? {};
  const [isStickerMode, setIsStickerMode] = useState(false);

  async function onShare() {
    try {
      if (isStickerMode) {
        await Share.share({ message: 'Sticker Memeforge', url: memeUrl });
      } else {
        await Share.share({ message: 'Regarde ce mème créé avec Memeforge !', url: memeUrl });
      }
    } catch (error) {
      console.warn('share error', error);
      Alert.alert('Partage', 'Le partage a été annulé ou a échoué.');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.glow} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Résultat</Text>
      <Text style={styles.subtitle}>Source : {source ?? 'inconnue'}</Text>
      <View style={styles.card}>
        {memeUrl ? <Image source={{ uri: memeUrl }} style={styles.image} resizeMode="contain" /> : null}
        <View style={styles.row}>
          <Text style={styles.label}>Mode sticker</Text>
          <Switch value={isStickerMode} onValueChange={setIsStickerMode} />
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={onShare}>
          <Text style={styles.primaryButtonText}>Partager</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0a0e1a' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,212,255,0.14)', top: -40, right: -40 },
  backButton: { marginBottom: 12 },
  backText: { color: '#00d4ff', fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '700', color: '#eaf6ff' },
  subtitle: { marginTop: 6, color: '#7fa8c9', fontSize: 15 },
  card: { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderRadius: 18, padding: 16 },
  image: { width: '100%', height: 320, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  label: { color: '#eaf6ff' },
  primaryButton: { marginTop: 14, backgroundColor: '#00b8ff', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#07111d', fontWeight: '700' },
});
