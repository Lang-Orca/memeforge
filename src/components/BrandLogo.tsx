import React from 'react';
import { StyleSheet, View } from 'react-native';
import MemeForgeLogo from '../../memeforge_neon_logo.svg';

export default function BrandLogo({ size = 100 }: { size?: number }) {
  return (
    <View style={styles.logoContainer}>
      <MemeForgeLogo width={size} height={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
});
