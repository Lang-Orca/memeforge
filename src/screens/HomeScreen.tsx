import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import BrandLogo from '../components/BrandLogo';
import GlassCard from '../components/GlassCard';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;

type HomeOption = {
  key: 'text' | 'image' | 'voice' | 'whatsapp';
  title: string;
  emoji: string;
  screen: 'TextGeneratorScreen' | 'ImageGeneratorScreen' | 'VoiceGeneratorScreen' | 'ChatStickerScreen';
};

const options: HomeOption[] = [
  { key: 'text', title: 'Créer à partir d\'un texte', emoji: '✨', screen: 'TextGeneratorScreen' },
  { key: 'image', title: 'Transformer une photo', emoji: '📸', screen: 'ImageGeneratorScreen' },
  { key: 'voice', title: 'Créer avec ta voix', emoji: '🎙️', screen: 'VoiceGeneratorScreen' },
  { key: 'whatsapp', title: 'Sticker depuis WhatsApp', emoji: '💬', screen: 'ChatStickerScreen' },
];

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.glow} />
      <View style={styles.glow2} />
      <BrandLogo size={72} />
      <Text style={styles.title}>Memeforge</Text>
      <Text style={styles.subtitle}>Crée un mème en quelques secondes, depuis du texte, une image ou ta voix</Text>

      <View style={styles.optionsList}>
        {options.map((option) => (
          <TouchableOpacity key={option.key} activeOpacity={0.9} onPress={() => navigation.navigate(option.screen)}>
            <GlassCard style={styles.optionCard}>
              <View style={styles.optionRow}>
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <View style={styles.optionTextWrapper}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0a0e1a' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,212,255,0.16)', top: -40, left: -40 },
  glow2: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(120,80,255,0.14)', bottom: -80, right: -60 },
  title: { fontSize: 32, fontWeight: '700', color: '#f7fbff', marginTop: 12 },
  subtitle: { marginTop: 8, color: '#8eaacc', fontSize: 15, lineHeight: 22, marginBottom: 20, maxWidth: 320 },
  optionsList: { gap: 12 },
  optionCard: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  optionEmoji: { fontSize: 20, marginRight: 12, width: 32, textAlign: 'center' },
  optionTextWrapper: { flex: 1 },
  optionTitle: { color: '#f7fbff', fontWeight: '700', fontSize: 15 },
});
