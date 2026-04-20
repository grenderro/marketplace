// mobile/App.tsx — React Native Marketplace App (fixed imports)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Simple inline icons (no external lib needed)
const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>🏠</Text>
);
const SearchIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>🔍</Text>
);
const PlusIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>➕</Text>
);
const ActivityIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>🔔</Text>
);
const UserIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>👤</Text>
);

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { CreateScreen } from './screens/CreateScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { NFTDetailScreen } from './screens/NFTDetailScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';

// Context
import { WalletProvider } from './context/WalletContext';
import { ThemeProvider } from './context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#0a0a0f',
          borderTopColor: '#1a1a25',
          height: 80,
          paddingBottom: 20,
        },
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#606070',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <HomeIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <SearchIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <View style={styles.createButton}>
              <PlusIcon color="#fff" size={28} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <ActivityIcon color={color} size={24} />
          ),
          tabBarBadge: 3,
          tabBarBadgeStyle: { backgroundColor: '#ff0080' },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <UserIcon color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <WalletProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerStyle: { backgroundColor: '#0a0a0f' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontFamily: 'Inter-Bold' },
                contentStyle: { backgroundColor: '#0a0a0f' },
              }}
            >
              <Stack.Screen
                name="Main"
                component={TabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="NFTDetail"
                component={NFTDetailScreen}
                options={{ title: 'Details', presentation: 'modal' }}
              />
              <Stack.Screen
                name="Checkout"
                component={CheckoutScreen}
                options={{ title: 'Complete Purchase', presentation: 'fullScreenModal' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="light" />
        </WalletProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
