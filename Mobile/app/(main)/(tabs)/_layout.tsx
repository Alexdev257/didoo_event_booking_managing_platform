import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#ee8c2b'; // Màu cam chủ đạo

// --- CUSTOM TAB BAR ---
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.tabBarContainer, { bottom: Math.max(insets.bottom, 20) }]}>
      <BlurView intensity={80} tint="light" style={styles.glassBar}>
        {state.routes.filter((r: any) => descriptors[r.key].options.href !== null).map((route: any, index: number) => {
          const isFocused = state.index === index;

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

          const renderIcon = (focused: boolean) => {
            let iconName: any;
            switch (route.name) {
              case 'index': iconName = focused ? 'home' : 'home-outline'; break;
              case 'events': iconName = focused ? 'calendar' : 'calendar-outline'; break;
              case 'tickets': iconName = focused ? 'ticket' : 'ticket-outline'; break;
              case 'resell': iconName = focused ? 'repeat' : 'repeat-outline'; break;
              case 'profile': iconName = focused ? 'person' : 'person-outline'; break;

            }
            return <Ionicons name={iconName} size={24} color={focused ? '#fff' : '#666'} />;
          };

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem}>
              <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                {renderIcon(isFocused)}
              </View>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

// --- TAB LAYOUT COMPONENT ---
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="tickets" />
      <Tabs.Screen name="resell" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  // NAVIGATION STYLES
  tabBarContainer: {
    position: 'absolute',
    width: width,
    alignItems: 'center',
    zIndex: 100,
  },
  glassBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 32,
    height: 64,
    width: width * 0.88,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  tabItem: { flex: 1, alignItems: 'center' },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 23,
  },
});