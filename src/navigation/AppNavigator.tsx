import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import TextGeneratorScreen from '../screens/TextGeneratorScreen';
import ImageGeneratorScreen from '../screens/ImageGeneratorScreen';
import VoiceGeneratorScreen from '../screens/VoiceGeneratorScreen';
import ChatStickerScreen from '../screens/ChatStickerScreen';
import MemeResultScreen from '../screens/MemeResultScreen';

export type RootStackParamList = {
  HomeScreen: undefined;
  TextGeneratorScreen: undefined;
  ImageGeneratorScreen: undefined;
  VoiceGeneratorScreen: undefined;
  ChatStickerScreen: undefined;
  MemeResultScreen: { memeUrl?: string; source?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="TextGeneratorScreen" component={TextGeneratorScreen} />
        <Stack.Screen name="ImageGeneratorScreen" component={ImageGeneratorScreen} />
        <Stack.Screen name="VoiceGeneratorScreen" component={VoiceGeneratorScreen} />
        <Stack.Screen name="ChatStickerScreen" component={ChatStickerScreen} />
        <Stack.Screen name="MemeResultScreen" component={MemeResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
