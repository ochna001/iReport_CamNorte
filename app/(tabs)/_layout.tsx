import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import AnimatedTabBar from '../../components/AnimatedTabBar';
import { Colors } from '../../constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 0,
          elevation: 0,
          height: 88,
        },
        tabBarBackground: () => <View style={{ flex: 1, backgroundColor: Colors.background }} />,
        sceneStyle: {
          backgroundColor: Colors.background,
        },
        lazy: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'My Reports',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
