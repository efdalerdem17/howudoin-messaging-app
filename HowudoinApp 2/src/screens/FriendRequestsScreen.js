import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FriendRequestsScreen = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Get pending friend requests - you'll need to add this endpoint to your backend
      const response = await fetch('http://192.168.0.109:8080/api/friends/pending', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Friend Requests:', data);
      
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Error', 'Could not load friend requests');
    }
  };

  const handleAccept = async (senderEmail) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://192.168.0.109:8080/api/friends/accept?senderEmail=${senderEmail}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(errorText);
      }
  
      Alert.alert('Success', 'Friend request accepted');
      fetchRequests();
    } catch (error) {
      console.error('Accept error:', error);
      Alert.alert('Error', 'Failed to accept request');
    }
  };
  
  const handleReject = async (senderEmail) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://192.168.0.109:8080/api/reject?senderEmail=${senderEmail}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(errorText);
      }
  
      Alert.alert('Success', 'Friend request rejected');
      fetchRequests();
    } catch (error) {
      console.error('Reject error:', error);
      Alert.alert('Error', 'Failed to reject request');
    }
  };


  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friend Requests</Text>
      {requests.length === 0 ? (
        <Text style={styles.noRequests}>No pending friend requests</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.email || item}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <Text style={styles.email}>{item.email || item}</Text>
              <View style={styles.actions}>
                <TouchableOpacity 
                  onPress={() => handleAccept(item.email || item)} 
                  style={styles.acceptButton}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleReject(item.email || item)} 
                  style={styles.rejectButton}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
  noRequests: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666'
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd'
  },
  email: {
    fontSize: 16,
    flex: 1,
    marginRight: 10
  },
  actions: {
    flexDirection: 'row'
  },
  acceptButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center'
  },
  rejectButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default FriendRequestsScreen;