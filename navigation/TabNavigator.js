import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import EditEventScreen from '../screens/EditEventScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import ChatScreen from '../screens/ChatScreen';
import MessagesScreen from '../screens/MessagesScreen';
import RateEventScreen from '../screens/RateEventScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import AboutScreen from '../screens/AboutScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="RateEvent" component={RateEventScreen} />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="RateEvent" component={RateEventScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="RateEvent" component={RateEventScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminPanelScreen" component={AdminPanelScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="RateEvent" component={RateEventScreen} />
    </Stack.Navigator>
  );
}

export default function TabNavigator({ isAdmin = false }) {
  const { language } = useLanguage();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 85,
          paddingBottom: 25,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#999999',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen 
        name="HomePage" 
        component={HomeStack}
        options={{
          tabBarLabel: t(language, 'home'),
          tabBarIcon: ({ focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={24} 
                color={focused ? '#000000' : '#999999'} 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesStack}
        options={{
          tabBarLabel: t(language, 'messages'),
          tabBarIcon: ({ focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Ionicons 
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
                size={24} 
                color={focused ? '#000000' : '#999999'} 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarLabel: t(language, 'profile'),
          tabBarIcon: ({ focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={24} 
                color={focused ? '#000000' : '#999999'} 
              />
            </View>
          ),
        }}
      />
      {isAdmin && (
        <Tab.Screen 
          name="Admin" 
          component={AdminStack}
          options={{
            tabBarLabel: t(language, 'admin'),
            tabBarIcon: ({ focused }) => (
              <View style={[
                styles.iconContainer,
                focused && styles.iconContainerActive
              ]}>
                <Ionicons 
                  name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} 
                  size={24} 
                  color={focused ? '#000000' : '#999999'} 
                />
              </View>
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: '#f5f5f5',
  },
});

