import React, { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Platform, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTabBarVisibility } from '../../src/context/TabBarVisibilityContext';

const TAB_CONFIG: Record<string, { label: string; activeIcon: keyof typeof Ionicons.glyphMap; inactiveIcon: keyof typeof Ionicons.glyphMap }> = {
  index: {
    label: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home',
  },
  courses: {
    label: 'Courses',
    activeIcon: 'school',
    inactiveIcon: 'school',
  },
  learning: {
    label: 'Learning',
    activeIcon: 'book',
    inactiveIcon: 'book',
  },
  alerts: {
    label: 'Alerts',
    activeIcon: 'notifications',
    inactiveIcon: 'notifications',
  },
  profile: {
    label: 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person',
  },
};

function AppleTabBar({ state, descriptors, navigation }: any) {
  const { isTabBarVisible } = useTabBarVisibility();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isTabBarVisible ? 0 : 100,
      friction: 8,
      tension: 65,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isTabBarVisible]);

  return (
    <Animated.View style={[styles.tabBarWrapper, { transform: [{ translateY }] }]}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] || {
            label: route.name,
            activeIcon: 'ellipse' as const,
            inactiveIcon: 'ellipse' as const,
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabButton}
            >
              <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
                <Ionicons
                  name={isFocused ? config.activeIcon : config.inactiveIcon}
                  size={23}
                  color={isFocused ? '#1d4ed8' : '#64748b'}
                />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppleTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="courses" options={{ title: 'Courses' }} />
      <Tabs.Screen name="learning" options={{ title: 'Learning' }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 50,
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1.5,
    borderTopColor: '#e2e8f0',
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 3,
    borderRadius: 14,
  },
  iconWrapperActive: {
    backgroundColor: '#dbeafe',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: '#1d4ed8',
    fontWeight: '900',
  },
});

