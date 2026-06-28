import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Image, Linking, Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { convertImageToSticker } from '../utils/stickerExport';

/**
 * Extracts base64 data from a data URI (e.g., "data:image/png;base64,...")
 */
function extractBase64FromDataUri(dataUri: string): string {
  const parts = dataUri.split(',');
  if (parts.length !== 2) {
    throw new Error('Invalid data URI format');
  }
  return parts[1];
}

type Props = NativeStackScreenProps<RootStackParamList, 'MemeResultScreen'>;

export default function MemeResultScreen({ route, navigation }: Props) {
  const { memeUrl, source } = route.params ?? {};
  const [isStickerMode, setIsStickerMode] = useState(source === 'whatsapp');
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasLoadedImage, setHasLoadedImage] = useState(false);

  const shareLabel = useMemo(() => (isStickerMode ? 'Sticker' : 'Mème'), [isStickerMode]);

  async function onShare() {
    if (!memeUrl) {
      Alert.alert('Aucune image', 'Le mème n’est pas encore disponible.');
      return;
    }

    setIsSharing(true);
    try {
      let shareFilePath = memeUrl;
      
      // Always convert to local file - convertImageToSticker handles both URLs and data URIs
      shareFilePath = await convertImageToSticker(memeUrl);

      if (isStickerMode) {
        // Sticker mode: share image only, without any accompanying text
        await Share.open({
          url: shareFilePath,
          type: 'image/png',
        });
      } else {
        // Normal meme sharing: include title and message
        await Share.open({
          url: shareFilePath,
          type: 'image/jpeg',
          title: `Partager ${shareLabel}`,
          message: 'Regarde ce mème créé avec Memeforge !',
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Partage annulé';
      if (!message.includes('cancel') && !message.includes('canceled')) {
        Alert.alert('Erreur', 'Le partage a échoué.');
        if (Platform.OS === 'android' && memeUrl.startsWith('http')) {
          await Linking.openURL(memeUrl);
        }
      }
    } finally {
      setIsSharing(false);
    }
  }

  async function onDownload() {
    if (!memeUrl) {
      Alert.alert('Aucune image', 'Le mème n’est pas encore disponible.');
      return;
    }

    setIsDownloading(true);
    try {
      const destinationPath = `${RNFS.DownloadDirectoryPath}/memeforge-${Date.now()}.png`;
      
      if (memeUrl.startsWith('http')) {
        // Handle HTTP URLs
        const result = await RNFS.downloadFile({ fromUrl: memeUrl, toFile: destinationPath }).promise;
        if (result.statusCode && result.statusCode >= 200 && result.statusCode < 300) {
          Alert.alert('Téléchargement', 'Image enregistrée avec succès.');
        } else {
          throw new Error('Téléchargement impossible');
        }
      } else if (memeUrl.startsWith('data:image')) {
        // Handle base64 data URIs
        const base64Data = extractBase64FromDataUri(memeUrl);
        await RNFS.writeFile(destinationPath, base64Data, 'base64');
        Alert.alert('Téléchargement', 'Image enregistrée avec succès.');
      } else {
        throw new Error('Format d\'image non reconnu');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Le téléchargement a échoué.');
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.glow} />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Ton mème</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.subtitle}>Résultat généré depuis {source ?? 'un mode'}</Text>
      <GlassCard style={styles.imageCard}>
        {memeUrl ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: memeUrl }}
              style={styles.image}
              resizeMode="contain"
              onLoad={() => setHasLoadedImage(true)}
              onError={() => setHasLoadedImage(false)}
            />
            {!hasLoadedImage ? (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>Chargement du mème…</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🖼️</Text>
            <Text style={styles.emptyText}>Le mème n’est pas encore visible ici.</Text>
          </View>
        )}
      </GlassCard>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Mode sticker</Text>
        <Switch value={isStickerMode} onValueChange={setIsStickerMode} thumbColor={isStickerMode ? '#00d4ff' : '#fff'} trackColor={{ false: '#4f5874', true: '#2f7daa' }} />
      </View>
      <GradientButton title="Partager" onPress={onShare} loading={isSharing} style={styles.actionButton} />
      <GradientButton title="Télécharger" onPress={onDownload} loading={isDownloading} style={styles.secondaryActionButton} />
      <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')} style={styles.replayButton}>
        <Text style={styles.replayText}>Recommencer</Text>
      </TouchableOpacity>
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
  imageCard: { marginBottom: 12, padding: 8, minHeight: 340 },
  imageWrapper: { width: '100%', height: 320, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 320, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)' },
  loadingOverlay: { position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(10,14,26,0.45)', borderRadius: 14 },
  loadingText: { color: '#f7fbff', fontWeight: '700' },
  emptyState: { height: 320, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: '#8eaacc', textAlign: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  switchLabel: { color: '#f7fbff', fontWeight: '600' },
  actionButton: { marginBottom: 10 },
  secondaryActionButton: { marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.12)' },
  replayButton: { paddingVertical: 12, alignItems: 'center' },
  replayText: { color: '#00d4ff', fontWeight: '700' },
});
