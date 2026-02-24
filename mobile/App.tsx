// mobile/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

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
          tabBarIcon: ({ color }) => (
            <HomeIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <SearchIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateScreen}
        options={{
          tabBarIcon: ({ color }) => (
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
          tabBarIcon: ({ color }) => (
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
          tabBarIcon: ({ color }) => (
            <UserIcon color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'SpaceMono': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

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
