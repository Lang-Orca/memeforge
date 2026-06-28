import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function BrandLogo({ size = 100 }: { size?: number }) {
  return (
    <View style={[styles.logoContainer, { height: size }]}> 
      <Text style={[styles.logoText, { fontSize: Math.round(size / 3) }]}>Memeforge</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logoText: {
    color: '#00d4ff',
    fontWeight: '800',
    letterSpacing: 1,
  },
});
