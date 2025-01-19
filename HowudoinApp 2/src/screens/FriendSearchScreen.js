import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FriendSearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFriendRequest = async () => {
    if (searchQuery.trim() === '') {
      Alert.alert('Error', 'Please enter an email');
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');

      // First check if the user exists
      const checkUserResponse = await fetch(`http://192.168.0.109:8080/api/users/find-by-email?email=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!checkUserResponse.ok) {
        Alert.alert('Error', 'User not found');
        return;
      }

      // If user exists, send friend request
      const response = await fetch(`http://192.168.0.109:8080/api/friends/add?receiverEmail=${encodeURIComponent(searchQuery)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        Alert.alert('Success', 'Friend request sent');
        setSearchQuery(''); // Clear input
      } else {
        const errorText = await response.text();
        Alert.alert('Error', errorText || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Request sending error:', error);
      Alert.alert('Error', 'An error occurred during the operation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Friend</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter the email of the person you want to add"
          value={searchQuery}
          onChangeText={setSearchQuery}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.searchButton, (isLoading || !searchQuery.trim()) && styles.disabledButton]} 
          onPress={handleFriendRequest}
          disabled={isLoading || !searchQuery.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>Send Request</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          • You can only send friend requests to registered users in the system.
        </Text>
        <Text style={styles.infoText}>
          • You can track sent requests from the "Friend Requests" page.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f5f5f5'
  },
  searchButton: {
    backgroundColor: '#f4511e',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 100,
    alignItems: 'center'
  },
  disabledButton: {
    opacity: 0.5
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  infoText: {
    color: '#6c757d',
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 20
  }
});

export default FriendSearchScreen;