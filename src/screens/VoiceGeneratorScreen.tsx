import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'VoiceGeneratorScreen'>;

export default function VoiceGeneratorScreen({ navigation }: Props) {
  const [text, setText] = useState('');

  function onGenerate() {
    if (!text.trim()) {
      Alert.alert('Voix requise', 'Veuillez d’abord transcrire votre message vocal.');
      return;
    }
    navigation.navigate('MemeResultScreen', { memeUrl: 'https://via.placeholder.com/1024x1024.png?text=Memeforge+Voice', source: 'voice' });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.glow} />
      <Text style={styles.title}>Voix</Text>
      <Text style={styles.subtitle}>Transcrivez votre idée vocale et générez un mème.</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Texte transcrit..."
          placeholderTextColor="#7fa8c9"
          multiline
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={onGenerate}>
          <Text style={styles.primaryButtonText}>Générer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0a0e1a' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,212,255,0.14)', top: 60, right: -20 },
  title: { fontSize: 26, fontWeight: '700', color: '#eaf6ff' },
  subtitle: { marginTop: 8, color: '#7fa8c9', fontSize: 15, lineHeight: 22 },
  card: { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderRadius: 18, padding: 16 },
  input: { minHeight: 120, color: '#eaf6ff', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  primaryButton: { marginTop: 14, backgroundColor: '#00b8ff', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#07111d', fontWeight: '700' },
});
