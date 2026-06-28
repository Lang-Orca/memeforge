import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import BrandLogo from '../components/BrandLogo';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.glow} />
      <View style={styles.glow2} />
      <BrandLogo size={72} />
      <Text style={styles.title}>Memeforge</Text>
      <Text style={styles.subtitle}>Créez un mème depuis du texte, une image ou votre voix.</Text>

      <View style={styles.card}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('TextGeneratorScreen')}>
          <Text style={styles.primaryButtonText}>Créer depuis du texte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('ImageGeneratorScreen')}>
          <Text style={styles.secondaryButtonText}>Créer depuis une image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('VoiceGeneratorScreen')}>
          <Text style={styles.secondaryButtonText}>Créer depuis la voix</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('ChatStickerScreen')}>
          <Text style={styles.secondaryButtonText}>Sticker WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0a0e1a' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,212,255,0.16)', top: -40, left: -40 },
  glow2: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(120,80,255,0.14)', bottom: -80, right: -60 },
  title: { fontSize: 32, fontWeight: '700', color: '#eaf6ff', marginTop: 12 },
  subtitle: { marginTop: 8, color: '#7fa8c9', fontSize: 15, lineHeight: 22 },
  card: { marginTop: 24, backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderRadius: 18, padding: 18 },
  primaryButton: { backgroundColor: '#00d4ff', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  primaryButtonText: { color: '#07111d', fontWeight: '700' },
  secondaryButton: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  secondaryButtonText: { color: '#eaf6ff', fontWeight: '600' },
});
