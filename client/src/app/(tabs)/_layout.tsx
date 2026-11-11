import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS, FONT_SIZE } from '../../constants/design';
import { useAuth } from '../../context/AuthContext';

type FA5Name = React.ComponentProps<typeof FontAwesome5>['name'];

function TabIcon({ icon, label, focused }: { icon: FA5Name; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <FontAwesome5
        name={icon}
        size={20}
        color={focused ? COLORS.primary : COLORS.textMuted}
        solid={focused}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="home" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="history" label="History" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="link" label="Resources" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => <TabIcon icon="cog" label="Admin" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 3, minWidth: 60 },
  tabLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '500', textAlign: 'center' },
  tabLabelActive: { color: COLORS.primary, fontWeight: '700' },
});
