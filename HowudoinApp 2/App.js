import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Existing Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FriendSearchScreen from './src/screens/FriendSearchScreen';
import FriendRequestsScreen from './src/screens/FriendRequestsScreen';
import FriendsListScreen from './src/screens/FriendsListScreen';
import MessageScreen from './src/screens/MessageScreen';

// New Group Screens
import GroupsListScreen from './src/screens/GroupsListScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import GroupChatScreen from './src/screens/GroupChatScreen';
import GroupDetailsScreen from './src/screens/GroupDetailsScreen';

import { AuthProvider } from './src/context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'FriendSearch':
              iconName = focused ? 'person-add' : 'person-add-outline';
              break;
            case 'FriendRequests':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'FriendsList':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Groups':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f4511e',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="FriendSearch"
        component={FriendSearchScreen}
        options={{ title: 'Add Friend' }}
      />
      <Tab.Screen
        name="FriendRequests"
        component={FriendRequestsScreen}
        options={{ title: 'Friend Requests' }}
      />
      <Tab.Screen
        name="FriendsList"
        component={FriendsListScreen}
        options={{ title: 'Friends' }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupStackNavigator}
        options={{ title: 'Groups', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

function GroupStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="GroupsList" 
        component={GroupsListScreen}
        options={({ navigation }) => ({
          title: 'Groups',
          headerRight: () => (
            <Ionicons
              name="add"
              size={24}
              color="#fff"
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate('CreateGroup')}
            />
          ),
        })}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{ title: 'New Group' }}
      />
      <Stack.Screen
        name="GroupChat"
        component={GroupChatScreen}
        options={({ route }) => ({ title: route.params?.groupName || 'Group Chatting' })}
      />
      <Stack.Screen 
        name="GroupDetails" 
        component={GroupDetailsScreen}
        options={({ route }) => ({
          title: 'Group Details',
        })}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login', headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Register' }}
          />
          <Stack.Screen
            name="Message"
            component={MessageScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}