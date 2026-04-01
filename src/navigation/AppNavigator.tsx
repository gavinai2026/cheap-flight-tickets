import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import { SearchScreen } from '../screens/SearchScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { FlightDetailsScreen } from '../screens/FlightDetailsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { DealsScreen } from '../screens/DealsScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CompareScreen } from '../screens/CompareScreen';
import { FlightTrackerScreen } from '../screens/FlightTrackerScreen';
import { VisaCheckScreen } from '../screens/VisaCheckScreen';
import { LoungeScreen } from '../screens/LoungeScreen';
import { TripPlannerScreen } from '../screens/TripPlannerScreen';
import { Colors, FontSizes, FontWeights } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchMain" component={SearchScreen} />
    <Stack.Screen name="Results" component={ResultsScreen} />
    <Stack.Screen name="FlightDetails" component={FlightDetailsScreen} />
    <Stack.Screen name="Calendar" component={CalendarScreen} />
    <Stack.Screen name="Alerts" component={AlertsScreen} />
    <Stack.Screen name="Compare" component={CompareScreen} />
    <Stack.Screen name="FlightTracker" component={FlightTrackerScreen} />
    <Stack.Screen name="VisaCheck" component={VisaCheckScreen} />
    <Stack.Screen name="Lounge" component={LoungeScreen} />
    <Stack.Screen name="TripPlanner" component={TripPlannerScreen} />
  </Stack.Navigator>
);

const DealsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DealsMain" component={DealsScreen} />
  </Stack.Navigator>
);

const SavedStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SavedMain" component={SavedScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
  </Stack.Navigator>
);

const getTabBarIcon = (routeName: string, focused: boolean, color: string, size: number) => {
  let iconName: keyof typeof Ionicons.glyphMap;

  switch (routeName) {
    case 'SearchTab':
      iconName = focused ? 'search' : 'search-outline';
      break;
    case 'DealsTab':
      iconName = focused ? 'flame' : 'flame-outline';
      break;
    case 'SavedTab':
      iconName = focused ? 'heart' : 'heart-outline';
      break;
    case 'ProfileTab':
      iconName = focused ? 'person' : 'person-outline';
      break;
    default:
      iconName = 'search-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

export const AppNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) =>
          getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingTop: 4,
          height: 85,
          paddingBottom: 25,
        },
        tabBarLabelStyle: {
          fontSize: FontSizes.xs,
          fontWeight: FontWeights.medium,
        },
      })}
    >
      <Tab.Screen name="SearchTab" component={SearchStack} options={{ tabBarLabel: 'Search' }} />
      <Tab.Screen name="DealsTab" component={DealsStack} options={{ tabBarLabel: 'Deals' }} />
      <Tab.Screen name="SavedTab" component={SavedStack} options={{ tabBarLabel: 'Saved' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  </NavigationContainer>
);
