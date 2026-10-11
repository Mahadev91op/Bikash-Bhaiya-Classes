import React from 'react';
import { Tabs } from 'expo-router';
import { Text, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.7 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.7 }}>🎓</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: 'My Learning',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.7 }}>📖</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.7 }}>🔔</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.7 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
